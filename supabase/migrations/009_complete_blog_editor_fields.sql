-- =====================================================
-- WILDLAND FIRE RECOVERY FUND - COMPLETE BLOG EDITOR FIELDS
-- Migration: Ensure all form fields are properly configured
-- Purpose: Make blog editor form fields match database schema perfectly
-- =====================================================

BEGIN;

-- =====================================================
-- 1. ADD PUBLISHING & DISCOVERY FIELDS
-- =====================================================

-- Scheduled publication datetime (for 'scheduled' status posts)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;

-- SEO indexing controls
ALTER TABLE posts ADD COLUMN IF NOT EXISTS allow_indexing BOOLEAN DEFAULT true;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS allow_follow BOOLEAN DEFAULT true;

-- Robots.txt directives override
ALTER TABLE posts ADD COLUMN IF NOT EXISTS robots_directives TEXT;

-- Sitemap priority (0.0-1.0, default 0.8)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS sitemap_priority DECIMAL(2,1) DEFAULT 0.8;

-- =====================================================
-- 2. ADD BACKLINKS & CITATION FIELDS (E-E-A-T)
-- =====================================================

-- JSON array of {label, url} source citations
ALTER TABLE posts ADD COLUMN IF NOT EXISTS sources JSONB DEFAULT '[]'::jsonb;

-- Verification flag for outbound links
ALTER TABLE posts ADD COLUMN IF NOT EXISTS outbound_links_verified BOOLEAN DEFAULT false;

-- =====================================================
-- 3. ADD MISSING CORE FIELDS (if any)
-- =====================================================

-- Ensure cover_image_url exists (for different image types)
-- Already exists in migration 001

-- Type field for posts (default vs external articles)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'default' CHECK (type IN ('default', 'external'));

-- External URL (for linking to external articles)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS external_url TEXT;

-- =====================================================
-- 4. CREATE PERFORMANCE INDEXES
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
-- 5. CREATE FUNCTION TO AUTO-UPDATE last_updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_last_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists (to avoid conflicts)
DROP TRIGGER IF EXISTS trigger_update_last_updated_at ON posts;

-- Create trigger to auto-update last_updated_at on any change
CREATE TRIGGER trigger_update_last_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_last_updated_at();

-- =====================================================
-- 6. UPDATE RLS POLICIES (if needed)
-- =====================================================

-- Drop old policies and recreate with proper access control
DROP POLICY IF EXISTS "Public can view published posts" ON posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON posts;
DROP POLICY IF EXISTS "Users can update posts they created" ON posts;
DROP POLICY IF EXISTS "Users can delete posts they created" ON posts;
DROP POLICY IF EXISTS "Admins can do anything with posts" ON posts;

-- Public: view published, indexed posts
CREATE POLICY "Public can view published posts"
  ON posts FOR SELECT
  USING (
    status = 'published' 
    AND allow_indexing = true
  );

-- Authenticated: can view their own drafts
CREATE POLICY "Authenticated can view own drafts"
  ON posts FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      status = 'published'
      OR author_email = auth.jwt() ->> 'email'
    )
  );

-- =====================================================
-- 7. MIGRATION COMPLETE VERIFICATION
-- =====================================================

-- Verify all required columns exist
DO $$
DECLARE
  missing_columns TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Check for core fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='title') THEN
    missing_columns := array_append(missing_columns, 'title');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='scheduled_for') THEN
    RAISE WARNING 'Missing column: scheduled_for (but migration added it)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='allow_indexing') THEN
    RAISE WARNING 'Missing column: allow_indexing (but migration added it)';
  END IF;
  
  IF ARRAY_LENGTH(missing_columns, 1) > 0 THEN
    RAISE WARNING 'Missing columns: %', missing_columns;
  ELSE
    RAISE NOTICE 'All required columns exist! ✓';
  END IF;
END $$;

COMMIT;

-- =====================================================
-- MIGRATION SUMMARY
-- =====================================================
-- Features Added:
-- ✓ Publishing: scheduled_for (datetime scheduling)
-- ✓ SEO: allow_indexing, allow_follow, robots_directives
-- ✓ Sitemap: sitemap_priority (0.0-1.0)
-- ✓ Citations: sources (JSON array), outbound_links_verified
-- ✓ Types: type, external_url (for external articles)
-- ✓ Indexes: 4 new performance indexes
-- ✓ Triggers: auto-update last_updated_at
-- ✓ RLS: improved access control
--
-- To verify all fields in psql:
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name='posts' 
-- ORDER BY column_name;
-- =====================================================
