# Authentication Loop Fix - Complete Documentation

## Problem Summary

Users clicking magic link were stuck in an infinite redirect loop:
1. Click magic link → redirected to site
2. Auth callback processes → redirects to `#publish`
3. App.tsx routing sees `#publish` → redirects to `#admin/blog`
4. BlogEditorPage loads but auth state not ready → shows login
5. User tries to login again → loop repeats

## Root Causes Identified

### 1. **Supabase Client Not Properly Configured**
- ❌ Missing auth configuration options
- ❌ No debug logging enabled
- ❌ Default settings caused issues with session restoration

### 2. **Redirect Loop in App.tsx**
- ❌ Line 54-56: Redirects SIGNED_IN event to `#publish`
- ❌ Line 79-82: Immediately redirects `#publish` to `#admin/blog`
- Result: Infinite loop between two hash routes

### 3. **AuthCallbackPage Incorrect Redirect**
- ❌ Redirected to `#publish` (old route)
- Should redirect directly to `#admin/blog`

### 4. **Wrong redirectTo URL in Magic Link**
- ❌ Used `${origin}/` instead of `${origin}/#auth-callback`
- Magic link callback couldn't find the handler

### 5. **No Auth Loading State Protection**
- ❌ Pages rendered before auth state loaded
- ❌ Premature redirects before session restoration
- ❌ No logging to debug auth flow

## Solutions Implemented

### ✅ 1. Fixed Supabase Client (src/lib/supabase.ts)

```typescript
export const supabase = createClient(
  supabaseUrl ?? '',
  supabaseAnonKey ?? '',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: window.localStorage,
      storageKey: 'wildland-fire-auth',
      debug: true, // Enable auth debugging
    },
  }
);
```

**Benefits:**
- ✅ Session persists across page reloads
- ✅ Auto-refreshes tokens before expiration
- ✅ Debug logging shows auth flow
- ✅ PKCE flow for better security

### ✅ 2. Fixed Redirect Loop in App.tsx

**Before:**
```typescript
if (event === 'SIGNED_IN' && session) {
  window.location.hash = 'publish'; // ❌ Causes loop
}
```

**After:**
```typescript
if (event === 'SIGNED_IN' && session) {
  console.log('[App] User signed in, redirecting to admin/blog');
  if (!window.location.hash.includes('admin')) {
    window.location.hash = 'admin/blog'; // ✅ Direct redirect
  }
}
```

**Benefits:**
- ✅ No intermediate `#publish` redirect
- ✅ Guard prevents redirect if already on admin page
- ✅ Logging for debugging

### ✅ 3. Fixed AuthCallbackPage

**Changes:**
- ✅ Redirects directly to `#admin/blog` instead of `#publish`
- ✅ Added comprehensive logging
- ✅ Verifies session exists before redirecting
- ✅ 500ms delay to ensure session is written to storage

```typescript
setTimeout(() => {
  window.location.replace(`${window.location.origin}/#admin/blog`);
}, 500);
```

### ✅ 4. Fixed redirectTo URL

**Before:**
```typescript
const { error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: `${window.location.origin}/`, // ❌ Wrong
  },
});
```

**After:**
```typescript
const { error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: `${window.location.origin}/#auth-callback`, // ✅ Correct
  },
});
```

### ✅ 5. Added Comprehensive Logging

All auth related files now include detailed console logging:

```typescript
console.log('[BlogEditor] Session check:', {
  hasSession: !!session,
  email,
  userId: session?.user?.id,
});
```

**Logging locations:**
- ✅ `supabase.ts` - Client initialization
- ✅ `App.tsx` - Auth state changes
- ✅ `AuthCallbackPage.tsx` - Callback processing
- ✅ `BlogEditorPage.tsx` - Auth checks
- ✅ `BlogEditorPageEnhanced.tsx` - Auth checks

### ✅ 6. Created useAuth Hook (Optional Enhancement)

New hook for centralized auth state management:

```typescript
const { session, user, loading, error } = useAuth();
```

**Features:**
- ✅ Single source of truth for auth state
- ✅ Proper loading state management
- ✅ Automatic cleanup
- ✅ Comprehensive logging

## Testing the Fix

### 1. Test Magic Link Login

1. Go to `/#admin/blog`
2. Enter your email
3. Click "Send Magic Link"
4. Check email and click the link
5. ✅ Should redirect to `/#admin/blog` without loops

### 2. Test Session Persistence

1. Login successfully
2. Refresh the page
3. ✅ Should stay logged in (no redirect to login)

### 3. Check Browser Console

You should see logs like:

```
[Supabase] Client initialized
[App] Auth state changed: SIGNED_IN
[AuthCallback] Processing auth callback...
[AuthCallback] Session created successfully
[BlogEditor] Session check: { hasSession: true, email: "user@example.com" }
[BlogEditor] Editor status: true
```

### 4. Test Logout

1. Click "Sign Out" button
2. ✅ Should show login form
3. ✅ Should not be able to access editor without login

## Supabase Configuration Checklist

Make sure these are configured in your Supabase project:

### Authentication Settings

1. **Redirect URLs** (Settings → Authentication → URL Configuration):
   ```
   https://your domain.com/#auth callback
   http://localhost:5173/#auth callback (for development)
   ```

2. **Email Templates** (Settings → Authentication → Email Templates):
   - Make sure magic link template uses `{{ .ConfirmationURL }}`

3. **Site URL** (Settings → Authentication → URL Configuration):
   ```
   https://your domain.com
   ```

## Database Setup

Run the migration to set up profiles and permissions:

```bash
# Make sure you're authenticated with Supabase
supabase db push
```

Then promote your admin user:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

## Environment Variables

Required in `.env`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Troubleshooting

### Still seeing login loop?

1. **Clear browser storage:**
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Check redirect URLs in Supabase:**
   - Must include `/#auth-callback`
   - Must match exactly (http vs https)

3. **Verify user has profile:**
   ```sql
   SELECT * FROM profiles WHERE email = 'your email@example.com';
   ```

4. **Check browser console for errors:**
   - Look for RLS policy errors
   - Check for session creation errors

### User can login but access denied?

1. **Check user role:**
   ```sql
   SELECT email, role FROM profiles WHERE email = 'your email@example.com';
   ```

2. **Promote to admin:**
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your email@example.com';
   ```

3. **Verify RLS policies allow admin access:**
   - Check migration `005_fix_admin_auth_comprehensive.sql`
   - Policies should use `is_admin()` or `is_editor_or_admin()` functions

### Session not persisting after refresh?

1. **Check localStorage:**
   ```javascript
   console.log(localStorage.getItem('wildland fire auth'));
   ```

2. **Verify auth config has:**
   ```typescript
   persistSession: true,
   storage: window.localStorage,
   ```

3. **Check for third party cookie blocking**

## Files Changed

### Core Auth Files
- ✅ `src/lib/supabase.ts` - Fixed client config
- ✅ `src/app/App.tsx` - Fixed redirect loop
- ✅ `src/app/pages/AuthCallbackPage.tsx` - Fixed callback redirect
- ✅ `src/app/pages/admin/BlogEditorPage.tsx` - Fixed redirectTo and logging
- ✅ `src/app/pages/admin/BlogEditorPageEnhanced.tsx` - Fixed redirectTo and logging

### New Files
- ✅ `src/hooks/useAuth.ts` - Centralized auth hook (optional)
- ✅ `AUTH_LOOP_FIX.md` - This documentation

## Next Steps

1. ✅ Test the complete auth flow
2. ✅ Verify session persistence
3. ✅ Promote your admin user in the database
4. ✅ Deploy changes to production
5. ✅ Update Supabase redirect URLs in production

## Summary

The authentication loop has been fixed by:

1. ✅ Configuring Supabase client properly
2. ✅ Removing redirect loop between `#publish` and `#admin/blog`
3. ✅ Fixing AuthCallbackPage to redirect correctly
4. ✅ Correcting redirectTo URL in magic link
5. ✅ Adding comprehensive logging throughout
6. ✅ Creating optional useAuth hook for better state management

All changes maintain backward compatibility and add defensive checks to prevent future issues.
