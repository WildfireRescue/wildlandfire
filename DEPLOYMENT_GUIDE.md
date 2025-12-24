# 🔥 Deployment Guide: Moving Your Site to INC Web Authority

## Overview

Your site is built with React + Vite and needs to be:
1. **Built** into static files
2. **Exported** from Figma Make
3. **Uploaded** to INC Web Authority
4. **Backend configured** (Supabase functions)

---

## Step 1: Export Your Code from Figma Make

### Option A: Download as ZIP (Recommended)
1. In Figma Make, look for an **"Export"** or **"Download"** button
2. Download the entire project as a ZIP file
3. Extract the ZIP to your computer

### Option B: Copy Files Manually
If there's no export button, you'll need to manually copy each file from Figma Make to your local computer.

---

## Step 2: Build Your Site Locally

Once you have the files on your computer:

### 1. Install Node.js (if not already installed)
- Download from: https://nodejs.org
- Choose the LTS version
- Verify installation: Open terminal and run `node --version`

### 2. Open Terminal/Command Prompt
- **Mac**: Open Terminal app
- **Windows**: Open Command Prompt or PowerShell
- Navigate to your project folder: `cd path/to/your-project`

### 3. Install Dependencies
```bash
npm install
```

### 4. Build for Production
```bash
npm run build
```

This creates a `dist` folder with your production-ready files.

---

## Step 3: Upload to INC Web Authority

### Files to Upload:
Upload **ONLY** the contents of the `dist` folder to your web host.

### Using cPanel File Manager (most common):
1. Log into your INC Web Authority cPanel
2. Click **"File Manager"**
3. Navigate to `public_html` (or your domain's root folder)
4. **Delete old files** (or backup first!)
5. **Upload** all files from the `dist` folder
   - Click "Upload"
   - Select all files from `dist` folder
   - Wait for upload to complete

### Using FTP (alternative):
1. Get your FTP credentials from INC Web Authority
2. Download an FTP client like FileZilla (https://filezilla-project.org)
3. Connect to your hosting:
   - Host: Your domain or FTP address
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21 (or 22 for SFTP)
4. Navigate to `public_html` on the server
5. Upload all files from the `dist` folder

---

## Step 4: Configure Backend (Supabase Edge Functions)

### ⚠️ IMPORTANT: Backend Deployment

Your site uses Supabase Edge Functions for payment processing. These need to be deployed separately.

### Option 1: Deploy via Supabase CLI (Recommended)

#### Install Supabase CLI:
```bash
npm install -g supabase
```

#### Login to Supabase:
```bash
supabase login
```

#### Link Your Project:
```bash
supabase link --project-ref kgwtctsj43v2cjoz3lp3djh2frsbt2lqsqvawc3rdjvdec2yqhxq
```

#### Deploy Functions:
```bash
supabase functions deploy
```

This deploys your payment processing backend to Supabase's servers.

### Option 2: Manual Deployment via Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Select your project: **kgwtctsj43v2cjoz3lp3djh2frsbt2lqsqvawc3rdjvdec2yqhxq**
3. Click **"Edge Functions"** in the left sidebar
4. Click **"Deploy new function"**
5. Name it: `make-server-39bb2c80`
6. Copy the contents of `/supabase/functions/server/index.tsx`
7. Paste into the editor
8. Click **"Deploy"**

---

## Step 5: Verify Everything Works

### Test Your Live Site:
1. Visit your domain (e.g., `https://wildfirerecoveryfund.org`)
2. Check that all pages load correctly
3. Test the navigation
4. **Test a donation:**
   - Click "Donate Now"
   - Try a small real donation ($1-5)
   - Verify it processes successfully
   - Check your Stripe dashboard for the payment

---

## Step 6: Set Up Custom Domain (if needed)

If you want to use a custom domain like `wildfirerecoveryfund.org`:

### At INC Web Authority:
1. Log into cPanel
2. Go to **"Domains"** or **"Addon Domains"**
3. Add your domain
4. Point the document root to `public_html`

### Update DNS (at your domain registrar):
Point your domain's DNS to INC Web Authority's nameservers.
- Get nameservers from INC Web Authority support
- Update at your domain registrar (GoDaddy, Namecheap, etc.)
- Wait 24-48 hours for DNS propagation

---

## Troubleshooting

### Issue: "Page Not Found" or 404 Errors

**Solution:** Add a `.htaccess` file to your `public_html` folder:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

This ensures React Router works correctly.

### Issue: Donations Not Working

**Check:**
1. ✅ Supabase Edge Function is deployed
2. ✅ STRIPE_SECRET_KEY environment variable is set in Supabase
3. ✅ Stripe publishable key is correct in code
4. ✅ Check browser console for errors
5. ✅ Verify payment appears in Stripe Dashboard

### Issue: Images Not Loading

**Check:**
1. All files from `dist` folder were uploaded
2. File paths are correct (case-sensitive on Linux servers)
3. Image files exist in the `assets` folder

---

## Environment Variables Checklist

Make sure these are set in your Supabase project:

| Variable | Location | Status |
|----------|----------|--------|
| `STRIPE_SECRET_KEY` | Supabase Dashboard → Settings → Edge Functions | ✅ Set |
| `SUPABASE_URL` | Auto-provided by Supabase | ✅ Set |
| `SUPABASE_ANON_KEY` | Auto-provided by Supabase | ✅ Set |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-provided by Supabase | ✅ Set |

---

## Quick Deployment Checklist

- [ ] Export code from Figma Make
- [ ] Install Node.js on your computer
- [ ] Run `npm install` in project folder
- [ ] Run `npm run build` to create `dist` folder
- [ ] Upload `dist` folder contents to INC Web Authority
- [ ] Deploy Supabase Edge Function
- [ ] Verify STRIPE_SECRET_KEY is set in Supabase
- [ ] Test the site on your domain
- [ ] Test a real donation
- [ ] Check Stripe Dashboard for payment

---

## Need Help?

### INC Web Authority Support:
- Contact their support for hosting-specific questions
- Ask about: FTP credentials, cPanel access, domain setup

### Supabase Support:
- Documentation: https://supabase.com/docs
- Community: https://github.com/supabase/supabase/discussions

### Stripe Support:
- Dashboard: https://dashboard.stripe.com
- Documentation: https://stripe.com/docs

---

## 🔥 Your Site is Ready!

Once deployed, your donation system will be live and accepting real payments to help wildfire survivors rise from the ashes!

**Pro Tip:** After deployment, make a small test donation to ensure everything works end-to-end before promoting the site.
