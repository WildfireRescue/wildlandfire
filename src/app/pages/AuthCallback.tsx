import { useEffect } from "react";

export default function AuthCallback() {
  useEffect(() => {
    console.log("[AuthCallback] PKCE session should already be handled by Supabase");

    // Small delay so Supabase finishes saving session
    setTimeout(() => {
      window.location.replace("/blog/editor");
    }, 500);
  }, []);

  return (
    <div style={{ padding: 40, textAlign: "center", fontFamily: "system-ui" }}>
      <h2>Signing you in…</h2>
      <p>Redirecting to editor…</p>
    </div>
  );
}