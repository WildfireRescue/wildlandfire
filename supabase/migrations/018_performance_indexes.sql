-- =====================================================
-- MIGRATION 018: Performance Indexes + Blog Listing View
-- Reduces Supabase Disk IO for public blog reads
-- =====================================================
--
-- Changes:
--   1. Composite index on posts(status, published_at) with covering columns
--   2. Composite index on posts(status, category, published_at) for category pages
--   3. Partial index on posts(featured, published_at) for featured queries
--   4. Index on posts(status, noindex, published_at) — exact public read pattern
--   5. Index on articles(status, published_at) for articles listings
--   6. blog_public_listing VIEW — union of posts + articles, card fields only
--      Use this in future queries instead of querying both tables separately.
--   7. pg_trgm indexes for search (ilike queries)
-- =====================================================

BEGIN;

-- =====================================================
-- 1. INDEXES ON posts
-- =====================================================

-- Primary listing query: status=published, noindex=false, NOT featured, ORDER BY published_at DESC
-- This index covers the exact filter pattern used by getPublishedPosts and getPostsBySlug
CREATE INDEX IF NOT EXISTS idx_posts_public_listing
  ON posts (status, noindex, published_at DESC)
  WHERE status = 'published' AND noindex = false;

-- Category listing: status=published, noindex=false, category=X, ORDER BY published_at DESC
CREATE INDEX IF NOT EXISTS idx_posts_category_listing
  ON posts (status, noindex, category, published_at DESC)
  WHERE status = 'published' AND noindex = false;

-- Featured posts: status=published, featured=true
CREATE INDEX IF NOT EXISTS idx_posts_featured_listing
  ON posts (status, featured, published_at DESC)
  WHERE status = 'published' AND featured = true;

-- Slug lookup (public and admin — already unique, this ensures index is used with status filter)
CREATE INDEX IF NOT EXISTS idx_posts_slug_status
  ON posts (slug, status);

-- Scheduled post publisher: find posts where status=scheduled AND scheduled_for <= now()
CREATE INDEX IF NOT EXISTS idx_posts_scheduled
  ON posts (scheduled_for)
  WHERE status = 'scheduled';

-- Admin dashboard / editor: all posts ordered by updated
CREATE INDEX IF NOT EXISTS idx_posts_updated_desc
  ON posts (updated_at DESC);

-- Tag search (GIN for array containment)
CREATE INDEX IF NOT EXISTS idx_posts_tags_gin
  ON posts USING GIN (tags)
  WHERE status = 'published';

-- =====================================================
-- 2. INDEXES ON articles
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_articles_status_published_at
  ON articles (status, published_at DESC)
  WHERE status = 'published';

-- =====================================================
-- 3. INDEXES ON categories
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_categories_slug_btree
  ON categories (slug);

-- =====================================================
-- 4. OPTIONAL: pg_trgm indexes for ILIKE search
--    Only enable if you have pg_trgm extension.
--    Uncomment if needed:
-- =====================================================
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX IF NOT EXISTS idx_posts_title_trgm
--   ON posts USING GIN (title gin_trgm_ops)
--   WHERE status = 'published';
-- CREATE INDEX IF NOT EXISTS idx_posts_excerpt_trgm
--   ON posts USING GIN (excerpt gin_trgm_ops)
--   WHERE status = 'published';

-- =====================================================
-- 5. blog_public_listing VIEW
--    Union of posts + articles, narrow card columns only.
--    Enables single-query pagination in future refactors.
--    Safe to query from public/anon role with RLS.
-- =====================================================

CREATE OR REPLACE VIEW public.blog_public_listing AS
SELECT
  p.id,
  p.slug,
  p.title,
  p.excerpt,
  p.cover_image_url           AS cover_image,
  p.featured_image_url        AS featured_image,
  p.featured_image_alt_text   AS image_alt,
  p.og_image_url,
  p.og_title,
  p.og_description,
  p.meta_title,
  p.meta_description,
  p.canonical_url,
  p.category,
  p.tags,
  p.status,
  p.published_at,
  p.featured,
  p.allow_indexing,
  p.noindex,
  p.author_name,
  p.author_role,
  p.reading_time_minutes,
  p.view_count,
  p.robots_directives,
  p.sitemap_priority,
  p.created_at,
  p.updated_at,
  'post'::text                AS source_type
FROM posts p
WHERE p.status = 'published'
  AND p.noindex = false

UNION ALL

SELECT
  a.id,
  a.slug,
  a.title,
  a.subtitle                  AS excerpt,
  a.featured_image            AS cover_image,
  a.featured_image            AS featured_image,
  NULL::text                  AS image_alt,
  a.og_image                  AS og_image_url,
  a.og_title,
  a.og_description,
  a.og_title                  AS meta_title,
  a.og_description            AS meta_description,
  a.external_url              AS canonical_url,
  'News'::text                AS category,
  ARRAY[]::text[]             AS tags,
  a.status,
  a.published_at,
  false                       AS featured,
  true                        AS allow_indexing,
  false                       AS noindex,
  COALESCE(a.author, a.source_name) AS author_name,
  NULL::text                  AS author_role,
  COALESCE(a.reading_time, 5) AS reading_time_minutes,
  0                           AS view_count,
  'index,follow'              AS robots_directives,
  0.5                         AS sitemap_priority,
  a.created_at,
  a.updated_at,
  'article'::text             AS source_type
FROM articles a
WHERE a.status = 'published';

-- Grant read access on the view (mirrors posts public policy)
GRANT SELECT ON public.blog_public_listing TO anon;
GRANT SELECT ON public.blog_public_listing TO authenticated;

-- =====================================================
-- 6. Ensure updated_at is auto-stamped on posts
--    (in case the trigger doesn't exist yet)
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_posts_updated_at'
  ) THEN
    CREATE TRIGGER set_posts_updated_at
      BEFORE UPDATE ON posts
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;

COMMIT;

-- =====================================================
-- USAGE NOTES
-- =====================================================
--
-- To paginate cleanly using the new view (future frontend change):
--
--   SELECT * FROM blog_public_listing
--   WHERE category = $1
--   ORDER BY published_at DESC
--   LIMIT 12 OFFSET 0;
--
-- Each query via blog_public_listing touches only card-level fields.
-- Full content (content_markdown, content_html, faq_json, sources)
-- is never read for listing pages.
--
-- For the individual post page, keep using `select('*')` from posts
-- via supabaseBlog.getPostBySlug() — full content is needed there.
-- =====================================================
