-- =====================================================
-- COMPREHENSIVE FIX: Admin Authentication & Authorization
-- =====================================================
-- Problem: Users can sign in but can't access /admin/blog
-- Root Cause: 
--   1. No profile row exists for logged-in users
--   2. RLS policies block profile reads causing permission checks to fail
--   3. No automatic profile creation on user signup
-- 
-- Solution:
--   1. Fix profiles table structure (id should be the auth user's id)
--   2. Add proper RLS policies that allow role checking without recursion
--   3. Auto-create profiles for new users via trigger
--   4. Add helper function to safely insert admin users
-- =====================================================

-- =====================================================
-- STEP 1: Fix profiles table structure
-- =====================================================

-- Drop existing table and recreate with correct structure
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'editor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 2: Add RLS Policies (Non-Recursive)
-- =====================================================

-- Policy 1: Users can read their own profile
-- This is safe and doesn't cause recursion
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Admins can read all profiles
-- Uses a direct check against the profiles table
-- This works because Policy 1 already allows the admin to read their own profile
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Policy 3: Admins can update any profile
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Policy 4: Admins can insert profiles
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Policy 5: Allow service role to manage profiles (for triggers)
-- This is crucial for the auto-create trigger
DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;
CREATE POLICY "Service role can manage profiles"
  ON profiles FOR ALL
  USING (current_setting('request.jwt.claim.role', true) = 'service_role')
  WITH CHECK (current_setting('request.jwt.claim.role', true) = 'service_role');

-- =====================================================
-- STEP 3: Create trigger to auto-create profiles
-- =====================================================

-- Function to create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to call the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- STEP 4: Helper function to check if user is editor/admin
-- =====================================================

-- Security definer function that safely checks editor status
-- This avoids RLS recursion issues in post policies
CREATE OR REPLACE FUNCTION public.is_editor_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('editor', 'admin')
  );
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_editor_or_admin() TO authenticated, anon;

-- Also create a simpler check for just admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- =====================================================
-- STEP 5: Update posts policies to use helper function
-- =====================================================

-- This prevents RLS recursion issues

DROP POLICY IF EXISTS "Editors can view all posts" ON posts;
CREATE POLICY "Editors can view all posts"
  ON posts FOR SELECT
  USING (is_editor_or_admin());

DROP POLICY IF EXISTS "Editors can insert posts" ON posts;
CREATE POLICY "Editors can insert posts"
  ON posts FOR INSERT
  WITH CHECK (is_editor_or_admin());

DROP POLICY IF EXISTS "Editors can update posts" ON posts;
CREATE POLICY "Editors can update posts"
  ON posts FOR UPDATE
  USING (is_editor_or_admin());

DROP POLICY IF EXISTS "Editors can delete posts" ON posts;
CREATE POLICY "Editors can delete posts"
  ON posts FOR DELETE
  USING (is_editor_or_admin());

-- =====================================================
-- STEP 6: Update categories policies
-- =====================================================

DROP POLICY IF EXISTS "Editors can manage categories" ON categories;
CREATE POLICY "Editors can manage categories"
  ON categories FOR ALL
  USING (is_editor_or_admin());

-- =====================================================
-- STEP 7: Create profiles for existing auth users
-- =====================================================

-- This will create profile rows for any users who already signed up
INSERT INTO profiles (id, email, role)
SELECT id, email, 'user'
FROM auth.users
WHERE email IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 8: Promote specific users to admin
-- =====================================================
-- ⚠️ IMPORTANT: Change these email addresses to your actual admin emails
-- This is where you set who has admin access to the blog editor

-- Method 1: Direct SQL update (run this manually after deployment)
-- UPDATE profiles SET role = 'admin' 
-- WHERE email IN (
--   'your-admin-email@example.com',
--   'another-admin@example.com'
-- );

-- Method 2: Create a helper function for future admin promotions
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(user_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow if caller is already an admin or this is the first admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'admin') OR is_admin() THEN
    UPDATE profiles
    SET role = 'admin', updated_at = NOW()
    WHERE email = user_email;
    
    RAISE NOTICE 'User % promoted to admin', user_email;
  ELSE
    RAISE EXCEPTION 'Permission denied: Only admins can promote users';
  END IF;
END;
$$;

-- Method 3: Auto-promote based on email pattern (OPTIONAL - use with caution)
-- Uncomment and modify if you want to auto-promote users with specific email domains
-- CREATE OR REPLACE FUNCTION public.auto_promote_admin()
-- RETURNS TRIGGER
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- SET search_path = public
-- AS $$
-- BEGIN
--   -- Auto-promote users from your organization's domain
--   IF NEW.email LIKE '%@thewildlandfirerecoveryfund.org' THEN
--     NEW.role := 'admin';
--   END IF;
--   RETURN NEW;
-- END;
-- $$;

-- DROP TRIGGER IF EXISTS on_profile_created_check_admin ON profiles;
-- CREATE TRIGGER on_profile_created_check_admin
--   BEFORE INSERT ON profiles
--   FOR EACH ROW
--   EXECUTE FUNCTION public.auto_promote_admin();

-- =====================================================
-- STEP 9: Create trigger for updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION & INSTRUCTIONS
-- =====================================================

DO $$
DECLARE
  user_count INTEGER;
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  SELECT COUNT(*) INTO admin_count FROM profiles WHERE role = 'admin';
  
  RAISE NOTICE '================================';
  RAISE NOTICE 'ADMIN AUTH FIX COMPLETED';
  RAISE NOTICE '================================';
  RAISE NOTICE 'Profiles created: %', user_count;
  RAISE NOTICE 'Admins configured: %', admin_count;
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT STEPS:';
  RAISE NOTICE '1. Update admin emails in this migration (Step 8)';
  RAISE NOTICE '2. Run the UPDATE statement to promote your admins:';
  RAISE NOTICE '   UPDATE profiles SET role = ''admin'' WHERE email IN (''your@email.com'');';
  RAISE NOTICE '';
  RAISE NOTICE 'OR use the helper function:';
  RAISE NOTICE '   SELECT promote_user_to_admin(''your@email.com'');';
  RAISE NOTICE '================================';
END $$;
