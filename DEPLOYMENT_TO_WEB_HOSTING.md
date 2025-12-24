# 🚀 Deploying to Traditional Web Hosting (INMotion, Bluehost, GoDaddy, etc.)

## ✅ What You Need

- ✅ Your web hosting account (INMotion, Bluehost, GoDaddy, HostGator, etc.)
- ✅ FTP/SFTP access or cPanel File Manager access
- ✅ Your domain name configured
- ✅ This React site code

---

## 📦 STEP 1: Build Your Site for Production (5 minutes)

Your site is built with React and Vite. You need to create production files first.

### Option A: If you're working locally

1. **Open Terminal/Command Prompt** in your project folder

2. **Install dependencies** (if you haven't already):
   ```bash
   npm install
   ```

3. **Build the production version:**
   ```bash
   npm run build
   ```

4. **Result:** A new folder called `dist` will be created with these files:
   ```
   dist/
   ├── index.html
   ├── assets/
   │   ├── index-ABC123.js
   │   ├── index-DEF456.css
   │   └── [other optimized files]
   ├── public/
   │   ├── robots.txt
   │   └── sitemap.xml
   └── [other files]
   ```

### Option B: If you're using Figma Make

Let me know and I can help you download the built files or provide alternate deployment options.

---

## 📤 STEP 2: Upload Files to Your Web Hosting

### Method A: Using cPanel File Manager (Easiest)

1. **Log into your hosting cPanel**
   - Usually: `https://yourdomain.com/cpanel` or `https://yourdomain.com:2083`
   - Or through your hosting provider's dashboard

2. **Go to File Manager**
   - Find and click "File Manager" icon

3. **Navigate to your website's root directory:**
   - Usually: `public_html` or `www` or `httpdocs`
   - If you have multiple domains, look for `public_html/yourdomain.com`

4. **Clear existing files** (if updating old site):
   - Select all existing files
   - Click "Delete"
   - Confirm

5. **Upload your built files:**
   - Click "Upload" button
   - Select ALL files from your `dist` folder
   - OR create a zip file and upload that, then extract

6. **Important: Move files to root**
   - Your `index.html` must be in `public_html` (not in a subfolder)
   - Your `assets` folder should be at `public_html/assets`
   - Your `public` folder contents should be at `public_html/`

**Final structure should look like:**
```
public_html/
├── index.html          ← Must be here!
├── assets/
│   ├── index-ABC123.js
│   ├── index-DEF456.css
├── robots.txt
├── sitemap.xml
└── [other files]
```

### Method B: Using FTP/SFTP (FileZilla)

1. **Download FileZilla** (if you don't have it):
   - https://filezilla-project.org/download.php

2. **Get your FTP credentials from your hosting:**
   - Host: Usually `ftp.yourdomain.com` or IP address
   - Username: From your hosting panel
   - Password: From your hosting panel
   - Port: 21 (FTP) or 22 (SFTP)

3. **Connect to your server:**
   - Open FileZilla
   - File → Site Manager → New Site
   - Enter your credentials
   - Click "Connect"

4. **Navigate on server** (right side):
   - Go to `public_html` or `www` or `httpdocs`

5. **Navigate on local computer** (left side):
   - Go to your `dist` folder

6. **Upload all files:**
   - Select all files in `dist` folder (left side)
   - Drag to `public_html` (right side)
   - Wait for upload to complete

---

## ⚙️ STEP 3: Configure for Single Page Application (CRITICAL!)

Your site uses React Router with hash-based routing (`#home`, `#about`, etc.). This should work automatically, but you need to ensure proper configuration.

### Create/Update `.htaccess` file (for Apache servers)

1. **In cPanel File Manager** or **FileZilla**, create a file called `.htaccess` in your `public_html` folder

2. **Add this code:**

```apache
# Enable Rewrite Engine
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Redirect all requests to index.html for SPA routing
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

# Gzip compression for faster loading
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/x-javascript application/json
</IfModule>

# Browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
  ExpiresByType application/pdf "access plus 1 month"
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

3. **Save the file**

4. **Make sure filename is `.htaccess`** (with the dot at the beginning)

### For Nginx Servers

If your host uses Nginx instead of Apache, contact your hosting support and ask them to add this configuration:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## ✅ STEP 4: Test Your Deployment

1. **Visit your domain:** `https://wildlandfirerecoveryfund.org`

2. **Test these pages:**
   - Home: `https://wildlandfirerecoveryfund.org/` ✓
   - About: `https://wildlandfirerecoveryfund.org/#about` ✓
   - Donate: `https://wildlandfirerecoveryfund.org/#donate` ✓
   - Contact: `https://wildlandfirerecoveryfund.org/#contact` ✓

3. **Test the donate button:**
   - Click "Donate Now"
   - Fill out form
   - Try test payment (use Stripe test mode)

4. **Check mobile version:**
   - Visit on your phone
   - Test navigation
   - Test donate form

5. **Check SEO files:**
   - `https://wildlandfirerecoveryfund.org/robots.txt` ✓
   - `https://wildlandfirerecoveryfund.org/sitemap.xml` ✓

---

## 🔧 STEP 5: Configure SSL (HTTPS) - CRITICAL for Donations!

**Your site MUST use HTTPS to accept donations securely.**

### Free SSL with Let's Encrypt (most hosts offer this):

1. **Log into cPanel**

2. **Find "SSL/TLS Status" or "Let's Encrypt SSL"**

3. **Select your domain**

4. **Click "Install SSL Certificate"** or "Enable"

5. **Wait 5-10 minutes** for activation

6. **Force HTTPS** - Add to top of `.htaccess`:

```apache
# Force HTTPS
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
```

### If your host doesn't offer free SSL:

- Contact support and ask about SSL certificates
- Most hosts offer free SSL now (Let's Encrypt)
- Paid options: ~$50-100/year

---

## 🗄️ STEP 6: Configure Supabase Backend

Your donation system uses Supabase. You need to configure environment variables.

### Option A: If your host supports environment variables

1. **In cPanel**, look for "Node.js" or "Environment Variables"

2. **Add these variables:**
   ```
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   STRIPE_SECRET_KEY=your_stripe_secret_key_here
   ```

### Option B: If your host doesn't support environment variables

**Your backend won't work on traditional hosting!**

You have 2 options:

**1. Use Supabase hosting for backend (Recommended):**
- Your frontend stays on INMotion
- Backend stays on Supabase Edge Functions
- Update your API calls to point to Supabase directly

**2. Deploy everything to Vercel or Netlify (Easier):**
- Free hosting
- Automatic SSL
- Environment variables built-in
- One-click deployment
- Would you like me to create a guide for this instead?

---

## ⚠️ COMMON ISSUES & FIXES

### Issue 1: "404 Not Found" when clicking navigation links

**Fix:** Make sure `.htaccess` file is properly configured (see Step 3)

### Issue 2: Page loads but looks broken (no styling)

**Fix:** Your files aren't in the right location. Make sure:
- `index.html` is in `public_html` (not in a subfolder)
- `assets` folder is at `public_html/assets`

### Issue 3: SSL/HTTPS not working

**Fix:** 
- Wait 10-15 minutes after enabling SSL
- Clear browser cache
- Check if SSL is fully activated in cPanel

### Issue 4: Donation form doesn't work

**Fix:** This is likely because Supabase backend isn't configured
- See Step 6 above
- Or consider deploying to Vercel/Netlify instead

### Issue 5: Images don't load

**Fix:** 
- Check that all files in `dist` were uploaded
- Check file permissions (should be 644 for files, 755 for folders)

---

## 🚨 IMPORTANT: Your Backend Needs Special Hosting

**Traditional web hosting (INMotion, Bluehost, etc.) is designed for:**
- WordPress sites
- Static HTML sites
- PHP applications

**Your site has:**
- ✅ React frontend (will work fine)
- ❌ Supabase backend with Edge Functions (won't work on traditional hosting)

### You Have 3 Options:

**Option 1: Hybrid Approach (What I recommend)**
- Frontend on INMotion (what you have)
- Backend stays on Supabase (already set up)
- Your frontend makes API calls to Supabase
- **Pros:** Uses your existing hosting, backend already configured
- **Cons:** Slightly more complex configuration

**Option 2: Full Modern Hosting (Easiest overall)**
- Deploy everything to Vercel, Netlify, or Cloudflare Pages
- **Pros:** Free, automatic SSL, supports your backend, one-click deploy
- **Cons:** Different from your current hosting

**Option 3: Frontend Only on INMotion**
- Remove backend functionality
- Use Stripe Checkout (hosted by Stripe)
- **Pros:** Simpler
- **Cons:** Lose custom donation features

---

## 💡 MY RECOMMENDATION

**For your specific case:**

Since you have backend functionality (Supabase + Stripe integration), I recommend **Option 2: Deploy to Vercel or Netlify** instead of INMotion.

**Why?**
- ✅ Free hosting
- ✅ Automatic SSL
- ✅ Supports your Supabase backend
- ✅ One-click deployment from GitHub
- ✅ Automatic updates when you make changes
- ✅ Better performance (CDN)
- ✅ No server configuration needed

**You can still use INMotion for:**
- Email hosting (@wildlandfirerecoveryfund.org)
- Other websites
- File storage

---

## 🤔 WHAT DO YOU WANT TO DO?

**Choose one:**

**A) "Deploy to INMotion (frontend only)"**
- I'll help you configure frontend-only deployment
- We'll simplify the backend or use Stripe Checkout directly

**B) "Deploy to Vercel/Netlify (full site)"** ← **RECOMMENDED**
- I'll create a simple deployment guide
- Takes 10 minutes
- Everything works out of the box

**C) "Deploy frontend to INMotion + keep backend on Supabase"**
- I'll help you configure the hybrid approach
- A bit more technical but uses your existing hosting

**Just tell me A, B, or C and I'll guide you through the exact steps!**

---

## 📞 Need Help?

Common hosting support contacts:
- **INMotion:** 1-888-321-4678 or live chat
- **Bluehost:** 1-888-401-4678
- **GoDaddy:** 1-480-505-8877
- **HostGator:** 1-866-964-2867

Ask them: "How do I deploy a React single-page application to my hosting?"

---

**Let me know which option you want and I'll walk you through it step by step!** 🚀
