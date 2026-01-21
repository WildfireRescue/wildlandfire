import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

// Read the HTML from a file you'll create
const html = readFileSync('./article-html.txt', 'utf-8');

console.log('HTML file length:', html.length);
console.log('First 100 chars:', html.substring(0, 100));

async function insertHTML() {
  // Get the article ID
  const { data: article } = await supabase
    .from('articles')
    .select('id')
    .eq('slug', 'apple-news-maui-fire-federal-housing')
    .single();

  if (!article) {
    console.error('Article not found');
    process.exit(1);
  }

  // Delete existing body blocks
  await supabase
    .from('article_blocks')
    .delete()
    .eq('article_id', article.id)
    .eq('role', 'body');

  // Insert new body block with HTML
  const { error } = await supabase
    .from('article_blocks')
    .insert({
      article_id: article.id,
      role: 'body',
      blocks: [
        {
          type: 'html',
          html: html
        }
      ]
    });

  if (error) {
    console.error('Error inserting:', error);
    process.exit(1);
  }

  console.log('✅ HTML inserted successfully!');
}

insertHTML();
