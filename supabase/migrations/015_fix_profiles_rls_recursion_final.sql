-- =====================================================
-- Migration: 015_fix_profiles_rls_recursion_final.sql
-- Purpose: Eliminate infinite recursion on public.profiles RLS
--          and standardize blog permissions to security-definer helpers
-- =====================================================

BEGIN;

-- =====================================================
-- 1) SECURITY-DEFINER HELPERS (NON-RECURSIVE)
-- =====================================================

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
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  has_id_column BOOLEAN;
  has_user_id_column BOOLEAN;
BEGIN
  IF public.is_blog_admin() THEN
    RETURN TRUE;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'id'
  ) INTO has_id_column;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'user_id'
  ) INTO has_user_id_column;

  IF has_id_column THEN
    RETURN EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('editor', 'admin')
    );
  END IF;

  IF has_user_id_column THEN
    RETURN EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.role IN ('editor', 'admin')
    );
  END IF;

  RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  has_id_column BOOLEAN;
  has_user_id_column BOOLEAN;
BEGIN
  IF public.is_blog_admin() THEN
    RETURN TRUE;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'id'
  ) INTO has_id_column;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'user_id'
  ) INTO has_user_id_column;

  IF has_id_column THEN
    RETURN EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    );
  END IF;

  IF has_user_id_column THEN
    RETURN EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.role = 'admin'
    );
  END IF;

  RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_blog_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_editor_or_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- =====================================================
-- 2) PROFILES POLICIES (DROP RECURSIVE, CREATE SAFE)
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can check editor status" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;

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

DO $$
DECLARE
  has_id_column BOOLEAN;
  has_user_id_column BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'id'
  ) INTO has_id_column;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'user_id'
  ) INTO has_user_id_column;

  IF has_id_column THEN
    EXECUTE '
      CREATE POLICY "Users can read own profile"
      ON public.profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id)
    ';

    EXECUTE '
      CREATE POLICY "Users can update own profile"
      ON public.profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id)
    ';
  ELSIF has_user_id_column THEN
    EXECUTE '
      CREATE POLICY "Users can read own profile"
      ON public.profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id)
    ';

    EXECUTE '
      CREATE POLICY "Users can update own profile"
      ON public.profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id)
    ';
  ELSE
    RAISE WARNING 'profiles table has neither id nor user_id column; own-profile policies were not created.';
  END IF;
END
$$;

-- =====================================================
-- 3) POSTS/CATEGORIES POLICIES USING HELPERS
-- =====================================================

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

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

-- =====================================================
-- 4) VERIFICATION
-- =====================================================

DO $$
DECLARE
  recursive_profile_policy_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO recursive_profile_policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'profiles'
    AND (
      COALESCE(qual, '') ILIKE '%from profiles%'
      OR COALESCE(with_check, '') ILIKE '%from profiles%'
    );

  IF recursive_profile_policy_count > 0 THEN
    RAISE WARNING 'Potential recursive profiles policy patterns still found: %', recursive_profile_policy_count;
  ELSE
    RAISE NOTICE 'Profiles policy recursion patterns removed successfully.';
  END IF;
END
$$;

COMMIT;
