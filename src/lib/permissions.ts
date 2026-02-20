// =====================================================
// PERMISSION CHECKING UTILITIES
// Fast + reliable permission checking (no hanging)
// =====================================================

import { supabase } from "./supabase";
import type { UserProfile } from "./blogTypes";

// Admin allowlist - must match the list in migration files
const ADMIN_EMAILS = [
  "earl@thewildlandfirerecoveryfund.org",
  "jason@thewildlandfirerecoveryfund.org",
  "admin@thewildlandfirerecoveryfund.org",
  "editor@thewildlandfirerecoveryfund.org",
  "reports@goldie.agency",
  "help@goldie.agency",
];

export type PermissionStatus =
  | "loading"
  | "no_session"
  | "no_profile"
  | "insufficient_role"
  | "editor"
  | "admin"
  | "allowlist"
  | "error";

export interface PermissionCheckResult {
  status: PermissionStatus;
  hasAccess: boolean;
  user: { id: string; email: string } | null;
  profile: UserProfile | null;
  message: string;
  technicalDetails?: unknown;
}

/** Normalize email */
function norm(email?: string | null) {
  return (email ?? "").trim().toLowerCase();
}

/** Check if an email is in the admin allowlist */
export function isInAdminAllowlist(email: string | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(norm(email));
}

/** Promise timeout helper (RESOLVES fallback; never throws) */
async function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(fallback), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Comprehensive permission check for editor access
 *
 * ✅ Uses getSession() (instant/local) instead of getUser() (network/hangs)
 * ✅ Allowlist check happens immediately (no DB needed)
 * ✅ Profile fetch has a real timeout and returns a safe error object (no throws)
 */
export async function checkEditorPermissions(): Promise<PermissionCheckResult> {
  // 1) Get session locally (fast)
  const { data } = await supabase.auth.getSession();
  const session = data.session;

  if (!session?.user?.email) {
    return {
      status: "no_session",
      hasAccess: false,
      user: null,
      profile: null,
      message: "Please sign in to access the editor.",
      technicalDetails: { note: "No session in storage" },
    };
  }

  const userId = session.user.id;
  const email = norm(session.user.email);

  // 2) Allowlist = immediate access (no DB call)
  if (isInAdminAllowlist(email)) {
    return {
      status: "allowlist",
      hasAccess: true,
      user: { id: userId, email },
      profile: null,
      message: "Access granted via admin allowlist.",
    };
  }

  // 3) Fetch profile with a real timeout (8s)
  const fallback: { profile: UserProfile | null; error: { code: string; message: string } } = {
    profile: null,
    error: { code: "TIMEOUT", message: "Profile lookup timed out" },
  };

  const profRes = await withTimeout(
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data, error }) => ({ profile: data as UserProfile | null, error })),
    8000,
    fallback as any
  );

  // Timed out
  if ((profRes as any).error?.code === "TIMEOUT") {
    return {
      status: "error",
      hasAccess: false,
      user: { id: userId, email },
      profile: null,
      message:
        "You are signed in, but permissions lookup timed out. This is usually an RLS policy issue on the profiles table.",
      technicalDetails: (profRes as any).error,
    };
  }

  // DB error (RLS / permissions / etc.)
  if ((profRes as any).error) {
    return {
      status: "error",
      hasAccess: false,
      user: { id: userId, email },
      profile: null,
      message:
        "Database error checking permissions. This is usually an RLS policy issue on the profiles table.",
      technicalDetails: (profRes as any).error,
    };
  }

  const profile = (profRes as any).profile as UserProfile | null;

  // No profile row
  if (!profile) {
    return {
      status: "no_profile",
      hasAccess: false,
      user: { id: userId, email },
      profile: null,
      message: "No profile found. Please contact an administrator to set up your account.",
      technicalDetails: { note: "profiles row missing for this user id" },
    };
  }

  // 4) Role check
  const role = (profile as any).role;

  if (role === "admin") {
    return {
      status: "admin",
      hasAccess: true,
      user: { id: userId, email },
      profile,
      message: "Full admin access granted.",
    };
  }

  if (role === "editor") {
    return {
      status: "editor",
      hasAccess: true,
      user: { id: userId, email },
      profile,
      message: "Editor access granted.",
    };
  }

  return {
    status: "insufficient_role",
    hasAccess: false,
    user: { id: userId, email },
    profile,
    message: `Access denied. Your role is "${role}" but you need "editor" or "admin".`,
    technicalDetails: { currentRole: role, requiredRoles: ["editor", "admin"] },
  };
}

/** Quick check if user has editor access (simplified) */
export async function hasEditorAccess(): Promise<boolean> {
  const result = await checkEditorPermissions();
  return result.hasAccess;
}

/** Get user-friendly error message for permission status */
export function getPermissionErrorMessage(status: PermissionStatus): string {
  switch (status) {
    case "no_session":
      return "Please sign in to access the blog editor.";
    case "no_profile":
      return "Your account is not set up yet. Please contact an administrator to create your profile.";
    case "insufficient_role":
      return "You don't have permission to access the blog editor. Please contact an administrator to upgrade your role.";
    case "error":
      return "An error occurred while checking permissions. Please try again or contact support.";
    default:
      return "Access denied.";
  }
}

/** Get instructions for resolving permission issues */
export function getPermissionInstructions(result: PermissionCheckResult): string[] {
  const instructions: string[] = [];

  switch (result.status) {
    case "no_session":
      instructions.push("Enter your email address below to receive a login link.");
      break;

    case "no_profile":
      instructions.push("Your user account exists but no profile has been created.");
      instructions.push("An administrator can run this SQL command:");
      instructions.push(
        `INSERT INTO profiles (id, email, role) VALUES ('${result.user?.id}', '${result.user?.email}', 'editor');`
      );
      instructions.push("Or add your email to the admin allowlist in the code.");
      break;

    case "insufficient_role":
      instructions.push(`Your current role: ${result.profile?.role}`);
      instructions.push("An administrator can run this SQL command:");
      instructions.push(`UPDATE profiles SET role = 'editor' WHERE id = '${result.user?.id}';`);
      break;

    case "error":
      instructions.push("If this persists, check:");
      instructions.push("1. RLS policies on profiles table");
      instructions.push("2. profiles table exists and has expected columns");
      instructions.push("3. Browser console for detailed errors");
      break;
  }

  return instructions;
}