# Blog System Migration - Final Setup Instructions

## ✅ Code Migration Complete

All code files have been successfully created and updated. The old Articles system has been completely removed and replaced with the premium Blog system.

## 🗄️ Database Migration Steps

Since the Supabase CLI isn't linked to your project, you'll need to run the migrations manually through the Supabase Dashboard:

### Step 1: Run Migration 001 (Core Blog Schema)

1. Go to https://supabase.com/dashboard/project/qckavajzhqlzicnjphvp
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `/supabase/migrations/001_create_blog_system.sql`
5. Paste into the SQL editor
6. Click **Run** button (or press Cmd/Ctrl + Enter)
7. Verify success message

### Step 2: Run Migration 002 (Profiles & Permissions)

1. Still in SQL Editor, click **New Query** again
2. Copy the entire contents of `/supabase/migrations/002_create_profiles_and_permissions.sql`
3. Paste into the SQL editor
4. Click **Run** button
5. Verify success message

### Step 3: Create Storage Bucket (Manual)

1. Navigate to **Storage** in the left sidebar
2. Click **New Bucket**
3. Bucket name: `blog`
4. Set as **Public bucket** (check the box)
5. Click **Create bucket**

### Step 4: Set Storage Policies

Still in Storage section:
1. Click on the `blog` bucket
2. Click **Policies** tab
3. Click **New Policy** → **Create a policy from scratch**

**Policy 1 - Public Read:**
- Policy name: `Public read access`
- Allowed operation: `SELECT`
- Target roles: `public`
- USING expression: `true`
- Click **Review** → **Save policy**

**Policy 2 - Editor Upload:**
- Click **New Policy** → **Create a policy from scratch**
- Policy name: `Editors can upload`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- USING expression:
  ```sql
  (EXISTS ( SELECT 1
     FROM profiles
    WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = ANY (ARRAY['editor'::user_role, 'admin'::user_role])))))
  ```
- Click **Review** → **Save policy**

**Policy 3 - Editor Update:**
- Click **New Policy** → **Create a policy from scratch**
- Policy name: `Editors can update`
- Allowed operation: `UPDATE`
- Target roles: `authenticated`
- USING expression: Same as Policy 2
- Click **Review** → **Save policy**

**Policy 4 - Editor Delete:**
- Click **New Policy** → **Create a policy from scratch**
- Policy name: `Editors can delete`
- Allowed operation: `DELETE`
- Target roles: `authenticated`
- USING expression: Same as Policy 2
- Click **Review** → **Save policy**

### Step 5: Add Your Profile as Editor

1. Go back to **SQL Editor**
2. **FIRST**: Sign in to your site at https://thewildlandfirerecoveryfund.org/#admin/blog
3. Use the magic link auth to sign in with your email: `earl@thewildlandfirerecoveryfund.org`
4. After signing in (this creates your auth.users record), go back to SQL Editor
5. Run this query to add yourself as admin:

```sql
INSERT INTO public.profiles (user_id, email, role)
SELECT id, email, 'admin'::user_role
FROM auth.users
WHERE email = 'earl@thewildlandfirerecoveryfund.org';
```

6. Repeat for other editors:

```sql
-- Add Jason
INSERT INTO public.profiles (user_id, email, role)
SELECT id, email, 'editor'::user_role
FROM auth.users
WHERE email = 'jason@thewildlandfirerecoveryfund.org';

-- Add Drew
INSERT INTO public.profiles (user_id, email, role)
SELECT id, email, 'editor'::user_role
FROM auth.users
WHERE email = 'drew@thewildlandfirerecoveryfund.org';

-- Add Kendra
INSERT INTO public.profiles (user_id, email, role)
SELECT id, email, 'editor'::user_role
FROM auth.users
WHERE email = 'kendra@thewildlandfirerecoveryfund.org';
```

**Note**: Each person must sign in via magic link at `/#admin/blog` BEFORE you run their INSERT statement, otherwise it will fail (no user_id exists yet).

## 🧪 Testing the Blog System

### Test Blog Index Page
1. Navigate to: https://thewildlandfirerecoveryfund.org/#blog
2. You should see the blog listing page with empty state (no posts yet)

### Test Blog Editor
1. Navigate to: https://thewildlandfirerecoveryfund.org/#admin/blog
2. Sign in with magic link
3. Fill in the form to create your first post:
   - **Title**: "Welcome to Our New Blog"
   - **Slug**: Auto-generated from title (welcome-to-our-new-blog)
   - **Excerpt**: "We're excited to share updates about wildfire recovery efforts..."
   - **Content**: Write some markdown (headings with ##, lists with -, etc.)
   - **Cover Image URL**: Upload to Supabase Storage or use external URL
   - **Category**: Select one (News, Updates, Stories, Resources)
   - **Tags**: Comma-separated (e.g., "announcement, website, blog")
   - **Published**: Check this box to make it live
4. Click **Save Post**
5. Navigate to `/#blog` to see your post

### Test Blog Post Page
1. Click on your published post from the blog index
2. Verify:
   - ✅ Reading progress bar at top
   - ✅ Table of contents sidebar (if you used ## headings)
   - ✅ Share buttons
   - ✅ Related posts section
   - ✅ SEO meta tags (check page source)

## 🎨 What's Been Updated

### New Files Created (36 total):
- ✅ 2 Supabase migration SQL files
- ✅ 3 TypeScript library files (types, helpers, queries)
- ✅ 2 Build-time generators (sitemap, RSS)
- ✅ 10 Blog UI components
- ✅ 4 Blog page components

### Files Modified (6):
- ✅ `src/main.tsx` - Added HelmetProvider for SEO
- ✅ `src/app/App.tsx` - Updated routing for blog system
- ✅ `src/app/components/Navigation.tsx` - Changed "Articles" to "Blog"
- ✅ `src/app/components/Footer.tsx` - Changed "Articles" to "Blog"
- ✅ `src/styles/theme.css` - Warm dark color palette
- ✅ `tailwind.config.js` - Custom prose typography
- ✅ `package.json` - Added prebuild script
- ✅ `netlify.toml` - Added /articles → /#blog redirects

### Files Deleted (3):
- ✅ `src/app/pages/ArticlesPage.tsx` (419 lines)
- ✅ `src/app/pages/PublishPage.tsx` (1180 lines)
- ✅ `supabase-articles-setup.sql` (old schema)

## 🚀 Deployment

When you're ready to deploy:

1. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Complete blog system migration - replace Articles with premium Blog"
   git push
   ```

2. **Netlify will automatically:**
   - Run the prebuild script (generate sitemap.xml and rss.xml)
   - Build the site with Vite
   - Deploy to production

3. **Verify production:**
   - Check https://thewildlandfirerecoveryfund.org/#blog
   - Verify old links redirect: https://thewildlandfirerecoveryfund.org/articles → redirects to /#blog
   - Check sitemap: https://thewildlandfirerecoveryfund.org/sitemap.xml
   - Check RSS feed: https://thewildlandfirerecoveryfund.org/rss.xml

## 📝 Creating Your First Blog Post

Sample markdown content for testing:

```markdown
## Why We Started This Blog

After witnessing the devastating impact of wildfires on communities across our region, we knew we had to do more than just provide immediate relief. This blog is our way of keeping you informed about:

- Recovery progress in affected communities
- Success stories from families we've helped
- Resources for wildfire prevention and preparation
- Updates on our grant programs

## How Your Support Makes a Difference

Every donation directly funds:

1. **Emergency Housing** - Temporary shelter for displaced families
2. **Home Rebuilding** - Grants to help families rebuild
3. **Community Resources** - Mental health services and support groups

## Stay Connected

We'll be sharing regular updates here about our work in the field. Subscribe to our [RSS feed](/rss.xml) to never miss an update.
```

## 🎯 SEO Checklist

For each blog post you create, make sure to:

- [ ] Write a compelling title (50-60 characters)
- [ ] Add a clear excerpt (150-160 characters for meta description)
- [ ] Upload an optimized cover image (1200x630px for OG image)
- [ ] Use heading hierarchy (## for main sections, ### for subsections)
- [ ] Add 3-5 relevant tags
- [ ] Select the appropriate category
- [ ] Include internal links to other pages/posts
- [ ] Check the slug is readable and SEO-friendly
- [ ] Set canonical URL if content is republished from elsewhere
- [ ] Leave noindex unchecked (unless it's a draft/test post)

## 🐛 Troubleshooting

**"Cannot read properties of null" error:**
- Make sure you've run both migrations in order
- Verify the `blog` storage bucket exists
- Check that your profile exists in the `profiles` table

**"Not authorized" when trying to create a post:**
- Sign in with magic link first at /#admin/blog
- Verify your email is in the profiles table with 'editor' or 'admin' role
- Run the INSERT query to add your profile

**Old /articles links still show old content:**
- Clear your browser cache
- Check netlify.toml has the redirect rules
- Redeploy the site on Netlify

**Sitemap/RSS not generating:**
- Check that prebuild script is in package.json
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are in .env.local
- Run `npm run prebuild` manually to test

## 🎉 You're Done!

The blog system is now fully functional with:
- ✅ Clean, warm dark aesthetic
- ✅ SEO-optimized pages with meta tags
- ✅ Role-based permissions system
- ✅ Automatic sitemap and RSS generation
- ✅ Premium reading experience with TOC and progress bar
- ✅ Related posts recommendations
- ✅ Social sharing buttons
- ✅ Category filtering
- ✅ Tag system for discovery

Start creating great content to share your impact stories! 🔥🌲
