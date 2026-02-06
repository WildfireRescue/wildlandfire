import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase.ts';

export function AuthCallbackPage() {
  const [msg, setMsg] = useState('Completing sign-in…');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        console.log('[AuthCallback] Processing auth callback...');
        console.log('[AuthCallback] Full URL:', window.location.href);
        console.log('[AuthCallback] Query string:', window.location.search);
        console.log('[AuthCallback] Hash:', window.location.hash);
        
        // Check if we have the required code parameter
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const error = params.get('error');
        const errorDescription = params.get('error_description');
        
        if (error) {
          console.error('[AuthCallback] Error in URL:', error, errorDescription);
          throw new Error(errorDescription || error);
        }
        
        if (!code) {
          console.error('[AuthCallback] No auth code in URL');
          throw new Error('No authentication code found. The magic link may be invalid or expired.');
        }
        
        console.log('[AuthCallback] Auth code found, exchanging for session...');
        
        // ✅ This consumes the link URL and writes the session into storage.
        // The URL contains the auth code in query parameters
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);
        
        if (exchangeError) {
          console.error('[AuthCallback] Exchange code error:', exchangeError);
          throw exchangeError;
        }

        if (!isMounted) return;

        // Give Supabase a moment to settle the session
        await new Promise(resolve => setTimeout(resolve, 200));

        if (!isMounted) return;

        // Verify session was created
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          console.error('[AuthCallback] No session after exchange');
          throw new Error('Failed to create session. Please check that cookies are enabled and try again.');
        }
        
        console.log('[AuthCallback] Session created successfully:', {
          email: data.session.user.email,
          userId: data.session.user.id,
        });

        if (!isMounted) return;

        setMsg('✅ Signed in successfully! Redirecting to blog editor...');

        // ✅ Redirect directly to blog/editor using path-based routing (React Router)
        // Use replace so callback URL doesn't stay in history
        // Use a longer delay to ensure session is fully persisted
        setTimeout(() => {
          window.location.replace(`${window.location.origin}/blog/editor`);
        }, 1000);
      } catch (e: any) {
        if (!isMounted) return;
        console.error('[AuthCallback] Error:', e);
        
        // Provide detailed error information
        let errorMsg = 'Sign-in failed';
        let details = e?.message || 'Unknown error';
        
        if (e?.message?.includes('expired')) {
          errorMsg = 'Magic link expired';
          details = 'This link has expired. Please request a new magic link.';
        } else if (e?.message?.includes('invalid')) {
          errorMsg = 'Invalid link';
          details = 'This magic link is invalid. Please request a new one.';
        } else if (e?.message?.includes('redirect')) {
          errorMsg = 'Configuration error';
          details = 'The redirect URL is not configured correctly. Please contact support.';
        }
        
        setMsg(`❌ ${errorMsg}`);
        setErrorDetails(details);
        
        // Fallback: redirect to editor login page after showing error
        setTimeout(() => {
          if (isMounted) {
            window.location.replace(`${window.location.origin}/blog/editor`);
          }
        }, 5000);
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
      {errorDetails && (
        <div style={{ 
          marginTop: 20, 
          padding: 16, 
          background: '#fee', 
          border: '1px solid #fcc',
          borderRadius: 8 
        }}>
          <p style={{ margin: 0, fontSize: 14, color: '#c00' }}>{errorDetails}</p>
          <p style={{ margin: '8px 0 0 0', fontSize: 12, color: '#666' }}>
            Redirecting to login page in 5 seconds...
          </p>
        </div>
      )}
    </div>
  );
}
