# ✅ Blog Migration Checklist

## Code Migration (COMPLETE ✅)

- [x] Install dependencies (react-helmet-async, tsx)
- [x] Create Supabase migration files (001, 002)
- [x] Create TypeScript types (blogTypes.ts)
- [x] Create helper functions (blogHelpers.ts)
- [x] Create Supabase queries (supabaseBlog.ts)
- [x] Create sitemap generator (generateSitemap.ts)
- [x] Create RSS generator (generateRSS.ts)
- [x] Create all 10 blog components
- [x] Create all 4 blog pages
- [x] Update main.tsx (HelmetProvider)
- [x] Update App.tsx (routing)
- [x] Update Navigation.tsx (Articles → Blog)
- [x] Update Footer.tsx (Articles → Blog)
- [x] Update theme.css (warm dark colors)
- [x] Update tailwind.config.js (prose typography)
- [x] Update package.json (prebuild script)
- [x] Update netlify.toml (redirects)
- [x] Delete old files (ArticlesPage, PublishPage, old SQL)
- [x] Fix all TypeScript errors
- [x] Verify build completes successfully
- [x] Create documentation

## Database Setup (REQUIRED - NOT AUTOMATED)

Visit: https://supabase.com/dashboard/project/qckavajzhqlzicnjphvp

### Migration 001 (Core Schema)
- [ ] Go to SQL Editor → New Query
- [ ] Copy `/supabase/migrations/001_create_blog_system.sql`
- [ ] Paste and click Run
- [ ] Verify success message
- [ ] Check: Tables `posts` and `categories` exist

### Migration 002 (Permissions)
- [ ] SQL Editor → New Query
- [ ] Copy `/supabase/migrations/002_create_profiles_and_permissions.sql`
- [ ] Paste and click Run
- [ ] Verify success message
- [ ] Check: Table `profiles` exists

### Storage Bucket
- [ ] Storage → New Bucket
- [ ] Name: `blog`
- [ ] Check "Public bucket"
- [ ] Click Create
- [ ] Set 4 policies (see QUICK_START.md)

### Your Profile
- [ ] Visit https://thewildlandfirerecoveryfund.org/#admin/blog
- [ ] Sign in with magic link (earl@thewildlandfirerecoveryfund.org)
- [ ] Go back to SQL Editor
- [ ] Run profile INSERT query (see QUICK_START.md)
- [ ] Refresh `/#admin/blog` - should see editor form

## Testing (After Database Setup)

### Blog Index Page
- [ ] Visit `/#blog`
- [ ] See "No posts yet" empty state
- [ ] Category filter buttons visible
- [ ] No console errors

### Blog Editor
- [ ] Visit `/#admin/blog`
- [ ] Already signed in
- [ ] Editor form visible (not "Not authorized" message)
- [ ] Create test post:
  - Title: "Test Post"
  - Excerpt: "This is a test"
  - Content: "## Hello\n\nThis is a test post."
  - Category: News
  - Tags: test
  - Published: ✓
- [ ] Click Save Post
- [ ] See success message

### Blog Index (After Creating Post)
- [ ] Refresh `/#blog`
- [ ] See your test post in grid
- [ ] Click on post card
- [ ] Redirects to `/#blog/test-post`

### Blog Post Page
- [ ] At `/#blog/test-post`
- [ ] Reading progress bar at top
- [ ] Breadcrumbs: Home > Blog > News > Test Post
- [ ] Post title displays
- [ ] Content renders
- [ ] TOC sidebar visible (if you used ## headings)
- [ ] Share buttons present
- [ ] "Related Posts" section (may be empty with only 1 post)

### SEO Verification
- [ ] View page source of `/#blog/test-post`
- [ ] See `<meta name="description">`
- [ ] See `<meta property="og:title">`
- [ ] See JSON-LD script with BlogPosting schema
- [ ] Visit `/sitemap.xml` - includes test post
- [ ] Visit `/rss.xml` - includes test post

### Navigation
- [ ] Click "Blog" in header nav
- [ ] Goes to `/#blog`
- [ ] Click "Blog" in footer
- [ ] Goes to `/#blog`
- [ ] Test old URL: Type `/#articles` in address bar
- [ ] Auto-redirects to `/#blog`

## Deployment

### Pre-Deployment
- [ ] All tests above passing
- [ ] .env.local has Supabase credentials
- [ ] Run `npm run build` locally - succeeds

### Commit & Push
```bash
git add .
git commit -m "Complete blog system migration - replace Articles with premium Blog"
git push
```

### Netlify Deployment
- [ ] Go to Netlify dashboard
- [ ] Check build logs - no errors
- [ ] Build includes "✅ sitemap.xml generated"
- [ ] Build includes "✅ rss.xml generated"
- [ ] Deploy succeeds

### Production Verification
- [ ] https://thewildlandfirerecoveryfund.org/#blog loads
- [ ] See your test post
- [ ] https://thewildlandfirerecoveryfund.org/sitemap.xml loads
- [ ] https://thewildlandfirerecoveryfund.org/rss.xml loads
- [ ] Test redirect: https://thewildlandfirerecoveryfund.org/articles
  - Should redirect to /#blog (may need hard refresh)

## Add Other Editors (Optional)

For each editor (jason@, drew@, kendra@):

- [ ] They visit `/#admin/blog`
- [ ] Enter their @thewildlandfirerecoveryfund.org email
- [ ] Click magic link in email to sign in
- [ ] You run SQL INSERT in Supabase (see QUICK_START.md)
- [ ] They refresh `/#admin/blog`
- [ ] They see editor form (not "Not authorized")

## Post-Launch

### Content Creation
- [ ] Create first real blog post with:
  - Compelling title
  - 150-character excerpt
  - Cover image (1200x630px)
  - Proper markdown headings (## and ###)
  - 3-5 tags
  - Category selection
  - Published checked
- [ ] Create 2-3 more posts for testing pagination/related posts

### Monitoring
- [ ] Check Google Analytics for `/#blog` traffic
- [ ] Monitor Supabase dashboard for auth logs
- [ ] Review post view counts in posts table

### Cleanup
- [ ] Archive/delete test posts from Supabase
- [ ] Remove BLOG_MIGRATION_INSTRUCTIONS.md if not needed
- [ ] Update README.md with blog info

---

## Status Summary

**Code**: ✅ 100% Complete  
**Database**: ⏳ Requires manual setup (5 minutes)  
**Testing**: ⏳ After database setup  
**Deployment**: ⏳ Ready to push  

**Next Step**: Follow database setup in QUICK_START.md
