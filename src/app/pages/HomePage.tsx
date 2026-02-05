import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.ts';
import { Hero } from '../components/Hero';
import { DonationImpactCards } from '../components/DonationImpactCards';
import { WhyGiveSection } from '../components/WhyGiveSection';
import { ImpactStats } from '../components/ImpactStats';
import { FinalUrgencyCTA } from '../components/FinalUrgencyCTA';
import { TrustIndicators } from '../components/TrustIndicators';
import { FloatingProgressIndicator } from '../components/FloatingProgressIndicator';
// import { LiveDonationNotifications } from '../components/LiveDonationNotifications';

export function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if this is an auth callback with a code in the URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const hash = window.location.hash;
    
    if (code && (hash === '#auth-callback' || hash === '#blog/editor')) {
      console.log('[HomePage] Detected auth callback, processing code...');
      
      (async () => {
        try {
          // Exchange the code for a session
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          
          if (error) {
            console.error('[HomePage] Auth error:', error);
            return;
          }
          
          console.log('[HomePage] Auth successful, redirecting to editor...');
          
          // Give session a moment to settle
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Redirect to editor
          navigate('/#blog/editor');
          window.location.hash = '#blog/editor';
        } catch (e) {
          console.error('[HomePage] Auth processing error:', e);
        }
      })();
    }
  }, [navigate]);

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