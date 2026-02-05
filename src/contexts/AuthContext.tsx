// =====================================================
// AUTH CONTEXT
// Centralized authentication state management
// Single auth listener for entire app lifecycle
// =====================================================

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import type { UserProfile } from '../lib/blogTypes';

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

        // Load profile if user is authenticated
        if (currentSession?.user) {
          await loadProfile(currentSession.user);
        } else {
          setProfile(null);
        }
        
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

    // Load user profile from database
    async function loadProfile(user: User) {
      try {
        console.log('[AuthProvider] Loading profile for user:', user.id, user.email);
        
        // Profile fetch may return 500 or PGRST116 - handle gracefully
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          // Profile errors are non-blocking
          if (profileError.code === 'PGRST116') {
            console.warn('[AuthProvider] No profile found for user (non-blocking):', user.id);
          } else if (profileError.message?.includes('500')) {
            console.warn('[AuthProvider] Profile fetch returned 500 (non-blocking):', profileError.message);
          } else {
            console.warn('[AuthProvider] Profile fetch error (non-blocking):', profileError.message);
          }
          
          // Check if user is in admin allowlist as fallback
          if (isAdminEmail(user.email)) {
            console.log('[AuthProvider] User email is in admin allowlist, creating virtual profile');
            const virtualProfile: UserProfile = {
              id: user.id,
              email: user.email || '',
              role: 'admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            if (mounted) setProfile(virtualProfile);
          } else {
            console.log('[AuthProvider] User email NOT in admin allowlist, no profile available');
            if (mounted) setProfile(null);
          }
        } else if (data) {
          console.log('[AuthProvider] Profile loaded:', {
            id: data.id,
            email: data.email,
            role: data.role
          });
          if (mounted) setProfile(data as UserProfile);
        } else {
          console.log('[AuthProvider] No profile data (non-blocking)');
          if (mounted) setProfile(null);
        }
      } catch (e: any) {
        console.warn('[AuthProvider] Profile load error (non-blocking):', e.message || e);
        if (mounted) setProfile(null);
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

      // Load profile for new session
      if (newSession?.user) {
        await loadProfile(newSession.user);
      } else {
        setProfile(null);
      }

      // Handle specific auth events
      if (event === 'SIGNED_IN' && newSession) {
        console.log('[AuthProvider] User signed in, redirecting to blog/editor');
        // Only redirect if not already on editor page
        if (!window.location.hash.includes('blog/editor')) {
          window.location.hash = 'blog/editor';
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
