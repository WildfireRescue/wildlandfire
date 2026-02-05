import { Hero } from '../components/Hero';
import { DonationImpactCards } from '../components/DonationImpactCards';
import { WhyGiveSection } from '../components/WhyGiveSection';
import { ImpactStats } from '../components/ImpactStats';
import { FinalUrgencyCTA } from '../components/FinalUrgencyCTA';
import { TrustIndicators } from '../components/TrustIndicators';
import { FloatingProgressIndicator } from '../components/FloatingProgressIndicator';
// import { LiveDonationNotifications } from '../components/LiveDonationNotifications';

export function HomePage() {
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