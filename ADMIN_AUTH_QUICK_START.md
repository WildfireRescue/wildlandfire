# Quick Start: Deploy Admin Auth Fix

## Step 1: Apply the Migration

### Option A: Using Supabase CLI (Recommended)
```bash
cd /Users/earl/Documents/GitHub/wildland-fire

# Push the migration to Supabase
supabase db push
```

### Option B: Manual Application via Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Open `supabase/migrations/005_fix_admin_auth_comprehensive.sql`
4. Copy the entire contents
5. Paste into SQL Editor
6. Click "Run"

## Step 2: Set Your Admin Email(s)

**⚠️ IMPORTANT: Do this immediately after Step 1**

Run ONE of these SQL commands in the Supabase SQL Editor:

### Option A: Update Existing Users
```sql
-- Replace with your actual admin email(s)
UPDATE profiles 
SET role = 'admin' 
WHERE email IN (
  'earl@thewildlandfirerecoveryfund.org',
  'jason@thewildlandfirerecoveryfund.org',
  'drew@thewildlandfirerecoveryfund.org',
  'kendra@thewildlandfirerecoveryfund.org'
);
```

### Option B: Use Helper Function
```sql
-- Run this for each admin
SELECT promote_user_to_admin('earl@thewildlandfirerecoveryfund.org');
SELECT promote_user_to_admin('jason@thewildlandfirerecoveryfund.org');
SELECT promote_user_to_admin('drew@thewildlandfirerecoveryfund.org');
SELECT promote_user_to_admin('kendra@thewildlandfirerecoveryfund.org');
```

## Step 3: Verify Installation

Run this query to confirm:
```sql
SELECT email, role, created_at 
FROM profiles 
ORDER BY role DESC, created_at;
```

Expected output:
- Should see your admin users with `role = 'admin'`
- All other users should have `role = 'user'`

## Step 4: Test Admin Access

1. **Sign Out** of your application if currently logged in
2. **Sign In** with an admin email
3. Navigate to `#admin/blog` or `/admin/blog`
4. You should now see the blog editor interface ✅

## Step 5: Deploy Frontend Changes

```bash
cd /Users/earl/Documents/GitHub/wildland-fire

# Build the frontend
npm run build

# Deploy (depending on your hosting)
# For Netlify:
netlify deploy --prod

# For Vercel:
vercel --prod

# Or just push to GitHub if auto-deploy is configured:
git add .
git commit -m "Fix admin authentication and authorization"
git push origin main
```

## Verification Checklist

After deployment, verify these scenarios:

### ✅ New User Signup
1. Sign up with a new email
2. Check Supabase → Authentication → Users
3. Check `profiles` table → should have a matching row with `role = 'user'`

### ✅ Admin Can Access Editor
1. Sign in as admin
2. Go to `/admin/blog`
3. Should see blog editor (not "Access Denied")

### ✅ Non Admin Cannot Access Editor
1. Sign in as regular user
2. Go to `/admin/blog`
3. Should see "Access Denied" with helpful error message

### ✅ Console Logging
1. Open browser DevTools → Console
2. Sign in as admin
3. Should see logs like:
   ```
   [getCurrentUserProfile] Fetching profile for user: <uuid>
   [getCurrentUserProfile] Profile found: { id: ..., email: ..., role: 'admin' }
   [isCurrentUserEditor] Permission check: { email: '...', role: 'admin', hasPermission: true }
   ```

## Troubleshooting

### Issue: User can't access admin after running migration

**Solution:**
```sql
-- Check if profile exists
SELECT * FROM profiles WHERE email = 'your-email@example.com';

-- If profile exists but role is 'user', update it:
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';

-- If no profile exists, create it:
INSERT INTO profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'your-email@example.com';
```

### Issue: "No profile found" error in console

**Solution:**
```sql
-- Backfill profiles for all existing users
INSERT INTO profiles (id, email, role)
SELECT id, email, 'user'
FROM auth.users
WHERE email IS NOT NULL
  AND id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;
```

### Issue: Migration fails with "table already exists"

**Solution:**
The migration uses `DROP TABLE IF EXISTS` so this shouldn't happen. If it does:
1. Backup your database first
2. Manually drop the profiles table:
   ```sql
   DROP TABLE IF EXISTS profiles CASCADE;
   ```
3. Re run the migration

## What Changed?

### Database
- ✅ Profiles table restructured (id is now PRIMARY KEY)
- ✅ Auto-creation trigger for new users
- ✅ RLS policies prevent recursion issues
- ✅ Security definer functions for safe permission checks

### Frontend
- ✅ Loading states while checking permissions
- ✅ Better error messages with troubleshooting tips
- ✅ Comprehensive console logging for debugging
- ✅ Graceful error handling

### Backend Helpers
- ✅ Enhanced `getCurrentUserProfile()` with error handling
- ✅ Enhanced `isCurrentUserEditor()` with logging
- ✅ New `isCurrentUserAdmin()` for admin-only features

## Need More Details?

See `ADMIN_AUTH_FIX_DOCUMENTATION.md` for:
- Complete technical explanation
- Architecture diagrams
- Security considerations
- Advanced troubleshooting
- Future enhancement ideas

## Quick Admin Commands Reference

### Promote User to Admin
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'user@example.com';
```

### Demote Admin to Editor
```sql
UPDATE profiles SET role = 'editor' WHERE email = 'user@example.com';
```

### List All Admins
```sql
SELECT email, created_at FROM profiles WHERE role = 'admin';
```

### List All Editors
```sql
SELECT email, created_at FROM profiles WHERE role IN ('editor', 'admin');
```

### Check User's Role
```sql
SELECT email, role FROM profiles WHERE email = 'user@example.com';
```
