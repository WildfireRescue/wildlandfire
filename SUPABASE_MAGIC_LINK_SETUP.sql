# Supabase SQL Setup for Magic Link Authentication

This SQL sets up your Supabase database to support the fixed magic link authentication flow.

## 📋 The 4 SQL Scripts You Need

### 1️⃣ CREATE PROFILES TABLE (If not exists)

Run this in your Supabase SQL Editor to create the profiles table with proper structure:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'viewers' CHECK (role IN ('viewer', 'editor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own profile
CREATE POLICY IF NOT EXISTS "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Only authenticated users can read profiles for permission checks
CREATE POLICY IF NOT EXISTS "Authenticated users can read all profiles for permission checks"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);
```

**What this does:**
- Creates `profiles` table to store user roles
- Sets up indexes for fast email/user lookups
- Enables RLS for security
- Allows users to check permissions

---

### 2️⃣ SETUP ADMIN ALLOWLIST FUNCTION (Must run)

This function checks if a user is an admin. Run this even if you have the migration, to ensure it's current:

```sql
-- Drop old function if it exists to get fresh version
DROP FUNCTION IF EXISTS public.is_blog_admin();

-- Create the admin allowlist function
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
  -- Get the email from JWT token
  user_email := current_setting('request.jwt.claims', true)::json->>'email';
  
  -- Check if email is in admin allowlist
  -- 🚨 EDIT THIS LIST to add your team members
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_blog_admin() TO authenticated, anon;

-- Add a helpful comment
COMMENT ON FUNCTION public.is_blog_admin() IS 
  'Checks if current user email is in blog admin allowlist. Returns true for admins, false otherwise.';
```

**What this does:**
- Creates function that checks if a user is an admin
- Used by RLS policies to grant/deny access
- **You must edit the email list to match your team!**

---

### 3️⃣ ADD YOUR ADMINS TO ALLOWLIST

To add a new admin, you need to:
1. First, they must sign up with magic link (creates them in `auth.users`)
2. Then you can add them to allowlist

**Option A: Add to email allowlist (Instant access, no DB profile)**

Edit the `is_blog_admin()` function above - add their email to the list:

```sql
-- After they click the magic link emails and get added to auth.users table,
-- just edit the function above to include their email
RETURN user_email IN (
  'earl@thewildlandfirerecoveryfund.org',
  'jason@thewildlandfirerecoveryfund.org',
  'newperson@company.com',  -- 👈 Add here for instant access
  'admin@thewildlandfirerecoveryfund.org',
  'editor@thewildlandfirerecoveryfund.org',
  'reports@goldie.agency',
  'help@goldie.agency'
);
```

Then run the CREATE FUNCTION script again (it will replace the old one).

**Option B: Create profile row in database (Alternative approach)**

If you prefer database profiles instead of hardcoded emails, you can insert them:

```sql
-- Find the user_id first (after they've signed up in auth.users):
-- SELECT id, email FROM auth.users WHERE email = 'newperson@company.com';

-- Then insert their profile:
INSERT INTO profiles (user_id, email, role)
VALUES (
  'USER-UUID-HERE',  -- Get from auth.users table
  'newperson@company.com',
  'editor'            -- or 'admin'
)
ON CONFLICT (email) DO UPDATE
SET role = 'editor'
WHERE profiles.email = 'newperson@company.com';
```

---

### 4️⃣ SETUP RLS POLICIES FOR BLOG POSTS

This controls who can read/write/delete blog posts. Run this:

```sql
-- Enable RLS on posts table
ALTER TABLE IF EXISTS posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS posts FORCE ROW LEVEL SECURITY;

-- Drop conflicting policies
DROP POLICY IF EXISTS "Public can view published posts" ON posts;
DROP POLICY IF EXISTS "Admins can view all posts" ON posts;
DROP POLICY IF EXISTS "Admins can insert posts" ON posts;
DROP POLICY IF EXISTS "Admins can update posts" ON posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON posts;

-- 1️⃣ Public can READ published posts
CREATE POLICY "Public can view published posts"
  ON posts FOR SELECT
  TO public
  USING (status = 'published');

-- 2️⃣ Admins can READ all posts (drafts too)
CREATE POLICY "Admins can view all posts"
  ON posts FOR SELECT
  TO authenticated
  USING (is_blog_admin());

-- 3️⃣ Admins can CREATE posts
CREATE POLICY "Admins can insert posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (is_blog_admin());

-- 4️⃣ Admins can UPDATE posts
CREATE POLICY "Admins can update posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (is_blog_admin())
  WITH CHECK (is_blog_admin());

-- 5️⃣ Admins can DELETE posts
CREATE POLICY "Admins can delete posts"
  ON posts FOR DELETE
  TO authenticated
  USING (is_blog_admin());
```

**What this does:**
- Allows public to read published posts
- Allows admins to read/write/delete all posts
- Prevents non-admins from accessing blog editor

---

## 🚀 Quick Setup Steps

### Step 1: Go to Supabase Console

```
https://app.supabase.com → Select your project → SQL Editor
```

### Step 2: Run Script 1 (Profiles Table)

Copy the "CREATE PROFILES TABLE" script above and run it. Should succeed without errors.

### Step 3: Run Script 2 (Admin Function)

Copy the "SETUP ADMIN ALLOWLIST FUNCTION" script and run it.

### Step 4: Edit Your Admin Emails

Open Script 2 again, **edit the email list** to add your team members:

```sql
RETURN user_email IN (
  'earl@thewildlandfirerecoveryfund.org',
  'your-name@company.com',  -- 👈 Add your team here
  'another-team@company.com'
);
```

Then run the edited version. It will replace the function.

### Step 5: Run Script 4 (RLS Policies)

Copy the "SETUP RLS POLICIES FOR BLOG POSTS" script and run it.

---

## ✅ Verification Queries

After running all scripts, run these to verify everything is set up:

```sql
-- Check 1: Profiles table exists
SELECT * FROM profiles LIMIT 5;
-- Expected: Empty table (no error = good)

-- Check 2: Admin function exists
SELECT is_blog_admin();
-- Expected: Should return false (you're not logged in)

-- Check 3: RLS policies exist
SELECT tablename, policyname FROM pg_policies 
WHERE tablename = 'posts' 
ORDER BY tablename, policyname;
-- Expected: See 5 policies for posts table

-- Check 4: Check if specific email would be admin
-- (This won't work in SQL editor, only in app, but you can check the function)
SELECT 'earl@thewildlandfirerecoveryfund.org' IN (
  'earl@thewildlandfirerecoveryfund.org',
  'jason@thewildlandfirerecoveryfund.org',
  'admin@thewildlandfirerecoveryfund.org',
  'editor@thewildlandfirerecoveryfund.org',
  'reports@goldie.agency',
  'help@goldie.agency'
);
-- Expected: true
```

---

## 🐛 Troubleshooting SQL

### Error: "Table already exists"
✅ **Fine!** The `IF NOT EXISTS` clause handles this. Just run the script again.

### Error: "Function already exists"
✅ **Expected!** We use `DROP FUNCTION IF EXISTS` then `CREATE OR REPLACE` to handle this. Just run again.

### Error: "Permission denied" on RLS policies
❌ **Problem:** You might not be logged in as a superuser. 
**Solution:** Make sure you're in Supabase console SQL editor (not API), and you're logged in as the account owner.

### Error: "Column 'status' doesn't exist"
❌ **Problem:** Your posts table might have a different schema.
**Solution:** Check your posts table: `SELECT * FROM posts LIMIT 1;` and adapt the RLS policy to match your column names.

---

## 🔐 Security Considerations

### Allowlist Email Changes

When you edit `is_blog_admin()` to add emails:
- Changes take effect **immediately**
- No need to restart your app
- The function is `SECURITY DEFINER` so it bypasses RLS for the check itself
- Always validate emails are correct before running

### RLS Policies

- `Public can view published posts` - Safe for everyone
- `Admins can view all posts` - Only users with emails in allowlist
- `Admins can insert/update/delete` - Only users with emails in allowlist
- Non-admins cannot do anything, even accidentally

---

## 📊 Example: Add New Team Member

**Scenario:** You want to add `sara@company.com` as an editor

### Option 1: Allowlist (Faster)

```sql
-- Step 1: Edit the function (add email to the list)
CREATE OR REPLACE FUNCTION public.is_blog_admin()
-- ... existing code ...
RETURN user_email IN (
  'earl@thewildlandfirerecoveryfund.org',
  'sara@company.com',  -- 👈 NEW!
  'jason@thewildlandfirerecoveryfund.org',
  -- ... rest of emails
);
-- ... rest of function
$$;

-- Step 2: Have sara@company.com request magic link
-- Step 3: She clicks it and has instant access ✅
```

### Option 2: Database Profile (Alternative)

```sql
-- After sara has requested and accepted the magic link:
-- (She'll appear in auth.users table)

-- Step 1: Get her user ID
SELECT id FROM auth.users WHERE email = 'sara@company.com';
-- Returns: abc-def-123

-- Step 2: Insert profile
INSERT INTO profiles (user_id, email, role)
VALUES ('abc-def-123', 'sara@company.com', 'editor');

-- Step 3: She refreshes the page and has access ✅
```

---

## 📞 Still Issues?

If you get errors, check:

1. **Are you in Supabase SQL Editor?**
   - Go to: Project → SQL Editor → New query

2. **Did you edit the email list?**
   - The function has hardcoded emails you must customize

3. **Are your table names correct?**
   - Check your schema: What is your blog posts table called?
   - Default: `posts`
   - If different: Edit the RLS policy script to use your table name

4. **Check the browser console logs:**
   - When you click the magic link
   - Look for `[checkEditorPermissions]` logs
   - They'll say exactly why access is denied

---

## Quick Validation Script

Run this ALL-IN-ONE to verify everything is working:

```sql
-- 1. Check tables exist
SELECT 'profiles' as "TABLE", EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='profiles') as exists;
SELECT 'posts' as "TABLE", EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='posts') as exists;

-- 2. Check function exists
SELECT 'is_blog_admin' as "FUNCTION", EXISTS(SELECT 1 FROM pg_proc WHERE proname='is_blog_admin') as exists;

-- 3. Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN ('profiles', 'posts');

-- 4. Count RLS policies
SELECT COUNT(*) as policy_count FROM pg_policies WHERE tablename IN ('profiles', 'posts');
-- Expected: At least 6 (1 for profiles, 5 for posts)

-- 5. Check profiles table structure
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles' ORDER BY ordinal_position;
-- Expected: id, user_id, email, role, created_at, updated_at
```

If all checks pass ✅, your database is properly configured for the magic link auth fix!
