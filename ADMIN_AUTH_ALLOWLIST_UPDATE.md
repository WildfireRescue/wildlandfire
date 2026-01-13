# Admin Authentication & Allowlist Update

## ✅ Changes Completed

Updated the admin/publish page (`BlogEditorPageEnhanced`) to properly handle authentication and permissions with admin allowlist fallback.

## 🎯 What Was Updated

### 1. **Enhanced useAuth Hook** ([src/hooks/useAuth.ts](src/hooks/useAuth.ts))

The auth hook now:
- Fetches session via `supabase.auth.getSession()` 
- Loads user profile from `public.profiles` table
- Checks admin allowlist if no profile exists
- Creates virtual admin profile for allowlisted emails
- Provides comprehensive loading state
- Includes detailed console logging at every step

**Admin Allowlist** (matches migration 006):
```typescript
const ADMIN_EMAILS = [
  'earl@thewildlandfirerecoveryfund.org',
  'admin@thewildlandfirerecoveryfund.org',
  'editor@thewildlandfirerecoveryfund.org'
];
```

**Console Logs Added:**
- Session loading state
- User ID and email
- Profile fetch results
- Admin allowlist checks
- Virtual profile creation

### 2. **Updated supabaseBlog Helpers** ([src/lib/supabaseBlog.ts](src/lib/supabaseBlog.ts))

Added `isAdminEmail()` function that:
- Checks if email is in admin allowlist
- Used by both client-side and server-side logic
- Provides fallback when profile doesn't exist

Enhanced `isCurrentUserEditor()` to:
- First check admin allowlist
- Then check profile role
- Grant access if either condition is true
- Detailed console logging for permission decisions

### 3. **Enhanced BlogEditorPageEnhanced Component** ([src/app/pages/admin/BlogEditorPageEnhanced.tsx](src/app/pages/admin/BlogEditorPageEnhanced.tsx))

Complete rewrite of authentication logic:

**Uses centralized auth hook:**
```typescript
const { session, user, profile, loading: authLoading, error: authHookError } = useAuth();
```

**Permission Logic:**
1. Waits for `authLoading` to complete before rendering
2. Checks session exists (`session`, `user`)
3. Determines permissions with priority:
   - **Profile role**: admin or editor can publish
   - **Admin allowlist**: if email in list, treat as admin
   - **User role**: cannot publish

**Console Logs Added:**
```
[BlogEditorEnhanced] === AUTH CHECK START ===
[BlogEditorEnhanced] Auth loading: false
[BlogEditorEnhanced] Session exists: true
[BlogEditorEnhanced] User ID: abc-123-def
[BlogEditorEnhanced] User email: earl@example.org
[BlogEditorEnhanced] Profile exists: false
[BlogEditorEnhanced] Profile role: undefined
[BlogEditorEnhanced] === PERMISSION DECISION ===
[BlogEditorEnhanced] Can publish: true
[BlogEditorEnhanced] Permission source: admin allowlist
[BlogEditorEnhanced] === AUTH CHECK END ===
```

**Three UI States:**

1. **Not Logged In** - Shows magic link login form
2. **Loading** - Shows spinner while checking permissions
3. **No Permission** - Shows detailed access denied with:
   - User email
   - Profile role (or "none")
   - Admin allowlist status
   - Troubleshooting steps
4. **Has Permission** - Shows full blog editor

## 📋 Permission Rules

| Condition | Can Publish | Source |
|-----------|------------|--------|
| Profile role = `admin` | ✅ Yes | Profile |
| Profile role = `editor` | ✅ Yes | Profile |
| Profile role = `user` | ❌ No | Profile |
| No profile + email in allowlist | ✅ Yes | Allowlist |
| No profile + email NOT in allowlist | ❌ No | - |

## 🔍 Testing Checklist

### Test 1: Admin Allowlist User (No Profile)
1. Sign in with email in allowlist
2. Check console for these logs:
   - `[useAuth] No profile found for user`
   - `[useAuth] Checking admin allowlist...`
   - `[useAuth] User email is in admin allowlist, treating as admin`
   - `[BlogEditorEnhanced] Can publish: true`
   - `[BlogEditorEnhanced] Permission source: admin allowlist`
3. ✅ Should see full blog editor
4. ✅ Header should show email with "(admin)" role

### Test 2: Editor with Profile
1. Sign in with editor account (profile exists with role='editor')
2. Check console for:
   - `[useAuth] Profile loaded: { role: 'editor' }`
   - `[BlogEditorEnhanced] Can publish: true`
   - `[BlogEditorEnhanced] Permission source: profile role: editor`
3. ✅ Should see full blog editor
4. ✅ Header should show email with "(editor)" role

### Test 3: Regular User (No Permission)
1. Sign in with non-admin email (profile role='user')
2. Check console for:
   - `[useAuth] Profile loaded: { role: 'user' }`
   - `[BlogEditorEnhanced] Can publish: false`
   - `[BlogEditorEnhanced] Permission source: user role (no publish access)`
3. ✅ Should see "Access Denied" page
4. ✅ Should show:
   - Email address
   - Profile role: user
   - In admin allowlist: No
   - Required: admin or editor role

### Test 4: Unauthenticated User
1. Visit `/admin/blog` without being logged in
2. ✅ Should see login form immediately
3. ✅ No console errors

### Test 5: Auth State Changes
1. Sign out and sign back in
2. Check console for auth state change logs
3. ✅ Should properly reload profile and permissions

## 🔐 Security Notes

- **Admin allowlist is hardcoded** in both:
  - `useAuth.ts` (client-side)
  - `supabaseBlog.ts` (client-side)
  - `006_blog_admin_rls_fix.sql` (database RLS)
  
- **To add/remove admins:** Update all three locations

- **Database RLS still enforced:** Even if client grants access, Supabase RLS policies will verify the email allowlist

- **Profile auto-creation:** Currently creates "virtual" profile client-side only. Consider adding database trigger to auto-create profiles for allowlisted emails.

## 📝 Next Steps (Optional)

1. **Auto-create profiles**: Add trigger to create `profiles` row when allowlisted user signs up:
   ```sql
   CREATE OR REPLACE FUNCTION handle_admin_signup()
   RETURNS TRIGGER AS $$
   BEGIN
     IF NEW.email IN ('earl@...', 'admin@...', 'editor@...') THEN
       INSERT INTO public.profiles (id, email, role)
       VALUES (NEW.id, NEW.email, 'admin')
       ON CONFLICT (id) DO NOTHING;
     END IF;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

2. **Centralize allowlist**: Move to environment variables or database table

3. **Add audit logging**: Track who publishes what

## 📄 Files Changed

1. ✅ [src/hooks/useAuth.ts](src/hooks/useAuth.ts) - Enhanced with profile loading and allowlist
2. ✅ [src/lib/supabaseBlog.ts](src/lib/supabaseBlog.ts) - Added allowlist check
3. ✅ [src/app/pages/admin/BlogEditorPageEnhanced.tsx](src/app/pages/admin/BlogEditorPageEnhanced.tsx) - Complete auth rewrite

## 🎉 Benefits

- ✅ No more "No profile found" hard failures
- ✅ Admin allowlist provides immediate access
- ✅ Clear permission source in console
- ✅ Detailed troubleshooting info for denied users
- ✅ Proper loading states prevent premature redirects
- ✅ Comprehensive logging for debugging
