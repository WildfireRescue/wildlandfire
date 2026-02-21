# WordPress Blog Migration Plan
## Supabase → WordPress in /blog (Main Site Untouched)

**Status:** Planning & Documentation  
**Date:** February 20, 2026  
**Scope:** Blog backend only. Main site remains React/Vite/Tailwind.  
**Risk Level:** Medium (if executed correctly: Low)

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Current State Analysis](#current-state-analysis)
3. [Installation Plan (Safe)](#installation-plan-safe)
4. [Supabase → WordPress Migration](#supabase--wordpress-migration)
5. [SEO & URL Preservation](#seo--url-preservation)
6. [Hosting Setup (Shared Hosting)](#hosting-setup-shared-hosting)
7. [Risk Assessment](#risk-assessment)
8. [Pre-Cutover Checklist](#pre-cutover-checklist)
9. [Cutover Execution](#cutover-execution)
10. [Post-Cutover Verification](#post-cutover-verification)
11. [Rollback Plan](#rollback-plan)
12. [Supabase Removal Checklist](#supabase-removal-checklist)

---

## Architecture Overview

### Current State
```
yourdomain.com/
├── index.html (React app)
├── assets/
├── api/ (Vite)
└── blog/
    ├── editor (Supabase magic-link auth)
    └── [slug] (posts from Supabase)
        └── (all content from Supabase DB)
```

### Target State
```
yourdomain.com/
├── index.html (React app - UNCHANGED)
├── assets/
├── api/ (Vite - UNCHANGED)
└── blog/
    └── [WordPress install]
        ├── wp-admin/
        ├── wp-content/
        ├── wp-includes/
        └── index.php (WordPress)
```

### Network Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Your Domain                         │
│                    yourdomain.com                           │
└─────────────────────────────────────────────────────────────┘
         │                                                │
         ▼                                                ▼
  ┌──────────────┐                            ┌──────────────────┐
  │  Main Site   │                            │  Blog /          │
  │              │                            │  ┌────────────┐  │
  │ React/Vite   │   (No changes)             │  │ WordPress  │  │
  │ Tailwind     │                            │  │            │  │
  │              │                            │  │ Posts      │  │
  └──────────────┘                            │  │ Categories │  │
         │                                     │  │ Media      │  │
         └─────────────────────────────────────┤  │ Editors    │  │
          Symlink OR Menu Link to /blog        │  │ Drafts     │  │
                                               │  └────────────┘  │
                                               └──────────────────┘
```

---

## Current State Analysis

### What Works Now (Keep This)
- Homepage at `/` (React app)
- Site styling (Tailwind)
- Main navigation
- Admin panel at `/admin` (if using Supabase auth)
- Any other non-blog pages

### What Breaks Now (Fix This)
- Supabase auth for blog editor (magic links failing)
- Row-level security complexity
- Media handling (file uploads)
- No publishing workflow
- No scheduled posts
- No revisions/drafts management

### Supabase Dependencies to Remove
```typescript
// Currently in your codebase:
✗ supabase auth (blog only)
✗ supabase posts table
✗ supabase categories table
✗ magic link auth
✗ row-level security policies
✗ file storage for images
✗ real-time subscriptions (if used)
```

---

## Installation Plan (Safe)

### Phase 1: Preparation (No Production Changes)

#### Step 1.1: Backup Everything
```bash
# Backup current /blog files
tar -czf backup-current-blog.tar.gz ~/Documents/GitHub/wildland-fire/public/blog/

# Backup Supabase data
# - Export posts table to CSV
# - Export categories table to CSV
# - Download all images from storage
# Document all image URLs currently in use
```

#### Step 1.2: Create a Test/Staging Environment
```bash
# On your local machine or staging server:
# 1. Create a test folder: /test-blog/
# 2. Test WordPress install there first
# 3. Run data migrations there
# 4. Test all URLs work
# 5. Only then move to production
```

#### Step 1.3: Document Current Blog URLs
```bash
# Get all current blog posts:
curl https://yourdomain.com/api/blog/posts

# Save as: current-posts-snapshot.json
# Needed for: URL verification, redirects, image mapping
```

### Phase 2: Local Installation & Configuration

#### Step 2.1: Download WordPress Locally
```bash
# Get latest WordPress
cd ~/Downloads
wget https://wordpress.org/wordpress-latest.zip
unzip wordpress-latest.zip

# Or using WP-CLI:
wp core download --path=wordpress --force
```

#### Step 2.2: Create Local Database
```bash
# Create a local MySQL/MariaDB for testing
mysql -u root -p -e "CREATE DATABASE wordpress_blog_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p -e "CREATE USER 'wp_user'@'localhost' IDENTIFIED BY 'strong-password-123';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON wordpress_blog_test.* TO 'wp_user'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"
```

#### Step 2.3: Configure wp-config.php
```php
<?php
// wp-config.php - WordPress configuration

// Database settings
define('DB_NAME', 'wordpress_blog_test');
define('DB_USER', 'wp_user');
define('DB_PASSWORD', 'strong-password-123');
define('DB_HOST', 'localhost');
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', 'utf8mb4_unicode_ci');

// Security keys
define('AUTH_KEY',         'put your unique phrase here 1');
define('SECURE_AUTH_KEY',  'put your unique phrase here 2');
define('LOGGED_IN_KEY',    'put your unique phrase here 3');
define('NONCE_KEY',        'put your unique phrase here 4');
define('AUTH_SALT',        'put your unique phrase here 5');
define('SECURE_AUTH_SALT', 'put your unique phrase here 6');
define('LOGGED_IN_SALT',   'put your unique phrase here 7');
define('NONCE_SALT',       'put your unique phrase here 8');

// WordPress URLs
define('WP_HOME', 'http://localhost/wordpress');
define('WP_SITEURL', 'http://localhost/wordpress');

// Subdirectory install (CRITICAL for /blog subfolder)
define('WP_CONTENT_DIR', dirname(__FILE__) . '/wp-content');
define('WP_CONTENT_URL', 'http://localhost/wordpress/wp-content');

// Disable file edits
define('DISALLOW_FILE_EDIT', true);

// Require table prefix for safety
$table_prefix = 'wp_';

/* That's all, stop editing! */
if ( !defined('ABSPATH') )
    define('ABSPATH', dirname(__FILE__) . '/');
require_once(ABSPATH . 'wp-settings.php');
?>
```

#### Step 2.4: Run WordPress Installation
```bash
# Via WP-CLI (fastest)
wp core install \
    --url=http://localhost/wordpress \
    --title="Your Blog" \
    --admin_user=admin \
    --admin_password=secure-password \
    --admin_email=you@yourdomain.com

# Or via web browser:
# 1. Visit http://localhost/wordpress
# 2. Fill in setup form
# 3. Create admin account
```

#### Step 2.5: Initial WordPress Configuration
```bash
# Set permalink structure (important for /blog/:slug URLs)
wp option update permalink_structure '/%postname%/' --skip-themes --skip-plugins

# Disable comments (if not needed)
wp option update default_comment_status 'closed'

# Set timezone
wp option update timezone_string 'America/Los_Angeles'

# Disable XML-RPC (security)
wp option update enable_xmlrpc 'false'

# Remove unnecessary default plugins
wp plugin delete hello --allow-root
wp plugin delete akismet --allow-root
```

---

## Supabase → WordPress Migration

### Phase 3: Data Export from Supabase

#### Step 3.1: Extract Posts Data
```bash
# Use Supabase data export or API
# Export posts table as CSV/JSON with:
# - id
# - title
# - content (markdown or HTML)
# - slug
# - featured_image_url
# - created_at
# - updated_at
# - is_published
# - is_featured (if applicable)
# - author

# Save as: supabase-posts-export.json
```

Example structure:
```json
[
  {
    "id": "abc123",
    "title": "Wildland Fires and Climate Change",
    "slug": "wildland-fires-climate-change",
    "content": "## Introduction\nDetailed article content...",
    "featured_image_url": "https://storage.supabase.co/...",
    "category": "Fire Science",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "status": "published"
  }
]
```

#### Step 3.2: Extract Categories
```bash
# Export categories table with:
# - id
# - name
# - slug
# - description (if any)

# Save as: supabase-categories-export.json
```

#### Step 3.3: Download All Featured Images
```bash
# Create a script to download all images:
# supabase-export-images.sh

#!/bin/bash
mkdir -p supabase-images

# Parse JSON and download each image
cat supabase-posts-export.json | jq -r '.[].featured_image_url' | while read url; do
  if [ ! -z "$url" ]; then
    filename=$(basename "$url" | cut -d'?' -f1)
    echo "Downloading: $url"
    curl -o "supabase-images/$filename" "$url"
  fi
done

echo "Images downloaded to: supabase-images/"
```

---

### Phase 4: WordPress Data Import

#### Step 4.1: Create Migration Script
```php
<?php
// migrate-supabase-to-wordpress.php
// Run this in WordPress admin context

// Load WordPress
require_once('wp-load.php');

// Read exported data
$posts_json = file_get_contents('supabase-posts-export.json');
$posts_data = json_decode($posts_json, true);

$categories_json = file_get_contents('supabase-categories-export.json');
$categories_data = json_decode($categories_json, true);

// Create categories first (they need to exist before posts reference them)
$category_map = array(); // Map old IDs to new WordPress term IDs

foreach ($categories_data as $cat) {
    $term = wp_insert_term(
        $cat['name'],
        'category',
        array(
            'slug' => $cat['slug'],
            'description' => $cat['description'] ?? ''
        )
    );
    
    if (is_wp_error($term)) {
        echo "Error creating category: " . $term->get_error_message() . "\n";
    } else {
        $category_map[$cat['id']] = $term['term_id'];
        echo "Created category: {$cat['name']} (ID: {$term['term_id']})\n";
    }
}

// Migrate posts
foreach ($posts_data as $post) {
    $post_data = array(
        'post_title' => $post['title'],
        'post_content' => $post['content'],
        'post_name' => $post['slug'],
        'post_status' => ($post['status'] === 'published') ? 'publish' : 'draft',
        'post_date' => date('Y-m-d H:i:s', strtotime($post['created_at'])),
        'post_modified' => date('Y-m-d H:i:s', strtotime($post['updated_at'])),
        'post_type' => 'post',
    );
    
    $post_id = wp_insert_post($post_data);
    
    if (is_wp_error($post_id)) {
        echo "Error creating post: " . $post_id->get_error_message() . "\n";
    } else {
        // Assign category
        if (isset($post['category']) && isset($category_map[$post['category']])) {
            wp_set_post_categories($post_id, array($category_map[$post['category']]));
        }
        
        // Set featured image
        if (!empty($post['featured_image_url'])) {
            attach_featured_image($post_id, $post['featured_image_url']);
        }
        
        echo "Created post: {$post['title']} (ID: {$post_id}, Slug: {$post['slug']})\n";
    }
}

// Helper function to attach featured image
function attach_featured_image($post_id, $image_url) {
    require_once(ABSPATH . 'wp-admin/includes/image.php');
    require_once(ABSPATH . 'wp-admin/includes/file.php');
    require_once(ABSPATH . 'wp-admin/includes/media.php');
    
    // Download image
    $image_name = basename($image_url);
    $image_path = '/tmp/' . $image_name;
    
    $image_data = file_get_contents($image_url);
    file_put_contents($image_path, $image_data);
    
    // Upload to WordPress
    if (file_exists($image_path)) {
        $attachment_id = media_handle_upload('local-file', $post_id);
        
        // Copy local file to upload dir instead
        $upload_dir = wp_upload_dir();
        $dest = $upload_dir['path'] . '/' . $image_name;
        copy($image_path, $dest);
        
        // Create attachment post
        $attachment = array(
            'post_mime_type' => mime_content_type($dest),
            'post_title' => preg_replace('/\.[^.]+$/', '', $image_name),
            'post_content' => '',
            'post_status' => 'inherit',
            'guid' => $upload_dir['url'] . '/' . $image_name
        );
        
        $attachment_id = wp_insert_attachment($attachment, $dest, $post_id);
        set_post_thumbnail($post_id, $attachment_id);
        
        unlink($image_path);
    }
}

echo "\n✅ Migration complete!\n";
?>
```

#### Step 4.2: Run Migration Script
```bash
# Copy migration script to WordPress directory
cp migrate-supabase-to-wordpress.php /path/to/wordpress/

# Run via WP-CLI
wp eval-file migrate-supabase-to-wordpress.php

# Or via wp-admin console (Tools > Code Snippets, if plugin installed)
# Or manually place in functions.php and access wp-admin once
```

#### Step 4.3: Verify Migration
```bash
# Check post count
wp post list --post_type=post --format=count

# Check posts have correct categories
wp post list --post_type=post --format=table

# Check featured images assigned
wp post list --post_type=post --format=csv --fields=ID,post_title,thumbnail

# Verify slugs match
wp post list --post_type=post --format=csv --fields=post_name
```

---

## SEO & URL Preservation

### Critical: Your URLs Must Not Change

#### Current Supabase URLs:
```
yourdomain.com/blog/wildland-fires-climate-change
yourdomain.com/blog/eaton-fire-anniversary
yourdomain.com/blog/prescribed-burns
```

#### After WordPress Migration (MUST be identical):
```
yourdomain.com/blog/wildland-fires-climate-change  ✅ (same slug)
yourdomain.com/blog/eaton-fire-anniversary         ✅ (same slug)
yourdomain.com/blog/prescribed-burns               ✅ (same slug)
```

### Step 5.1: Permalink Structure Configuration

```bash
# Set WordPress permalink structure to match
wp option update permalink_structure '/%postname%/'

# This produces: yourdomain.com/blog/post-name/ OR yourdomain.com/blog/post-name

# Verify it's set
wp option get permalink_structure

# Flush rewrite rules
wp rewrite flush
```

### Step 5.2: .htaccess Setup for /blog
```apache
# public_html/blog/.htaccess
# WordPress rewrite rules for subdirectory

<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /blog/

# WordPress rewrites
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /blog/index.php [L]
</IfModule>
```

### Step 5.3: SEO Preservation Strategy

#### Don't Use 301 Redirects (you're switching URLs, not moving them)
- Slugs remain identical
- Domain remains identical
- Path remains identical
- (No redirects needed)

#### Update Sitemap
```bash
# WordPress automatically generates XML sitemap at:
# yourdomain.com/blog/sitemap.xml

# In your main site's sitemap, add:
# <loc>https://yourdomain.com/blog/sitemap.xml</loc>

# OR if you generate your own master sitemap:
# Combine both:
# - yourdomain.com/sitemap.xml (main site pages)
# - yourdomain.com/blog/sitemap.xml (WordPress posts)
```

#### Canonical URLs
WordPress handles these automatically:
```html
<!-- WordPress adds automatically -->
<link rel="canonical" href="https://yourdomain.com/blog/post-slug/" />
```

#### Structured Data (Schema)
WordPress manages this via plugins, but consider adding:
```html
<!-- Add to WordPress post template -->
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "BlogPosting",
  "headline": "Post Title",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "datePublished": "2024-01-15"
}
</script>
```

#### Meta Tags Preservation
```php
// In WordPress, ensure these are set correctly:
// 1. Page titles (post_title)
// 2. Meta descriptions (use Yoast SEO or manually set)
// 3. Open Graph tags (use Yoast SEO plugin)
// 4. Twitter cards (use Yoast SEO plugin)

// Install SEO plugin:
wp plugin install wordpress-seo --activate
```

---

## Hosting Setup (Shared Hosting)

### Typical Shared Hosting Structure
```
public_html/
├── index.html (or index.php - your main site)
├── wp-config.php (WordPress - DO NOT PUT HERE)
├── .htaccess
├── css/
├── js/
├── images/
└── blog/
    ├── index.php (WordPress)
    ├── wp-admin/
    ├── wp-config.php (WordPress config - CORRECT LOCATION)
    ├── wp-content/
    ├── wp-includes/
    └── .htaccess (WordPress rewrites)
```

### Step 6.1: Create Database on Shared Host

#### Via cPanel (most common)
```
1. Log in to cPanel
2. Find "MySQL Databases" or "Databases"
3. Click "Create New Database"
4. Database name: yourdomain_wpblog
   (cPanel prefixes this: yourdomain_blog)
5. Click "Create Database"
6. Create user: yourdomain_wpuser
   Password: (strong, 16+ chars with special chars)
7. Grant all privileges
8. Note the database name and credentials
```

#### Via phpMyAdmin
```
1. Log in to phpMyAdmin
2. Click "New" (create new database)
3. Name: yourdomain_wpblog
4. Collation: utf8mb4_unicode_ci
5. Click "Create"
6. Go to "User accounts"
7. "Add user account"
8. User name: yourdomain_wpuser
   Host: localhost
   Password: (strong 16+ chars)
9. Grant all privileges on yourdomain_wpblog
```

#### Via SSH (if available)
```bash
ssh user@yourdomain.com
mysql -u yourdomain_user -p

# Inside MySQL:
CREATE DATABASE yourdomain_wpblog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'yourdomain_wpuser'@'localhost' IDENTIFIED BY 'strong-password-here-123!@#';
GRANT ALL PRIVILEGES ON yourdomain_wpblog.* TO 'yourdomain_wpuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 6.2: Upload WordPress to /blog

#### Via FTP
```bash
# From your computer:
1. Download WordPress locally
2. Unzip it
3. Connect to host via FTP
4. Navigate to public_html/
5. Create folder "blog"
6. Upload all WordPress files into public_html/blog/
7. Do NOT upload wp-config.php yet
```

#### Via SSH + Git (cleaner)
```bash
ssh user@yourdomain.com
cd public_html
git clone https://github.com/WordPress/WordPress.git blog

# Or using wget
wget -qO - https://wordpress.org/latest.tar.gz | tar -xzf - blog
```

### Step 6.3: Create & Upload wp-config.php

```bash
# On your local machine:
# 1. Copy wp-config-sample.php to wp-config.php
# 2. Edit with your database credentials from Step 6.1

cp wp-config-sample.php wp-config.php
nano wp-config.php

# Update these lines (from Step 6.1):
define('DB_NAME', 'yourdomain_wpblog');
define('DB_USER', 'yourdomain_wpuser');
define('DB_PASSWORD', 'strong-password-here-123!@#');
define('DB_HOST', 'localhost');

# Get unique keys and salts at:
# https://api.wordpress.org/secret-key/1.1/salt/
# Copy the output and replace the AUTH_KEY, etc. lines

# Set these for subdirectory install:
define('WP_HOME', 'https://yourdomain.com/blog');
define('WP_SITEURL', 'https://yourdomain.com/blog');

# Add security settings:
define('DISALLOW_FILE_EDIT', true);
define('DISALLOW_FILE_MODS', true);

# Save and upload to public_html/blog/wp-config.php via FTP
```

### Step 6.4: File Permissions (Critical)
```bash
# SSH into your host:
ssh user@yourdomain.com

# Navigate to blog directory
cd public_html/blog

# Set directory permissions to 755
find . -type d -exec chmod 755 {} \;

# Set file permissions to 644
find . -type f -exec chmod 644 {} \;

# Make wp-config.php read-only
chmod 400 wp-config.php

# Make .htaccess writable (WordPress needs this)
chmod 644 .htaccess

# Create write-access directory for uploads
chmod 755 wp-content/
chmod 755 wp-content/uploads/

# Verify:
ls -la public_html/blog/ | head -20
```

### Step 6.5: .htaccess Configuration
```bash
# Create/update public_html/blog/.htaccess
# via FTP or SSH

cat > /tmp/.htaccess << 'EOF'
# BEGIN WordPress
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /blog/
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /blog/index.php [L]
</IfModule>
# END WordPress
EOF

# Upload this file to public_html/blog/.htaccess
```

### Step 6.6: SSL Certificate Verification
```bash
# Ensure WordPress is configured for HTTPS:
1. Log into wp-admin
2. Settings > General
3. WordPress Address (URL): https://yourdomain.com/blog
4. Site Address (URL): https://yourdomain.com/blog
5. Save Changes

# Test with curl:
curl -I https://yourdomain.com/blog/
curl -I https://yourdomain.com/blog/wp-admin/

# Both should respond with 200 or 301 (redirect to https)
```

---

## Risk Assessment

### Critical Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| **Overwrite root index.html** | Low | Catastrophic | Install WordPress IN /blog folder, not root. Triple-check all file uploads. |
| **Break main /blog API routes** | Medium | High | Test all existing blog API endpoints before cutover. Prepare fallback proxy. |
| **Database credentials exposed** | Low | Critical | Store in wp-config.php only (file-level security). Never in version control. Use strong passwords. |
| **Image URLs change** | Medium | High | Download and re-upload all images. Rewrite content to point to new URLs before migration. |
| **Slugs don't match** | Medium | High | Export current slugs. Manually verify in WordPress. Check 404s post-launch. |
| **Rewrite rules fail (404s)** | Medium | High | Test .htaccess locally. Verify permalink structure. Flush rewrite rules post-install. |
| **Performance degradation** | Low | Medium | Use lightweight theme. Minimize plugins. Test with real data. Monitor first week. |
| **RLS/Auth logic breaks** | Low | Medium | No longer needed (WordPress handles). Test editor roles in staging. |
| **Scheduled posts don't publish** | Low | Medium | Configure WordPress cron properly on shared host. Monitor first 48 hours. |

---

## Pre-Cutover Checklist

### Week Before Cutover

- [ ] **Backup everything**
  - [ ] Current /blog directory (tar.gz)
  - [ ] Supabase database (pg_dump or export)
  - [ ] All featured images
  - [ ] Current routing/API setup

- [ ] **Export Supabase data**
  - [ ] Posts table (CSV or JSON)
  - [ ] Categories table
  - [ ] All image URLs documented
  - [ ] Featured images downloaded

- [ ] **Staging environment ready**
  - [ ] Local WordPress install tested
  - [ ] Migration script tested with real data
  - [ ] All posts import correctly
  - [ ] All categories created
  - [ ] All images re-uploaded and working
  - [ ] Slugs verified to match exactly

- [ ] **WordPress configuration complete**
  - [ ] Plugins installed (Yoast SEO, WP-CLI, etc.)
  - [ ] Theme selected and tested
  - [ ] Permalinks set to /%postname%/
  - [ ] .htaccess prepared and tested
  - [ ] wp-config.php configured for subdirectory
  - [ ] Rewrite rules flushed

- [ ] **Hosting account prepared**
  - [ ] Database created
  - [ ] User account created with correct privileges
  - [ ] /blog directory exists and is writable
  - [ ] FTP/SSH access verified
  - [ ] SSL certificate covers /blog

- [ ] **SEO checks completed**
  - [ ] Current blog post URLs documented
  - [ ] Sitemap format verified
  - [ ] Meta tags strategy confirmed
  - [ ] Structured data plan created

- [ ] **Editor access plan**
  - [ ] WordPress admin account created
  - [ ] Editor role tested
  - [ ] Password manager configured
  - [ ] 2FA plan (if needed)
  - [ ] Login URL documented (yourdomain.com/blog/wp-admin/)

### Day Before Cutover

- [ ] **Final backups**
  - [ ] Full Supabase backup
  - [ ] Full codebase backup
  - [ ] Current /blog backup

- [ ] **Hosting account final checks**
  - [ ] Database credentials verified
  - [ ] File permissions set correctly
  - [ ] .htaccess uploaded to /blog
  - [ ] wp-config.php ready for upload
  - [ ] SSLs configured for /blog

- [ ] **Team notification**
  - [ ] Notify team of cutover window
  - [ ] Provide WordPress access credentials (secure)
  - [ ] Provide login URL
  - [ ] Provide rollback contact info

- [ ] **Monitoring setup**
  - [ ] Error logging enabled
  - [ ] Uptime monitoring active
  - [ ] 404 monitoring active
  - [ ] Slack/email alerts configured

---

## Cutover Execution

### Timeline: 30 minutes (during low-traffic time)

#### T-10min: Pre-cutover checks
```bash
# 1. Verify hosting access
ssh user@yourdomain.com
cd public_html
ls -la

# 2. Verify database connection
mysql -u yourdomain_wpuser -p yourdomain_wpblog -e "SELECT 1;" # Should return: 1

# 3. Verify current /blog accessible
curl -I https://yourdomain.com/blog/some-post-slug/

# 4. Back up /blog one last time
tar -czf /tmp/blog-backup-final-$(date +%s).tar.gz blog/
```

#### T-0min: Upload WordPress

##### Step A: Upload WordPress files
```bash
# Via SSH (fastest and safest):
cd public_html

# Download and extract WordPress INTO /blog
wget -qO - https://wordpress.org/latest.tar.gz | tar -xz --strip-components=1 -C blog/

# Verify structure:
ls -la blog/ | head -20
# Should show: wp-admin, wp-content, wp-includes, index.php, etc.
```

##### Step B: Upload wp-config.php
```bash
# Copy prepared wp-config.php to /blog
scp ~/Downloads/wp-config.php user@yourdomain.com:public_html/blog/

# Verify
ssh user@yourdomain.com "cat public_html/blog/wp-config.php | head -20"
```

##### Step C: Set permissions
```bash
ssh user@yourdomain.com
cd public_html/blog

find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;
chmod 400 wp-config.php
chmod 755 wp-content/uploads/ 2>/dev/null || mkdir -p wp-content/uploads && chmod 755 wp-content/uploads/
```

#### T+5min: Run database setup
```bash
# SSH access:
ssh user@yourdomain.com

# Run WordPress installation
# Option 1: Via WordPress web setup
# Visit: https://yourdomain.com/blog/wp-admin/install.php
# Fill form, create admin account

# Option 2: Via WP-CLI (if available on host)
wp core install \
    --url=https://yourdomain.com/blog \
    --title="Blog" \
    --admin_user=admin \
    --admin_password='secure-password-here' \
    --admin_email=you@yourdomain.com
```

#### T+10min: Import data
```bash
# Copy migration script to /blog
scp migrate-supabase-to-wordpress.php user@yourdomain.com:public_html/blog/

# Copy exported data files
scp supabase-posts-export.json user@yourdomain.com:public_html/blog/
scp supabase-categories-export.json user@yourdomain.com:public_html/blog/

# Run migration via WP-CLI
ssh user@yourdomain.com
cd public_html/blog

# Activate WP-CLI if needed
wp eval-file migrate-supabase-to-wordpress.php

# Or visit /blog/wp-admin/ and use Tools > Code Snippets
```

#### T+20min: Verify URLs
```bash
# Test a few posts:
curl -I https://yourdomain.com/blog/wildland-fires-climate-change/
curl -I https://yourdomain.com/blog/eaton-fire-anniversary/

# Should return: 200 OK (not 404)

# Test WordPress admin:
curl -I https://yourdomain.com/blog/wp-admin/

# Should redirect to https (301 or 302) then 200
```

#### T+25min: Update main site links (if needed)
```tsx
// In your React app, if you have blog links:
// Update any hardcoded blog URLs

// Before:
// <Link to="/blog/post-slug">Blog Post</Link>

// After (if URL structure changed):
// <a href="https://yourdomain.com/blog/post-slug">Blog Post</a>

// But if URLs didn't change, no update needed!
```

#### T+30min: Go live / Rollback decision
```bash
# Run final verification:
./verify-migration.sh  # See script below

# If all green (✅):
# ✅ MIGRATION SUCCESSFUL - MONITOR CLOSELY

# If any red (❌):
# ❌ EXECUTE ROLLBACK PLAN (see below)
```

### Verification Script
```bash
#!/bin/bash
# verify-migration.sh

echo "🔍 Starting WordPress migration verification..."
echo ""

DOMAIN="yourdomain.com"
BLOG_POSTS=(
    "wildland-fires-climate-change"
    "eaton-fire-anniversary"
    "prescribed-burns"
    # Add all your actual post slugs here
)

ERRORS=0
SUCCESSES=0

# Test 1: WordPress accessible
echo "Test 1: WordPress homepage accessible..."
if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/blog/ | grep -q 200; then
    echo "✅ WordPress blog accessible"
    ((SUCCESSES++))
else
    echo "❌ WordPress blog not accessible"
    ((ERRORS++))
fi

# Test 2: Admin accessible
echo "Test 2: WordPress admin accessible..."
if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/blog/wp-admin/ | grep -q -E "200|301|302"; then
    echo "✅ WordPress admin accessible"
    ((SUCCESSES++))
else
    echo "❌ WordPress admin not accessible"
    ((ERRORS++))
fi

# Test 3: Posts exist
echo "Test 3: Individual posts accessible..."
for slug in "${BLOG_POSTS[@]}"; do
    if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/blog/$slug/ | grep -q 200; then
        echo "✅ /blog/$slug/ → 200 OK"
        ((SUCCESSES++))
    else
        echo "❌ /blog/$slug/ → NOT FOUND"
        echo "   This post may not have been migrated correctly"
        ((ERRORS++))
    fi
done

# Test 4: Sitemap
echo "Test 4: Sitemap accessible..."
if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/blog/sitemap.xml | grep -q 200; then
    echo "✅ Sitemap accessible"
    ((SUCCESSES++))
else
    echo "❌ Sitemap not found (may need plugin activation)"
    ((ERRORS++))
fi

# Test 5: Main site untouched
echo "Test 5: Main site untouched..."
if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/ | grep -q 200; then
    echo "✅ Main site still accessible"
    ((SUCCESSES++))
else
    echo "❌ Main site broken"
    ((ERRORS++))
fi

# Summary
echo ""
echo "═══════════════════════════════════════"
echo "Verification Results:"
echo "✅ Successes: $SUCCESSES"
echo "❌ Errors: $ERRORS"
echo "═══════════════════════════════════════"

if [ $ERRORS -eq 0 ]; then
    echo ""
    echo "🎉 ALL TESTS PASSED - SAFE TO PROCEED"
    exit 0
else
    echo ""
    echo "⚠️  SOME TESTS FAILED - REVIEW BEFORE GOING LIVE"
    exit 1
fi
```

---

## Post-Cutover Verification

### First 24 Hours Monitoring

```bash
# Every hour, run:
./verify-migration.sh

# Watch error logs:
ssh user@yourdomain.com
tail -f public_html/blog/wp-content/debug.log

# Check for 404s:
grep "404" /var/log/apache2/access.log

# Monitor database:
wp db optimize  # Clean up after migration
wp option get siteurl
wp option get home
```

### Manual Smoke Tests

```
1. Visit https://yourdomain.com
   → Main site should load normally ✅

2. Visit https://yourdomain.com/blog
   → WordPress blog homepage should load ✅

3. Click blog post from main site
   → Should load on WordPress ✅

4. Log in to https://yourdomain.com/blog/wp-admin/
   → Dashboard should load ✅

5. View edit post
   → All content should be there (title, content, featured image, categories) ✅

6. Check featured image
   → Should load correctly (not broken image) ✅

7. Visit category page
   → All posts in category should show ✅

8. Check browser console
   → No console errors ✅

9. Check Search Console
   → No sudden indexing errors
```

---

## Rollback Plan

### If Something Goes Wrong

#### Rollback Decision Criteria
Execute rollback if ANY of these occur:
- Main site becomes inaccessible
- More than 20% of blog post URLs return 404
- Database is corrupted
- Security breach detected
- Performance degrades >50%

#### Rollback Execution (< 5 minutes)

##### Step 1: Remove WordPress
```bash
ssh user@yourdomain.com
cd public_html

# Move WordPress aside (don't delete yet)
mv blog blog-broken-$(date +%s)

# Restore from backup
tar -xzf /tmp/blog-backup-final-*.tar.gz

# Verify /blog restored
ls -la blog/ | head -10
```

##### Step 2: Verify Supabase still works
```bash
# If Supabase routes still active in your site:
curl https://yourdomain.com/blog/  # Should show old content

# If you haven't deleted Supabase yet, it should respond
curl https://api.yourdomain.com/blog/posts  # Check your API
```

##### Step 3: Restore database (if modified)
```bash
# Restore Supabase from backup (done outside this guide)
# Or restore any database backups you made

# Verify posts accessible via old API
curl https://yourdomain.com/api/blog/posts
```

##### Step 4: Clear caches
```bash
# If you have CDN caching:
# Purge cache for /blog/*

# If you have browser caching:
# Provide links for users to clear cache (Ctrl+Shift+R)

# If you have WordPress caching (shouldn't be active during rollback):
rm -rf blog/wp-content/cache/*
```

#### Post-Rollback Analysis

- [ ] Identify specifically what failed
- [ ] Review error logs from WordPress
- [ ] Check database integrity
- [ ] Backup the "broken" WordPress (/blog-broken-[timestamp]/) for analysis
- [ ] Plan fixes before re-attempting cutover
- [ ] Wait >= 24 hours before attempting again

---

## Supabase Removal Checklist

### After Successful Cutover (Week 1+)

Once WordPress is running smoothly for >= 1 week and you're confident, remove Supabase blog logic.

#### Step 1: Identify All Supabase Blog Dependencies

```swift
// Search codebase for references:
grep -r "supabase" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx"
grep -r "SUPABASE" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx"

// Look for:
// - supabase.from('posts')
// - supabase.from('categories')
// - magic-link auth
// - row-level security calls
// - file storage references
```

#### Step 2: Identify Files to Remove/Modify
```
Files likely involved:
❌ src/pages/BlogEditor.tsx (or similar)
❌ src/contexts/SupabaseContext.tsx (if blog-only)
❌ src/hooks/useSupabaseBlog.ts
❌ Any blog RLS policies in Supabase
❌ Authentication routes for /blog/editor

Files to KEEP:
✅ src/pages/Blog.tsx (may still exist to redirect or embed?)
✅ Main site auth (if not blog-specific)
✅ Non-blog related Supabase functions
```

#### Step 3: Remove From Codebase

```tsx
// Example: Remove blog editor component
// DELETE: src/pages/BlogEditor.tsx
// DELETE: src/hooks/useSupabaseBlog.ts
// DELETE: src/contexts/BlogSupabaseContext.tsx

// Update routes:
// BEFORE:
// <Route path="/blog/editor" element={<BlogEditor />} />

// AFTER (delete this route entirely):
// Link to WordPress instead:
{allowedToEditBlog && (
  <a href="https://yourdomain.com/blog/wp-admin/" target="_blank">
    Edit Blog
  </a>
)}
```

#### Step 4: Update Navigation

```tsx
// Update any blog links in your site:

// BEFORE:
<Link to="/blog/posts">View Blog</Link>

// AFTER:
<a href="/blog">View Blog</a>

// OR if you want to open in same window:
<a href="https://yourdomain.com/blog">View Blog</a>
```

#### Step 5: Remove Supabase Blog Tables (AFTER 100% Confident)

⚠️ **WARNING: Only do this AFTER >= 2 weeks of WordPress running perfectly**

```sql
-- In Supabase console, AFTER verifying WordPress has all content:

-- DO NOT RUN YET - Wait 2 weeks minimum!

-- If absolutely sure, delete in this order:
-- 1. Drop table references
-- 2. Drop RLS policies
-- 3. Drop functions

DROP TABLE IF EXISTS blog_categories CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS blog_editors CASCADE;

-- But KEEP this for >= 30 days in case urgent rollback needed
```

#### Step 6: Remove Environment Variables

```bash
# If you use .env for Supabase keys:
# BEFORE:
# VITE_SUPABASE_URL=https://xxx.supabase.co
# VITE_SUPABASE_KEY=xxx

# AFTER:
# Remove these lines entirely (if only for blog)

# git commit
git add .
git commit -m "Remove Supabase blog CMS (migrated to WordPress)"
git push
```

#### Step 7: Update Documentation
```markdown
# Update README.md:

## Blog System
- **Status**: Migrated to WordPress
- **Location**: yourdomain.com/blog
- **Admin**: yourdomain.com/blog/wp-admin/
- **Supabase Usage**: No longer used for blog
  (Kept for other features: [list any non-blog uses])

## Publishing a New Blog Post
1. Log in to https://yourdomain.com/blog/wp-admin/
2. Posts → New Post
3. Write content
4. Set featured image
5. Set category
6. Publish

## Archiving Old Content
- All posts previously in Supabase have been migrated
- Old Supabase database kept for 30 days as backup (see ROLLBACK_PLAN.md)
```

#### Step 8: Final Checklist
- [ ] All blog references in code removed
- [ ] Router updated (no /blog/editor route)
- [ ] Env variables removed/updated
- [ ] Navigation links updated
- [ ] Documentation updated
- [ ] .gitignore updated (if needed)
- [ ] Code review/approval
- [ ] Deployed
- [ ] Supabase blog tables deleted (only after 30+ days)

---

## Architecture Diagram (Detailed)

### Before Migration
```
┌──────────────────────────────────────────────────────────────────┐
│                         Browser                                   │
│                    (User visiting site)                          │
└────────────┬─────────────────────────────────────────────────────┘
             │
             ├─► https://yourdomain.com/
             │        │
             │        └─► public_html/index.html (React app)
             │             ├─ /assets
             │             └─ /images
             │
             ├─► https://yourdomain.com/blog
             │        │
             │        ├─ Vite API: /api/blog/posts
             │        │   │
             │        │   └─► Supabase DB (posts table) 🔴 BUGGY AUTH
             │        │
             │        ├─ Features:
             │        │   ├─ /blog/:slug (fetch from Supabase)
             │        │   ├─ /blog/editor (magic-link auth) 🔴 FAILS
             │        │   ├─ /blog/categories (RLS policy)
             │        │   └─ /editor/upload (Supabase storage)
             │        │
             │        └─ Issues:
             │            ├─ RLS complexity
             │            ├─ Auth failures
             │            ├─ DIY media handling
             │            └─ No versioning/drafts
             │
             └─► Supabase (external dependency) 📦
                  ├─ auth table
                  ├─ posts table 🗄️
                  ├─ categories table 🗄️
                  ├─ storage bucket (images)
                  └─ RLS policies 🔐
```

### After Migration
```
┌──────────────────────────────────────────────────────────────────┐
│                         Browser                                   │
│                    (User visiting site)                          │
└────────────┬─────────────────────────────────────────────────────┘
             │
             ├─► https://yourdomain.com/
             │        │
             │        └─► public_html/index.html (React app) ✅ UNTOUCHED
             │             ├─ /assets
             │             └─ /images
             │
             ├─► https://yourdomain.com/blog
             │        │
             │        └─► public_html/blog/index.php (WordPress) ✅ CLEAN
             │             ├─ Posts (from migration)
             │             ├─ Categories (from migration) 
             │             ├─ Media library (images)
             │             ├─ Editor roles (Admin, Editor)
             │             ├─ Drafts & scheduling
             │             ├─ wp-admin/ (editor panel)
             │             └─ Features:
             │                 ├─ Built-in auth ✅
             │                 ├─ Media handling ✅
             │                 ├─ Revisions ✅
             │                 ├─ SEO plugins ✅
             │                 └─ Caching plugins ✅
             │
             └─► WordPress Database (local) 🗄️
                  ├─ wp_users
                  ├─ wp_posts (migrated from Supabase)
                  ├─ wp_terms (categories)
                  ├─ wp_postmeta (featured images, etc.)
                  └─ wp_usermeta (editor roles)

Supabase: No longer used for blog ✅
          (Kept for other features, if any)
```

---

## Common Questions & Troubleshooting

### Q: "Will my main website be affected?"
**A:** No. WordPress is installed in `/blog` only. Your React/Vite app at `/` is completely untouched. No shared files, no shared database, no routing conflicts.

### Q: "Can I test locally first?"
**A:** Yes (recommended). Follow Phase 2 on your local machine. Set up WordPress locally with imported test data. Verify all URLs work before touching production.

### Q: "What if the /blog URLs change?"
**A:** They won't if you:
1. Export post slugs from Supabase correctly
2. Set WordPress permalink structure to `/%postname%/`
3. Ensure post names match exactly
4. Test URLs before going live

### Q: "Do I need to install WordPress at the root?"
**A:** No. Never. Install at `/blog/` only. Root stays your React app.

### Q: "What about the main site's SEO?"
**A:** Unaffected. Google treats `/` and `/blog` as the same site. Just link between them normally.

### Q: "Can I roll back if something breaks?"
**A:** Yes. See [Rollback Plan](#rollback-plan). Keep backups for exactly this reason.

### Q: "How long does migration take?"
**A:** 
- Prep: 3-5 days
- Execution: 30 minutes
- Verification: 1 week
- Full removal: 30+ days

### Q: "Do I need to learn WordPress?"
**A:** Minimally. You only need to know /wp-admin/ for publishing. You don't need to manage themes or plugins if it already works.

### Q: "What about scheduled posts?"
**A:** WordPress handles this natively. WordPress cron runs via site visits (or via real cron on server).

### Q: "Can I use a WordPress theme that doesn't match my site design?"
**A:** Yes. Your site stays as-is. The /blog section can look different. If you want them to match, you can style WordPress with custom CSS, but it's not required.

### Q: "What if I want to use a headless WordPress later?"
**A:** You can always migrate later. Start with traditional WordPress, then move to headless if needed. Adding this complexity from day 1 is overkill.

---

## Files Checklist Before Migration

Create these files and keep them safe:

```
✓ supabase-posts-export.json
✓ supabase-categories-export.json
✓ backup-current-blog.tar.gz
✓ supabase-posts-snapshot.csv
✓ wp-config.php (for /blog)
✓ migrate-supabase-to-wordpress.php
✓ verify-migration.sh
✓ blog-backup-final-[timestamp].tar.gz (day of migration)
✓ rollback-plan.md (copy of rollback section)
```

---

## Executive Summary

### What You're Doing
Moving blog backend from Supabase (buggy auth, DIY CMS) to WordPress (proven CMS, built-in features).

### What Doesn't Change
- Your main website (React/Vite/Tailwind)
- Your domain
- Your hosting
- Your blog URLs
- Your SEO

### What Changes
- Blog editing interface: Supabase → WordPress admin
- Backend: Supabase RLS → WordPress users/roles
- Media handling: DIY → WordPress media library
- Auth: Magic links → WordPress login

### Why This Works
- WordPress in `/blog`, your site in `/`
- No file overwrites
- No database conflicts
- No routing issues
- Complete independence

### Timeline
- **Planning**: 3-5 days
- **Cutover**: 30 minutes
- **Verification**: 1 week
- **Full cleanup**: 30+ days

### Success Criteria
- ✅ All blog posts accessible at same URLs
- ✅ All images downloaded and re-uploaded
- ✅ Categories created in WordPress
- ✅ Main site completely untouched
- ✅ No 404s (or minimal, fixed immediately)
- ✅ Zero downtime (or minimal, unnoticeable)

### Next Step
Choose your cutover date, follow the checklist, and execute.

---

## Document Tracking

- **Created:** February 20, 2026
- **Last Updated:** February 20, 2026
- **Status:** Ready for review
- **Reviewer:** [Your name]
- **Approved:** [ ] Yes [ ] No
- **Cutover Date:** [To be set]
- **Rollback Contact:** [To be set]
