// =====================================================
// PERMISSION CHECKING UTILITIES
// Robust permission checking with detailed error states
// =====================================================

import { supabase } from './supabase';
import type { UserProfile } from './blogTypes';

// Admin allowlist - must match the list in migration files
const ADMIN_EMAILS = [
  'earl@thewildlandfirerecoveryfund.org',
  'jason@thewildlandfirerecoveryfund.org',
  'admin@thewildlandfirerecoveryfund.org',
  'editor@thewildlandfirerecoveryfund.org'
];

export type PermissionStatus = 
  | 'loading'
  | 'no_session'        // Not logged in
  | 'no_profile'        // Logged in but no profile exists
  | 'insufficient_role' // Profile exists but role is 'user'
  | 'editor'            // Has editor role
  | 'admin'             // Has admin role
  | 'allowlist'         // Email in admin allowlist (fallback)
  | 'error';            // An error occurred

export interface PermissionCheckResult {
  status: PermissionStatus;
  hasAccess: boolean;
  user: {
    id: string;
    email: string;
  } | null;
  profile: UserProfile | null;
  message: string;
  technicalDetails?: any;
}

/**
 * Check if an email is in the admin allowlist
 */
export function isInAdminAllowlist(email: string | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Comprehensive permission check for editor access
 * Returns detailed status information for better UI feedback
 */
export async function checkEditorPermissions(): Promise<PermissionCheckResult> {
  try {
    // Step 1: Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('[checkEditorPermissions] Auth error:', authError);
      
      // Any auth error should default to showing login page (no_session)
      // This includes session missing, abort errors, and network issues
      // Better to let them log in than show error page
      return {
        status: 'no_session',
        hasAccess: false,
        user: null,
        profile: null,
        message: 'Please sign in to access the editor.',
        technicalDetails: { authError }
      };
    }

    if (!user || !user.email) {
      return {
        status: 'no_session',
        hasAccess: false,
        user: null,
        profile: null,
        message: 'Please sign in to access the editor.'
      };
    }

    // Step 2: Check admin allowlist first (primary fallback)
    const inAllowlist = isInAdminAllowlist(user.email);
    
    if (inAllowlist) {
      console.log('[checkEditorPermissions] User in admin allowlist:', user.email);
      return {
        status: 'allowlist',
        hasAccess: true,
        user: {
          id: user.id,
          email: user.email
        },
        profile: null, // Profile may not exist, but allowlist grants access
        message: 'Access granted via admin allowlist.'
      };
    }

    // Step 3: Try to fetch profile from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    // Handle profile fetch errors
    if (profileError) {
      console.error('[checkEditorPermissions] Profile fetch error:', profileError);
      
      // Check if it's a "not found" error vs actual database error
      if (profileError.code === 'PGRST116') {
        return {
          status: 'no_profile',
          hasAccess: false,
          user: {
            id: user.id,
            email: user.email
          },
          profile: null,
          message: 'No profile found. Please contact an administrator to set up your account.',
          technicalDetails: {
            note: 'Profile row does not exist in database',
            email: user.email
          }
        };
      }
      
      // Other database errors (RLS, permissions, etc.)
      return {
        status: 'error',
        hasAccess: false,
        user: {
          id: user.id,
          email: user.email
        },
        profile: null,
        message: 'Database error checking permissions. Please contact support.',
        technicalDetails: {
          error: profileError,
          note: 'This may be an RLS policy issue'
        }
      };
    }

    // Step 4: Check if profile exists
    if (!profile) {
      return {
        status: 'no_profile',
        hasAccess: false,
        user: {
          id: user.id,
          email: user.email
        },
        profile: null,
        message: 'No profile found. Please contact an administrator to set up your account.',
        technicalDetails: {
          note: 'Profile query returned null',
          email: user.email
        }
      };
    }

    // Step 5: Check role
    const role = profile.role;
    
    if (role === 'admin') {
      return {
        status: 'admin',
        hasAccess: true,
        user: {
          id: user.id,
          email: user.email
        },
        profile: profile as UserProfile,
        message: 'Full admin access granted.'
      };
    }
    
    if (role === 'editor') {
      return {
        status: 'editor',
        hasAccess: true,
        user: {
          id: user.id,
          email: user.email
        },
        profile: profile as UserProfile,
        message: 'Editor access granted.'
      };
    }

    // Role exists but is 'user' or something else
    return {
      status: 'insufficient_role',
      hasAccess: false,
      user: {
        id: user.id,
        email: user.email
      },
      profile: profile as UserProfile,
      message: `Access denied. Your role is "${role}" but you need "editor" or "admin" role.`,
      technicalDetails: {
        currentRole: role,
        requiredRoles: ['editor', 'admin']
      }
    };

  } catch (error: any) {
    console.error('[checkEditorPermissions] Unexpected error:', error);
    return {
      status: 'error',
      hasAccess: false,
      user: null,
      profile: null,
      message: 'An unexpected error occurred. Please try again.',
      technicalDetails: error
    };
  }
}

/**
 * Quick check if user has editor access (simplified)
 */
export async function hasEditorAccess(): Promise<boolean> {
  const result = await checkEditorPermissions();
  return result.hasAccess;
}

/**
 * Get user-friendly error message for permission status
 */
export function getPermissionErrorMessage(status: PermissionStatus): string {
  switch (status) {
    case 'no_session':
      return 'Please sign in to access the blog editor.';
    case 'no_profile':
      return 'Your account is not set up yet. Please contact an administrator to create your profile.';
    case 'insufficient_role':
      return 'You don\'t have permission to access the blog editor. Please contact an administrator to upgrade your role.';
    case 'error':
      return 'An error occurred while checking permissions. Please try again or contact support.';
    default:
      return 'Access denied.';
  }
}

/**
 * Get instructions for resolving permission issues
 */
export function getPermissionInstructions(result: PermissionCheckResult): string[] {
  const instructions: string[] = [];
  
  switch (result.status) {
    case 'no_session':
      instructions.push('Enter your email address below to receive a login link.');
      break;
      
    case 'no_profile':
      instructions.push('Your user account exists but no profile has been created.');
      instructions.push('An administrator needs to run this SQL command:');
      instructions.push(`INSERT INTO profiles (id, email, role) VALUES ('${result.user?.id}', '${result.user?.email}', 'editor');`);
      instructions.push('Or add your email to the admin allowlist in the code.');
      break;
      
    case 'insufficient_role':
      instructions.push(`Your current role: ${result.profile?.role}`);
      instructions.push('An administrator needs to run this SQL command:');
      instructions.push(`UPDATE profiles SET role = 'editor' WHERE email = '${result.user?.email}';`);
      break;
      
    case 'error':
      instructions.push('If this persists, check:');
      instructions.push('1. Database connection');
      instructions.push('2. RLS policies on profiles table');
      instructions.push('3. Browser console for detailed errors');
      break;
  }
  
  return instructions;
}
