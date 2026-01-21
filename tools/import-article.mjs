#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
const BUCKET = process.env.ARTICLE_IMAGES_BUCKET || 'article-images';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase server-side credentials. Please set SUPABASE_SERVICE_ROLE_KEY and VITE_SUPABASE_URL in your environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function downloadBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const buffer = await res.arrayBuffer();
  const arr = Buffer.from(buffer);
  const contentType = res.headers.get('content-type') || undefined;
  return { buffer: arr, contentType };
}

function slugify(s) {
  return (s || '')
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function uploadImage(buffer, contentType, destPath) {
  const { data, error } = await supabase.storage.from(BUCKET).upload(destPath, buffer, { contentType, upsert: false });
  if (error) throw error;
  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(destPath);
  return publicData.publicUrl;
}

function isValidFeaturedImage(imgUrl, imgElement = null) {
  const denylistPatterns = ['logo', 'icon', 'badge', 'apple', 'apple-news', 'civilbeat'];
  const urlLower = imgUrl.toLowerCase();
  
  // Check URL for denylisted terms
  for (const pattern of denylistPatterns) {
    if (urlLower.includes(pattern)) {
      console.log(`Rejected image (URL contains "${pattern}"): ${imgUrl}`);
      return false;
    }
  }
  
  // Check alt text if available
  if (imgElement) {
    const alt = imgElement.getAttribute('alt') || '';
    const altLower = alt.toLowerCase();
    for (const pattern of denylistPatterns) {
      if (altLower.includes(pattern)) {
        console.log(`Rejected image (alt contains "${pattern}"): ${imgUrl}`);
        return false;
      }
    }
    
    // Check dimensions
    const width = parseInt(imgElement.getAttribute('width') || '0', 10);
    const height = parseInt(imgElement.getAttribute('height') || '0', 10);
    if (width > 0 && width < 400) {
      console.log(`Rejected image (width ${width}px < 400px): ${imgUrl}`);
      return false;
    }
    if (height > 0 && height < 200) {
      console.log(`Rejected image (height ${height}px < 200px): ${imgUrl}`);
      return false;
    }
  }
  
  return true;
}

async function importArticle(url, providedSlug) {
  console.log('Fetching URL:', url);
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const html = await res.text();

  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();
  if (!article) throw new Error('Readability failed to parse article');

  const title = article.title || 'Untitled';
  const byline = article.byline || null;
  let content = article.content || '';
  const excerpt = (article.excerpt && article.excerpt.length > 10) ? article.excerpt : null;

  // Calculate reading time (avg 200 words per minute)
  const textContent = article.textContent || '';
  const wordCount = textContent.trim().split(/\s+/).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Clean up content: remove external CTAs, newsletter signups, donation prompts, etc.
  const contentDom = new JSDOM(content);
  const doc = contentDom.window.document;
  
  // Remove elements containing newsletter/signup prompts
  const selectorsToRemove = [
    'form', // forms (newsletter signups)
    'iframe', // embedded content
    '[class*="newsletter"]',
    '[class*="signup"]',
    '[class*="subscribe"]',
    '[class*="donation"]',
    '[class*="donate"]',
    '[id*="newsletter"]',
    '[id*="signup"]',
    '[id*="subscribe"]',
    '[id*="donation"]',
    '[id*="donate"]'
  ];
  
  selectorsToRemove.forEach(selector => {
    doc.querySelectorAll(selector).forEach(el => el.remove());
  });
  
  // Remove elements with text patterns that indicate CTAs
  const textPatternsToRemove = [
    /sign up/i,
    /newsletter/i,
    /subscribe/i,
    /donation/i,
    /will you fund/i,
    /give now/i,
    /support our/i,
    /as a.*reader/i
  ];
  
  Array.from(doc.querySelectorAll('p, div, section, aside')).forEach(el => {
    const text = el.textContent || '';
    if (textPatternsToRemove.some(pattern => pattern.test(text))) {
      // Only remove if it's a short promotional block (< 300 chars)
      if (text.length < 300) {
        el.remove();
      }
    }
  });
  
  content = doc.body.innerHTML;

  content = doc.body.innerHTML;

  // Extract OG image from meta tags
  let ogImage = null;
  const ogImageTag = dom.window.document.querySelector('meta[property="og:image"]');
  if (ogImageTag) {
    try {
      const ogImageUrl = ogImageTag.getAttribute('content');
      if (ogImageUrl) {
        ogImage = new URL(ogImageUrl, url).toString();
        console.log('Found OG image:', ogImage);
      }
    } catch (e) {
      console.warn('Failed to parse OG image:', e.message);
    }
  }

  // Find image URLs in content with validation (reuse the cleaned DOM)
  const imgRegex = /<img[^>]+src=["']?([^"'\s>]+)/g;
  let match;
  let transformed = content;
  const images = [];
  const validImages = [];
  const imgElements = doc.querySelectorAll('img');
  
  // Build a map of src to element for validation
  const imgElementMap = new Map();
  imgElements.forEach(img => {
    const src = img.getAttribute('src');
    if (src) {
      imgElementMap.set(src, img);
    }
  });

  while ((match = imgRegex.exec(content)) !== null) {
    let imgUrl = match[1];
    try {
      imgUrl = new URL(imgUrl, url).toString();
    } catch (e) {}
    images.push(imgUrl);
    
    // Validate image for featured image candidacy
    const imgElement = imgElementMap.get(match[1]);
    if (isValidFeaturedImage(imgUrl, imgElement)) {
      validImages.push(imgUrl);
    }
  }

  // Upload images and replace srcs
  for (const imgUrl of images) {
    try {
      console.log('Downloading image:', imgUrl);
      const { buffer, contentType } = await downloadBuffer(imgUrl);
      const filename = path.basename(new URL(imgUrl).pathname) || `${Date.now()}.jpg`;
      const slug = providedSlug ? providedSlug : slugify(title);
      const destPath = `articles/${slug}/${Date.now()}-${filename}`;
      console.log('Uploading to storage as:', destPath);
      const publicUrl = await uploadImage(buffer, contentType, destPath);
      transformed = transformed.split(imgUrl).join(publicUrl);
      console.log('Replaced', imgUrl, '->', publicUrl);
    } catch (e) {
      console.warn('Failed to import image', imgUrl, e.message || e);
    }
  }

  // Prepare blocks — single HTML block
  const blocks = [
    { type: 'html', html: transformed }
  ];

  const slug = providedSlug || slugify(title) || `article-${Date.now()}`;

  // Determine featured image with fallback logic
  let featuredImage = null;
  
  // 1. Try OG image if valid
  if (ogImage && isValidFeaturedImage(ogImage)) {
    featuredImage = ogImage;
    console.log('Using OG image as featured image:', featuredImage);
  }
  
  // 2. Fallback to first valid in-article image
  if (!featuredImage && validImages.length > 0) {
    featuredImage = validImages[0];
    console.log('Using first valid in-article image as featured:', featuredImage);
  }
  
  // 3. If no valid image, leave as null
  if (!featuredImage) {
    console.log('No valid featured image found, setting to null');
  }

  // Upsert article row as hosted (try update first, then insert)
  console.log('Upserting article row with slug:', slug);
  
  // Try to update existing article first
  const { data: existingArticle } = await supabase
    .from('articles')
    .select('id')
    .eq('slug', slug)
    .single();
  
  let articleRow;
  if (existingArticle) {
    // Update existing
    const { data, error } = await supabase
      .from('articles')
      .update({
        title,
        subtitle: excerpt,
        status: 'published',
        published_at: new Date().toISOString(),
        type: 'hosted',
        featured_image: featuredImage,
        og_title: title,
        og_description: excerpt,
        author: byline,
        reading_time: readingTimeMinutes,
        updated_at: new Date().toISOString()
      })
      .eq('slug', slug)
      .select()
      .single();
    
    if (error) throw error;
    articleRow = data;
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('articles')
      .insert({
        slug,
        title,
        subtitle: excerpt,
        status: 'published',
        published_at: new Date().toISOString(),
        type: 'hosted',
        featured_image: featuredImage,
        og_title: title,
        og_description: excerpt,
        author: byline,
        reading_time: readingTimeMinutes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    articleRow = data;
  }
  const articleId = articleRow.id;

  // Upsert blocks (delete and recreate to avoid conflict issues)
  console.log('Saving article blocks...');
  
  // Delete existing blocks first
  await supabase
    .from('article_blocks')
    .delete()
    .eq('article_id', articleId)
    .eq('role', 'body');
  
  // Insert new blocks
  const { data: blockRow, error: blockErr } = await supabase
    .from('article_blocks')
    .insert({ article_id: articleId, role: 'body', blocks })
    .select()
    .single();

  if (blockErr) throw blockErr;

  console.log('Import complete. Article ID:', articleId, 'slug:', slug);
  console.log('Visit /#blog/' + slug + ' to preview locally.');
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length < 1) {
    console.error('Usage: node tools/import-article.mjs <url> [slug]');
    process.exit(1);
  }
  const url = argv[0];
  const slug = argv[1];
  try {
    await importArticle(url, slug);
    process.exit(0);
  } catch (e) {
    console.error('Import failed:', e.message || e);
    process.exit(2);
  }
}

main();
