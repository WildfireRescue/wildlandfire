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
      console.log('[HomePage] Auth code detected in URL, redirecting to editor...');
      console.log('[HomePage] Current URL:', window.location.href);
      // Redirect to editor with the code still in the URL
      // The editor will handle the code exchange
      window.location.replace(window.location.origin + '/#blog/editor');
      return; // Stop rendering homepage
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