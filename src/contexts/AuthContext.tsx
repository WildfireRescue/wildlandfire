// =====================================================
// AUTH CONTEXT
// Centralized authentication state management
// Single auth listener for entire app lifecycle
// =====================================================

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../lib/blogTypes';

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider - Manages authentication state for entire app
 * 
 * Features:
 * - Single onAuthStateChange listener for entire app lifecycle
 * - Loads initial session on mount
 * - Loads user profile from public.profiles (optional - may fail gracefully)
 * - Provides auth state via context to all components
 * - Proper cleanup on unmount
 * 
 * IMPORTANT: This is the ONLY place where we register an auth listener.
 * All components should consume auth via useAuth() hook.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Load initial session and profile
    async function initAuth() {
      try {
        console.log('[AuthProvider] Initializing auth state...');
        
        // Get current session from storage
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[AuthProvider] Session error:', sessionError);
          if (mounted) {
            setError(sessionError.message);
            setSession(null);
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        if (!mounted) return;

        const currentSession = data.session;
        console.log('[AuthProvider] Initial session loaded:', {
          hasSession: !!currentSession,
          email: currentSession?.user?.email,
          userId: currentSession?.user?.id,
        });
        
        setSession(currentSession);

        // Skip profile loading - use allowlist-only for permissions
        // Profile queries were causing hangs due to RLS policies
        // Allowlist is checked in permissions.ts instead
        setProfile(null);
        
        setError(null);
        setLoading(false);
      } catch (e: any) {
        console.error('[AuthProvider] Unexpected error:', e);
        if (mounted) {
          setError(e?.message || 'Unknown error');
          setSession(null);
          setProfile(null);
          setLoading(false);
        }
      }
    }

    // Handle auth state changes
    async function handleAuthChange(event: AuthChangeEvent, newSession: Session | null) {
      if (!mounted) return;

      console.log('[AuthProvider] Auth state changed:', event, { 
        email: newSession?.user?.email,
        hasSession: !!newSession
      });

      setSession(newSession);

      // Skip profile loading (allowlist-only mode)
      setProfile(null);

      // Handle specific auth events
      if (event === 'SIGNED_IN' && newSession) {
        console.log('[AuthProvider] User signed in, redirecting to blog/editor');
        // Only redirect if not already on editor page (check pathname for React Router)
        if (!window.location.pathname.includes('/blog/editor')) {
          window.location.href = '/blog/editor';
        }
      }
      
      if (event === 'SIGNED_OUT') {
        console.log('[AuthProvider] User signed out');
        setProfile(null);
      }
    }

    // Initialize auth state
    initAuth();

    // Register the ONE AND ONLY auth state listener for the entire app
    console.log('[AuthProvider] Registering auth state listener');
    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Cleanup function
    return () => {
      console.log('[AuthProvider] Cleaning up auth state listener');
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []); // Empty dependency array - runs once on mount

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth - Hook to consume auth context
 * 
 * IMPORTANT: Must be used within AuthProvider
 * Components should use this hook instead of calling supabase.auth directly
 */
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
