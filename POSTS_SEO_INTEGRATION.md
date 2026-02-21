// ============================================================================
// BLOG EDITOR + POSTS_SEO_VIEW INTEGRATION GUIDE
// ============================================================================
// Your BlogEditorPage is already set up to save most SEO fields!
// This guide shows what's ready, what's missing, and how to use posts_seo_view

// ============================================================================
// 1. FIELDS YOUR BLOG EDITOR ALREADY SAVES
// ============================================================================

// ✅ These fields are already in BlogEditorPage and saved to the posts table:
const editorFieldsAlreadySaved = {
  // Core
  title: "string",
  slug: "string",
  excerpt: "string",
  content_markdown: "string",
  
  // SEO
  meta_title: "string",
  meta_description: "string",
  canonical_url: "string",
  focus_keyword: "string",
  secondary_keywords: "string[] (from comma-separated input)",
  
  // Images
  cover_image_url: "string",
  featured_image_url: "string",
  featured_image_alt_text: "string",
  og_image_url: "string",
  
  // Social
  og_title: "string",
  og_description: "string",
  twitter_card: "string",
  
  // Categories & Tags
  category: "string",
  tags: "string[] (from comma-separated input)",
  
  // Publishing
  status: "'draft' | 'scheduled' | 'published'",
  scheduled_for: "string (ISO timestamp)",
  featured: "boolean",
  
  // Indexing
  allow_indexing: "boolean",
  allow_follow: "boolean",
  robots_directives: "string",
  sitemap_priority: "number",
  
  // Author & Trust
  author_name: "string",
  author_role: "string",
  author_bio: "string",
  reviewed_by: "string",
  fact_checked: "boolean",
  
  // Timestamps
  published_at: "ISO string (auto-set when published)",
  reading_time_minutes: "number (auto-calculated)",
};

// ============================================================================
// 2. NEW FIELDS ADDED TO DATABASE (not yet in editor UI)
// ============================================================================

// ⚠️ These are in the database but may not be in your editor UI:
const newDatabaseFields = {
  og_image_width: 1200,          // Default: 1200 (for Open Graph)
  og_image_height: 630,           // Default: 630 (standard OG dimensions)
  og_image_type: "image/jpeg",   // Default: "image/jpeg"
};

// If you want to expose these in the UI, update BlogEditorPage:
// 1. Add state: const [ogImageWidth, setOgImageWidth] = useState("1200");
// 2. Add input fields for fine-tuning image dimensions
// 3. Include in postData: og_image_width: parseInt(ogImageWidth) || 1200

// ============================================================================
// 3. YOUR SEO VIEW IN ACTION
// ============================================================================

// After running the migration, you now have posts_seo_view available.
// This view automatically handles all fallback logic for you.

// Example: Fetch post for rendering page with meta tags
async function fetchPostForRendering(slug: string) {
  const { data: post, error } = await supabase
    .from('posts_seo_view')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  
  if (error) throw error;
  
  // post.meta_title_final is already computed with fallbacks:
  // IF meta_title IS SET → use it
  // ELSE use post.title
  
  return post;
}

// ============================================================================
// 4. RENDERING META TAGS WITH FALLBACKS (all built into the view)
// ============================================================================

// In your React component or template:
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function BlogPageHead({ slug }: { slug: string }) {
  const [post, setPost] = useState<any>(null);
  
  useEffect(() => {
    async function loadPost() {
      const { data } = await supabase
        .from('posts_seo_view')
        .select('*')
        .eq('slug', slug)
        .single();
      setPost(data);
    }
    loadPost();
  }, [slug]);
  
  if (!post) return null;
  
  return (
    <>
      <Helmet>
        {/* TITLE - Use meta_title_final (has fallback to post.title) */}
        <title>{post.meta_title_final}</title>
        
        {/* DESCRIPTION - Use meta_description_final (has fallback to excerpt) */}
        <meta name="description" content={post.meta_description_final} />
        
        {/* KEYWORDS */}
        {post.focus_keyword && <meta name="keywords" content={post.focus_keyword} />}
        
        {/* ROBOTS - Use robots_final (smart logic based on allow_indexing/allow_follow) */}
        <meta name="robots" content={post.robots_final} />
        
        {/* CANONICAL */}
        <link rel="canonical" href={post.canonical_url_final} />
        
        {/* OPEN GRAPH - All _final fields include cascading fallbacks */}
        <meta property="og:title" content={post.og_title_final} />
        <meta property="og:description" content={post.og_description_final} />
        <meta property="og:image" content={post.og_image_url} />
        <meta property="og:image:width" content={post.og_image_width} />
        <meta property="og:image:height" content={post.og_image_height} />
        <meta property="og:image:type" content={post.og_image_type} />
        <meta property="og:url" content={post.canonical_url_final} />
        <meta property="og:type" content="article" />
        
        {/* TWITTER CARD */}
        <meta name="twitter:card" content={post.twitter_card_final} />
        <meta name="twitter:title" content={post.og_title_final} />
        <meta name="twitter:description" content={post.og_description_final} />
        <meta name="twitter:image" content={post.og_image_url} />
        
        {/* STRUCTURED DATA - JSON-LD BlogPosting */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.meta_description_final,
            "image": post.og_image_url,
            "datePublished": post.published_at,
            "dateModified": post.updated_at,
            "author": {
              "@type": "Person",
              "name": post.author_name,
              "description": post.author_bio
            },
            "publisher": {
              "@type": "Organization",
              "name": "The Wildland Fire Recovery Fund",
              "logo": {
                "@type": "ImageObject",
                "url": "https://thewildlandfirerecoveryfund.org/logo.png",
                "width": 250,
                "height": 60
              }
            },
            "isPartOf": {
              "@type": "WebSite",
              "url": "https://thewildlandfirerecoveryfund.org",
              "name": "The Wildland Fire Recovery Fund"
            },
            "url": post.canonical_url_final,
            "articleBody": post.excerpt
          })}
        </script>
      </Helmet>
    </>
  );
}

// ============================================================================
// 5. COMMON QUERIES YOU'LL USE
// ============================================================================

// QUERY 1: Get single post by slug (for blog page)
const getSinglePost = async (slug: string) => {
  return supabase
    .from('posts_seo_view')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
};

// QUERY 2: Get recent posts (for homepage)
const getRecentPosts = async (limit = 10) => {
  return supabase
    .from('posts_seo_view')
    .select('id,slug,title,excerpt,published_at,featured_image_url,featured_image_alt,author_name')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);
};

// QUERY 3: Get posts for sitemap generation
const getPostsForSitemap = async () => {
  return supabase
    .from('posts_seo_view')
    .select('slug,published_at,sitemap_priority_final')
    .eq('status', 'published')
    .eq('allow_indexing', true)
    .order('published_at', { ascending: false });
};

// QUERY 4: Get posts for search/filtering
const searchPosts = async (keyword: string) => {
  return supabase
    .from('posts_seo_view')
    .select('*')
    .eq('status', 'published')
    .or(`title.ilike.%${keyword}%,excerpt.ilike.%${keyword}%,focus_keyword.ilike.%${keyword}%`)
    .order('published_at', { ascending: false });
};

// ============================================================================
// 6. IMPORTANT: UNDERSTANDING THE "_final" FIELDS
// ============================================================================

/*
The posts_seo_view automatically computes all "_final" fields:

Field Name              | Fallback Chain
─────────────────────────────────────────────────────────────────────
meta_title_final        | meta_title → post.title
meta_description_final  | meta_description → excerpt
canonical_url_final     | canonical_url → auto-built from slug
og_title_final          | og_title → meta_title → title
og_description_final    | og_description → meta_description → excerpt
twitter_card_final      | twitter_card (default: summary_large_image)
robots_final            | robots_directives override OR logic from:
                          - allow_indexing=F, allow_follow=F → "noindex,nofollow"
                          - allow_indexing=F → "noindex,follow"
                          - allow_follow=F → "index,nofollow"
                          - default → "index,follow,max-image-preview:large,...

BEST PRACTICE: Always use the "_final" fields in HTML output.
Never use the non-final fields directly (they might be null).
*/

// ============================================================================
// 7. UPDATING POSTS (FROM BLOG EDITOR)
// ============================================================================

async function updatePostFromEditor(slug: string, formData: any) {
  const { data, error } = await supabase
    .from('posts')
    .update({
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt,
      
      // SEO fields
      meta_title: formData.metaTitle,
      meta_description: formData.metaDescription,
      focus_keyword: formData.focusKeyword,
      secondary_keywords: formData.secondaryKeywords, // array
      canonical_url: formData.canonicalUrl,
      
      // OG fields
      og_title: formData.ogTitle,
      og_description: formData.ogDescription,
      og_image_url: formData.ogImageUrl,
      og_image_width: formData.ogImageWidth || 1200,
      og_image_height: formData.ogImageHeight || 630,
      og_image_type: formData.ogImageType || 'image/jpeg',
      
      // Twitter
      twitter_card: formData.twitterCard,
      
      // Images
      featured_image_url: formData.featuredImageUrl,
      featured_image_alt_text: formData.featuredImageAltText,
      
      // Indexing
      allow_indexing: formData.allowIndexing,
      allow_follow: formData.allowFollow,
      robots_directives: formData.robotsDirectives,
      sitemap_priority: formData.sitemapPriority,
      
      // Author
      author_name: formData.authorName,
      author_role: formData.authorRole,
      author_bio: formData.authorBio,
      reviewed_by: formData.reviewedBy,
      fact_checked: formData.factChecked,
      
      // Timestamps
      updated_at: new Date().toISOString(),
      published_at: formData.status === 'published' ? new Date().toISOString() : null
    })
    .eq('slug', slug)
    .select()
    .single();
  
  return { data, error };
}

// ============================================================================
// 8. NEXT STEPS
// ============================================================================

/*
✅ DONE:
  1. Migration applied (all SEO columns added)
  2. posts_seo_view created with fallback logic
  3. Your blog editor already saves most fields

📋 OPTIONAL IMPROVEMENTS:
  1. Add og_image_width/height/type inputs to BlogEditorPage UI
  2. Add "featured image alt" to featured image upload
  3. Show meta_description character count (warn at 160)
  4. Add focus keyword verification helper
  5. Create SEO score badge in editor
  6. Update BlogPostPage to use posts_seo_view instead of posts table

🚀 READY TO USE:
  - Query posts_seo_view in your blog rendering components
  - All meta tags will have smart fallbacks
  - SEO fields are persisted and queryable
  - RLS policy allows public read of published posts
*/
