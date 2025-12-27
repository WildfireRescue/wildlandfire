import { useState, useEffect } from 'react';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { StoriesPage } from './pages/StoriesPage';
import { GrantsPage } from './pages/GrantsPage';
import { DonatePage } from './pages/DonatePage';
import { ThankYouPage } from './pages/ThankYouPage';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { DonationForm } from './components/DonationForm';
import { StructuredData } from './components/StructuredData';
import { UrgencyTopBanner } from './components/UrgencyTopBanner';

// Wildland Fire Recovery Fund - Main Application Component
export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isDonationFormOpen, setIsDonationFormOpen] = useState(false);

  // Handle hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.slice(1);
      // Support hash values with query params, e.g. '#thankyou?session_id=...'
      const page = rawHash ? rawHash.split(/[?#/]/)[0] : '';
      if (page && ['home', 'about', 'contact', 'thankyou', 'stories', 'grants', 'donate', 'articles'].includes(page)) {
        setCurrentPage(page);
        window.scrollTo(0, 0);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // SEO Meta Tags
  useEffect(() => {
    const updateSEO = () => {
      let title = 'The Wildland Fire Recovery Fund - Helping Wildfire Survivors Rebuild';
      let description = 'The Wildland Fire Recovery Fund provides emergency assistance, housing support, and resources to wildfire survivors. 501(c)(3) nonprofit committed to rapid emergency response and transparent aid distribution.';
      let keywords = 'wildfire relief, wildfire survivors, fire disaster relief, emergency housing assistance, wildfire recovery fund, fire victim support, nonprofit wildfire aid';

      switch (currentPage) {
        case 'about':
          title = 'About Us - The Wildland Fire Recovery Fund | Our Mission & Team';
          description = 'Learn about The Wildland Fire Recovery Fund\'s mission to help wildfire survivors rebuild their lives. Meet our team committed to transparent, rapid-response disaster relief.';
          keywords = 'about wildfire fund, nonprofit mission, fire relief organization, disaster recovery team, wildfire charity about';
          break;
        case 'donate':
          title = 'Donate Now - Support Wildfire Survivors | Tax-Deductible Donations';
          description = 'Make a tax-deductible donation to help wildfire survivors. 75% goes directly to families in need. $5M fundraising goal for 2026. Every dollar makes a difference.';
          keywords = 'donate wildfire relief, tax deductible donation, wildfire charity donation, help fire survivors, disaster relief donation, nonprofit donation';
          break;
        case 'stories':
          title = 'Our Vision & Mission - The Stories We\'ll Help Create';
          description = 'Discover The Wildland Fire Recovery Fund\'s vision for wildfire recovery. See how your support will help families rebuild with dignity, hope, and comprehensive assistance.';
          keywords = 'wildfire recovery vision, fire relief mission, disaster recovery fund, wildfire charity values, nonprofit mission statement';
          break;
        case 'grants':
          title = 'Grants & Resources - Fire Department & Education Grants';
          description = 'Apply for fire department equipment grants and education grants. Supporting first responders and fire prevention education. Individual survivors receive proactive assistance.';
          keywords = 'fire department grants, firefighter grants, fire prevention education, emergency grants, wildfire resources';
          break;
        case 'contact':
          title = 'Contact Us - Get Help or Get Involved | Wildfire Recovery Fund';
          description = 'Contact The Wildland Fire Recovery Fund for survivor assistance, volunteer opportunities, or partnership inquiries. We respond promptly to all inquiries.';
          keywords = 'contact wildfire fund, get help wildfire, volunteer wildfire relief, nonprofit contact, disaster relief help';
          break;
        case 'thankyou':
          title = 'Thank You - Your Donation Helps Wildfire Survivors';
          description = 'Thank you for your generous donation! Your support helps wildfire survivors rebuild their lives with dignity and hope.';
          keywords = 'thank you donation, wildfire donation confirmation, nonprofit thanks';
          break;
      }

      document.title = title;

      const updateMeta = (name: string, content: string, isProperty = false) => {
        const attribute = isProperty ? 'property' : 'name';
        let tag = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
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
      updateMeta('og:url', `https://wildlandfirerecoveryfund.org/#${currentPage}`, true);
      updateMeta('og:site_name', 'The Wildland Fire Recovery Fund', true);
      updateMeta('og:locale', 'en_US', true);
      
      // Twitter Card tags
      updateMeta('twitter:card', 'summary_large_image');
      updateMeta('twitter:title', title);
      updateMeta('twitter:description', description);
      updateMeta('twitter:site', '@wildfirerecovery');
      
      // Canonical URL
      const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement || document.createElement('link');
      if (!canonical.rel) {
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = `https://wildlandfirerecoveryfund.org/#${currentPage}`;
      
      // Language
      document.documentElement.lang = 'en';
      
      // Additional meta tags for SEO
      updateMeta('author', 'The Wildland Fire Recovery Fund');
      updateMeta('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
      updateMeta('googlebot', 'index, follow');
      updateMeta('theme-color', '#FF9933');
    };

    updateSEO();
  }, [currentPage]);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.location.hash = page;
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'thankyou':
        return <ThankYouPage onNavigate={handleNavigate} />;
      case 'stories':
        return <StoriesPage />;
      case 'grants':
        return <GrantsPage />;
      case 'donate':
        return <DonatePage />;
      case 'articles':
        return <ArticlesPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StructuredData />
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="flex-grow" role="main" aria-label="Main content">
        {renderPage()}
      </main>
      <Footer />
      
      {isDonationFormOpen && <DonationForm onClose={() => setIsDonationFormOpen(false)} />}
      <UrgencyTopBanner />
    </div>
  );
}