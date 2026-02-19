-- =====================================================
-- SUPABASE MAGIC LINK AUTH - COPY & PASTE READY SQL
-- Run these scripts in Supabase SQL Editor (in order)
-- =====================================================

-- =====================================================
-- SCRIPT 1: CREATE PROFILES TABLE
-- =====================================================
-- Run this first. It's safe to run multiple times.

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Allow authenticated users to read all profiles for permission checks
DROP POLICY IF EXISTS "Authenticated users can read all profiles" ON profiles;
CREATE POLICY "Authenticated users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- SCRIPT 2: CREATE ADMIN ALLOWLIST FUNCTION
-- =====================================================
-- Run this second. Edit the email list below to add your team!

DROP FUNCTION IF EXISTS public.is_blog_admin();

CREATE OR REPLACE FUNCTION public.is_blog_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  user_email TEXT;
BEGIN
  user_email := current_setting('request.jwt.claims', true)::json->>'email';
  
  -- 🚨 EDIT THIS LIST: Add your admin emails here
  RETURN user_email IN (
    'earl@thewildlandfirerecoveryfund.org',
    'jason@thewildlandfirerecoveryfund.org',
    'admin@thewildlandfirerecoveryfund.org',
    'editor@thewildlandfirerecoveryfund.org',
    'reports@goldie.agency',
    'help@goldie.agency'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_blog_admin() TO authenticated, anon;

COMMENT ON FUNCTION public.is_blog_admin() IS 
  'Returns true if current user email is in blog admin allowlist';

-- =====================================================
-- SCRIPT 3: ENABLE RLS ON POSTS TABLE
-- =====================================================
-- Run this third. This controls who can read/write blog posts.

ALTER TABLE IF EXISTS posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS posts FORCE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Public can view published posts" ON posts;
DROP POLICY IF EXISTS "Admins can view all posts" ON posts;
DROP POLICY IF EXISTS "Admins can insert posts" ON posts;
DROP POLICY IF EXISTS "Admins can update posts" ON posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON posts;

-- Create new policies
-- 1. Everyone can read published posts
CREATE POLICY "Public can view published posts"
  ON posts FOR SELECT
  TO public
  USING (status = 'published');

-- 2. Only admins can read all posts (including drafts)
CREATE POLICY "Admins can view all posts"
  ON posts FOR SELECT
  TO authenticated
  USING (is_blog_admin());

-- 3. Only admins can create posts
CREATE POLICY "Admins can insert posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (is_blog_admin());

-- 4. Only admins can edit posts
CREATE POLICY "Admins can update posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (is_blog_admin())
  WITH CHECK (is_blog_admin());

-- 5. Only admins can delete posts
CREATE POLICY "Admins can delete posts"
  ON posts FOR DELETE
  TO authenticated
  USING (is_blog_admin());

-- =====================================================
-- VERIFY SETUP
-- =====================================================
-- Run all of these to verify everything is configured

SELECT 'Profiles table' as check_item, 
       EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='profiles') as result;

SELECT 'Posts table', 
       EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='posts') as result;

SELECT 'is_blog_admin() function',
       EXISTS(SELECT 1 FROM pg_proc WHERE proname='is_blog_admin') as result;

SELECT tablename as table_with_rls, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('profiles', 'posts');

SELECT COUNT(*) as total_rls_policies 
FROM pg_policies 
WHERE tablename IN ('profiles', 'posts');

-- =====================================================
-- OPTIONAL: INSERT YOUR FIRST ADMINS
-- =====================================================
-- After your team members have clicked the magic link,
-- you can give them profiles (alternative to email allowlist)
-- 
-- Option A: They're in allowlist - skip this, they have access
-- Option B: They need DB profile - run below:

-- First, find their user IDs from auth.users:
-- SELECT id, email FROM auth.users WHERE email LIKE '%@%';

-- Then insert their profiles (replace XXX with actual UUID):
-- INSERT INTO profiles (user_id, email, role)
-- VALUES 
--   ('USER-ID-1-HERE', 'earl@thewildlandfirerecoveryfund.org', 'admin'),
--   ('USER-ID-2-HERE', 'jason@example.com', 'editor'),
--   ('USER-ID-3-HERE', 'team@example.com', 'editor')
-- ON CONFLICT (email) DO UPDATE
-- SET role = EXCLUDED.role;

-- =====================================================
-- HOW TO ADD NEW ADMINS
-- =====================================================

-- Method 1: Add to email allowlist (RECOMMENDED - Instant, no DB)
--   1. Edit the is_blog_admin() function (Script 2 above)
--   2. Add their email to the RETURN list
--   3. Run the edited function
--   4. They have instant access when they click magic link

-- Method 2: Create database profile (Alternative)
--   1. Get their UUID from auth.users after they click magic link:
--      SELECT id, email FROM auth.users WHERE email = 'newperson@email.com';
--   2. Insert profile:
--      INSERT INTO profiles (user_id, email, role) 
--      VALUES ('their-uuid', 'newperson@email.com', 'editor');

-- =====================================================
-- TYPICAL TEAM SETUP EXAMPLE
-- =====================================================
-- For 5 team members, your allowlist would look like:

-- RETURN user_email IN (
--   'earl@thewildlandfirerecoveryfund.org',     -- ✅ Admin
--   'jason@example.com',                        -- ✅ Admin
--   'sara@example.com',                         -- ✅ Editor
--   'mike@example.com',                         -- ✅ Editor
--   'taylor@example.com',                       -- ✅ Editor
--   'reports@goldie.agency',                    -- ✅ Admin
--   'help@goldie.agency'                        -- ✅ Admin
-- );

-- =====================================================
-- DEBUGGING QUERIES
-- =====================================================

-- See all RLS policies:
-- SELECT tablename, policyname, permissive, roles, qual
-- FROM pg_policies 
-- ORDER BY tablename, policyname;

-- See all profiles:
-- SELECT * FROM profiles ORDER BY created_at DESC;

-- See all blog posts:
-- SELECT id, title, status, created_at FROM posts ORDER BY created_at DESC;

-- Check if specific email would be admin (for testing):
-- SELECT 'earl@thewildlandfirerecoveryfund.org' IN (
--   'earl@thewildlandfirerecoveryfund.org',
--   'jason@thewildlandfirerecoveryfund.org',
--   'admin@thewildlandfirerecoveryfund.org'
-- ) as is_admin;
-- -- Result: true

-- =====================================================
-- DONE!
-- =====================================================
-- Your Supabase is now configured for the magic link auth fix.
-- Users can now:
-- 1. Request magic link at /blog/editor
-- 2. Click email link
-- 3. Get redirected to /blog/editor to access the editor
-- 4. Permission check verifies they're an admin
-- 5. They see the blog editor interface
