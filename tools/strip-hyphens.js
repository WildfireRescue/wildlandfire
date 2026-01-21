#!/usr/bin/env node
// Scan markdown/html/txt files and replace hyphens between letters with spaces
// Skips fenced code blocks, inline code, and list bullets (lines starting with '-')

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const exts = ['.md', '.mdx', '.html', '.txt'];
const excludePaths = ['/node_modules/', '/.git/', '/dist/', '/public/', '/src/', '/supabase/migrations/', '/netlify/functions/'];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (excludePaths.some(p => filePath.includes(p))) return;
      results = results.concat(walk(filePath));
    } else {
      if (exts.includes(path.extname(filePath)) && !excludePaths.some(p => filePath.includes(p))) {
        results.push(filePath);
      }
    }
  });
  return results;
}

function processFile(filePath) {
  let changed = false;
  let content = fs.readFileSync(filePath, 'utf8');

  const lines = content.split(/\r?\n/);
  let inFence = false;
  const out = lines.map((line) => {
    if (/^```/.test(line)) {
      inFence = !inFence;
      return line;
    }

    if (inFence) return line;

    // Preserve list bullets
    if (/^\s*-\s+/.test(line)) return line;

    // Process inline code by splitting on backticks
    const parts = line.split(/(`+)/);
    for (let i = 0; i < parts.length; i++) {
      // parts with backticks remain; text parts are at even indexes when separators are included
      if (i % 2 === 0) {
        // Replace hyphens between letters with spaces using Unicode letter class
        const replaced = parts[i].replace(/(?<=\p{L})-(?=\p{L})/gu, ' ');
        if (replaced !== parts[i]) {
          parts[i] = replaced;
          changed = true;
        }
      }
    }
    return parts.join('');
  });

  const newContent = out.join('\n');
  if (changed) {
    fs.writeFileSync(filePath, newContent, 'utf8');
  }
  return changed;
}

function main() {
  console.log('Scanning for text files...');
  const files = walk(ROOT);
  console.log(`Found ${files.length} candidate files.`);
  const changedFiles = [];
  files.forEach((f) => {
    try {
      const c = processFile(f);
      if (c) changedFiles.push(f);
    } catch (e) {
      console.error('Error processing', f, e.message);
    }
  });

  console.log('Done. Files changed:', changedFiles.length);
  changedFiles.forEach(f => console.log('-', path.relative(ROOT, f)));
}

if (require.main === module) main();
