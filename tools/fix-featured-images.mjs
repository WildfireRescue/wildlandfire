#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

function isValidFeaturedImage(imgUrl) {
  if (!imgUrl) return false;
  
  const denylistPatterns = ['logo', 'icon', 'badge', 'apple', 'apple-news', 'civilbeat', 'appicon'];
  const urlLower = imgUrl.toLowerCase();
  
  for (const pattern of denylistPatterns) {
    if (urlLower.includes(pattern)) {
      console.log(`  ❌ Rejected (contains "${pattern}"): ${imgUrl}`);
      return false;
    }
  }
  
  return true;
}

async function extractImagesFromBlocks(articleId) {
  const { data, error } = await supabase
    .from('article_blocks')
    .select('blocks')
    .eq('article_id', articleId)
    .eq('role', 'body')
    .single();
  
  if (error || !data) return [];
  
  const blocks = data.blocks || [];
  const images = [];
  
  for (const block of blocks) {
    if (block.type === 'html' && block.html) {
      const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
      let match;
      while ((match = imgRegex.exec(block.html)) !== null) {
        images.push(match[1]);
      }
    }
  }
  
  return images;
}

async function fixFeaturedImages() {
  console.log('Fetching all hosted articles...\n');
  
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, slug, title, featured_image, og_image')
    .eq('type', 'hosted');
  
  if (error) {
    console.error('Error fetching articles:', error);
    process.exit(1);
  }
  
  console.log(`Found ${articles.length} hosted articles\n`);
  
  for (const article of articles) {
    console.log(`\n📄 ${article.title}`);
    console.log(`   Slug: ${article.slug}`);
    console.log(`   Current featured_image: ${article.featured_image || 'null'}`);
    console.log(`   Current og_image: ${article.og_image || 'null'}`);
    
    let newFeaturedImage = article.featured_image;
    let changed = false;
    
    // Check if current featured_image is invalid or missing
    const needsNewImage = !article.featured_image || !isValidFeaturedImage(article.featured_image);
    
    if (needsNewImage) {
      if (article.featured_image) {
        console.log('  ⚠️  Current featured_image is invalid');
      } else {
        console.log('  ⚠️  No featured_image set');
      }
      
      // Try og_image first
      if (article.og_image && isValidFeaturedImage(article.og_image)) {
        newFeaturedImage = article.og_image;
        console.log(`  ✅ Using og_image as replacement: ${newFeaturedImage}`);
        changed = true;
      } else {
        // Extract images from article content
        console.log('  🔍 Searching article content for valid images...');
        const contentImages = await extractImagesFromBlocks(article.id);
        console.log(`     Found ${contentImages.length} images in content`);
        
        // Find first valid image
        const validImage = contentImages.find(img => isValidFeaturedImage(img));
        
        if (validImage) {
          newFeaturedImage = validImage;
          console.log(`  ✅ Using first valid content image: ${validImage}`);
          changed = true;
        } else {
          newFeaturedImage = null;
          console.log('  ⚠️  No valid images found, setting to null');
          changed = true;
        }
      }
    } else {
      console.log('  ✓ Featured image is valid');
    }
    
    if (changed) {
      const { error: updateError } = await supabase
        .from('articles')
        .update({ featured_image: newFeaturedImage })
        .eq('id', article.id);
      
      if (updateError) {
        console.error('  ❌ Failed to update:', updateError);
      } else {
        console.log('  💾 Updated successfully');
      }
    }
  }
  
  console.log('\n✨ Done!');
}

fixFeaturedImages().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
