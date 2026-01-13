// =====================================================
// GENERATE RSS FEED AT BUILD TIME
// Fetches published posts from Supabase and generates rss.xml
// =====================================================

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Missing Supabase environment variables - generating minimal RSS');
  
  // Generate minimal RSS feed without blog posts
  const minimalRSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Wildland Fire Recovery Fund Blog</title>
    <link>https://thewildlandfirerecoveryfund.org/#blog</link>
    <description>Latest news, stories, and updates from The Wildland Fire Recovery Fund</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://thewildlandfirerecoveryfund.org/rss.xml" rel="self" type="application/rss+xml"/>
  </channel>
</rss>`;

  try {
    const outputPath = join(process.cwd(), 'public', 'rss.xml');
    writeFileSync(outputPath, minimalRSS);
    console.log('✅ Minimal rss.xml generated successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to write RSS feed:', error);
    process.exit(1);
  }
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function generateRSS() {
  try {
    console.log('🔄 Fetching published blog posts for RSS feed...');
    
    // Fetch recent published posts
    const { data: posts, error } = await supabase
      .from('posts')
      .select('slug, title, excerpt, content_markdown, author_name, published_at, updated_at, cover_image_url, category')
      .eq('status', 'published')
      .eq('noindex', false)
      .order('published_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('❌ Error fetching posts:', error);
      process.exit(1);
    }

    console.log(`✅ Found ${posts?.length || 0} posts for RSS feed`);

    // Generate RSS XML
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>The Wildland Fire Recovery Fund Blog</title>
    <link>https://thewildlandfirerecoveryfund.org/#blog</link>
    <description>Latest news, stories, and updates from The Wildland Fire Recovery Fund - supporting wildfire survivors with emergency assistance and long-term recovery.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://thewildlandfirerecoveryfund.org/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>https://thewildlandfirerecoveryfund.org/Images/logo-512.png</url>
      <title>The Wildland Fire Recovery Fund</title>
      <link>https://thewildlandfirerecoveryfund.org</link>
    </image>
${(posts || []).map(post => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>https://thewildlandfirerecoveryfund.org/#blog/${post.slug}</link>
      <guid isPermaLink="true">https://thewildlandfirerecoveryfund.org/#blog/${post.slug}</guid>
      <pubDate>${new Date(post.published_at || post.updated_at).toUTCString()}</pubDate>
      ${post.author_name ? `<dc:creator><![CDATA[${post.author_name}]]></dc:creator>` : ''}
      ${post.category ? `<category><![CDATA[${post.category}]]></category>` : ''}
      <description><![CDATA[${post.excerpt || ''}]]></description>
      ${post.cover_image_url ? `<enclosure url="${post.cover_image_url}" type="image/jpeg"/>` : ''}
    </item>`).join('\n')}
  </channel>
</rss>`;

    // Write to public folder
    const outputPath = join(process.cwd(), 'public', 'rss.xml');
    writeFileSync(outputPath, rss, 'utf-8');

    console.log(`✅ RSS feed generated successfully at ${outputPath}`);
    console.log(`📊 Total items: ${posts?.length || 0}`);

  } catch (err) {
    console.error('❌ Error generating RSS feed:', err);
    process.exit(1);
  }
}

generateRSS();
