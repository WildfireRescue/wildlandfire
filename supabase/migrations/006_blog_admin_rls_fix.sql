-- =====================================================
-- ALL-IN-ONE FIX: Blog Admin Access + RLS Policies
-- =====================================================
-- Purpose: Allow admin users to manage blog posts while
--          keeping published content public
-- Safe to re-run: All operations are idempotent
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: Create admin email allowlist function
-- =====================================================
-- This function checks if the current user is a blog admin
-- by comparing their email against a hardcoded allowlist
-- SECURITY DEFINER allows it to bypass RLS for the check

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
  -- Extract email from JWT claims
  user_email := current_setting('request.jwt.claims', true)::json->>'email';
  
  -- Check if email is in the admin allowlist
  -- ⚠️ EDIT THIS LIST: Add your admin email addresses here
  RETURN user_email IN (
    'earl@thewildlandfirerecoveryfund.org',
    'admin@thewildlandfirerecoveryfund.org',
    'editor@thewildlandfirerecoveryfund.org'
  );
END;
$$;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.is_blog_admin() TO authenticated, anon;

COMMENT ON FUNCTION public.is_blog_admin() IS 
  'Returns true if the current user email is in the blog admin allowlist';

-- =====================================================
-- STEP 2: Enable RLS on posts table
-- =====================================================
-- Enable Row Level Security on the blog posts table
-- Replace 'posts' with your actual table name if different

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Force RLS - even table owner must go through RLS policies
ALTER TABLE public.posts FORCE ROW LEVEL SECURITY;

COMMENT ON TABLE public.posts IS 
  'Blog posts table with RLS enabled. Public can read published posts, admins can manage all posts.';

-- =====================================================
-- STEP 3: Drop existing conflicting policies
-- =====================================================
-- Remove any existing policies to start clean
-- This makes the migration idempotent

DROP POLICY IF EXISTS "Public can view published posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can insert posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can update posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON public.posts;
DROP POLICY IF EXISTS "Editors can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Editors can insert posts" ON public.posts;
DROP POLICY IF EXISTS "Editors can update posts" ON public.posts;
DROP POLICY IF EXISTS "Editors can delete posts" ON public.posts;

-- =====================================================
-- STEP 4: Create public read policy
-- =====================================================
-- Allow anyone (authenticated or anonymous) to read
-- posts that have status = 'published'

CREATE POLICY "Public can view published posts"
  ON public.posts
  FOR SELECT
  TO public
  USING (status = 'published');

COMMENT ON POLICY "Public can view published posts" ON public.posts IS
  'Allows anyone to read posts with status = published';

-- =====================================================
-- STEP 5: Create admin SELECT policy
-- =====================================================
-- Allow admin users to view ALL posts (including drafts)

CREATE POLICY "Admins can view all posts"
  ON public.posts
  FOR SELECT
  TO authenticated
  USING (is_blog_admin());

COMMENT ON POLICY "Admins can view all posts" ON public.posts IS
  'Allows admin users to read all posts including drafts';

-- =====================================================
-- STEP 6: Create admin INSERT policy
-- =====================================================
-- Allow admin users to create new posts

CREATE POLICY "Admins can insert posts"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (is_blog_admin());

COMMENT ON POLICY "Admins can insert posts" ON public.posts IS
  'Allows admin users to create new blog posts';

-- =====================================================
-- STEP 7: Create admin UPDATE policy
-- =====================================================
-- Allow admin users to edit any post

CREATE POLICY "Admins can update posts"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (is_blog_admin())
  WITH CHECK (is_blog_admin());

COMMENT ON POLICY "Admins can update posts" ON public.posts IS
  'Allows admin users to edit any post';

-- =====================================================
-- STEP 8: Create admin DELETE policy
-- =====================================================
-- Allow admin users to delete any post

CREATE POLICY "Admins can delete posts"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (is_blog_admin());

COMMENT ON POLICY "Admins can delete posts" ON public.posts IS
  'Allows admin users to delete any post';

-- =====================================================
-- STEP 9: Optional - Categories table policies
-- =====================================================
-- If you have a categories table, apply similar policies

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories') THEN
    -- Enable RLS on categories
    ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.categories FORCE ROW LEVEL SECURITY;
    
    -- Drop existing policies
    DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
    DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
    
    -- Public can read categories
    EXECUTE 'CREATE POLICY "Public can view categories" ON public.categories FOR SELECT TO public USING (true)';
    
    -- Admins can manage categories
    EXECUTE 'CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL TO authenticated USING (is_blog_admin()) WITH CHECK (is_blog_admin())';
    
    RAISE NOTICE 'RLS policies applied to categories table';
  ELSE
    RAISE NOTICE 'Categories table not found, skipping';
  END IF;
END $$;

-- =====================================================
-- VERIFICATION & INSTRUCTIONS
-- =====================================================

DO $$
DECLARE
  post_count INTEGER;
  published_count INTEGER;
  policy_count INTEGER;
BEGIN
  -- Count posts
  SELECT COUNT(*) INTO post_count FROM public.posts;
  SELECT COUNT(*) INTO published_count FROM public.posts WHERE status = 'published';
  
  -- Count policies on posts table
  SELECT COUNT(*) INTO policy_count 
  FROM pg_policies 
  WHERE schemaname = 'public' AND tablename = 'posts';
  
  RAISE NOTICE '================================================';
  RAISE NOTICE 'BLOG ADMIN RLS FIX COMPLETED';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Total posts: %', post_count;
  RAISE NOTICE 'Published posts: %', published_count;
  RAISE NOTICE 'RLS policies created: %', policy_count;
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT STEPS:';
  RAISE NOTICE '1. Update admin emails in is_blog_admin() function';
  RAISE NOTICE '   Edit the function to include your admin email addresses';
  RAISE NOTICE '';
  RAISE NOTICE '2. Test public access (anonymous):';
  RAISE NOTICE '   - Should see only published posts';
  RAISE NOTICE '';
  RAISE NOTICE '3. Test admin access (authenticated as admin):';
  RAISE NOTICE '   - Should see all posts (drafts + published)';
  RAISE NOTICE '   - Should be able to create/edit/delete posts';
  RAISE NOTICE '';
  RAISE NOTICE '4. If using a different table name:';
  RAISE NOTICE '   - Replace "posts" with your table name throughout';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS is now ENABLED and FORCED on posts table';
  RAISE NOTICE '================================================';
END $$;

COMMIT;
