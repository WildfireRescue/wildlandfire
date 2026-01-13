import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import type { UserProfile } from '../lib/blogTypes';

export interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

// Admin allowlist - must match the list in migration 006_blog_admin_rls_fix.sql
const ADMIN_EMAILS = [
  'earl@thewildlandfirerecoveryfund.org',
  'jason@thewildlandfirerecoveryfund.org',
  'admin@thewildlandfirerecoveryfund.org',
  'editor@thewildlandfirerecoveryfund.org'
];

export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Hook to manage Supabase authentication state
 * 
 * Features:
 * - Loads session on mount using getSession()
 * - Loads user profile from public.profiles (optional - may fail with 500)
 * - DOES NOT listen for auth state changes (handled by App.tsx)
 * - Provides loading state to prevent premature redirects
 * - Comprehensive logging for debugging
 * 
 * IMPORTANT: This hook does NOT register an auth listener.
 * The listener is registered ONCE in App.tsx to avoid multiple subscriptions.
 */
export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        console.log('[useAuth] Initializing auth state...');
        
        // Get current session from storage
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[useAuth] Session error:', sessionError);
          if (mounted) {
            setError(sessionError.message);
            setSession(null);
            setProfile(null);
          }
          return;
        }

        if (!mounted) return;

        const currentSession = data.session;
        console.log('[useAuth] Session loaded:', {
          hasSession: !!currentSession,
          email: currentSession?.user?.email,
          userId: currentSession?.user?.id,
        });
        
        setSession(currentSession);

        // Load profile if user is authenticated
        // Profile fetch may fail with 500 - that's OK, it's optional
        if (currentSession?.user) {
          await loadProfile(currentSession.user);
        } else {
          setProfile(null);
        }
        
        setError(null);
      } catch (e: any) {
        console.error('[useAuth] Unexpected error:', e);
        if (mounted) {
          setError(e?.message || 'Unknown error');
          setSession(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    async function loadProfile(user: User) {
      try {
        console.log('[useAuth] Loading profile for user:', user.id, user.email);
        
        // Profile fetch may return 500 or PGRST116 - handle gracefully
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle(); // Use maybeSingle instead of single to handle 0 rows

        if (profileError) {
          // Profile errors are non-blocking
          if (profileError.code === 'PGRST116') {
            console.warn('[useAuth] No profile found for user (non-blocking):', user.id);
          } else if (profileError.message?.includes('500')) {
            console.warn('[useAuth] Profile fetch returned 500 (non-blocking):', profileError.message);
          } else {
            console.warn('[useAuth] Profile fetch error (non-blocking):', profileError.message);
          }
          
          // Check if user is in admin allowlist as fallback
          if (isAdminEmail(user.email)) {
            console.log('[useAuth] User email is in admin allowlist, creating virtual profile');
            const virtualProfile: UserProfile = {
              id: user.id,
              email: user.email || '',
              role: 'admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            if (mounted) setProfile(virtualProfile);
          } else {
            console.log('[useAuth] User email NOT in admin allowlist, no profile available');
            if (mounted) setProfile(null);
          }
        } else if (data) {
          console.log('[useAuth] Profile loaded:', {
            id: data.id,
            email: data.email,
            role: data.role
          });
          if (mounted) setProfile(data as UserProfile);
        } else {
          console.log('[useAuth] No profile data (non-blocking)');
          if (mounted) setProfile(null);
        }
      } catch (e: any) {
        console.warn('[useAuth] Profile load error (non-blocking):', e.message || e);
        if (mounted) setProfile(null);
      }
    }

    initAuth();

    // ❌ DO NOT register auth listener here - it's handled in App.tsx
    // Multiple listeners cause AbortError and stuck states
    
    return () => {
      mounted = false;
      console.log('[useAuth] Cleanup');
    };
  }, []);

  return {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    error,
  };
}
