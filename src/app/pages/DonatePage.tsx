import { DonateHero } from "../components/DonateHero";
import { FundraisingGoal } from "../components/FundraisingGoal";
import { EmotionalMicroCopy } from "../components/EmotionalMicroCopy";
import { HowYourDonationHelps } from "../components/HowYourDonationHelps";
import { DonationCalculator } from "../components/DonationCalculator";
import { WaysToGive } from "../components/WaysToGive";
import { DonationCTA } from "../components/DonationCTA";
import { TrustBadges } from "../components/TrustBadges";
import { PremiumTrustBadges } from "../components/PremiumTrustBadges";

export function DonatePage() {
  return (
    <section id="donate">
      <DonateHero />
      <PremiumTrustBadges />

      {/* Outcomes early (why donate) */}
      <HowYourDonationHelps />

      {/* Social proof */}
      <FundraisingGoal />

      {/* Mid-page ask */}
      <DonationCTA />

      {/* Story for warm donors */}
      <EmotionalMicroCopy />

      {/* Tools + options */}
      <DonationCalculator />
      <WaysToGive />

      {/* Final close */}
      <DonationCTA />
      <TrustBadges />
    </section>
  );
}
