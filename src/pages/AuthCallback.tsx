import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const [status, setStatus] = useState("Completing sign-in…");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // With detectSessionInUrl:true, this may already be handled,
        // but calling exchangeCodeForSession makes it deterministic.
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) throw error;

        // Optional: confirm session exists before redirect
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
          // Optional: bounce to editor login page after a moment
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