# Enhanced Blog System with SEO & E-E-A-T Implementation

## Overview

This document describes the comprehensive SEO and E-E-A-T (Expertise, Experience, Authority, Trust) enhancement to the Wildland Fire Recovery Fund blog/article publishing system.

## What Was Implemented

### 1. Database Schema Enhancement

**Migration File:** `supabase/migrations/003_enhance_seo_eeat_fields.sql`

Added 25+ new fields to the `posts` table organized into categories:

#### SEO & Metadata Fields
- `meta_title` - SEO title tag (max 60 chars recommended)
- `meta_description` - Meta description (max 160 chars recommended)
- `canonical_url` - Prevent duplicate content issues
- `focus_keyword` - Primary SEO keyword
- `secondary_keywords` - Array of additional keywords

#### Images & Social Sharing
- `featured_image_url` - Main article image
- `featured_image_alt_text` - Required for accessibility (if image exists)
- `og_image_url` - Open Graph sharing image
- `og_title` - Social sharing title
- `og_description` - Social sharing description
- `twitter_card` - Twitter card type (default: summary_large_image)

#### Trust / E-E-A-T
- `author_role` - Author's title/credentials
- `author_bio` - Author biography
- `reviewed_by` - Fact-checker/reviewer name
- `fact_checked` - Boolean flag for fact-checked content
- `last_updated_at` - Auto-updated timestamp (trigger-based)

#### Publishing & Discovery
- `status` - Now supports: draft, scheduled, published
- `scheduled_for` - Scheduled publication time
- `allow_indexing` - Whether search engines should index
- `allow_follow` - Whether search engines should follow links
- `robots_directives` - Custom robots meta (e.g., "index,follow")
- `sitemap_priority` - 0.0-1.0 (default: 0.7)

#### Backlinks / Citations
- `sources` - JSONB array of `{label, url}` objects
- `outbound_links_verified` - Quality check flag

### 2. TypeScript Types

**Updated File:** `src/lib/blogTypes.ts`

- Enhanced `BlogPost` interface with all new fields
- Added `Source` interface for citations
- Updated `BlogPostFormData` for form handling
- Updated `BlogListFilters` to include 'scheduled' status

### 3. Enhanced Editor UI

**New File:** `src/app/pages/admin/BlogEditorPageEnhanced.tsx`

Features:
- Organized collapsible sections for better UX
- Character count indicators for SEO fields
- Real-time validation
- Auto-generated robots directives based on checkboxes
- Dynamic source/citation list management
- Comprehensive input validation with helpful tooltips

Sections:
1. **Core Content** - Title, slug, excerpt, markdown content
2. **SEO Optimization** - Meta tags, keywords, canonical URL
3. **Images & Social Sharing** - Featured images, OG tags
4. **Author & E-E-A-T** - Author credentials, fact-checking
5. **Publishing & Discovery** - Status, visibility, robots
6. **Sources & Citations** - Reference management

### 4. SEO Helpers

**New File:** `src/lib/seoHelpers.ts`

Functions:
- `generateMetaTags()` - Generate comprehensive meta tags with fallback hierarchy
- `updateDocumentMeta()` - Update document head (client-side)
- `renderMetaTags()` - Render meta tags as HTML string (SSR-ready)
- `generateArticleStructuredData()` - Create JSON-LD for Google

### 5. New Display Components

**Files Created:**
- `src/app/components/blog/BlogEEATSignals.tsx` - Display trust signals
- `src/app/components/blog/BlogSources.tsx` - Display citations

### 6. Enhanced Blog Post Rendering

**Updated File:** `src/app/pages/BlogPostPage.tsx`

Now automatically:
- Generates and applies meta tags on load
- Injects JSON-LD structured data
- Displays E-E-A-T signals in sidebar
- Shows sources/citations at article end

## How to Use

### 1. Run the Migration

```bash
# Using Supabase CLI
supabase db push

# Or via Supabase Dashboard SQL Editor:
# Copy and paste the contents of supabase/migrations/003_enhance_seo_eeat_fields.sql
```

### 2. Access the Enhanced Editor

Navigate to: `https://yoursite.com/#publish`

The editor will prompt for authentication via magic link.

### 3. Publishing Workflow

1. **Core Content** (Required)
   - Title
   - Content (Markdown)
   - Featured image + alt text (for accessibility)

2. **SEO Optimization** (Recommended)
   - Meta title (≤60 chars)
   - Meta description (≤160 chars)
   - Focus keyword
   - Secondary keywords

3. **Author Credentials** (E-E-A-T)
   - Author name (default: organization)
   - Author role (credentials)
   - Author bio
   - Fact-checked checkbox
   - Reviewer name

4. **Publishing Settings**
   - Status: draft/scheduled/published
   - Allow indexing (SEO)
   - Featured post checkbox

5. **Sources & Citations** (Trust)
   - Add references with labels and URLs
   - Mark links as verified

### 4. Field Fallback Hierarchy

The system uses smart fallbacks to ensure SEO tags are always populated:

```
Meta Title: meta_title → title
Meta Description: meta_description → excerpt → content (truncated)
OG Title: og_title → meta_title → title
OG Description: og_description → meta_description → excerpt
OG Image: og_image_url → featured_image_url → cover_image_url
Robots: robots_directives → computed from allow_indexing + allow_follow
```

## SEO Best Practices Implemented

### 1. Title Optimization
- Meta title max 60 characters (character counter)
- Automatically uses page title as fallback
- Separate OG title for social sharing

### 2. Description Optimization
- Meta description max 160 characters
- Excerpt as fallback
- Separate OG description for social sharing

### 3. Image Accessibility
- Required alt text when image is provided
- Validation error if missing
- Used in OG tags for social sharing

### 4. Keyword Strategy
- Focus keyword field
- Secondary keywords array
- Proper meta keywords tag

### 5. Robots Directives
- Checkbox-driven (user-friendly)
- Auto-generates proper directive string
- Per-post control

### 6. Structured Data
- JSON-LD Article schema
- Author information
- Publisher information
- Dates (published, modified)
- Image references

## E-E-A-T Implementation

### Expertise
- Author role/title field
- Author bio with credentials
- Display prominently on posts

### Experience
- Author name attribution
- Last updated timestamp
- Revision transparency

### Authority
- Reviewed by field
- Fact-checked badge
- Citation sources display

### Trust
- Sources/references section
- Outbound link verification
- Transparent update dates
- Proper organization attribution

## Database Indexes

Optimized queries with indexes on:
- `slug` (unique)
- `status` + `published_at` (listing)
- `scheduled_for` (scheduled posts)
- `allow_indexing` + `published_at` (SEO queries)
- `secondary_keywords` (GIN index)
- `last_updated_at` (freshness)

## RLS Policies

Security implemented via Row Level Security:

**Public:**
- Can view published posts where `allow_indexing = true`

**Editors/Admins:**
- Can view all posts
- Can insert new posts
- Can update existing posts
- Can delete posts

## Testing Checklist

- [ ] Run migration successfully
- [ ] Create new post with all fields
- [ ] Verify meta tags in browser (View Source)
- [ ] Test Open Graph with Facebook debugger
- [ ] Test Twitter cards with Twitter validator
- [ ] Verify JSON-LD with Google Rich Results Test
- [ ] Check accessibility with image alt texts
- [ ] Test scheduled posts functionality
- [ ] Verify character counters work
- [ ] Test source/citation management
- [ ] Confirm E-E-A-T signals display

## Future Enhancements

1. **Image Upload** - Direct upload to Supabase storage
2. **Markdown Preview** - Live preview alongside editor
3. **SEO Score** - Real-time SEO optimization score
4. **Keyword Density** - Analysis tool for keywords
5. **Schema Enhancements** - FAQ schema, How-To schema
6. **Multilingual** - i18n support for content
7. **Version History** - Track content revisions
8. **Bulk Operations** - Edit multiple posts at once

## Troubleshooting

### Migration Fails
- Ensure you're on the latest Supabase version
- Check for conflicts with existing columns
- Run migrations in order

### Meta Tags Not Updating
- Check browser cache
- Verify `generateMetaTags()` is called
- Inspect with browser DevTools

### RLS Blocking Access
- Verify user has editor/admin role in profiles table
- Check RLS policies are enabled
- Ensure user is authenticated

### Images Not Showing
- Verify URLs are publicly accessible
- Check CORS settings
- Ensure alt text is provided

## Support

For issues or questions:
1. Check console logs for errors
2. Verify migration ran successfully
3. Review RLS policies
4. Check Supabase dashboard for data

## Conclusion

This implementation provides a production-ready, SEO-optimized, E-E-A-T-compliant blog publishing system that maximizes trust signals, accessibility, and search engine discoverability for nonprofit credibility and reach.
