// =====================================================
// DEBUG LOGGER
// Lightweight debug logging for development and troubleshooting
// Logs only when import.meta.env.DEV or VITE_DEBUG=true
// =====================================================

/**
 * Debug logger that only logs in development mode or when VITE_DEBUG is enabled
 * @param args - Arguments to log (same as console.log)
 */
export function debugLog(...args: any[]): void {
  const isDev = import.meta.env.DEV;
  const debugEnabled = import.meta.env.VITE_DEBUG === 'true';
  
  if (isDev || debugEnabled) {
    const timestamp = new Date().toISOString();
    console.log(`[DEBUG ${timestamp}]`, ...args);
  }
}

/**
 * Debug logger specifically for errors
 * @param message - Error message
 * @param error - Error object or additional context
 */
export function debugError(message: string, error?: any): void {
  const isDev = import.meta.env.DEV;
  const debugEnabled = import.meta.env.VITE_DEBUG === 'true';
  
  if (isDev || debugEnabled) {
    const timestamp = new Date().toISOString();
    console.error(`[DEBUG ERROR ${timestamp}]`, message);
    
    if (error) {
      // Log the full error object
      console.error('[DEBUG ERROR DETAILS]', {
        message: error?.message,
        stack: error?.stack,
        fullError: error,
      });
    }
  }
}

/**
 * Debug logger for timing operations
 * @param label - Operation label
 * @param startTime - Start timestamp (optional, will use current time if not provided)
 * @returns End function to call when operation completes
 */
export function debugTiming(label: string, startTime?: number): () => void {
  const isDev = import.meta.env.DEV;
  const debugEnabled = import.meta.env.VITE_DEBUG === 'true';
  
  if (!isDev && !debugEnabled) {
    return () => {}; // No-op if debugging is disabled
  }
  
  const start = startTime || performance.now();
  debugLog(`[TIMING] ${label} - START`);
  
  return () => {
    const end = performance.now();
    const duration = end - start;
    debugLog(`[TIMING] ${label} - END (${duration.toFixed(2)}ms)`);
  };
}
