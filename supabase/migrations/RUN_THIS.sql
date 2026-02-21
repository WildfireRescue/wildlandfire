-- ============================================================================
-- COMPLETE SEO MIGRATION FOR POSTS TABLE
-- ============================================================================
-- Paste this entire block into Supabase SQL Editor and run
-- Safe: All columns use IF NOT EXISTS, no breaking changes
-- Status: Ready to execute
-- Date: 2026-02-20

BEGIN;

-- ============================================================================
-- 1. ADD SEO FIELDS
-- ============================================================================

ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS focus_keyword text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS secondary_keywords jsonb DEFAULT '[]'::jsonb;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS canonical_url text;

-- OG Fields
ALTER TABLE posts ADD COLUMN IF NOT EXISTS og_title text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS og_description text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS og_image_url text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS og_image_width integer DEFAULT 1200;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS og_image_height integer DEFAULT 630;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS og_image_type text DEFAULT 'image/jpeg';

-- Twitter
ALTER TABLE posts ADD COLUMN IF NOT EXISTS twitter_card text DEFAULT 'summary_large_image';

-- Featured Image
ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured_image_url text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured_image_alt text;

-- Indexing Control
ALTER TABLE posts ADD COLUMN IF NOT EXISTS allow_indexing boolean DEFAULT true;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS allow_follow boolean DEFAULT true;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS robots_directives text;

-- Sitemap
ALTER TABLE posts ADD COLUMN IF NOT EXISTS sitemap_priority numeric(2,1) DEFAULT 0.8 CHECK (sitemap_priority >= 0.0 AND sitemap_priority <= 1.0);

-- Author/Expert
ALTER TABLE posts ADD COLUMN IF NOT EXISTS author_name text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS author_role text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS author_bio text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reviewed_by text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS fact_checked boolean DEFAULT false;

-- Timestamps
ALTER TABLE posts ADD COLUMN IF NOT EXISTS published_at timestamptz;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- ============================================================================
-- 2. ADD CONSTRAINTS
-- ============================================================================

ALTER TABLE posts ADD CONSTRAINT check_meta_description_length
  CHECK (meta_description IS NULL OR char_length(meta_description) <= 160)
  NOT VALID;

ALTER TABLE posts VALIDATE CONSTRAINT check_meta_description_length;

-- ============================================================================
-- 3. CREATE INDEXES
-- ============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_allow_indexing ON posts(allow_indexing) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_author_name ON posts(author_name) WHERE author_name IS NOT NULL;

-- ============================================================================
-- 4. CREATE SEO VIEW
-- ============================================================================

CREATE OR REPLACE VIEW public.posts_seo_view AS
SELECT 
  p.id,
  p.slug,
  p.title,
  p.excerpt,
  p.status,
  p.created_at,
  p.published_at,
  p.updated_at,
  
  -- Meta fields with fallbacks
  COALESCE(p.meta_title, p.title) AS meta_title_final,
  COALESCE(p.meta_description, p.excerpt) AS meta_description_final,
  
  p.focus_keyword,
  p.secondary_keywords,
  
  -- Canonical URL with auto-generation
  COALESCE(
    p.canonical_url,
    'https://thewildlandfirerecoveryfund.org/blog/' || p.slug
  ) AS canonical_url_final,
  
  -- OG fields with fallbacks
  COALESCE(p.og_title, p.meta_title, p.title) AS og_title_final,
  COALESCE(p.og_description, p.meta_description, p.excerpt) AS og_description_final,
  
  p.og_image_url,
  p.og_image_width,
  p.og_image_height,
  p.og_image_type,
  
  -- Twitter
  COALESCE(p.twitter_card, 'summary_large_image') AS twitter_card_final,
  
  -- Featured Image
  p.featured_image_url,
  p.featured_image_alt,
  
  -- Robots directive with logic
  CASE 
    WHEN p.robots_directives IS NOT NULL THEN p.robots_directives
    WHEN p.allow_indexing = false AND p.allow_follow = false THEN 'noindex,nofollow'
    WHEN p.allow_indexing = false THEN 'noindex,follow'
    WHEN p.allow_follow = false THEN 'index,nofollow'
    ELSE 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
  END AS robots_final,
  
  p.allow_indexing,
  p.allow_follow,
  
  -- Sitemap
  COALESCE(p.sitemap_priority, 0.8) AS sitemap_priority_final,
  
  -- Author
  p.author_name,
  p.author_role,
  p.author_bio,
  p.reviewed_by,
  p.fact_checked
FROM public.posts p
WHERE p.status = 'published' OR p.status = 'draft';

COMMENT ON VIEW public.posts_seo_view IS 'SEO-ready posts view with computed fallbacks for meta tags, OG, and robots directives.';

-- ============================================================================
-- 5. RLS POLICIES (only if RLS is enabled on posts table)
-- ============================================================================

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid duplicates
DROP POLICY IF EXISTS "Public posts are readable by anyone" ON posts;
DROP POLICY IF EXISTS "Authors can see their own posts" ON posts;
DROP POLICY IF EXISTS "Authors can manage their own posts" ON posts;
DROP POLICY IF EXISTS "Authors can update their own posts" ON posts;
DROP POLICY IF EXISTS "Authors can delete their own posts" ON posts;
DROP POLICY IF EXISTS "Admins have full access" ON posts;

-- Public: Read published posts
CREATE POLICY "Public posts are readable by anyone"
  ON posts FOR SELECT
  USING (status = 'published');

COMMIT;
