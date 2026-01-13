# Quick Test Guide - Auth Loop Fix

## Before Testing

1. **Update Supabase Redirect URLs:**
   - Go to: Supabase Dashboard → Authentication → URL Configuration
   - Add to "Redirect URLs":
     ```
     http://localhost:5173/#auth-callback
     https://your-production-domain.com/#auth-callback
     ```

2. **Ensure you have an admin user:**
   ```sql
   -- Run this in Supabase SQL Editor
   UPDATE profiles 
   SET role = 'admin' 
   WHERE email = 'your-email@example.com';
   ```

3. **Clear browser storage:**
   - Open DevTools → Application → Storage → Clear site data

## Test Procedure

### Test 1: Fresh Login
1. ✅ Navigate to `http://localhost:5173/#admin/blog`
2. ✅ Should show login form (not blank page or error)
3. ✅ Enter your admin email
4. ✅ Click "Send Magic Link"
5. ✅ Should show "Check your email" message
6. ✅ Check email and click the magic link
7. ✅ Should redirect to `/#admin/blog`
8. ✅ Should show blog editor (not login form again)

**Expected Console Logs:**
```
[Supabase] Client initialized
[App] Auth state changed: INITIAL_SESSION
[AuthCallback] Processing auth callback...
[AuthCallback] Session created successfully: { email: "...", userId: "..." }
[App] Auth state changed: SIGNED_IN
[App] User signed in, redirecting to admin/blog
[BlogEditorEnhanced] Checking auth...
[BlogEditorEnhanced] Session check: { hasSession: true, email: "..." }
[BlogEditorEnhanced] Editor status: true
```

### Test 2: Session Persistence
1. ✅ After successful login (Test 1)
2. ✅ Refresh the page (Cmd+R or F5)
3. ✅ Should stay logged in
4. ✅ Should not redirect to login

**Expected Console Logs:**
```
[Supabase] Client initialized
[BlogEditorEnhanced] Checking auth...
[BlogEditorEnhanced] Session check: { hasSession: true, email: "..." }
[BlogEditorEnhanced] Editor status: true
```

### Test 3: Logout
1. ✅ Click "Sign Out" button
2. ✅ Should show login form
3. ✅ Try to navigate to `/#admin/blog`
4. ✅ Should show login form (not editor)

**Expected Console Logs:**
```
[App] Auth state changed: SIGNED_OUT
[App] User signed out
[BlogEditorEnhanced] No authenticated user
```

### Test 4: Non-Admin User
1. ✅ Create a test user without admin role
2. ✅ Login with that user
3. ✅ Should see "Access Denied" message
4. ✅ Message should show user's role
5. ✅ Should have "Sign Out" button

## Troubleshooting

### ❌ "Sign-in failed: Invalid redirect URL"
**Fix:** Add the redirect URL to Supabase dashboard (see "Before Testing" step 1)

### ❌ Still seeing login loop
**Fix:**
1. Clear browser storage completely
2. Check redirect URLs match exactly (http vs https)
3. Look for errors in console

### ❌ "Access Denied" but I'm an admin
**Fix:**
```sql
-- Check your role
SELECT email, role FROM profiles WHERE email = 'your-email@example.com';

-- Update to admin if needed
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

### ❌ "No profile found"
**Fix:**
```sql
-- Create profile manually
INSERT INTO profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'your-email@example.com';
```

## Success Criteria

✅ All 4 tests pass without errors
✅ No infinite redirects
✅ Session persists after refresh
✅ Console shows expected log sequence
✅ Non-admin users see proper error message

## Production Deployment Checklist

Before deploying to production:

1. ✅ Update production redirect URLs in Supabase
   ```
   https://your-production-domain.com/#auth-callback
   ```

2. ✅ Verify production environment variables
   ```
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   ```

3. ✅ Run migration on production database
   ```bash
   supabase db push --linked
   ```

4. ✅ Promote production admin users
   ```sql
   UPDATE profiles SET role = 'admin' 
   WHERE email IN ('admin1@example.com', 'admin2@example.com');
   ```

5. ✅ Test complete flow on production

6. ✅ Monitor error logs for first 24 hours

## Getting Help

If issues persist:

1. Check [AUTH_LOOP_FIX.md](./AUTH_LOOP_FIX.md) for detailed documentation
2. Review console logs for specific error messages
3. Verify Supabase RLS policies are correctly applied
4. Check that migration `005_fix_admin_auth_comprehensive.sql` ran successfully
