-- ============================================================================
-- EXAMPLE QUERIES FOR BLOG RENDERING
-- ============================================================================
-- Use these queries from your frontend to fetch posts for rendering meta tags,
-- JSON-LD, and blog pages.

-- ============================================================================
-- QUERY 1: FETCH A SINGLE POST BY SLUG (for blog page rendering)
-- ============================================================================
-- Use this to render a blog post page with all SEO tags properly set

SELECT
  id,
  slug,
  title,
  excerpt,
  content,
  status,
  published_at,
  updated_at,
  meta_title_final,
  meta_description_final,
  og_title_final,
  og_description_final,
  og_image_url,
  og_image_width,
  og_image_height,
  og_image_type,
  twitter_card_final,
  featured_image_url,
  featured_image_alt,
  canonical_url_final,
  robots_final,
  focus_keyword,
  secondary_keywords,
  author_name,
  author_role,
  author_bio,
  fact_checked,
  reviewed_by
FROM public.posts_seo_view
WHERE slug = $1  -- Pass the slug as a parameter
  AND status = 'published';

-- ============================================================================
-- QUERY 2: FETCH LATEST POSTS FOR BLOG LISTING
-- ============================================================================
-- Use this for homepage or blog archive pages

SELECT
  id,
  slug,
  title,
  excerpt,
  published_at,
  updated_at,
  og_image_url,
  featured_image_url,
  featured_image_alt,
  author_name,
  fact_checked
FROM public.posts_seo_view
WHERE status = 'published'
ORDER BY published_at DESC
LIMIT 10;

-- ============================================================================
-- QUERY 3: FETCH POST FOR SEO SITEMAP GENERATION
-- ============================================================================
-- Use this to build sitemap.xml dynamically

SELECT
  slug,
  published_at AS lastmod,
  sitemap_priority_final AS priority,
  'weekly' AS changefreq  -- You can vary this based on post type
FROM public.posts_seo_view
WHERE status = 'published'
  AND allow_indexing = true
ORDER BY published_at DESC;

-- ============================================================================
-- QUERY 4: FETCH POST WITH FULL JSON-LD SCHEMA DATA
-- ============================================================================
-- Use this when you need comprehensive data for JSON-LD generation

SELECT
  id,
  slug,
  title,
  excerpt,
  content,
  published_at,
  updated_at,
  og_image_url,
  og_image_width,
  og_image_height,
  og_image_type,
  meta_description_final,
  robots_final,
  canonical_url_final,
  author_name,
  author_role,
  author_bio,
  fact_checked,
  reviewed_by,
  secondary_keywords
FROM public.posts_seo_view
WHERE slug = $1
  AND status = 'published';

-- ============================================================================
-- QUERY 5: SEARCH POSTS BY FOCUS KEYWORD (for internal linking)
-- ============================================================================
-- Use this to find related posts for "People Also Search For" or internal links

SELECT
  id,
  slug,
  title,
  excerpt,
  focus_keyword
FROM public.posts_seo_view
WHERE status = 'published'
  AND (
    focus_keyword ILIKE $1
    OR secondary_keywords ? $2  -- jsonb contains check for keyword string
  )
LIMIT 5;

-- ============================================================================
-- QUERY 6: FIND POSTS NEEDING FACT-CHECK REVIEW
-- ============================================================================
-- Use this for your editorial dashboard

SELECT
  id,
  slug,
  title,
  author_name,
  published_at,
  fact_checked,
  reviewed_by
FROM public.posts
WHERE status = 'published'
  AND fact_checked = false
ORDER BY published_at DESC;

-- ============================================================================
-- FRONTEND INTEGRATION EXAMPLES
-- ============================================================================

-- ============================================================================
-- EXAMPLE 1: RENDERING SEO <head> TAGS IN REACT
-- ============================================================================

/*
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export function BlogPage({ slug }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      const { data, error } = await supabase
        .from('posts_seo_view')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) console.error(error);
      setPost(data);
      setLoading(false);
    }

    fetchPost();
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <>
      <Head>
        {/* META TAGS */}
        <title>{post.meta_title_final}</title>
        <meta name="description" content={post.meta_description_final} />
        <meta name="robots" content={post.robots_final} />
        
        {/* CANONICAL */}
        <link rel="canonical" href={post.canonical_url_final} />
        
        {/* OG TAGS */}
        <meta property="og:title" content={post.og_title_final} />
        <meta property="og:description" content={post.og_description_final} />
        <meta property="og:image" content={post.og_image_url} />
        <meta property="og:image:width" content={post.og_image_width} />
        <meta property="og:image:height" content={post.og_image_height} />
        <meta property="og:image:type" content={post.og_image_type} />
        <meta property="og:url" content={post.canonical_url_final} />
        
        {/* TWITTER CARD */}
        <meta name="twitter:card" content={post.twitter_card_final} />
        <meta name="twitter:title" content={post.og_title_final} />
        <meta name="twitter:description" content={post.og_description_final} />
        <meta name="twitter:image" content={post.og_image_url} />
        
        {/* FOCUS KEYWORD */}
        <meta name="keywords" content={post.focus_keyword} />
        
        {/* JSON-LD */}
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
            "factChecked": post.fact_checked,
            "url": post.canonical_url_final
          })}
        </script>
      </Head>
      
      <article>
        <h1>{post.title}</h1>
        {post.featured_image_url && (
          <img 
            src={post.featured_image_url} 
            alt={post.featured_image_alt || post.title}
          />
        )}
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </>
  );
}
*/

-- ============================================================================
-- EXAMPLE 2: POSTING/UPDATING A POST FROM BLOG EDITOR
-- ============================================================================

/*
// When user saves a post from your blog editor:

const updatePost = async (postData) => {
  const { error } = await supabase
    .from('posts')
    .update({
      title: postData.title,
      slug: postData.slug,
      excerpt: postData.excerpt,
      content: postData.content,
      
      // SEO Fields
      meta_title: postData.metaTitle,
      meta_description: postData.metaDescription,
      focus_keyword: postData.focusKeyword,
      secondary_keywords: postData.secondaryKeywords,  // Should be JSON array
      canonical_url: postData.canonicalUrl,
      
      // OG Fields
      og_title: postData.ogTitle,
      og_description: postData.ogDescription,
      og_image_url: postData.ogImage,
      
      // Twitter
      twitter_card: postData.twitterCard || 'summary_large_image',
      
      // Images
      featured_image_url: postData.featuredImage,
      featured_image_alt: postData.featuredImageAlt,
      
      // Indexing
      allow_indexing: postData.allowIndexing,
      allow_follow: postData.allowFollow,
      robots_directives: postData.robotsOverride,
      sitemap_priority: postData.sitemapPriority,
      
      // Author
      author_name: postData.authorName,
      author_role: postData.authorRole,
      author_bio: postData.authorBio,
      
      // Review
      reviewed_by: postData.reviewedBy,
      fact_checked: postData.factChecked,
      
      updated_at: new Date().toISOString()
    })
    .eq('id', postData.id);

  if (error) console.error('Update failed:', error);
};
*/

-- ============================================================================
-- NOTES FOR FRONTEND DEVELOPERS
-- ============================================================================
/*

1. QUERY RESULTS:
   - All "_final" fields already have fallback logic applied by the view
   - You don't need to build your own fallback logic in the frontend
   - Just use the _final fields directly for HTML meta tags

2. META TAGS YOU SHOULD ALWAYS SET:
   - title (from meta_title_final)
   - meta[name="description"] (from meta_description_final)
   - meta[property="og:*"] (OG tags for social sharing)
   - meta[name="twitter:*"] (Twitter card tags)
   - link[rel="canonical"] (canonical_url_final)
   - meta[name="robots"] (robots_final)

3. OPTIONAL BUT RECOMMENDED:
   - JSON-LD BlogPosting schema injection
   - JSON-LD Organization schema (site-wide)
   - Sitemap generation from sitemap_priority_final
   - Internal linking based on secondary_keywords

4. BLOG EDITOR BEST PRACTICES:
   - If user doesn't set meta_title, it defaults to post.title in the view
   - If user doesn't set meta_description, it defaults to excerpt
   - If user doesn't set og_title, it cascades: og_title → meta_title → title
   - Warn users if meta_description exceeds 160 chars (CSS indicator, not hard block)
   - Suggest focus_keyword in editor for better SEO guidance

5. SECURITY:
   - RLS policies ensure users can only see published posts (or their own drafts)
   - Don't query posts table directly; use posts_seo_view for safety
   - If implementing admin features, ensure is_admin custom claim is set in Auth

6. PERFORMANCE:
   - The view doesn't add much overhead (simple JOINs + computed fields)
   - Indexes on slug, published_at, status ensure fast queries
   - For high-traffic sites, cache the view results or use Supabase Edge Functions
*/
