# 🚀 Quick Start - Blog System

## Immediate Next Steps

### 1. Set Up Database (5 minutes)
Visit: https://supabase.com/dashboard/project/qckavajzhqlzicnjphvp

**Run SQL migrations:**
1. SQL Editor → New Query
2. Copy `/supabase/migrations/001_create_blog_system.sql`
3. Paste & Run
4. Repeat with `002_create_profiles_and_permissions.sql`

**Create storage bucket:**
1. Storage → New Bucket
2. Name: `blog`
3. Check "Public bucket"
4. Create

### 2. Sign In & Add Your Profile (2 minutes)
1. Go to: https://thewildlandfirerecoveryfund.org/#admin/blog
2. Enter email: `earl@thewildlandfirerecoveryfund.org`
3. Check inbox for magic link → Click to sign in
4. Back to Supabase → SQL Editor → New Query
5. Run:
```sql
INSERT INTO public.profiles (user_id, email, role)
SELECT id, email, 'admin'::user_role
FROM auth.users
WHERE email = 'earl@thewildlandfirerecoveryfund.org';
```

### 3. Create First Post (3 minutes)
1. Already at `/#admin/blog` (signed in)
2. Refresh page (you should now see the editor form)
3. Fill in:
   - **Title**: "Welcome to Our New Blog"
   - **Excerpt**: "We're excited to share updates about wildfire recovery efforts..."
   - **Content**: 
     ```markdown
     ## Our New Blog
     
     We're launching this blog to share:
     
     - Recovery progress in affected communities
     - Success stories from families we've helped
     - Resources for wildfire prevention
     
     Stay tuned for more updates!
     ```
   - **Category**: News
   - **Tags**: `announcement, website`
   - **Published**: ✓ (checked)
4. Click **Save Post**
5. Go to `/#blog` to see it live!

### 4. Deploy (1 minute)
```bash
git add .
git commit -m "Complete blog system migration"
git push
```

Netlify auto-deploys. Check in 2-3 minutes:
- https://thewildlandfirerecoveryfund.org/#blog

---

## Key URLs

| Purpose | URL |
|---------|-----|
| Blog Index | `/#blog` |
| Blog Editor | `/#admin/blog` |
| Supabase Dashboard | https://supabase.com/dashboard/project/qckavajzhqlzicnjphvp |
| Sitemap | `/sitemap.xml` |
| RSS Feed | `/rss.xml` |

---

## Storage Policies (Copy-Paste)

Go to: Storage → blog bucket → Policies → New Policy

**Policy 1: Public Read**
```sql
(bucket_id = 'blog'::text)
```

**Policy 2-4: Editor Upload/Update/Delete**
```sql
(EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = ANY (ARRAY['editor'::user_role, 'admin'::user_role])))))
```

---

## Add More Editors

For jason@, drew@, kendra@:

1. They visit `/#admin/blog` and sign in with magic link
2. You run in SQL Editor:
```sql
INSERT INTO public.profiles (user_id, email, role)
SELECT id, email, 'editor'::user_role
FROM auth.users
WHERE email = 'jason@thewildlandfirerecoveryfund.org';
```

---

## Troubleshooting

**Can't see editor after signing in?**
→ Check profiles table has your email

**"Row level security" error?**
→ Run both migration files in order

**Old articles still showing?**
→ Clear browser cache, they're deleted from code

**Need help?**
→ See BLOG_MIGRATION_INSTRUCTIONS.md for full details

---

## What Changed Summary

- ❌ Removed: ArticlesPage, PublishPage, old schema
- ✅ Added: 38 new files (blog components, pages, database)
- 🎨 Updated: Warm dark color theme (#1a1614, #ff8c42)
- 🔀 Routing: `#articles` → `#blog`, `#publish` → `#admin/blog`
- 📈 SEO: Automatic sitemap.xml, rss.xml, meta tags
- 🔒 Auth: Magic link + role-based permissions

---

**Ready to publish? Start with database setup above! 🚀**
