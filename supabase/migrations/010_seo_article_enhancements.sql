-- Migration: 010_seo_article_enhancements.sql
-- Add SEO-critical fields to articles table for complete head tag generation
-- Status: NEW
-- Date: 2026-02-20

BEGIN;

-- Add missing SEO fields
ALTER TABLE articles ADD COLUMN IF NOT EXISTS
  canonical_url text;

ALTER TABLE articles ADD COLUMN IF NOT EXISTS
  og_image_width integer DEFAULT 1200;

ALTER TABLE articles ADD COLUMN IF NOT EXISTS
  og_image_height integer DEFAULT 630;

ALTER TABLE articles ADD COLUMN IF NOT EXISTS
  og_image_type text DEFAULT 'image/jpeg';

ALTER TABLE articles ADD COLUMN IF NOT EXISTS
  twitter_creator text;

ALTER TABLE articles ADD COLUMN IF NOT EXISTS
  twitter_site text DEFAULT '@WildlandFireFnd';

ALTER TABLE articles ADD COLUMN IF NOT EXISTS
  robots_directives text DEFAULT 'index,follow,max-image-preview:large';

ALTER TABLE articles ADD COLUMN IF NOT EXISTS
  category text DEFAULT 'Disaster Recovery';

ALTER TABLE articles ADD COLUMN IF NOT EXISTS
  description text;

ALTER TABLE articles ADD COLUMN IF NOT EXISTS
  tags jsonb DEFAULT '[]'::jsonb;

-- Update existing article with proper dimensions
UPDATE articles 
SET 
  og_image_width = 1200,
  og_image_height = 630,
  og_image_type = 'image/jpeg',
  twitter_creator = '@HonoluluCivBeat',
  twitter_site = '@WildlandFireFnd',
  category = 'Disaster Recovery',
  canonical_url = 'https://thewildlandfirerecoveryfund.org/blog/apple-news-maui-fire-federal-housing',
  tags = '["Maui Wildfires", "FEMA Housing", "Disaster Relief", "Housing Crisis"]'::jsonb,
  description = 'The state is seeking another extension to the FEMA housing program that thousands of Maui residents have relied on since losing their homes in the 2023 wildfires. It''s currently set to end Feb. 28.'
WHERE slug = 'apple-news-maui-fire-federal-housing';

COMMIT;
