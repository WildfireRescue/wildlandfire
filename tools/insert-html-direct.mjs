import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);
const html = readFileSync('./article-full.txt', 'utf-8');

console.log('Read HTML:', html.length, 'chars');
console.log('First 100:', html.substring(0, 100));

const { data: article } = await supabase
  .from('articles')
  .select('id')
  .eq('slug', 'apple-news-maui-fire-federal-housing')
  .single();

await supabase
  .from('article_blocks')
  .delete()
  .eq('article_id', article.id)
  .eq('role', 'body');

const { error } = await supabase
  .from('article_blocks')
  .insert({
    article_id: article.id,
    role: 'body',
    blocks: [{ type: 'html', html: html }]
  });

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log('✅ Done! Inserted', html.length, 'chars');
