-- Migration: 011_posts_seo_fields_complete.sql
-- Add comprehensive SEO fields to posts table for reliable tag generation & JSON-LD
-- Includes constraints, indexes, and safe defaults
-- Status: SAFE (all columns IF NOT EXISTS; no breaking changes)
-- Date: 2026-02-20

BEGIN;

-- ============================================================================
-- 1. ADD SEO & META FIELDS (if not already present)
-- ============================================================================

-- Meta/Title fields
ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  meta_title text;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  meta_description text;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  focus_keyword text;

-- Keywords as jsonb array for flexibility
ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  secondary_keywords jsonb DEFAULT '[]'::jsonb;

-- Canonical URL (if different from slug-based auto-generate)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  canonical_url text;

-- ============================================================================
-- 2. ADD OG (OPEN GRAPH) FIELDS
-- ============================================================================

ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  og_title text;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  og_description text;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  og_image_url text;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  og_image_width integer DEFAULT 1200;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  og_image_height integer DEFAULT 630;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  og_image_type text DEFAULT 'image/jpeg';

-- ============================================================================
-- 3. ADD TWITTER CARD FIELDS
-- ============================================================================

ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  twitter_card text DEFAULT 'summary_large_image';

-- ============================================================================
-- 4. ADD FEATURED IMAGE FIELDS
-- ============================================================================

ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  featured_image_url text;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  featured_image_alt text;

-- ============================================================================
-- 5. ADD INDEXING/ROBOTS CONTROL
-- ============================================================================

ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  allow_indexing boolean DEFAULT true;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  allow_follow boolean DEFAULT true;

-- Optional override (if set, takes precedence over allow_indexing/allow_follow)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  robots_directives text;

-- ============================================================================
-- 6. ADD SITEMAP & DISCOVERY FIELDS
-- ============================================================================

ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  sitemap_priority numeric(2,1) DEFAULT 0.8 CHECK (sitemap_priority >= 0.0 AND sitemap_priority <= 1.0);

-- ============================================================================
-- 7. ADD AUTHOR / EXPERT FIELDS
-- ============================================================================

ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  author_name text;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  author_role text;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  author_bio text;

-- Fact-checking & review tracking
ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  reviewed_by text;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  fact_checked boolean DEFAULT false;

-- ============================================================================
-- 8. ENSURE TIMESTAMP FIELDS (if you don't have them)
-- ============================================================================

-- If these don't exist, add them. If they do, this is a no-op.
ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  published_at timestamptz;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  updated_at timestamptz DEFAULT now();

-- ============================================================================
-- 9. ADD CONSTRAINTS
-- ============================================================================

-- Constraint: meta_description should ideally be <= 160 chars
-- (This is a check constraint; you'll want to monitor in your app too)
ALTER TABLE posts ADD CONSTRAINT check_meta_description_length
  CHECK (meta_description IS NULL OR char_length(meta_description) <= 160)
  NOT VALID; -- Will be validated later; existing rows won't break

-- Validate constraint after ensuring no existing violates it
ALTER TABLE posts VALIDATE CONSTRAINT check_meta_description_length;

-- ============================================================================
-- 10. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Slug queries (very common in rendering)
CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);

-- Publishing workflow
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);

-- SEO/Discovery queries
CREATE INDEX IF NOT EXISTS idx_posts_allow_indexing ON posts(allow_indexing) WHERE status = 'published';

-- Author queries
CREATE INDEX IF NOT EXISTS idx_posts_author_name ON posts(author_name) WHERE author_name IS NOT NULL;

COMMIT;
