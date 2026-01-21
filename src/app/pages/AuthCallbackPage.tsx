import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase.ts';

export function AuthCallbackPage() {
  const [msg, setMsg] = useState('Completing sign-in…');

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        console.log('[AuthCallback] Processing auth callback...');
        
        // ✅ This consumes the link URL and writes the session into storage.
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        
        if (error) {
          console.error('[AuthCallback] Exchange code error:', error);
          throw error;
        }

        if (!isMounted) return;

        // Verify session was created
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          console.error('[AuthCallback] No session after exchange');
          throw new Error('No session created. Check Redirect URLs + storage/cookies.');
        }
        
        console.log('[AuthCallback] Session created successfully:', {
          email: data.session.user.email,
          userId: data.session.user.id,
        });

        setMsg('Signed in! Sending you to the blog editor…');

        // ✅ Redirect directly to admin/blog (not publish) to avoid redirect loop
        // Use replace so callback URL doesn't stay in history
        setTimeout(() => {
          window.location.replace(`${window.location.origin}/#admin/blog`);
        }, 500);
      } catch (e: any) {
        if (!isMounted) return;
        console.error('[AuthCallback] Error:', e);
        setMsg(`Sign-in failed: ${e?.message ?? 'Unknown error'}`);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 40 }}>
      <h1>Signing you in…</h1>
      <p style={{ opacity: 0.8 }}>{msg}</p>
    </div>
  );
}
