#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const { data, error } = await supabase
  .from('article_blocks')
  .select('blocks')
  .eq('article_id', '31b832dd-644f-4cee-95bd-e58d142fb639')
  .single();

if (error) {
  console.error(error);
  process.exit(1);
}

const html = data.blocks[0].html;
const imgRegex = /<img[^>]+>/g;
const matches = html.match(imgRegex) || [];

console.log(`Found ${matches.length} images in article\n`);

matches.forEach((img, i) => {
  const srcMatch = img.match(/src=["']([^"']+)["']/);
  const altMatch = img.match(/alt=["']([^"']+)["']/);
  console.log(`Image ${i + 1}:`);
  console.log(`  src: ${srcMatch ? srcMatch[1] : 'none'}`);
  console.log(`  alt: ${altMatch ? altMatch[1] : 'none'}\n`);
});
