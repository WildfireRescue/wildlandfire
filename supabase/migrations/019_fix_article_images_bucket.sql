-- ============================================================
-- Migration 019: Verify and harden the article-images bucket
-- ============================================================
-- Run this if images fail to display after uploading, or if
-- you receive "bucket not found" / RLS errors in the editor.
--
-- Safe to re-run — all statements use ON CONFLICT / IF EXISTS.
-- ============================================================

BEGIN;

-- ── 1. Ensure bucket exists and is public ──────────────────────────────────
--
-- The bucket MUST have public = true for getPublicUrl() to return
-- accessible URLs. Without this flag, every image URL returns 403.
--
-- file_size_limit: 10 MB in bytes
-- allowed_mime_types: restrict to common image formats
--
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-images',
  'article-images',
  true,
  10485760,
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif',
    'image/svg+xml'
  ]
)
ON CONFLICT (id) DO UPDATE
  SET
    public             = true,
    file_size_limit    = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ── 2. Drop and recreate all storage policies ──────────────────────────────
--
-- Drop any stale policies that may conflict (from migration 017 or manual
-- changes in the Supabase dashboard).
--

DROP POLICY IF EXISTS "Public can view article images"    ON storage.objects;
DROP POLICY IF EXISTS "Editors can upload article images" ON storage.objects;
DROP POLICY IF EXISTS "Editors can update article images" ON storage.objects;
DROP POLICY IF EXISTS "Editors can delete article images" ON storage.objects;

-- Anyone can read images (required for public URLs to work in browsers)
CREATE POLICY "Public can view article images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'article-images');

-- Only authenticated editors/admins can upload
CREATE POLICY "Editors can upload article images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'article-images'
    AND public.is_editor_or_admin()
  );

-- Only authenticated editors/admins can overwrite
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

-- Only authenticated editors/admins can delete
CREATE POLICY "Editors can delete article images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'article-images'
    AND public.is_editor_or_admin()
  );

COMMIT;

-- ── Verification query ─────────────────────────────────────────────────────
-- Run this after the migration to confirm the bucket is set up correctly:
--
-- SELECT id, name, public, file_size_limit, allowed_mime_types
-- FROM storage.buckets
-- WHERE id = 'article-images';
--
-- Expected: public = true, file_size_limit = 10485760
--
-- SELECT policyname, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'objects' AND schemaname = 'storage'
--   AND policyname LIKE '%article images%';
--
-- Expected: 4 rows (SELECT / INSERT / UPDATE / DELETE)
-- ──────────────────────────────────────────────────────────────────────────
