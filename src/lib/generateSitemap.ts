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
  console.warn('⚠️  Missing Supabase environment variables - generating minimal sitemap');
  
  // Generate minimal sitemap without blog posts
  const minimalSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://thewildlandfirerecoveryfund.org/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://thewildlandfirerecoveryfund.org/#donate</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://thewildlandfirerecoveryfund.org/#about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://thewildlandfirerecoveryfund.org/#blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>0.8</priority>
  </url>
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
    
    // Fetch all published posts
    const { data: posts, error } = await supabase
      .from('posts')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .eq('noindex', false)
      .order('published_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching posts:', error);
      process.exit(1);
    }

    console.log(`✅ Found ${posts?.length || 0} published posts`);

    // Define static URLs
    const staticUrls: SitemapUrl[] = [
      { loc: '/', priority: 1.0, changefreq: 'weekly' },
      { loc: '/#donate', priority: 1.0, changefreq: 'weekly' },
      { loc: '/#about', priority: 0.8, changefreq: 'monthly' },
      { loc: '/#blog', priority: 0.9, changefreq: 'daily' },
      { loc: '/#stories', priority: 0.7, changefreq: 'weekly' },
      { loc: '/#grants', priority: 0.8, changefreq: 'monthly' },
      { loc: '/#contact', priority: 0.6, changefreq: 'monthly' },
    ];

    // Add blog posts
    const postUrls: SitemapUrl[] = (posts || []).map(post => ({
      loc: `/#blog/${post.slug}`,
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
