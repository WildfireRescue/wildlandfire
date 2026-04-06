import { SEOHead } from '../components/SEOHead';
import { AboutHero } from '../components/AboutHero';
import { WhoWeAre } from '../components/WhoWeAre';
import { WhatWeDo } from '../components/WhatWeDo';
import { AboutKendra } from '../components/AboutKendra';

export function AboutPage() {
  return (
    <>
      <SEOHead
        title="About The Wildland Fire Recovery Fund | Nonprofit Wildfire Relief"
        description="Learn about The Wildland Fire Recovery Fund, an independent 501(c)(3) nonprofit providing direct financial relief to wildfire survivors, displaced families, and firefighters."
        url="https://www.thewildlandfirerecoveryfund.org/about"
      />
      <AboutHero />

      {/* Disambiguation / Identity Clarifier */}
      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <p className="text-base text-muted-foreground leading-relaxed">
          The Wildland Fire Recovery Fund is an independent nonprofit organization
          and is not affiliated with the California Community Foundation or other
          similarly named wildfire funds.
        </p>
      </section>

      <WhoWeAre />
      <WhatWeDo />
      <AboutKendra />
    </>
  );
}
