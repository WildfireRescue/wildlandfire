# Console Log Reference - Admin Auth Flow

## Quick Debug Guide

When visiting the admin/publish page, you should see these console logs in order:

### 1. Auth Initialization

```
[useAuth] Initializing auth state...
[useAuth] Session loaded: { 
  hasSession: true, 
  email: 'earl@thewildlandfirerecoveryfund.org', 
  userId: 'abc-123-def-456' 
}
```

### 2. Profile Loading

**Scenario A: Profile Exists**
```
[useAuth] Loading profile for user: abc-123-def-456 earl@example.org
[useAuth] Profile loaded: { 
  id: 'abc-123-def-456', 
  email: 'earl@example.org', 
  role: 'editor' 
}
```

**Scenario B: No Profile + In Allowlist**
```
[useAuth] Loading profile for user: abc-123-def-456 earl@thewildlandfirerecoveryfund.org
[useAuth] No profile found for user: abc-123-def-456
[useAuth] Checking admin allowlist...
[useAuth] User email is in admin allowlist, treating as admin
```

**Scenario C: No Profile + NOT in Allowlist**
```
[useAuth] Loading profile for user: abc-123-def-456 user@gmail.com
[useAuth] No profile found for user: abc-123-def-456
[useAuth] Checking admin allowlist...
[useAuth] User email NOT in admin allowlist
```

### 3. Permission Check

```
[BlogEditorEnhanced] === AUTH CHECK START ===
[BlogEditorEnhanced] Auth loading: false
[BlogEditorEnhanced] Session exists: true
[BlogEditorEnhanced] User ID: abc-123-def-456
[BlogEditorEnhanced] User email: earl@thewildlandfirerecoveryfund.org
[BlogEditorEnhanced] Profile exists: true
[BlogEditorEnhanced] Profile role: admin
[BlogEditorEnhanced] Auth hook error: null
[BlogEditorEnhanced] === PERMISSION DECISION ===
[BlogEditorEnhanced] Can publish: true
[BlogEditorEnhanced] Permission source: profile role: admin
[BlogEditorEnhanced] === AUTH CHECK END ===
```

### 4. Additional Permission Checks (When Saving Post)

```
[isCurrentUserEditor] Checking permissions for: earl@thewildlandfirerecoveryfund.org
[isCurrentUserEditor] User is in admin allowlist, granting access
```

OR

```
[isCurrentUserEditor] Checking permissions for: editor@example.org
[isCurrentUserEditor] Permission check: { 
  email: 'editor@example.org', 
  role: 'editor', 
  hasPermission: true 
}
```

## 🔍 Troubleshooting by Console Output

### Issue: "Access Denied" even though email is in allowlist

**Expected logs:**
```
[useAuth] User email is in admin allowlist, treating as admin
[BlogEditorEnhanced] Can publish: true
[BlogEditorEnhanced] Permission source: admin allowlist
```

**If missing:**
1. Check email spelling in allowlist (case-sensitive)
2. Verify both files have same allowlist:
   - `src/hooks/useAuth.ts`
   - `src/lib/supabaseBlog.ts`
3. Hard refresh page (Cmd+Shift+R)

### Issue: "No profile found" error visible

**Expected logs:**
```
[useAuth] No profile found for user: ...
[useAuth] Checking admin allowlist...
```

**If you see:**
```
[useAuth] Profile fetch error: ...
```

1. Check Supabase RLS policies on `profiles` table
2. Verify migration 002 ran successfully
3. Check if profiles table exists

### Issue: Stuck on "Checking permissions..." spinner

**Expected logs:**
```
[BlogEditorEnhanced] Auth loading: false
```

**If stuck at:**
```
[BlogEditorEnhanced] Auth loading: true
```

1. Check network tab for hung requests
2. Verify Supabase URL and anon key
3. Check browser console for errors

### Issue: Can't save post even with permission

**Expected logs when clicking Save:**
```
[isCurrentUserEditor] Checking permissions for: ...
[isCurrentUserEditor] User is in admin allowlist, granting access
Attempting to save post: { title: '...', ... }
Save result: { post: {...}, error: null }
✅ Post saved successfully!
```

**If you see:**
```
[isCurrentUserEditor] User is in admin allowlist, granting access
Supabase error: { message: 'new row violates row-level security policy' }
```

1. Run migration 006 (blog admin RLS fix)
2. Verify email in database function matches:
   ```sql
   SELECT is_blog_admin(); -- Should return true
   ```
3. Check RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'posts';
   ```

## 📊 Permission Decision Matrix

| Profile Role | In Allowlist | Can Publish | Log Message |
|--------------|--------------|-------------|-------------|
| admin | N/A | ✅ Yes | `Permission source: profile role: admin` |
| editor | N/A | ✅ Yes | `Permission source: profile role: editor` |
| user | No | ❌ No | `Permission source: user role (no publish access)` |
| user | Yes | ✅ Yes | `Permission source: admin allowlist` |
| (no profile) | Yes | ✅ Yes | `Permission source: admin allowlist` |
| (no profile) | No | ❌ No | (Access denied, no source) |

## 🛠️ Testing Commands

### Check if user is in allowlist (Browser Console)
```javascript
// After page loads
const email = 'earl@thewildlandfirerecoveryfund.org';
const ADMIN_EMAILS = [
  'earl@thewildlandfirerecoveryfund.org',
  'admin@thewildlandfirerecoveryfund.org',
  'editor@thewildlandfirerecoveryfund.org'
];
console.log('In allowlist?', ADMIN_EMAILS.includes(email));
```

### Check current session (Browser Console)
```javascript
const { data } = await window.supabase.auth.getSession();
console.log('Session:', data.session);
console.log('Email:', data.session?.user?.email);
```

### Check profile (Browser Console)
```javascript
const { data } = await window.supabase
  .from('profiles')
  .select('*')
  .eq('id', (await window.supabase.auth.getUser()).data.user.id)
  .single();
console.log('Profile:', data);
```

### Test RLS function (Supabase SQL Editor)
```sql
-- Check if current JWT is recognized as admin
SELECT is_blog_admin();

-- View all RLS policies
SELECT * FROM pg_policies WHERE tablename = 'posts';

-- Check if user can see posts
SELECT count(*) FROM posts;
```

## 🎯 Success Indicators

All green means everything is working:

- ✅ Console shows "Permission source: ..." message
- ✅ UI shows blog editor (not access denied)
- ✅ Header shows email and role badge
- ✅ Can save posts without RLS errors
- ✅ No error messages in console
- ✅ Auth state persists after page refresh
