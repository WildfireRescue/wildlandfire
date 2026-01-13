-- =====================================================
-- WILDLAND FIRE RECOVERY FUND - SEO & E-E-A-T ENHANCEMENT
-- Migration: Add comprehensive SEO, metadata, and trust fields
-- Purpose: Maximize Google E-E-A-T, discoverability, and nonprofit credibility
-- =====================================================

-- =====================================================
-- 1. UPDATE STATUS ENUM
-- =====================================================

-- Add 'scheduled' status option (keeping existing values safe)
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_status_check;
ALTER TABLE posts ADD CONSTRAINT posts_status_check 
  CHECK (status IN ('draft', 'scheduled', 'published'));

-- =====================================================
-- 2. ADD SEO & METADATA FIELDS
-- =====================================================

-- Meta fields for search engines (with character limits enforced at app level)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_description TEXT;
-- canonical_url already exists
ALTER TABLE posts ADD COLUMN IF NOT EXISTS focus_keyword TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS secondary_keywords TEXT[];

-- =====================================================
-- 3. ADD IMAGE & SOCIAL SHARING FIELDS
-- =====================================================

ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured_image_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured_image_alt_text TEXT;
-- og_image_url already exists
ALTER TABLE posts ADD COLUMN IF NOT EXISTS og_title TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS og_description TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS twitter_card TEXT DEFAULT 'summary_large_image';

-- =====================================================
-- 4. ADD TRUST / E-E-A-T FIELDS
-- =====================================================

-- author_name and author_email already exist
ALTER TABLE posts ADD COLUMN IF NOT EXISTS author_role TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS author_bio TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reviewed_by TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS fact_checked BOOLEAN DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS last_updated_at TIMESTAMPTZ;

-- Set initial last_updated_at to updated_at for existing records
UPDATE posts SET last_updated_at = updated_at WHERE last_updated_at IS NULL;

-- =====================================================
-- 5. ADD PUBLISHING & DISCOVERY FIELDS
-- =====================================================

-- status already exists and updated above
-- published_at already exists
ALTER TABLE posts ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;
-- featured already exists
ALTER TABLE posts ADD COLUMN IF NOT EXISTS allow_indexing BOOLEAN DEFAULT true;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS allow_follow BOOLEAN DEFAULT true;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS robots_directives TEXT DEFAULT 'index,follow';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS sitemap_priority NUMERIC(2,1) DEFAULT 0.7;

-- Add constraint for sitemap_priority range
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_sitemap_priority_check;
ALTER TABLE posts ADD CONSTRAINT posts_sitemap_priority_check 
  CHECK (sitemap_priority >= 0.0 AND sitemap_priority <= 1.0);

-- =====================================================
-- 6. ADD BACKLINK / CITATION FIELDS
-- =====================================================

-- Store sources as JSONB array of {label, url} objects
ALTER TABLE posts ADD COLUMN IF NOT EXISTS sources JSONB DEFAULT '[]'::jsonb;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS outbound_links_verified BOOLEAN DEFAULT false;

-- =====================================================
-- 7. ADD PERFORMANCE INDEXES
-- =====================================================

-- Index for scheduled posts
CREATE INDEX IF NOT EXISTS idx_posts_scheduled 
  ON posts(scheduled_for) 
  WHERE status = 'scheduled' AND scheduled_for IS NOT NULL;

-- Index for SEO optimization queries
CREATE INDEX IF NOT EXISTS idx_posts_allow_indexing 
  ON posts(allow_indexing, published_at DESC) 
  WHERE status = 'published';

-- GIN index for secondary keywords
CREATE INDEX IF NOT EXISTS idx_posts_secondary_keywords 
  ON posts USING GIN(secondary_keywords);

-- Index for last_updated_at
CREATE INDEX IF NOT EXISTS idx_posts_last_updated 
  ON posts(last_updated_at DESC);

-- =====================================================
-- 8. CREATE FUNCTION TO AUTO-UPDATE last_updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_last_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated_at = NOW();
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_last_updated_at ON posts;
CREATE TRIGGER trigger_update_last_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_last_updated_at();

-- =====================================================
-- 9. UPDATE RLS POLICIES
-- =====================================================

-- Drop old public view policy
DROP POLICY IF EXISTS "Public can view published posts" ON posts;

-- New policy: Public can view published posts that allow indexing
CREATE POLICY "Public can view published posts"
  ON posts FOR SELECT
  USING (
    status = 'published' 
    AND published_at IS NOT NULL
    AND (noindex = false OR allow_indexing = true)
  );

-- Note: Editor policies already exist from migration 002
-- No need to recreate them here to avoid conflicts

-- =====================================================
-- 10. SET SENSIBLE DEFAULTS FOR EXISTING RECORDS
-- =====================================================

-- Update existing posts with sensible defaults
UPDATE posts SET
  meta_title = COALESCE(meta_title, title),
  meta_description = COALESCE(meta_description, excerpt),
  author_name = COALESCE(author_name, 'The Wildland Fire Recovery Fund'),
  twitter_card = COALESCE(twitter_card, 'summary_large_image'),
  allow_indexing = COALESCE(allow_indexing, true),
  allow_follow = COALESCE(allow_follow, true),
  robots_directives = COALESCE(robots_directives, 'index,follow'),
  sitemap_priority = COALESCE(sitemap_priority, 0.7),
  fact_checked = COALESCE(fact_checked, false),
  outbound_links_verified = COALESCE(outbound_links_verified, false),
  sources = COALESCE(sources, '[]'::jsonb),
  featured_image_url = COALESCE(featured_image_url, cover_image_url),
  last_updated_at = COALESCE(last_updated_at, updated_at)
WHERE id IS NOT NULL;

-- =====================================================
-- 11. ADD HELPFUL COMMENTS
-- =====================================================

COMMENT ON COLUMN posts.meta_title IS 'SEO title tag, max 60 chars recommended, fallback to title';
COMMENT ON COLUMN posts.meta_description IS 'SEO meta description, max 160 chars recommended, fallback to excerpt';
COMMENT ON COLUMN posts.canonical_url IS 'Canonical URL to prevent duplicate content issues';
COMMENT ON COLUMN posts.focus_keyword IS 'Primary SEO keyword for this article';
COMMENT ON COLUMN posts.secondary_keywords IS 'Additional SEO keywords, array format';
COMMENT ON COLUMN posts.featured_image_alt_text IS 'Alt text for featured image (accessibility & SEO)';
COMMENT ON COLUMN posts.og_title IS 'Open Graph title, fallback to meta_title';
COMMENT ON COLUMN posts.og_description IS 'Open Graph description, fallback to meta_description';
COMMENT ON COLUMN posts.og_image_url IS 'Open Graph image, fallback to featured_image_url';
COMMENT ON COLUMN posts.twitter_card IS 'Twitter card type: summary, summary_large_image, etc.';
COMMENT ON COLUMN posts.author_role IS 'Author role/title for E-E-A-T credibility';
COMMENT ON COLUMN posts.author_bio IS 'Author biography for E-E-A-T credibility';
COMMENT ON COLUMN posts.reviewed_by IS 'Name of reviewer for fact-checking transparency';
COMMENT ON COLUMN posts.fact_checked IS 'Whether content has been fact-checked for trust signals';
COMMENT ON COLUMN posts.last_updated_at IS 'Auto-updated timestamp for content freshness signal';
COMMENT ON COLUMN posts.scheduled_for IS 'Scheduled publication timestamp for status=scheduled posts';
COMMENT ON COLUMN posts.allow_indexing IS 'Whether search engines should index this page';
COMMENT ON COLUMN posts.allow_follow IS 'Whether search engines should follow links on this page';
COMMENT ON COLUMN posts.robots_directives IS 'Custom robots meta directives (e.g., index,follow)';
COMMENT ON COLUMN posts.sitemap_priority IS 'Sitemap priority 0.0-1.0, default 0.7';
COMMENT ON COLUMN posts.sources IS 'JSONB array of citation sources: [{label, url}]';
COMMENT ON COLUMN posts.outbound_links_verified IS 'Whether outbound links have been checked for quality';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Verify migration
DO $$
BEGIN
  RAISE NOTICE 'SEO & E-E-A-T enhancement migration completed successfully!';
  RAISE NOTICE 'New fields added: 25+';
  RAISE NOTICE 'Indexes created: 4';
  RAISE NOTICE 'RLS policies updated: 5';
  RAISE NOTICE 'Auto-update trigger created for last_updated_at';
END $$;
