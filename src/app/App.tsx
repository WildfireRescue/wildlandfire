import { useEffect, useState, lazy, Suspense } from 'react';
import { HomePage } from './pages/HomePage';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { StructuredData } from './components/StructuredData';
import { ErrorBoundary } from './components/ErrorBoundary';
import { supabase } from '../lib/supabase';

// Lazy load pages that aren't immediately needed
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const StoriesPage = lazy(() => import('./pages/StoriesPage').then(m => ({ default: m.StoriesPage })));
const GrantsPage = lazy(() => import('./pages/GrantsPage').then(m => ({ default: m.GrantsPage })));
const DonatePage = lazy(() => import('./pages/DonatePage').then(m => ({ default: m.DonatePage })));
const ThankYouPage = lazy(() => import('./pages/ThankYouPage').then(m => ({ default: m.ThankYouPage })));
const BlogIndexPage = lazy(() => import('./pages/BlogIndexPage').then(m => ({ default: m.BlogIndexPage })));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage').then(m => ({ default: m.BlogPostPage })));
const BlogCategoryPage = lazy(() => import('./pages/BlogCategoryPage').then(m => ({ default: m.BlogCategoryPage })));
const BlogEditorPage = lazy(() => import('./pages/admin/BlogEditorPageEnhanced').then(m => ({ default: m.BlogEditorPageEnhanced })));
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage').then(m => ({ default: m.AuthCallbackPage })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsOfUsePage = lazy(() => import('./pages/TermsOfUsePage').then(m => ({ default: m.TermsOfUsePage })));

// Lazy load components that aren't critical for initial render
const DonationForm = lazy(() => import('./components/DonationForm').then(m => ({ default: m.DonationForm })));
const UrgencyTopBanner = lazy(() => import('./components/UrgencyTopBanner').then(m => ({ default: m.UrgencyTopBanner })));

// Wildland Fire Recovery Fund - Main Application Component
export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [blogSlug, setBlogSlug] = useState<string | null>(null);
  const [blogCategory, setBlogCategory] = useState<string | null>(null);
  const [isDonationFormOpen, setIsDonationFormOpen] = useState(false);

  const allowedPages = [
    'home',
    'about',
    'contact',
    'thankyou',
    'stories',
    'grants',
    'donate',
    'blog',
    'admin',
    'auth-callback',
    'privacy',
    'terms',
  ];

  // Listen for Supabase auth state changes (magic link login)
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // When user signs in via magic link, redirect to publish page
      if (event === 'SIGNED_IN' && session) {
        window.location.hash = 'publish';
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Handle hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.slice(1);

      // ✅ Redirect old articles routes to blog
      if (rawHash.startsWith('articles')) {
        const newHash = rawHash.replace('articles', 'blog');
        window.location.replace(`#${newHash}`);
        return;
      }

      // ✅ Redirect old publish route to admin/blog
      if (rawHash === 'publish') {
        window.location.replace('#admin/blog');
        return;
      }

      // ✅ Keep full path segments, strip querystring only
      const [hashNoQuery] = rawHash.split('?');
      const parts = hashNoQuery ? hashNoQuery.split('/').filter(Boolean) : [];
      const page = parts[0] || 'home';

      if (allowedPages.includes(page)) {
        setCurrentPage(page);

        // Handle blog routing
        if (page === 'blog') {
          if (parts[1] === 'category' && parts[2]) {
            // #blog/category/news
            setBlogCategory(parts[2]);
            setBlogSlug(null);
          } else if (parts[1]) {
            // #blog/post-slug
            setBlogSlug(parts[1]);
            setBlogCategory(null);
          } else {
            // #blog
            setBlogSlug(null);
            setBlogCategory(null);
          }
        } else if (page === 'admin' && parts[1] === 'blog') {
          // #admin/blog - handled in render
        } else {
          setBlogSlug(null);
          setBlogCategory(null);
        }

        window.scrollTo(0, 0);
      } else {
        // Unknown hash → go home
        setCurrentPage('home');
        setBlogSlug(null);
        setBlogCategory(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // SEO Meta Tags
  useEffect(() => {
    const updateSEO = () => {
      let title =
        'The Wildland Fire Recovery Fund - Helping Wildfire Survivors Rebuild';
      let description =
        'The Wildland Fire Recovery Fund provides emergency assistance, housing support, and resources to wildfire survivors. 501(c)(3) nonprofit committed to rapid emergency response and transparent aid distribution.';
      let keywords =
        'wildfire relief, wildfire survivors, fire disaster relief, emergency housing assistance, wildfire recovery fund, fire victim support, nonprofit wildfire aid';

      // Default: indexable pages
      let robots =
        'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
      let googlebot = 'index, follow';

      switch (currentPage) {
        case 'about':
          title =
            'About Us - The Wildland Fire Recovery Fund | Our Mission & Team';
          description =
            "Learn about The Wildland Fire Recovery Fund's mission to help wildfire survivors rebuild their lives. Meet our team committed to transparent, rapid-response disaster relief.";
          keywords =
            'about wildfire fund, nonprofit mission, fire relief organization, disaster recovery team, wildfire charity about';
          break;

        case 'donate':
          title =
            'Donate Now - Support Wildfire Survivors | Tax-Deductible Donations';
          description =
            'Make a tax-deductible donation to help wildfire survivors. 75% goes directly to families in need. $5M fundraising goal for 2026. Every dollar makes a difference.';
          keywords =
            'donate wildfire relief, tax deductible donation, wildfire charity donation, help fire survivors, disaster relief donation, nonprofit donation';
          break;

        case 'stories':
          title = "Our Vision & Mission - The Stories We'll Help Create";
          description =
            "Discover The Wildland Fire Recovery Fund's vision for wildfire recovery. See how your support will help families rebuild with dignity, hope, and comprehensive assistance.";
          keywords =
            'wildfire recovery vision, fire relief mission, disaster recovery fund, wildfire charity values, nonprofit mission statement';
          break;

        case 'grants':
          title = 'Grants & Resources - Fire Department & Education Grants';
          description =
            'Apply for fire department equipment grants and education grants. Supporting first responders and fire prevention education. Individual survivors receive proactive assistance.';
          keywords =
            'fire department grants, firefighter grants, fire prevention education, emergency grants, wildfire resources';
          break;

        case 'contact':
          title =
            'Contact Us - Get Help or Get Involved | Wildfire Recovery Fund';
          description =
            'Contact The Wildland Fire Recovery Fund for survivor assistance, volunteer opportunities, or partnership inquiries. We respond promptly to all inquiries.';
          keywords =
            'contact wildfire fund, get help wildfire, volunteer wildfire relief, nonprofit contact, disaster relief help';
          break;

        case 'thankyou':
          title = 'Thank You - Your Donation Helps Wildfire Survivors';
          description =
            'Thank you for your generous donation! Your support helps wildfire survivors rebuild their lives with dignity and hope.';
          keywords =
            'thank you donation, wildfire donation confirmation, nonprofit thanks';
          break;

        case 'publish':
          title = 'Publisher Login - The Wildland Fire Recovery Fund';
          description =
            'Internal publishing portal for The Wildland Fire Recovery Fund.';
          keywords = 'publisher, admin, articles';
          // Do NOT index the publish portal
          robots = 'noindex, nofollow';
          googlebot = 'noindex, nofollow';
          break;

        case 'auth-callback':
          title = 'Signing you in… - The Wildland Fire Recovery Fund';
          description =
            'Completing sign-in for the internal publishing portal.';
          // ✅ Do NOT index callback pages
          robots = 'noindex, nofollow';
          googlebot = 'noindex, nofollow';
          break;

        default:
          break;
      }

      document.title = title;

      const updateMeta = (name: string, content: string, isProperty = false) => {
        const attribute = isProperty ? 'property' : 'name';
        let tag = document.querySelector(
          `meta[${attribute}="${name}"]`
        ) as HTMLMetaElement;

        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute(attribute, name);
          document.head.appendChild(tag);
        }

        tag.setAttribute('content', content);
      };

      updateMeta('description', description);
      updateMeta('keywords', keywords);

      // Open Graph tags
      updateMeta('og:title', title, true);
      updateMeta('og:description', description, true);
      updateMeta('og:type', 'website', true);
      updateMeta(
        'og:url',
        `https://www.thewildlandfirerecoveryfund.org/#${currentPage}`,
        true
      );
      updateMeta('og:site_name', 'The Wildland Fire Recovery Fund', true);
      updateMeta('og:locale', 'en_US', true);

      // Twitter Card tags
      updateMeta('twitter:card', 'summary_large_image');
      updateMeta('twitter:title', title);
      updateMeta('twitter:description', description);
      updateMeta('twitter:site', '@wildfirerecovery');

      // Canonical URL
      const canonical =
        (document.querySelector('link[rel="canonical"]') as HTMLLinkElement) ||
        document.createElement('link');
      if (!canonical.rel) {
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = `https://www.thewildlandfirerecoveryfund.org/#${currentPage}`;

      // Language
      document.documentElement.lang = 'en';

      // Additional meta tags for SEO
      updateMeta('author', 'The Wildland Fire Recovery Fund');
      updateMeta('robots', robots);
      updateMeta('googlebot', googlebot);
      updateMeta('theme-color', '#FF9933');
    };

    updateSEO();
  }, [currentPage]);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.location.hash = page;
  };

  const renderPage = () => {
    let pageContent;
    
    switch (currentPage) {
      case 'about':
        pageContent = <AboutPage />;
        break;
      case 'contact':
        pageContent = <ContactPage />;
        break;
      case 'thankyou':
        pageContent = <ThankYouPage onNavigate={handleNavigate} />;
        break;
      case 'stories':
        pageContent = <StoriesPage />;
        break;
      case 'grants':
        pageContent = <GrantsPage />;
        break;
      case 'donate':
        pageContent = <DonatePage />;
        break;
      case 'blog':
        if (blogCategory) {
          pageContent = <BlogCategoryPage categorySlug={blogCategory} />;
        } else if (blogSlug) {
          pageContent = <BlogPostPage slug={blogSlug} />;
        } else {
          pageContent = <BlogIndexPage />;
        }
        break;
      case 'admin':
        pageContent = <BlogEditorPage />;
        break;
      case 'auth-callback':
        pageContent = <AuthCallbackPage />;
        break;
      case 'privacy':
        pageContent = <PrivacyPolicyPage />;
        break;
      case 'terms':
        pageContent = <TermsOfUsePage />;
        break;
      default:
        pageContent = <HomePage />;
        break;
    }

    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }>
        <ErrorBoundary>
          {pageContent}
        </ErrorBoundary>
      </Suspense>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StructuredData />
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="flex-grow" role="main" aria-label="Main content">
        {renderPage()}
      </main>
      <Footer />
      <Suspense fallback={null}>
        <UrgencyTopBanner />
      </Suspense>

      {isDonationFormOpen && (
        <Suspense fallback={null}>
          <DonationForm onClose={() => setIsDonationFormOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}
