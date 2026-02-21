-- Migration: 013_posts_rls_policies.sql
-- RLS Policies for posts table
-- Assumes RLS is enabled. If not enabled, these policies won't affect anything.
-- Policies:
--   1. Public: SELECT published posts only
--   2. Authenticated: Full access to own posts (if you have auth_user_id column)
--   3. Admin: Full access via is_admin check (requires custom claims)
--
-- IMPORTANT: Adjust based on your actual auth setup (auth_user_id, is_admin, roles, etc.)
-- Status: SAFE (only grants explicit permissions; denies by default)
-- Date: 2026-02-20

BEGIN;

-- ============================================================================
-- ENABLE RLS (if not already enabled)
-- ============================================================================
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICY 1: PUBLIC SELECT - Anyone can read published posts
-- ============================================================================
CREATE POLICY IF NOT EXISTS "Public posts are readable by anyone"
  ON posts FOR SELECT
  USING (status = 'published');

-- ============================================================================
-- POLICY 2: AUTHENTICATED USER - Can see their own posts (draft + published)
-- ============================================================================
-- NOTE: Adjust auth_user_id to match your actual column that stores the post author
-- If you don't have this column, skip or modify this policy
CREATE POLICY IF NOT EXISTS "Authors can see their own posts"
  ON posts FOR SELECT
  USING (
    auth.uid() = auth_user_id  -- Change to your actual column name
  );

-- ============================================================================
-- POLICY 3: AUTHENTICATED USER - Can INSERT/UPDATE/DELETE their own posts
-- ============================================================================
-- Enforce that users can only create/edit posts they own
CREATE POLICY IF NOT EXISTS "Authors can manage their own posts"
  ON posts FOR INSERT
  WITH CHECK (
    auth.uid() = auth_user_id  -- Change to your actual column name
  );

CREATE POLICY IF NOT EXISTS "Authors can update their own posts"
  ON posts FOR UPDATE
  USING (
    auth.uid() = auth_user_id  -- Change to your actual column name
  )
  WITH CHECK (
    auth.uid() = auth_user_id  -- Change to your actual column name
  );

CREATE POLICY IF NOT EXISTS "Authors can delete their own posts"
  ON posts FOR DELETE
  USING (
    auth.uid() = auth_user_id  -- Change to your actual column name
  );

-- ============================================================================
-- POLICY 4: ADMIN - Full access
-- ============================================================================
-- Uses custom claims in JWT (requires setting up custom claims in Supabase Auth)
-- Adjust the custom claim name if different (e.g., "role", "is_admin", etc.)
CREATE POLICY IF NOT EXISTS "Admins have full access"
  ON posts FOR ALL
  USING (
    (auth.jwt() ->> 'is_admin')::boolean = true
  )
  WITH CHECK (
    (auth.jwt() ->> 'is_admin')::boolean = true
  );

COMMIT;

-- ============================================================================
-- NOTES FOR IMPLEMENTATION
-- ============================================================================
-- 1. Verify your auth_user_id column name and type in posts table
--    - If it's called user_id, use user_id instead of auth_user_id
--    - If it's uuid, ensure auth.uid() matches
--
-- 2. For admin policy to work:
--    - Set custom claims in Supabase Auth via the Admin API or via a trigger
--    - Example: POST /admin/users/{user-id}/app_metadata with { "is_admin": true }
--    - Or use auth.jwt() ->> 'role' if you store role instead
--
-- 3. Test policies with:
--    SELECT * FROM posts WHERE status = 'published';  -- Should work for anon
--    SELECT * FROM posts;  -- For authenticated user, should see own posts + published
--
-- 4. Disable RLS if you want (not recommended for production):
--    ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
