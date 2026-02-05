import { useEffect } from 'react';
import { Hero } from '../components/Hero';
import { DonationImpactCards } from '../components/DonationImpactCards';
import { WhyGiveSection } from '../components/WhyGiveSection';
import { ImpactStats } from '../components/ImpactStats';
import { FinalUrgencyCTA } from '../components/FinalUrgencyCTA';
import { TrustIndicators } from '../components/TrustIndicators';
import { FloatingProgressIndicator } from '../components/FloatingProgressIndicator';
// import { LiveDonationNotifications } from '../components/LiveDonationNotifications';

export function HomePage() {
  useEffect(() => {
    // Check if this is an auth callback with a code in the URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    
    if (code) {
      console.log('[HomePage] Auth code detected, redirecting to editor...');
      // Redirect to editor - the code stays in the URL for the auth exchange
      window.location.href = '/#blog/editor';
    }
  }, []);

  return (
    <>
      <Hero />
      <DonationImpactCards />
      <WhyGiveSection />
      <ImpactStats />
      <FinalUrgencyCTA />
      <TrustIndicators />
      
      {/* Floating/Sticky Elements */}
      <FloatingProgressIndicator />
      {/* <LiveDonationNotifications /> */}
    </>
  );
}