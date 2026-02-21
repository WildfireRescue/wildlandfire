/**
 * Post-Build Blog Prerenderer
 * Prerendering blog routes for SEO after Vite build
 * 
 * This script:
 * 1. Fetches all published posts/articles from Supabase
 * 2. Renders HTML for /blog and /blog/:slug routes
 * 3. Injects SEO meta tags, OG, Twitter, and JSON-LD schema
 * 4. Writes prerendered HTML files to dist/
 * 
 * The main SPA (index.html) remains a traditional SPA for other routes.
 * Only /blog/* routes are prerendered for search engine crawlers.
 * 
 * Usage: tsx scripts/prerender-blog.ts
 * Called from: npm run build (via postbuild script)
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { JSDOM } from 'jsdom';

const DIST_DIR = 'dist';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';
const SITE_ORIGIN = 'https://www.thewildlandfirerecoveryfund.org';

interface BlogPost {
  id: string;
  slug: string;
  title?: string;
  excerpt?: string;
  meta_title?: string;
  meta_title_final?: string;
  meta_description?: string;
  meta_description_final?: string;
  og_title?: string;
  og_title_final?: string;
  og_description?: string;
  og_description_final?: string;
  og_image_url?: string;
  og_image_width?: number;
  og_image_height?: number;
  og_image_type?: string;
  canonical_url?: string;
  canonical_url_final?: string;
  twitter_card?: string;
  twitter_card_final?: string;
  robots_directives?: string;
  robots_final?: string;
  published_at?: string;
  updated_at?: string;
  author_name?: string;
  author_bio?: string;
  category?: string;
  tags?: string[];
  reading_time_minutes?: number;
}

interface Article {
  id: string;
  slug: string;
  title?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_image_width?: number;
  og_image_height?: number;
  og_image_type?: string;
  canonical_url?: string;
  external_url?: string;
  author?: string;
  source_name?: string;
  category?: string;
  tags?: string[];
  published_at?: string;
  updated_at?: string;
  robots_directives?: string;
  twitter_creator?: string;
  reading_time?: number;
}

function normalizePost(post: BlogPost): BlogPost {
  return {
    ...post,
    meta_title_final: post.meta_title_final || post.meta_title || post.title || 'Blog Post',
    meta_description_final: post.meta_description_final || post.meta_description || post.excerpt || '',
    og_title_final: post.og_title_final || post.og_title || post.meta_title || post.title || 'Blog Post',
    og_description_final: post.og_description_final || post.og_description || post.meta_description || post.excerpt || '',
    og_image_width: post.og_image_width || 1200,
    og_image_height: post.og_image_height || 630,
    og_image_type: post.og_image_type || 'image/jpeg',
    canonical_url_final: post.canonical_url_final || post.canonical_url || `${SITE_ORIGIN}/blog/${post.slug}`,
    twitter_card_final: post.twitter_card_final || post.twitter_card || 'summary_large_image',
    robots_final: post.robots_final || post.robots_directives || 'index,follow,max-image-preview:large',
  };
}

function normalizeArticle(article: Article): BlogPost {
  const title = article.title || article.og_title || 'Article';
  const description = article.og_description || '';
  return {
    id: article.id,
    slug: article.slug,
    title,
    excerpt: description,
    meta_title: article.og_title,
    meta_title_final: article.og_title || title,
    meta_description: article.og_description,
    meta_description_final: article.og_description || description,
    og_title: article.og_title,
    og_title_final: article.og_title || title,
    og_description: article.og_description,
    og_description_final: article.og_description || description,
    og_image_url: article.og_image,
    og_image_width: article.og_image_width || 1200,
    og_image_height: article.og_image_height || 630,
    og_image_type: article.og_image_type || 'image/jpeg',
    canonical_url: article.external_url || article.canonical_url,
    canonical_url_final: article.external_url || article.canonical_url || `${SITE_ORIGIN}/blog/${article.slug}`,
    twitter_card: 'summary_large_image',
    twitter_card_final: 'summary_large_image',
    robots_directives: article.robots_directives,
    robots_final: article.robots_directives || 'index,follow,max-image-preview:large',
    published_at: article.published_at,
    updated_at: article.updated_at,
    author_name: article.author || article.source_name,
    category: article.category,
    tags: article.tags,
    reading_time_minutes: article.reading_time || 5,
  };
}

async function fetchPublishedPosts(): Promise<BlogPost[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('⚠️  Missing Supabase environment variables. Skipping blog prerendering.');
    return [];
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    // Fetch from posts_seo_view if available, fallback to posts table
    console.log('📥 Fetching published posts...');
    const [postsRes, articlesRes] = await Promise.all([
      supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .eq('noindex', false),
      supabase
        .from('articles')
        .select('*')
        .eq('status', 'published'),
    ]);

    const posts: BlogPost[] = (postsRes.data || []).map((p: any) => normalizePost(p));
    const articles: BlogPost[] = (articlesRes.data || []).map((a: any) => normalizeArticle(a));

    const allPosts = [...posts, ...articles];

    console.log(`✓ Found ${allPosts.length} published posts and articles`);
    return allPosts;
  } catch (error: any) {
    console.error('❌ Error fetching posts:', error.message);
    return [];
  }
}

function injectSEOTags(html: string, post: BlogPost, baseUrl: string = SITE_ORIGIN): string {
  const doc = new JSDOM(html).window.document;

  // Always update <title>
  const title = doc.querySelector('title');
  if (title) {
    title.textContent = post.meta_title_final || 'Blog Post';
  }

  // Update or create meta description
  let metaDesc = doc.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = doc.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    doc.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', post.meta_description_final || '');

  // Update robots meta
  let robotsMeta = doc.querySelector('meta[name="robots"]');
  if (!robotsMeta) {
    robotsMeta = doc.createElement('meta');
    robotsMeta.setAttribute('name', 'robots');
    doc.head.appendChild(robotsMeta);
  }
  robotsMeta.setAttribute('content', post.robots_final || 'index,follow');

  // Update canonical
  let canonical = doc.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = doc.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    doc.head.appendChild(canonical);
  }
  canonical.setAttribute('href', post.canonical_url_final || `${baseUrl}/blog/${post.slug}`);

  // Open Graph tags
  const ogTags: [string, string][] = [
    ['og:title', post.og_title_final || ''],
    ['og:description', post.og_description_final || ''],
    ['og:type', 'article'],
    ['og:url', `${baseUrl}/blog/${post.slug}`],
    ['og:site_name', 'The Wildland Fire Recovery Fund'],
  ];

  if (post.og_image_url) {
    ogTags.push(['og:image', post.og_image_url]);
    ogTags.push(['og:image:width', String(post.og_image_width || 1200)]);
    ogTags.push(['og:image:height', String(post.og_image_height || 630)]);
    ogTags.push(['og:image:type', post.og_image_type || 'image/jpeg']);
  }

  for (const [property, content] of ogTags) {
    let tag = doc.querySelector(`meta[property="${property}"]`);
    if (!tag) {
      tag = doc.createElement('meta');
      tag.setAttribute('property', property);
      doc.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  }

  // Twitter Card tags
  const twitterTags: [string, string][] = [
    ['twitter:card', post.twitter_card_final || 'summary_large_image'],
    ['twitter:title', post.og_title_final || ''],
    ['twitter:description', post.og_description_final || ''],
  ];

  if (post.og_image_url) {
    twitterTags.push(['twitter:image', post.og_image_url]);
  }

  for (const [name, content] of twitterTags) {
    let tag = doc.querySelector(`meta[name="${name}"]`);
    if (!tag) {
      tag = doc.createElement('meta');
      tag.setAttribute('name', name);
      doc.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  }

  // JSON-LD BlogPosting schema
  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title || post.meta_title_final,
    description: post.meta_description_final,
    image: post.og_image_url || `${baseUrl}/Images/logo-128.png`,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: post.author_name ? {
      '@type': 'Person',
      name: post.author_name,
      ...(post.author_bio && { description: post.author_bio }),
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'The Wildland Fire Recovery Fund',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/Images/logo-128.png`,
        width: 128,
        height: 128,
      },
    },
    inLanguage: 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      url: baseUrl,
      name: 'The Wildland Fire Recovery Fund',
    },
    url: `${baseUrl}/blog/${post.slug}`,
    articleBody: post.excerpt || post.meta_description_final,
  };

  let schemaScript = doc.getElementById('article-structured-data');
  if (!schemaScript) {
    schemaScript = doc.createElement('script');
    schemaScript.id = 'article-structured-data';
    schemaScript.type = 'application/ld+json';
    doc.head.appendChild(schemaScript);
  }
  schemaScript.textContent = JSON.stringify(blogPostingSchema, null, 2);

  return doc.documentElement.outerHTML;
}

async function prerenderBlogRoutes() {
  console.log('\n🚀 Starting blog prerendering...\n');

  if (!fs.existsSync(DIST_DIR)) {
    console.error(`❌ Error: ${DIST_DIR} directory not found. Run "npm run build" first.`);
    process.exit(1);
  }

  const indexHtmlPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    console.error(`❌ Error: ${indexHtmlPath} not found.`);
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
  const posts = await fetchPublishedPosts();

  if (posts.length === 0) {
    console.warn('⚠️  No posts found. Blog prerendering skipped.');
    return;
  }

  // Create blog directory
  const blogDir = path.join(DIST_DIR, 'blog');
  if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(blogDir, { recursive: true });
  }

  let successCount = 0;
  let errorCount = 0;

  // Prerender each blog post
  for (const post of posts) {
    try {
      const seoHtml = injectSEOTags(baseHtml, post);
      const postDir = path.join(blogDir, post.slug);
      
      // Create post slug directory
      if (!fs.existsSync(postDir)) {
        fs.mkdirSync(postDir, { recursive: true });
      }

      // Write index.html to /blog/:slug/index.html
      const indexPath = path.join(postDir, 'index.html');
      fs.writeFileSync(indexPath, seoHtml, 'utf-8');

      console.log(`✓ Prerendered: /blog/${post.slug}`);
      successCount++;
    } catch (error: any) {
      console.error(`✗ Error prerendering ${post.slug}:`, error.message);
      errorCount++;
    }
  }

  // Prerender /blog index page
  try {
    const indexHtml = injectSEOTags(baseHtml, {
      slug: '',
      title: 'Blog',
      meta_title_final: 'Blog | The Wildland Fire Recovery Fund',
      meta_description_final: 'Read our latest resources on wildfire recovery, community support, and fire preparedness.',
      og_title_final: 'Blog | The Wildland Fire Recovery Fund',
      og_description_final: 'Read our latest resources on wildfire recovery.',
      canonical_url_final: `${SITE_ORIGIN}/blog`,
      robots_final: 'index,follow,max-image-preview:large',
      twitter_card_final: 'summary_large_image',
    });
    fs.writeFileSync(path.join(blogDir, 'index.html'), indexHtml, 'utf-8');
    console.log('✓ Prerendered: /blog');
    successCount++;
  } catch (error: any) {
    console.error('✗ Error prerendering /blog:', error.message);
    errorCount++;
  }

  console.log(`\n✅ Prerendering complete: ${successCount} pages succeeded, ${errorCount} failed\n`);
}

prerenderBlogRoutes().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

