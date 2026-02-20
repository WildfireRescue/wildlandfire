import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase.ts";

export default function AuthCallback() {
  const [status, setStatus] = useState("Completing sign-in…");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Exchange ?code=... for a session (PKCE magic link)
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) throw error;

        // Confirm session exists
        const { data } = await supabase.auth.getSession();
        if (!data.session) throw new Error("No session after exchange.");

        if (!cancelled) {
          setStatus("Success. Redirecting…");
          window.location.replace("/blog/editor");
        }
      } catch (e) {
        console.error("[AuthCallback] Failed:", e);
        if (!cancelled) {
          setStatus("Sign-in failed. Please request a new magic link.");
          setTimeout(() => window.location.replace("/blog/editor"), 1200);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h2>Auth Callback</h2>
      <p>{status}</p>
    </div>
  );
}