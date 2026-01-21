# 🎯 Auth Loop Fix - Action Checklist

## ✅ Immediate Actions (Before Testing)

### 1. Update Supabase Redirect URLs
**Priority: CRITICAL**

Go to: [Supabase Dashboard](https://app.supabase.com) → Your Project → Authentication → URL Configuration

Add these redirect URLs:

**Development:**
```
http://localhost:5173/#auth-callback
http://localhost:3000/#auth-callback
```

**Production:**
```
https://your-production-domain.com/#auth-callback
```

> ⚠️ Without this, magic links will fail with "Invalid redirect URL" error

---

### 2. Promote Your Admin User
**Priority: CRITICAL**

Go to: Supabase Dashboard → SQL Editor → New query

Run this (replace with your email):
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

Verify it worked:
```sql
SELECT email, role 
FROM profiles 
WHERE email = 'your-email@example.com';
```

Expected result: `role = 'admin'`

---

### 3. Clear Browser Storage
**Priority: HIGH**

Before testing, clear old auth data:

**Option A: Browser DevTools**
1. Open DevTools (F12)
2. Application tab → Storage
3. Click "Clear site data"

**Option B: Console**
```javascript
localStorage.clear();
sessionStorage.clear();
```

---

## 🧪 Testing (Follow This Order)

### Test 1: Fresh Login ✓
- [ ] Go to `http://localhost:5173/#admin/blog`
- [ ] Enter admin email
- [ ] Click "Send Magic Link"
- [ ] Check email for link
- [ ] Click magic link
- [ ] **Expected:** Redirects to blog editor (no loop)

### Test 2: Session Persistence ✓
- [ ] After successful login
- [ ] Refresh page (Cmd+R / F5)
- [ ] **Expected:** Stay logged in (no redirect to login)

### Test 3: Logout ✓
- [ ] Click "Sign Out" button
- [ ] **Expected:** Shows login form
- [ ] Try to access `/#admin/blog`
- [ ] **Expected:** Shows login form (blocked from editor)

### Test 4: Non Admin Access ✓
- [ ] Create test user WITHOUT admin role
- [ ] Login as that user
- [ ] **Expected:** "Access Denied" message with role info

---

## 📋 Deployment Checklist

### Pre Deployment
- [ ] All 4 tests pass locally
- [ ] No TypeScript errors (`npm run build`)
- [ ] Console logs show expected flow
- [ ] No infinite redirects

### Deployment
- [ ] Update production Supabase redirect URLs
- [ ] Set production environment variables
  ```bash
  VITE_SUPABASE_URL=https://xxxxx.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJ...
  ```
- [ ] Deploy code to production
- [ ] Run database migration (if not already done)
  ```bash
  supabase db push --linked
  ```

### Post Deployment
- [ ] Promote production admin users
  ```sql
  UPDATE profiles SET role = 'admin' 
  WHERE email IN ('admin1@example.com', 'admin2@example.com');
  ```
- [ ] Test magic link login on production
- [ ] Test session persistence on production
- [ ] Monitor error logs for 24 hours

---

## 🚨 Troubleshooting Quick Reference

### ❌ "Invalid redirect URL"
**Fix:** Add redirect URL to Supabase dashboard (see Action #1)

### ❌ Still seeing login loop
**Fix:**
1. Clear browser storage completely
2. Verify redirect URLs match exactly
3. Check console for specific errors

### ❌ "Access Denied" (but I'm admin)
**Fix:**
```sql
-- Check role
SELECT email, role FROM profiles 
WHERE email = 'your-email@example.com';

-- Promote to admin
UPDATE profiles SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### ❌ "No profile found"
**Fix:**
```sql
-- Create profile
INSERT INTO profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### ❌ Session not persisting
**Fix:**
1. Check localStorage in DevTools
2. Look for key: `wildland fire auth`
3. If missing, check for cookie blocking
4. Try different browser

---

## 📊 Expected Console Output

### ✅ Success Case
```
[Supabase] Client initialized
[AuthCallback] Processing auth callback...
[AuthCallback] Session created successfully: { email: "...", userId: "..." }
[App] Auth state changed: SIGNED_IN
[BlogEditorEnhanced] Session check: { hasSession: true, ... }
[BlogEditorEnhanced] Editor status: true
```

### ❌ Failure Indicators
```
"Invalid redirect URL"  → Add URL to Supabase dashboard
"No session after exchange"  → Check Supabase config
"No profile found"  → Run SQL to create profile
"infinite redirect"  → Clear browser storage, verify code fixes
```

---

## 📚 Documentation Reference

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **AUTH_TEST_GUIDE.md** | Detailed testing procedures | Testing the fix |
| **AUTH_LOOP_FIX.md** | Technical deep dive | Understanding the fix |
| **AUTH_FLOW_DIAGRAM.md** | Visual flow diagrams | Understanding auth flow |
| **AUTH_FIX_SUMMARY.md** | Summary of changes | Quick reference |
| **This File** | Action checklist | Right now! |

---

## ✨ Quick Win Verification

After completing Actions 1-3, run this quick test:

1. Open `http://localhost:5173/#admin/blog`
2. Open browser console
3. Look for: `[Supabase] Client initialized`
4. Enter email → Send magic link
5. Click email link
6. Look for: `[AuthCallback] Session created successfully`
7. **Expected:** Blog editor loads (no loop!)

If you see the editor, you're done! 🎉

---

## 🆘 Need Help?

1. **Check console logs** - They tell you exactly what's happening
2. **Review documentation** - Detailed troubleshooting in AUTH_LOOP_FIX.md
3. **Verify configuration** - Double check redirect URLs and database
4. **Test in clean browser** - Eliminate cached state issues

---

## 📝 Notes

- All changes are backward compatible
- Old routes still work (they redirect)
- No breaking changes for existing users
- Can deploy with confidence

**Estimated Time:**
- Setup: 5 minutes
- Testing: 10 minutes
- Deployment: 15 minutes
- **Total: ~30 minutes**

---

**Last Updated:** January 13, 2026
**Status:** Ready for deployment ✅
