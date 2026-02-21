# 🚀 Blog Prerendering — Quick Start

## What Was Done

✅ **4 files created/updated** for production blog prerendering:

| File | Change | Purpose |
|------|--------|---------|
| `scripts/get-prerender-routes.mjs` | ✨ **NEW** | Fetch blog slugs from Supabase at build time |
| `scripts/prerender-blog.ts` | 📝 **Enhanced** | Better error handling, JSON-LD with mainEntityOfPage |
| `vite.config.ts` | 📝 **Documented** | Added prerendering strategy notes |
| `package.json` | ✅ **No change** | All deps already present (jsdom, @supabase/supabase-js, tsx) |

---

## Next Steps (5 minutes)

### 1. Set Local Environment Variables
```bash
# Open .env.local and add:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Test Locally
```bash
npm run build
```

✅ Look for: `✅ Blog prerendering complete: X pages succeeded`

### 3. Verify Prerendered Files
```bash
cat dist/blog/sample-slug/index.html | grep "<title>"
# Should show actual post title, not homepage
```

### 4. Deploy to Netlify
Set environment variables in **Netlify UI**:

**Site settings → Build & deploy → Environment**

Add:
```
VITE_SUPABASE_URL = <your-url>
VITE_SUPABASE_ANON_KEY = <your-key>
```

Then push to main or redeploy.

### 5. Verify Production
```bash
curl -s https://yourdomain.com/blog/any-post | grep "<title>"
# Should show post title, not homepage title
```

---

## How It Works (30-second version)

```
npm run build
  ↓
[Vite builds SPA → creates dist/index.html]
  ↓
[Postbuild script runs]
  ├─ Fetches blog posts from Supabase
  ├─ For each post, injects SEO meta tags into HTML
  └─ Writes dist/blog/[slug]/index.html (static files)
  ↓
[Netlify serves static HTML to crawlers] ✓
[SPA still handles client navigation] ✓
```

---

## Output Files

After build, you'll have:
```
dist/
├─ blog/
│  ├─ index.html              (blog listing page)
│  ├─ post-slug-1/
│  │  └─ index.html           (individual post)
│  ├─ post-slug-2/
│  │  └─ index.html
│  └─ ... (one per post)
├─ index.html                 (SPA shell for other routes)
├─ js/
├─ css/
└─ assets/
```

---

## What Crawlers See

**Before prerendering**:
```html
<title>The Wildland Fire Recovery Fund | Home</title>
<meta name="description" content="homepage content...">
<meta property="og:title" content="The Wildland Fire Recovery Fund">
```

**After prerendering** (for `/blog/article-slug`):
```html
<title>Article Title | The Wildland Fire Recovery Fund</title>
<meta name="description" content="Article excerpt...">
<meta property="og:title" content="Article Title">
<meta property="og:image" content="article-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<script type="application/ld+json">
  {
    "@type": "BlogPosting",
    "headline": "Article Title",
    "mainEntityOfPage": { "@id": "https://..." },
    ...
  }
</script>
```

✅ **Google sees real article tags**  
✅ **Facebook/Twitter see correct preview**  
✅ **Rich results show in search**  

---

## Troubleshooting

### ❌ "Missing Supabase environment variables"
**Fix**: Add VITE_SUPABASE_* to .env.local and Netlify

### ❌ "No posts found. Blog prerendering skipped."
**Fix**: Check posts table has `status='published'` and `noindex=false`

### ❌ Static files weren't created
**Fix**: Run `npm run build` again and check for errors

---

## Full Documentation

See **[BLOG_PRERENDER_COMPLETE.md](BLOG_PRERENDER_COMPLETE.md)** for:
- Detailed implementation checklist ✓
- Configuration guide ✓
- SEO validation steps ✓
- Troubleshooting guide ✓
- Performance metrics ✓

---

## Netlify Build Command

No changes needed. Already configured:

```toml
[build]
  command = "npm ci && npm run build"
  publish = "dist"
```

This automatically runs:
1. `npm run prebuild` (sitemap + RSS)
2. `npm run build` (Vite build)
3. `npm run postbuild` (prerender blog)

---

## Testing

**View Page Source** (to verify prerendering):
1. Visit your blog post: `https://yourdomain.com/blog/any-post`
2. Right-click → **View Page Source** (or Cmd+U on Mac)
3. Search for: `<title>`
4. Should show: **Article Title**, NOT "The Wildland Fire..."

✓ **If you see article title = prerendering is working!**

---

**Ready?** Run `npm run build` and check the output. 🚀

See any issues? Check [BLOG_PRERENDER_COMPLETE.md](BLOG_PRERENDER_COMPLETE.md) troubleshooting section.
