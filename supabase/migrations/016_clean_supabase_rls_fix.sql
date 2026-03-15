-- =====================================================
-- CLEAN SUPABASE RLS FIX (Blog + Profiles)
-- Migration: 016_clean_supabase_rls_fix.sql
-- =====================================================
-- What this does:
-- 1) Removes recursive policy patterns on public.profiles
-- 2) Uses SECURITY DEFINER functions for editor/admin checks
-- 3) Rebuilds posts/categories policies cleanly
-- =====================================================

BEGIN;

-- -----------------------------------------------------
-- 1) SECURITY DEFINER FUNCTIONS (NON-RECURSIVE)
-- -----------------------------------------------------

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
  user_email := lower(current_setting('request.jwt.claims', true)::json->>'email');

  RETURN user_email IN (
    'earl@thewildlandfirerecoveryfund.org',
    'jason@thewildlandfirerecoveryfund.org',
    'admin@thewildlandfirerecoveryfund.org',
    'editor@thewildlandfirerecoveryfund.org',
    'reports@goldie.agency',
    'help@goldie.agency',
    'ca_mortar@yahoo.com'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_editor_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    public.is_blog_admin()
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('editor', 'admin')
    );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    public.is_blog_admin()
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    );
$$;

GRANT EXECUTE ON FUNCTION public.is_blog_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_editor_or_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- -----------------------------------------------------
-- 2) PROFILES TABLE POLICIES
-- -----------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can check editor status" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_blog_admin());

CREATE POLICY "Admins can update profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_blog_admin())
  WITH CHECK (public.is_blog_admin());

CREATE POLICY "Admins can insert profiles"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_blog_admin());

CREATE POLICY "Service role can manage profiles"
  ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------
-- 3) POSTS TABLE POLICIES
-- -----------------------------------------------------

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published posts" ON public.posts;
DROP POLICY IF EXISTS "Public posts are readable by anyone" ON public.posts;
DROP POLICY IF EXISTS "Admins can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can insert posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can update posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON public.posts;
DROP POLICY IF EXISTS "Editors can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Editors can insert posts" ON public.posts;
DROP POLICY IF EXISTS "Editors can update posts" ON public.posts;
DROP POLICY IF EXISTS "Editors can delete posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can see their own posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can manage their own posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can delete their own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins have full access" ON public.posts;

CREATE POLICY "Public can view published posts"
  ON public.posts
  FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "Editors can view all posts"
  ON public.posts
  FOR SELECT
  TO authenticated
  USING (public.is_editor_or_admin());

CREATE POLICY "Editors can insert posts"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_editor_or_admin());

CREATE POLICY "Editors can update posts"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (public.is_editor_or_admin())
  WITH CHECK (public.is_editor_or_admin());

CREATE POLICY "Editors can delete posts"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (public.is_editor_or_admin());

-- -----------------------------------------------------
-- 4) CATEGORIES TABLE POLICIES
-- -----------------------------------------------------

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Editors can manage categories" ON public.categories;

CREATE POLICY "Public can view categories"
  ON public.categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Editors can manage categories"
  ON public.categories
  FOR ALL
  TO authenticated
  USING (public.is_editor_or_admin())
  WITH CHECK (public.is_editor_or_admin());

COMMIT;
