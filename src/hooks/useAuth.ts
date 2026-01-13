import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

export interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to manage Supabase authentication state
 * 
 * Features:
 * - Loads session on mount using getSession()
 * - Listens for auth state changes
 * - Provides loading state to prevent premature redirects
 * - Comprehensive logging for debugging
 */
export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
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
          }
          return;
        }

        if (mounted) {
          console.log('[useAuth] Session loaded:', {
            hasSession: !!data.session,
            email: data.session?.user?.email,
            userId: data.session?.user?.id,
          });
          setSession(data.session);
          setError(null);
        }
      } catch (e: any) {
        console.error('[useAuth] Unexpected error:', e);
        if (mounted) {
          setError(e?.message || 'Unknown error');
          setSession(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
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
    loading,
    error,
  };
}
