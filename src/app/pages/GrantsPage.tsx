import { GrantsHero } from '../components/GrantsHero';
import { GrantForms } from '../components/GrantForms';

export function GrantsPage() {
  return (
    <div className="min-h-screen bg-background">
      <GrantsHero />
      <GrantForms />
    </div>
  );
}