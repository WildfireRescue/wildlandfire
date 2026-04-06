import { useEffect, lazy, Suspense } from 'react';
import { Hero } from '../components/Hero';

// Below-fold sections: lazy-loaded so they don't block the initial JS parse
// or delay the LCP hero image. Each section loads independently after hydration.
const DonationImpactCards = lazy(() =>
  import('../components/DonationImpactCards').then((m) => ({ default: m.DonationImpactCards }))
);
const WhyGiveSection = lazy(() =>
  import('../components/WhyGiveSection').then((m) => ({ default: m.WhyGiveSection }))
);
const ImpactStats = lazy(() =>
  import('../components/ImpactStats').then((m) => ({ default: m.ImpactStats }))
);
const FinalUrgencyCTA = lazy(() =>
  import('../components/FinalUrgencyCTA').then((m) => ({ default: m.FinalUrgencyCTA }))
);
const TrustIndicators = lazy(() =>
  import('../components/TrustIndicators').then((m) => ({ default: m.TrustIndicators }))
);
const FloatingProgressIndicator = lazy(() =>
  import('../components/FloatingProgressIndicator').then((m) => ({
    default: m.FloatingProgressIndicator,
  }))
);

export function HomePage() {
  useEffect(() => {
    // Check if this is an auth callback with a code in the URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    
    if (code) {
      // Redirect to editor with the code still in the URL for exchange
      window.location.replace(window.location.origin + '/#blog/editor');
      return; // Stop rendering homepage
    }
  }, []);

  return (
    <>
      <Hero />
      {/* Below-fold: rendered lazily — does not block LCP or initial paint */}
      <Suspense fallback={null}>
        <DonationImpactCards />
        <WhyGiveSection />
        <ImpactStats />
        <FinalUrgencyCTA />
        <TrustIndicators />
      </Suspense>

      {/* Floating/Sticky Elements */}
      <Suspense fallback={null}>
        <FloatingProgressIndicator />
      </Suspense>
    </>
  );
}