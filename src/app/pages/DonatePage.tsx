import { DonateHero } from "../components/DonateHero";
import { HowYourDonationHelps } from "../components/HowYourDonationHelps";
import { DonationCTA } from "../components/DonationCTA";
import { TrustBadges } from "../components/TrustBadges";
import { PremiumTrustBadges } from "../components/PremiumTrustBadges";

export function DonatePage() {
  return (
    <section id="donate">
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