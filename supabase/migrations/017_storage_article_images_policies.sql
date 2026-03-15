-- =====================================================
-- STORAGE FIX: article-images bucket RLS policies
-- Migration: 017_storage_article_images_policies.sql
-- =====================================================

BEGIN;

-- Ensure bucket exists (public read URLs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public;

-- Drop stale/conflicting policies if present
DROP POLICY IF EXISTS "Public can view article images" ON storage.objects;
DROP POLICY IF EXISTS "Editors can upload article images" ON storage.objects;
DROP POLICY IF EXISTS "Editors can update article images" ON storage.objects;
DROP POLICY IF EXISTS "Editors can delete article images" ON storage.objects;

-- Public can read files from article-images
CREATE POLICY "Public can view article images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'article-images');

-- Editor/admin upload access
CREATE POLICY "Editors can upload article images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'article-images'
    AND public.is_editor_or_admin()
  );

-- Editor/admin update access
CREATE POLICY "Editors can update article images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'article-images'
    AND public.is_editor_or_admin()
  )
  WITH CHECK (
    bucket_id = 'article-images'
    AND public.is_editor_or_admin()
  );

-- Editor/admin delete access
CREATE POLICY "Editors can delete article images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'article-images'
    AND public.is_editor_or_admin()
  );

COMMIT;
