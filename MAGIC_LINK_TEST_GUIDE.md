# Magic Link Authentication - Quick Test Guide

## 🚀 Quick Testing Checklist

### Test 1: Request Magic Link
1. Go to `https://thewildlandfirerecoveryfund.org/blog/editor`
2. Enter an email in `ADMIN_EMAILS` allowlist (e.g., `earl@thewildlandfirerecoveryfund.org`)
3. Click "Send Magic Link"
4. **Expected**: "✅ Check your email for the login link!" message appears

### Test 2: Click Magic Link
1. Check your email inbox
2. Click the magic link
3. **Expected**: You should see "Signing you in…" → "✅ Signed in successfully!" → redirected to `/blog/editor`
4. **Timing**: Should complete in 1-2 seconds

### Test 3: Editor Access
1. After redirect, you should see the Blog Editor form
2. Your email should show at top-right: "Signed in as: `earl@thewildlandfirerecoveryfund.org` (allowlist)"
3. **Expected**: Can write a test post

### Test 4: Slow Network (Permission Check Timeout)
1. Open DevTools → Network → Throttle to "Slow 3G"
2. Request magic link
3. Click it
4. On `/blog/editor`, permission check should timeout
5. **Expected**: Shows login form after timeout (not stuck spinner)
6. Can click "Retry Permission Check" button

### Test 5: Non-Allowlist User
1. Go to `/blog/editor`
2. Enter an email NOT in allowlist (e.g., `test@example.com`)
3. Click "Send Magic Link"
4. **Expected**: Should fail with error message

### Test 6: No Profile (After Clicking Link)
*Only if user email is in Supabase auth but no profile row exists:*
1. Click magic link
2. See "Access Denied" page
3. Shows SQL command to create profile
4. **Expected**: Clear fix instructions visible

---

## 🔍 Browser Console Debugging

Open DevTools (F12) → Console and look for these logs:

### During Magic Link Request:
```
[BlogEditor] Sending magic link to: earl@thewildlandfirerecoveryfund.org
[BlogEditor] Magic link sent successfully
```

### During Auth Callback:
```
[AuthCallback] Processing auth callback...
[AuthCallback] Auth code found, exchanging for session...
[AuthCallback] Session created successfully: email: ...
[AuthCallback] Redirecting to /blog/editor
```

### During Permission Check:
```
[BlogEditor] Waiting for AuthProvider to load session...
[BlogEditor] Checking permissions (session loaded from AuthProvider)...
[checkEditorPermissions] Starting permission check...
[checkEditorPermissions] Checking allowlist for: earl@...
[checkEditorPermissions] User in admin allowlist
[checkEditorPermissions] Permission check result: {status: 'allowlist', hasAccess: true, ...}
```

### If Stuck:
```
❌ NO logs = Permission check hung
⚠️ [BlogEditor] Permission check timeout after 8 seconds = Working as expected
```

---

## 📊 Network Tab Debugging

1. Open DevTools → Network tab
2. Request magic link and click it
3. Look for these requests:

| Request | Expected Status | Speed |
|---------|-----------------|-------|
| `auth-callback?code=...` | 200 (redirect) | <100ms |
| POST `rest/auth/verify` | 200 | <100ms |
| GET `/profiles?id=...` | 200 | <500ms |

**If slow:**
- Profiles query taking >3 seconds = Database issue
- Check RLS policies on `profiles` table
- Check database connection in Supabase

---

## 🛠️ Troubleshooting

### Issue: "Still stuck on Checking Permissions"
**Solution:**
1. Click "Retry Permission Check" button
2. If still stuck after 3 retries, check:
   - Browser console for errors
   - Database connection
   - Magic link hasn't expired (5-30 min typical)

### Issue: "Magic link expired"
**Solution:**
1. Request a new magic link
2. Click it within 30 minutes (check Supabase settings)
3. Or check spam folder for original email

### Issue: "Permission denied / Access denied"
**Solution:**
1. Check if email is in `ADMIN_EMAILS` list
2. If not, admin must add you:
   ```sql
   INSERT INTO profiles (id, email, role) 
   VALUES ('user-uuid', 'your@email.com', 'editor');
   ```
3. Request new magic link after profile created

### Issue: Spinner appears but never loads
**Solution:**
1. Open browser DevTools
2. Check Network tab - any errors?
3. Check Console - any red errors?
4. Try Ctrl+F5 (hard refresh)
5. Try private/incognito window
6. Verify cookies are enabled

---

## 📋 All Tests Passing Checklist

- [ ] Request magic link works
- [ ] Redirect from email works (1-2 seconds)
- [ ] Editor loads and shows authenticated
- [ ] Can write a test post
- [ ] Slow network timeout works
- [ ] Manual retry button works
- [ ] Non-allowlist user gets error
- [ ] Console logs show no errors
- [ ] Network tab shows all successful requests

---

## 🚨 When to Check Logs

**Check CloudWatch/Supabase logs if:**
- RLS policy errors in console
- 500 errors on profiles query
- Network requests timing out
- Email not being sent

**Check browser console if:**
- Permission check stuck
- Session not loading
- Redirect not happening

**Check Supabase settings if:**
- Magic link emails not arriving
- Redirect URL errors
- PKCE verification errors

---

## ✉️ Test Email Template

To test with your own email:

1. Add to `ADMIN_EMAILS` in `/src/lib/permissions.ts`
2. Go to `/blog/editor`
3. Request magic link with your email
4. Check email (spam folder too!)
5. Click the link

The magic link URL looks like:
```
https://thewildlandfirerecoveryfund.org/auth-callback?code=abc123&type=signup
```

---

## 📞 Support & Reports

**If auth flow breaks:**
1. Collect error from browser console
2. Note the timestamp
3. Check browser: Chrome/Safari/Firefox/Edge
4. Check OS: Windows/Mac/Linux/Mobile
5. Email to: earl@thewildlandfirerecoveryfund.org

**Include:**
- Screenshot of error
- Full browser console error text (not truncated)
- What email you used
- What was the last step that worked
