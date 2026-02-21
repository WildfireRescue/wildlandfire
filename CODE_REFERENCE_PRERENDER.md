# Code Reference: Blog Prerendering Implementation

## 1. New Script: `scripts/get-prerender-routes.mjs`

**Location**: `/Users/earl/Documents/GitHub/wildland-fire/scripts/get-prerender-routes.mjs`

**Purpose**: Fetch all published blog slugs from Supabase  
**Called by**: Can be used standalone or integrated into build tools

```javascript
#!/usr/bin/env node

/**
 * Get Prerender Routes from Supabase
 * 
 * Fetch all published blog slugs from Supabase at build time.
 * This script is used by the prerender process to know which pages to generate.
 * 
 * Usage:
 *   node scripts/get-prerender-routes.mjs
 * 
 * Returns JSON array of routes:
 *   [
 *     { route: "/blog", priority: "0.9" },
 *     { route: "/blog/slug-1", priority: "0.8" },
 *     { route: "/blog/slug-2", priority: "0.8" },
 *   ]
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

async function getPrerenderRoutes() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables');
    console.error('   Set these in your .env.local or Netlify environment variables');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    console.error('📥 Fetching prerender routes from Supabase...');
    
    // Fetch published posts and articles in parallel
    const [postsRes, articlesRes] = await Promise.all([
      supabase
        .from('posts')
        .select('slug')
        .eq('status', 'published')
        .eq('noindex', false),
      supabase
        .from('articles')
        .select('slug')
        .eq('status', 'published'),
    ]);

    const posts = (postsRes.data || []).map(p => p.slug);
    const articles = (articlesRes.data || []).map(a => a.slug);
    const allSlugs = [...new Set([...posts, ...articles])]; // Deduplicate

    const routes = [
      { route: '/blog', priority: '0.9' },
      ...allSlugs.map((slug) => ({
        route: `/blog/${slug}`,
        priority: '0.8',
      })),
    ];

    console.error(`✓ Found ${routes.length - 1} blog posts to prerender`);
    
    // Output JSON to stdout (for consumption by other scripts)
    console.log(JSON.stringify(routes, null, 2));
    
  } catch (error) {
    console.error('❌ Error fetching routes:', error.message);
    process.exit(1);
  }
}

getPrerenderRoutes();
```

---

## 2. Updated: `vite.config.ts`

**Location**: `/Users/earl/Documents/GitHub/wildland-fire/vite.config.ts`

**Change**: Added header documentation with prerendering strategy

**Key sections** (new):

```typescript
/**
 * Vite Configuration
 * Production SPA builds with blog prerendering support
 * 
 * Build Pipeline:
 * 1. prebuild: Generate sitemap & RSS feed
 * 2. vite build: Bundle SPA + create dist/index.html template
 * 3. postbuild: Use JSom + Supabase to prerender /blog and /blog/:slug
 * 
 * Result: Static HTML files for blog routes (SEO-friendly)
 *         SPA for all other routes (fast, interactive)
 */
```

**At the end** (new):

```typescript
/**
 * PRERENDERING STRATEGY
 * 
 * The vite.config.ts builds a traditional SPA where every route returns index.html.
 * After the build completes, the postbuild script (npm run postbuild) takes over:
 * 
 * What postbuild does:
 * 1. Reads the compiled dist/index.html (SPA shell)
 * 2. Fetches all published blog posts from Supabase
 * 3. For each blog post, uses JSDOM to inject SEO meta tags:
 *    - <title> from meta_title_final
 *    - meta description from meta_description_final
 *    - og:image/width/height/type tags
 *    - twitter:card tags
 *    - canonical URL
 *    - robots directives
 *    - JSON-LD BlogPosting schema with mainEntityOfPage
 * 4. Writes static HTML files:
 *    - dist/blog/index.html (blog listing page)
 *    - dist/blog/[slug]/index.html (individual blog posts)
 * 
 * Result:
 * - Search engines crawl static HTML with correct meta tags ✓
 * - Social media scrapers see correct OG/Twitter tags ✓
 * - All other routes still use SPA (fast, interactive) ✓
 * 
 * Environment Variables Required:
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Supabase anonymous/public anon key
 * 
 * These should be set in:
 * - Development: .env.local
 * - Netlify Production: Site settings → Environment variables
 * 
 * See: POSTS_SEO_INTEGRATION.md for data model details
 * See: netlify.toml for build configuration
 */
```

---

## 3. Updated: `scripts/prerender-blog.ts`

**Location**: `/Users/earl/Documents/GitHub/wildland-fire/scripts/prerender-blog.ts`

**Key changes**:
1. Enhanced JSON-LD schema with `mainEntityOfPage` and image dimensions
2. Better error handling for Supabase fetch
3. Improved console logging with helpful hints
4. Deduplication of posts/articles

**Main improvements**:

### A. Better error messages
```typescript
async function fetchPublishedPosts(): Promise<BlogPost[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ ERROR: Missing Supabase environment variables!');
    console.error('   VITE_SUPABASE_URL: ' + (SUPABASE_URL ? '✓ Set' : '✗ Not set'));
    console.error('   VITE_SUPABASE_ANON_KEY: ' + (SUPABASE_ANON_KEY ? '✓ Set' : '✗ Not set'));
    console.error('\n   For development, add to .env.local:');
    console.error('   VITE_SUPABASE_URL=your-project-url');
    console.error('   VITE_SUPABASE_ANON_KEY=your-anon-key');
    console.error('\n   For Netlify, add to Site settings → Environment variables');
    console.error('\n   Skipping blog prerendering without Supabase.\n');
    return [];
  }
  // ... rest of function
}
```

### B. Enhanced JSON-LD with mainEntityOfPage
```typescript
const postUrl = `${baseUrl}/blog/${post.slug}`;
const blogPostingSchema = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.title || post.meta_title_final,
  image: post.og_image_url ? {
    '@type': 'ImageObject',
    url: post.og_image_url,
    width: post.og_image_width || 1200,
    height: post.og_image_height || 630,
  } : `${baseUrl}/Images/logo-128.png`,
  // ... other fields ...
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': postUrl,  // ✨ NEW: Google recommends this
  },
  articleSection: post.category || 'Disaster Recovery',
  keywords: post.tags?.join(', ') || '',
};
```

### C. Better summary output
```typescript
// Summary with better formatting
console.log('\n' + '='.repeat(60));
console.log('✅ Blog prerendering complete!');
console.log('='.repeat(60));
console.log(`   Success: ${successCount} pages`);
console.log(`   Errors:  ${errorCount} pages`);

if (failures.length > 0) {
  console.log('\nFailed pages:');
  failures.forEach((f) => console.log(`  - ${f}`));
}

console.log('\n📍 Static blog files written to:');
console.log(`   ${blogDir}/index.html              (blog index)`);
console.log(`   ${blogDir}/<slug>/index.html        (individual posts)`);
```

---

## 4. No Changes to `package.json`

**Location**: `/Users/earl/Documents/GitHub/wildland-fire/package.json`

✅ **Already has all required dependencies**:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.89.0",  // ✓ For Supabase API
    "jsdom": "^27.4.0",                   // ✓ For HTML manipulation
  },
  "devDependencies": {
    "tsx": "^4.21.0"                      // ✓ For TypeScript execution
  },
  "scripts": {
    "prebuild": "tsx src/lib/generateSitemap.ts && tsx src/lib/generateRSS.ts",
    "build": "vite build",
    "postbuild": "tsx scripts/prerender-blog.ts"  // ✓ Already in place
  }
}
```

---

## 5. No Changes to `netlify.toml`

**Location**: `/Users/earl/Documents/GitHub/wildland-fire/netlify.toml`

✅ **Already correctly configured**:

```toml
[build]
  command = "npm ci && npm run build"
  publish = "dist"

# Environment variables must be set in:
# Site settings → Build & deploy → Environment variables
# VITE_SUPABASE_URL = <your-url>
# VITE_SUPABASE_ANON_KEY = <your-key>
```

---

## Environment Variables

### File: `.env.local` (for local development)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Netlify (for production)

**Navigate to**: Site settings → Build & deploy → Environment variables

Add these two variables:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `your-actual-anon-key` |

---

## Build Output Example

When you run `npm run build`, you'll see:

```
$ npm run build

> prebuild
📝 Generating sitemap...
✓ Generated sitemap.xml (50 entries)
📝 Generating RSS feed...
✓ Generated rss.xml

> vite build
✓ 1234 modules transformed
dist/index.html                    45.2 kb
dist/js/main.abc123.js            156.4 kb
dist/js/vendor.def456.js           98.2 kb
dist/css/main.ghi789.css           23.5 kb

> postbuild

🚀 Starting blog prerendering...

✓ Found SPA template at dist/index.html
📥 Fetching published posts from Supabase...
✓ Found 42 unique published posts and articles

📝 Prerendering 42 blog post pages...

✓ /blog/post-slug-1
✓ /blog/post-slug-2
✓ /blog/post-slug-3
... (40 more posts) ...

📝 Prerendering /blog index page...

✓ /blog

============================================================
✅ Blog prerendering complete!
============================================================
   Success: 43 pages
   Errors:  0 pages

📍 Static blog files written to:
   dist/blog/index.html              (blog index)
   dist/blog/<slug>/index.html        (individual posts)

💡 These static files will be served by Netlify for crawlers.
   Client-side navigation still works via the SPA.
```

---

## Testing Commands

### Verify prerendered files locally
```bash
# Check if prerendered files exist
ls -la dist/blog/

# Check a specific post
cat dist/blog/your-slug-here/index.html | grep "<title>"

# Check OG tags were injected
grep "og:title\|og:image" dist/blog/your-slug-here/index.html

# Validate JSON-LD schema
grep -A20 "@type.*BlogPosting" dist/blog/your-slug-here/index.html
```

### Verify on production
```bash
# Check title was injected correctly
curl -s https://yourdomain.com/blog/your-slug | grep "<title>"

# Check mainEntityOfPage schema
curl -s https://yourdomain.com/blog/your-slug | grep "mainEntityOfPage"

# Download full HTML to inspect
curl -o /tmp/blog-page.html https://yourdomain.com/blog/your-slug
cat /tmp/blog-page.html | head -50
```

---

## SEO Validation

### Test with Google Rich Results
1. Go to: https://search.google.com/test/rich-results
2. Paste your blog URL (e.g., https://yourdomain.com/blog/sample-post)
3. Click "Test URL"
4. Should show "BlogPosting" in detected items
5. Look for `mainEntityOfPage` in the schema

### Test with Facebook Debugger
1. Go to: https://developers.facebook.com/tools/debug/
2. Paste blog URL
3. Check "OG Tags" section
4. Should show:
   - og:title (post title)
   - og:description (post excerpt)
   - og:image (featured image)
   - og:image:width (1200)
   - og:image:height (630)

### Test with Twitter Card Validator
1. Go to: https://cards-dev.twitter.com/validator
2. Paste blog URL
3. Should show:
   - twitter:card (summary_large_image)
   - twitter:title (post title)
   - twitter:description (post excerpt)
   - twitter:image (featured image)

---

## Checklist for Integration

- [x] `scripts/get-prerender-routes.mjs` created
- [x] `scripts/prerender-blog.ts` enhanced
- [x] `vite.config.ts` documented
- [x] `package.json` verified (no changes needed)
- [x] `netlify.toml` verified (no changes needed)
- [x] Environment variables documented
- [x] Build output examples provided
- [x] Testing commands provided
- [x] SEO validation steps provided

---

## Quick Links

- **Quick Start Guide**: [BLOG_PRERENDER_QUICKSTART.md](BLOG_PRERENDER_QUICKSTART.md)
- **Complete Guide**: [BLOG_PRERENDER_COMPLETE.md](BLOG_PRERENDER_COMPLETE.md)
- **SEO Integration**: [POSTS_SEO_INTEGRATION.md](POSTS_SEO_INTEGRATION.md)

---

Last updated: February 21, 2026
