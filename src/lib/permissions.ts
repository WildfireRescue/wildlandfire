// =====================================================
// PERMISSION CHECKING UTILITIES
// Clean + No-Hang (ALLOWLIST ONLY)
// =====================================================

import { supabase } from "./supabase";

const ADMIN_EMAILS = [
  "earl@thewildlandfirerecoveryfund.org",
  "jason@thewildlandfirerecoveryfund.org",
  "admin@thewildlandfirerecoveryfund.org",
  "editor@thewildlandfirerecoveryfund.org",
  "reports@goldie.agency",
  "help@goldie.agency",
];

export type PermissionStatus = "no_session" | "allowlist" | "insufficient_role" | "error";

export interface PermissionCheckResult {
  status: PermissionStatus;
  hasAccess: boolean;
  user: { id: string; email: string } | null;
  profile: null; // not used in allowlist-only mode
  message: string;
  technicalDetails?: unknown;
}

function norm(email?: string | null) {
  return (email ?? "").trim().toLowerCase();
}

export function isInAdminAllowlist(email: string | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(norm(email));
}

// Alias for backward compatibility
export function isAdminEmail(email: string | undefined): boolean {
  return isInAdminAllowlist(email);
}

export async function checkEditorPermissions(): Promise<PermissionCheckResult> {
  try {
    // Local / instant session read (no network)
    // Add timeout guard just in case
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Session check timeout')), 3000)
    );
    
    const { data } = await Promise.race([
      sessionPromise,
      timeoutPromise
    ]) as Awaited<ReturnType<typeof supabase.auth.getSession>>;
    const session = data.session;

    if (!session?.user?.email) {
      return {
        status: "no_session",
        hasAccess: false,
        user: null,
        profile: null,
        message: "Please sign in to access the editor.",
      };
    }

    const email = norm(session.user.email);
    const user = { id: session.user.id, email };

    // ✅ Only gate: allowlist
    if (isInAdminAllowlist(email)) {
      return {
        status: "allowlist",
        hasAccess: true,
        user,
        profile: null,
        message: "Access granted via allowlist.",
      };
    }

    return {
      status: "insufficient_role",
      hasAccess: false,
      user,
      profile: null,
      message: `Access denied. ${email} is not on the editor allowlist.`,
      technicalDetails: { allowlist: ADMIN_EMAILS },
    };
  } catch (e) {
    return {
      status: "error",
      hasAccess: false,
      user: null,
      profile: null,
      message: "Permission check failed.",
      technicalDetails: e,
    };
  }
}

export async function hasEditorAccess(): Promise<boolean> {
  const r = await checkEditorPermissions();
  return r.hasAccess;
}

export function getPermissionInstructions(result: PermissionCheckResult): string[] {
  if (result.status === "no_session") {
    return ["Enter your email to receive a magic link."];
  }
  if (result.status === "insufficient_role") {
    return [
      "Your email is not allowlisted for the editor.",
      "Add your email to ADMIN_EMAILS in src/lib/permissions.ts and redeploy.",
    ];
  }
  if (result.status === "error") {
    return ["Check the browser console for technical details."];
  }
  return [];
}