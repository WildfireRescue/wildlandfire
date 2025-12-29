import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export function AuthCallbackPage() {
  const [msg, setMsg] = useState('Completing sign-in…');

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        // ✅ This consumes the link URL and writes the session into storage.
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) throw error;

        if (!isMounted) return;

        // Optional: sanity check that a session exists
        const { data } = await supabase.auth.getSession();
        if (!data.session) throw new Error('No session created. Check Redirect URLs + storage/cookies.');

        setMsg('Signed in! Sending you to the publisher…');

        // ✅ Use replace so the callback URL doesn’t stay in history
        window.location.replace(`${window.location.origin}/#publish`);
      } catch (e: any) {
        if (!isMounted) return;
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