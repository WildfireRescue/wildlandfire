// =====================================================
// GENERATE SITEMAP AT BUILD TIME
// Fetches published posts from Supabase and generates sitemap.xml
// =====================================================

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Missing Supabase environment variables - generating fallback sitemap with known URLs');

  // Known blog post slugs — kept in sync with what is actually published.
  // Add new slugs here when posts are published without Supabase access at build time.
  const knownBlogSlugs = [
    'Wildfire-Defense-Systems',
    'after-the-flames-what-wildfire-recovery-really-takes-and-how-we-help',
    'how-does-a-wildfire-start',
    'what-is-a-wildfire',
    'what-was-the-worst-wildfire-in-history',
    'wildfire-resilience',
  ];

  const today = new Date().toISOString().split('T')[0];

  const staticEntries = [
    { loc: '/',        priority: '1.0', changefreq: 'weekly'  },
    { loc: '/donate',  priority: '1.0', changefreq: 'weekly'  },
    { loc: '/about',   priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog',    priority: '0.9', changefreq: 'daily'   },
    { loc: '/stories', priority: '0.7', changefreq: 'weekly'  },
    { loc: '/grants',  priority: '0.8', changefreq: 'monthly' },
    { loc: '/contact', priority: '0.6', changefreq: 'monthly' },
    ...knownBlogSlugs.map(slug => ({
      loc: `/blog/${slug}`,
      priority: '0.7',
      changefreq: 'monthly',
    })),
  ];

  const minimalSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries.map(e => `  <url>
    <loc>https://thewildlandfirerecoveryfund.org${e.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  try {
    const outputPath = join(process.cwd(), 'public', 'sitemap.xml');
    writeFileSync(outputPath, minimalSitemap);
    console.log('✅ Minimal sitemap.xml generated successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to write sitemap:', error);
    process.exit(1);
  }
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority: number;
}

async function generateSitemap() {
  try {
    console.log('🔄 Fetching published blog posts from Supabase...');

    const { error: publishError } = await supabase.rpc('publish_due_scheduled_posts');
    if (publishError && publishError.code !== '42883') {
      console.warn('⚠️  Scheduled publish pre-check failed (continuing):', publishError.message);
    }
    
    // Fetch all published posts AND articles (both feed into /blog/:slug)
    const [postsResult, articlesResult] = await Promise.all([
      supabase
        .from('posts')
        .select('slug, updated_at, published_at')
        .eq('status', 'published')
        .eq('noindex', false)
        .order('published_at', { ascending: false }),
      supabase
        .from('articles')
        .select('slug, updated_at, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .then((r: any) => r)
        .catch(() => ({ data: [], error: null })),
    ]);

    if (postsResult.error) {
      console.error('❌ Error fetching posts:', postsResult.error);
      process.exit(1);
    }

    const posts = postsResult.data || [];
    const articles = ((articlesResult as any).data) || [];

    // Merge, deduplicate by slug (posts take precedence)
    const slugMap = new Map<string, { slug: string; updated_at?: string; published_at?: string }>();
    for (const p of [...posts, ...articles]) {
      if (!slugMap.has(p.slug)) slugMap.set(p.slug, p);
    }
    const allBlogPosts = Array.from(slugMap.values());

    console.log(`✅ Found ${posts.length} posts + ${articles.length} articles = ${allBlogPosts.length} unique blog URLs`);

    // Define static URLs
    const staticUrls: SitemapUrl[] = [
      { loc: '/', priority: 1.0, changefreq: 'weekly' },
      { loc: '/donate', priority: 1.0, changefreq: 'weekly' },
      { loc: '/about', priority: 0.8, changefreq: 'monthly' },
      { loc: '/blog', priority: 0.9, changefreq: 'daily' },
      { loc: '/stories', priority: 0.7, changefreq: 'weekly' },
      { loc: '/grants', priority: 0.8, changefreq: 'monthly' },
      { loc: '/contact', priority: 0.6, changefreq: 'monthly' },
    ];

    // Add blog posts and articles
    const postUrls: SitemapUrl[] = allBlogPosts.map(post => ({
      loc: `/blog/${post.slug}`,
      lastmod: post.updated_at || post.published_at,
      changefreq: 'monthly',
      priority: 0.7
    }));

    const allUrls = [...staticUrls, ...postUrls];

    // Generate XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>https://thewildlandfirerecoveryfund.org${url.loc}</loc>
${url.lastmod ? `    <lastmod>${url.lastmod.split('T')[0]}</lastmod>` : ''}
${url.changefreq ? `    <changefreq>${url.changefreq}</changefreq>` : ''}
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    // Write to public folder
    const outputPath = join(process.cwd(), 'public', 'sitemap.xml');
    writeFileSync(outputPath, sitemap, 'utf-8');

    console.log(`✅ Sitemap generated successfully at ${outputPath}`);
    console.log(`📊 Total URLs: ${allUrls.length} (${staticUrls.length} static + ${postUrls.length} blog posts)`);

  } catch (err) {
    console.error('❌ Error generating sitemap:', err);
    process.exit(1);
  }
}

generateSitemap();
