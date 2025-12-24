import { ImpactHero } from '../components/ImpactHero';
import { ImpactStats } from '../components/ImpactStats';
import { HowWeCreateChange } from '../components/HowWeCreateChange';
import { OurWork } from '../components/OurWork';
import { BeforeAfter } from '../components/BeforeAfter';
import { ImpactStories } from '../components/ImpactStories';
import { About } from '../components/About';
import { FinancialTransparency } from '../components/FinancialTransparency';

export function ImpactPage() {
  return (
    <>
      <ImpactHero />
      <ImpactStats />
      <HowWeCreateChange />
      <OurWork />
      <BeforeAfter />
      <ImpactStories />
      <About />
      <FinancialTransparency />
    </>
  );
}
