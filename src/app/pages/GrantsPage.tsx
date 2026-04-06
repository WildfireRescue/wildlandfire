import { SEOHead } from '../components/SEOHead';
import { GrantsHero } from '../components/GrantsHero';
import { GrantForms } from '../components/GrantForms';

export function GrantsPage() {
  return (
    <>
      <SEOHead
        title="Wildfire Relief Grants for Survivors | The Wildland Fire Recovery Fund"
        description="Apply for emergency wildfire relief grants. The Wildland Fire Recovery Fund provides financial assistance grants to families and firefighters displaced or impacted by wildfires."
        url="https://www.thewildlandfirerecoveryfund.org/grants"
      />
      <GrantsHero />
      <GrantForms />
    </>
  );
}