import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase env vars. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

// ✅ Singleton Supabase client with proper auth configuration
export const supabase = createClient(
  supabaseUrl ?? '',
  supabaseAnonKey ?? '',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: window.localStorage,
      storageKey: 'wildland-fire-auth',
      debug: true, // Enable auth debugging
    },
  }
);

// Suppress unhandled abort errors in console (they're harmless)
// These occur during concurrent auth operations and don't affect functionality
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason instanceof Error && event.reason.name === 'AbortError') {
      // Suppress AbortError promise rejections
      event.preventDefault();
    }
  });
}

// Log auth initialization
console.log('[Supabase] Client initialized', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
});
