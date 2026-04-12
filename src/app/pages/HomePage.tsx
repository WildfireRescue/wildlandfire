import { useEffect, lazy, Suspense } from 'react';
import { Hero } from '../components/Hero';
import { TrustBar } from '../components/TrustBar';
import { SEOHead } from '../components/SEOHead';

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
const HomeFAQ = lazy(() =>
  import('../components/HomeFAQ').then((m) => ({ default: m.HomeFAQ }))
);
const HomeFinalCTA = lazy(() =>
  import('../components/HomeFinalCTA').then((m) => ({ default: m.HomeFinalCTA }))
);
const TrustIndicators = lazy(() =>
  import('../components/TrustIndicators').then((m) => ({ default: m.TrustIndicators }))
);
const DonateControls = lazy(() =>
  import('../components/DonateControls').then((m) => ({ default: m.DonateControls }))
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
      <SEOHead
        title="Wildfire Relief Donations for Long-Term Recovery | The Wildland Fire Recovery Fund"
        description="Support wildfire relief donations to help families rebuild. The Wildland Fire Recovery Fund provides long-term wildfire recovery aid to displaced families and firefighters. 501(c)(3) nonprofit."
        url="https://thewildlandfirerecoveryfund.org/"
      />
      {/* 1 — Hero: LCP-optimised, above the fold, H1 with primary keyword */}
      <Hero />

      {/* 2 — TrustBar: immediate credibility (501c3, tax-deductible, etc.) */}
      <TrustBar />

      {/* Below-fold: rendered lazily — does not block LCP or initial paint */}
      <Suspense fallback={null}>
        {/* 3 — Inline donate widget: real functional Stripe checkout */}
        <section className="py-12 bg-primary/5 border-y border-primary/20">
          <div className="container mx-auto px-4 max-w-xl text-center">
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">Make a Donation</p>
            <h2 className="text-2xl font-bold mb-6">Support Wildfire Survivors Today</h2>
            <DonateControls defaultAmount={50} defaultMonthly={true} />
          </div>
        </section>

        {/* 4 — 3 Program Pillars */}
        <DonationImpactCards />

        {/* 5 — Why Donate / Impact outcomes */}
        <WhyGiveSection />

        {/* 6 — Our Commitment / Rapid Response / Promise */}
        <ImpactStats />

        {/* 7 — Urgency CTA (mid-page conversion) */}
        <FinalUrgencyCTA />

        {/* 8 — FAQ with JSON-LD schema */}
        <HomeFAQ />

        {/* 9 — Final conversion CTA */}
        <HomeFinalCTA />

        {/* 10 — Partners / Trust Indicators */}
        <TrustIndicators />
      </Suspense>
    </>
  );
}