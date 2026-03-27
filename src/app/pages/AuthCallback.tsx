import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AuthCallback() {
  const [status, setStatus] = useState("Completing sign-in…");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        console.log("[AuthCallback] Starting PKCE session exchange...");
        console.log("[AuthCallback] Current URL:", window.location.href);

        // Try explicit code exchange first.
        // If detectSessionInUrl already consumed the code, this may error —
        // that's OK, we fall through to check if a session exists anyway.
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(
            window.location.href
          );
          if (error) {
            console.warn("[AuthCallback] exchangeCodeForSession error (may be already consumed):", error.message);
          }
        } catch (exchangeErr) {
          console.warn("[AuthCallback] exchangeCodeForSession threw (may be already consumed):", exchangeErr);
        }

        // Give detectSessionInUrl a moment to finish if it's handling the exchange
        // (the Supabase client auto-detects URL params on init)
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Check if we have a session (either from our explicit exchange or detectSessionInUrl)
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          throw new Error("No session found after auth callback. The magic link may have expired.");
        }

        console.log("[AuthCallback] Session established for:", data.session.user?.email);

        if (!cancelled) {
          setStatus("Success! Redirecting to editor…");
          window.location.replace("/blog/editor");
        }
      } catch (e: any) {
        console.error("[AuthCallback] Failed:", e);
        if (!cancelled) {
          setStatus(
            "Sign-in failed. The magic link may have expired — please request a new one."
          );
          // Redirect to editor login after a brief delay so user can read the message
          setTimeout(() => window.location.replace("/blog/editor"), 3000);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ padding: 40, textAlign: "center", fontFamily: "system-ui" }}>
      <h2>Signing you in…</h2>
      <p>{status}</p>
    </div>
  );
}
