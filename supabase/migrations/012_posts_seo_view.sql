-- View: posts_seo_view
-- Returns posts with computed SEO fields and fallback logic
-- Safe for: Meta tag generation, JSON-LD injection, Sitemap generation
-- All nullable fields have sensible fallbacks
-- Insert this into a new migration file, e.g., 012_posts_seo_view.sql

BEGIN;

-- ============================================================================
-- CREATE SEO VIEW FOR EASY RENDERING
-- ============================================================================

CREATE OR REPLACE VIEW public.posts_seo_view AS
SELECT 
  p.id,
  p.slug,
  p.title,
  p.excerpt,
  p.content,
  p.status,
  p.created_at,
  p.published_at,
  p.updated_at,
  
  -- ========================================================================
  -- META FIELDS WITH FALLBACKS
  -- ========================================================================
  -- Title: use meta_title if set, else fall back to post title
  COALESCE(p.meta_title, p.title) AS meta_title_final,
  
  -- Description: use meta_description if set, else use excerpt
  COALESCE(p.meta_description, p.excerpt) AS meta_description_final,
  
  p.focus_keyword,
  p.secondary_keywords,
  
  -- ========================================================================
  -- CANONICAL URL (with auto-generation from slug if not set)
  -- ========================================================================
  COALESCE(
    p.canonical_url,
    'https://thewildlandfirerecoveryfund.org/blog/' || p.slug
  ) AS canonical_url_final,
  
  -- ========================================================================
  -- OPEN GRAPH FIELDS WITH FALLBACKS
  -- ========================================================================
  -- og:title: use what's set, fall back to meta_title, then post title
  COALESCE(p.og_title, p.meta_title, p.title) AS og_title_final,
  
  -- og:description: use what's set, fall back to meta_description, then excerpt
  COALESCE(p.og_description, p.meta_description, p.excerpt) AS og_description_final,
  
  p.og_image_url,
  p.og_image_width,
  p.og_image_height,
  p.og_image_type,
  
  -- ========================================================================
  -- TWITTER CARD FIELDS
  -- ========================================================================
  COALESCE(p.twitter_card, 'summary_large_image') AS twitter_card_final,
  
  -- ========================================================================
  -- FEATURED IMAGE
  -- ========================================================================
  p.featured_image_url,
  p.featured_image_alt,
  
  -- ========================================================================
  -- ROBOTS / INDEXING DIRECTIVES
  -- ========================================================================
  -- Logic:
  -- 1. If robots_directives is explicitly set, use it (override)
  -- 2. Otherwise, build from allow_indexing + allow_follow + defaults
  CASE 
    WHEN p.robots_directives IS NOT NULL THEN
      p.robots_directives
    WHEN p.allow_indexing = false AND p.allow_follow = false THEN
      'noindex,nofollow'
    WHEN p.allow_indexing = false THEN
      'noindex,follow'
    WHEN p.allow_follow = false THEN
      'index,nofollow'
    ELSE
      'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
  END AS robots_final,
  
  p.allow_indexing,
  p.allow_follow,
  
  -- ========================================================================
  -- SITEMAP DISCOVERY
  -- ========================================================================
  COALESCE(p.sitemap_priority, 0.8) AS sitemap_priority_final,
  
  -- ========================================================================
  -- AUTHOR / EXPERT FIELDS
  -- ========================================================================
  p.author_name,
  p.author_role,
  p.author_bio,
  p.reviewed_by,
  p.fact_checked
FROM public.posts p
WHERE p.status = 'published' OR p.status = 'draft'; -- Adjust status logic as needed

COMMENT ON VIEW public.posts_seo_view IS 'SEO-ready posts view with computed fallbacks for meta tags, OG, and robots directives. Safe for frontend queries.';

COMMIT;
