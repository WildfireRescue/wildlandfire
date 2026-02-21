#!/usr/bin/env node

/**
 * Get Prerender Routes from Supabase
 * 
 * Fetch all published blog slugs from Supabase at build time.
 * This script is used by the prerender process to know which pages to generate.
 * 
 * Usage:
 *   node scripts/get-prerender-routes.mjs
 * 
 * Returns JSON array of routes:
 *   [
 *     { route: "/blog", priority: "0.9" },
 *     { route: "/blog/slug-1", priority: "0.8" },
 *     { route: "/blog/slug-2", priority: "0.8" },
 *   ]
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

async function getPrerenderRoutes() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables');
    console.error('   Set these in your .env.local or Netlify environment variables');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    console.error('📥 Fetching prerender routes from Supabase...');
    
    // Fetch published posts and articles in parallel
    const [postsRes, articlesRes] = await Promise.all([
      supabase
        .from('posts')
        .select('slug')
        .eq('status', 'published')
        .eq('noindex', false),
      supabase
        .from('articles')
        .select('slug')
        .eq('status', 'published'),
    ]);

    const posts = (postsRes.data || []).map(p => p.slug);
    const articles = (articlesRes.data || []).map(a => a.slug);
    const allSlugs = [...new Set([...posts, ...articles])]; // Deduplicate

    const routes = [
      { route: '/blog', priority: '0.9' },
      ...allSlugs.map((slug) => ({
        route: `/blog/${slug}`,
        priority: '0.8',
      })),
    ];

    console.error(`✓ Found ${routes.length - 1} blog posts to prerender`);
    
    // Output JSON to stdout (for consumption by other scripts)
    console.log(JSON.stringify(routes, null, 2));
    
  } catch (error) {
    console.error('❌ Error fetching routes:', error.message);
    process.exit(1);
  }
}

getPrerenderRoutes();
