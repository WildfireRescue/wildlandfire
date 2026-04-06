import { SEOHead } from '../components/SEOHead';
import { DonateHero } from "../components/DonateHero";
import { HowYourDonationHelps } from "../components/HowYourDonationHelps";
import { DonationCTA } from "../components/DonationCTA";
import { TrustBadges } from "../components/TrustBadges";
import { PremiumTrustBadges } from "../components/PremiumTrustBadges";

export function DonatePage() {
  return (
    <section id="donate">
      <SEOHead
        title="Make a Wildfire Relief Donation | The Wildland Fire Recovery Fund"
        description="Donate to support wildfire survivors. Your tax-deductible gift provides emergency housing, living expenses, and long-term recovery aid to families and firefighters affected by wildfires."
        url="https://www.thewildlandfirerecoveryfund.org/donate"
      />
      <DonateHero />
      <PremiumTrustBadges />

      {/* Outcomes and 2026 Vision */}
      <HowYourDonationHelps />

      {/* Mid-page ask */}
      <DonationCTA />

      {/* Final close */}
      <TrustBadges />
    </section>
  );
}