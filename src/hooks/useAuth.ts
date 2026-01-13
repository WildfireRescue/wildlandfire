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
 * - Loads user profile from public.profiles
 * - Listens for auth state changes
 * - Provides loading state to prevent premature redirects
 * - Comprehensive logging for debugging
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
        
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            console.warn('[useAuth] No profile found for user:', user.id);
            console.log('[useAuth] Checking admin allowlist...');
            
            // Check if user is in admin allowlist
            if (isAdminEmail(user.email)) {
              console.log('[useAuth] User email is in admin allowlist, treating as admin');
              // Create a virtual admin profile
              const virtualProfile: UserProfile = {
                id: user.id,
                email: user.email || '',
                role: 'admin',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              if (mounted) setProfile(virtualProfile);
            } else {
              console.log('[useAuth] User email NOT in admin allowlist');
              if (mounted) setProfile(null);
            }
          } else {
            console.error('[useAuth] Profile fetch error:', profileError);
            if (mounted) setProfile(null);
          }
        } else {
          console.log('[useAuth] Profile loaded:', {
            id: data.id,
            email: data.email,
            role: data.role
          });
          if (mounted) setProfile(data as UserProfile);
        }
      } catch (e) {
        console.error('[useAuth] Profile load error:', e);
        if (mounted) setProfile(null);
      }
    }

    initAuth();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('[useAuth] Auth state changed:', event, {
          hasSession: !!newSession,
          email: newSession?.user?.email,
        });

        if (mounted) {
          setSession(newSession);
          
          if (newSession?.user) {
            await loadProfile(newSession.user);
          } else {
            setProfile(null);
          }
          
          setError(null);
        }
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
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
