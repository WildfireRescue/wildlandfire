/**
 * HomeFinalCTA.tsx — bottom-of-page conversion section
 * "Support Wildfire Recovery Today"
 */
import { Heart } from 'lucide-react';

export function HomeFinalCTA() {
  return (
    <section
      id="support-today"
      className="py-20 bg-gradient-to-b from-primary/10 to-background"
      aria-labelledby="final-cta-heading"
    >
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <p className="text-sm tracking-widest uppercase text-primary mb-4">
          Support Wildfire Recovery Today
        </p>

        <h2
          id="final-cta-heading"
          className="text-4xl md:text-5xl mb-6 leading-tight"
        >
          Help Communities Rise from the Ashes
        </h2>

        <p className="text-lg text-muted-foreground mb-5 max-w-2xl mx-auto leading-relaxed">
          The Wildland Fire Recovery Fund stands ready to help families, firefighters, and
          communities affected by devastating wildfires. With your support through wildfire
          relief donations, we provide emergency assistance, rebuild homes, and bring hope to
          those who have lost everything.
        </p>

        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          Wildfire recovery is a long journey, and no one should walk it alone. When you give,
          you join thousands of caring people committed to making a real difference.
        </p>

        <a
          href="/donate"
          className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-10 py-5 rounded-full text-lg hover:bg-primary/90 transition-colors"
        >
          <Heart size={22} aria-hidden="true" />
          Make Your Wildfire Relief Donation
        </a>

        <p className="mt-6 text-sm text-muted-foreground">
          💳 Secure &nbsp;|&nbsp; 🔒 100% Tax-Deductible &nbsp;|&nbsp; ⚡ Rapidly Deployed
        </p>
      </div>
    </section>
  );
}
