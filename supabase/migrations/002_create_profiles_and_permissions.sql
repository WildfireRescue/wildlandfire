-- =====================================================
-- WILDLAND FIRE RECOVERY FUND - USER PROFILES & PERMISSIONS
-- Migration: Create profiles table and editor permissions
-- =====================================================

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(email)
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - PROFILES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Only admins can insert profiles (done via admin panel or SQL)
-- For now, we'll manually insert via SQL after users sign up

-- =====================================================
-- RLS POLICIES - POSTS (EDITORS)
-- =====================================================

-- Editors can view all posts (including drafts)
CREATE POLICY "Editors can view all posts"
  ON posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('editor', 'admin')
    )
  );

-- Editors can insert posts
CREATE POLICY "Editors can insert posts"
  ON posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('editor', 'admin')
    )
  );

-- Editors can update posts
CREATE POLICY "Editors can update posts"
  ON posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('editor', 'admin')
    )
  );

-- Editors can delete posts
CREATE POLICY "Editors can delete posts"
  ON posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('editor', 'admin')
    )
  );

-- =====================================================
-- RLS POLICIES - CATEGORIES (EDITORS)
-- =====================================================

-- Editors can manage categories
CREATE POLICY "Editors can manage categories"
  ON categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('editor', 'admin')
    )
  );

-- =====================================================
-- STORAGE BUCKET POLICIES
-- =====================================================

-- Note: Run these in Supabase SQL Editor after creating 'blog' bucket in Storage

-- CREATE POLICY "Editors can upload blog images"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'blog' AND
--   EXISTS (
--     SELECT 1 FROM profiles
--     WHERE profiles.user_id = auth.uid()
--     AND profiles.role IN ('editor', 'admin')
--   )
-- );

-- CREATE POLICY "Editors can update blog images"
-- ON storage.objects FOR UPDATE
-- USING (
--   bucket_id = 'blog' AND
--   EXISTS (
--     SELECT 1 FROM profiles
--     WHERE profiles.user_id = auth.uid()
--     AND profiles.role IN ('editor', 'admin')
--   )
-- );

-- CREATE POLICY "Editors can delete blog images"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'blog' AND
--   EXISTS (
--     SELECT 1 FROM profiles
--     WHERE profiles.user_id = auth.uid()
--     AND profiles.role IN ('editor', 'admin')
--   )
-- );

-- CREATE POLICY "Public can view blog images"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'blog');

-- =====================================================
-- TRIGGER FOR PROFILES UPDATED_AT
-- =====================================================

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MANUAL STEP: INSERT EDITOR PROFILES
-- =====================================================

-- After users sign in via magic link for the first time, run:
-- 
-- INSERT INTO profiles (user_id, email, role)
-- SELECT id, email, 'editor'
-- FROM auth.users
-- WHERE email IN (
--   'earl@thewildlandfirerecoveryfund.org',
--   'jason@thewildlandfirerecoveryfund.org',
--   'drew@thewildlandfirerecoveryfund.org',
--   'kendra@thewildlandfirerecoveryfund.org'
-- )
-- ON CONFLICT (email) DO UPDATE SET role = 'editor';
