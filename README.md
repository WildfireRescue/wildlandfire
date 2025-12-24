# The Wildland Fire Recovery Fund

A comprehensive donation-focused website serving wildfire survivors.

## 🔥 About

The Wildland Fire Recovery Fund is a 501(c)(3) nonprofit organization providing rapid emergency assistance to wildfire survivors, including emergency housing, mental health support, and firefighter resources.

**2026 Fundraising Goal: $5,000,000**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 🌐 Deployment

This site is optimized for deployment on Vercel or Netlify.

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables (see below)
4. Deploy!

See `DEPLOY_NOW.md` for detailed instructions.

### Environment Variables

Required environment variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server only)
- `STRIPE_SECRET_KEY` - Stripe secret key (server only)

## 💳 Donation System

Fully functional Stripe integration with:
- ✅ Preset donation amounts ($50-$5,000)
- ✅ Custom amount option
- ✅ Secure payment processing
- ✅ Receipt emails
- ✅ Progress tracking toward $500K goal

## 🎨 Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS 4
- **Backend:** Supabase Edge Functions (Hono)
- **Payments:** Stripe
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel/Netlify

## 📄 Pages

- `/` - Home page with hero and call-to-action
- `/#about` - About us and mission
- `/#donate` - Donation page with form
- `/#impact` - Impact metrics and transparency
- `/#stories` - Vision and mission stories
- `/#grants` - Fire department and education grants
- `/#contact` - Contact form and information

## 🔍 SEO

Enterprise-level SEO implementation:
- ✅ Meta tags optimization
- ✅ Structured data (Schema.org)
- ✅ Open Graph tags
- ✅ Sitemap and robots.txt
- ✅ Semantic HTML

See `SEO_ACTION_CHECKLIST.md` for complete SEO strategy.

## 📱 Features

- ✅ Fully responsive design
- ✅ Dark theme with orange accents (#FF9933)
- ✅ Floating "Donate Now" button
- ✅ Animated progress tracker
- ✅ Accessibility optimized
- ✅ Fast performance

## 📞 Contact

- **Email:** info@wildlandfirerecoveryfund.org
- **Website:** https://wildlandfirerecoveryfund.org

## 📄 License

Copyright © 2025 The Wildland Fire Recovery Fund. All rights reserved.

---

**Built with ❤️ for wildfire survivors**