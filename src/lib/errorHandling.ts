// =====================================================
// ERROR HANDLING UTILITIES
// Categorize and handle errors gracefully
// =====================================================

import { PostgrestError } from '@supabase/supabase-js';

export type ErrorCategory = 
  | 'NOT_FOUND'          // Resource doesn't exist (PGRST116)
  | 'PERMISSION_DENIED'  // RLS or auth failure (42501, 42502)
  | 'NETWORK_ERROR'      // Connection issues
  | 'TIMEOUT'            // Request timeout
  | 'SERVER_ERROR'       // 500+ errors
  | 'UNKNOWN';           // Uncategorized

export interface CategorizedError {
  category: ErrorCategory;
  message: string;
  userMessage: string;
  technicalDetails?: any;
  retryable: boolean;
}

/**
 * Categorize Supabase/Postgres errors for better UX
 */
export function categorizeError(error: any): CategorizedError {
  // Handle null/undefined
  if (!error) {
    return {
      category: 'UNKNOWN',
      message: 'Unknown error occurred',
      userMessage: 'Something went wrong. Please try again.',
      retryable: true
    };
  }

  // PostgrestError (Supabase REST API errors)
  if (isPostgrestError(error)) {
    const pgError = error as PostgrestError;

    // PGRST116: No rows found (single() or maybeSingle())
    if (pgError.code === 'PGRST116') {
      return {
        category: 'NOT_FOUND',
        message: pgError.message,
        userMessage: 'Post not found',
        technicalDetails: { code: pgError.code, hint: pgError.hint },
        retryable: false
      };
    }

    // PGRST301: Multiple rows found (single())
    if (pgError.code === 'PGRST301') {
      return {
        category: 'SERVER_ERROR',
        message: pgError.message,
        userMessage: 'Multiple posts found with the same identifier. Please contact support.',
        technicalDetails: { code: pgError.code },
        retryable: false
      };
    }

    // Permission denied / RLS errors
    if (pgError.code === '42501' || pgError.code === '42502' || 
        pgError.message?.toLowerCase().includes('permission') ||
        pgError.message?.toLowerCase().includes('rls')) {
      return {
        category: 'PERMISSION_DENIED',
        message: pgError.message,
        userMessage: 'You don\'t have permission to view this content.',
        technicalDetails: { code: pgError.code, hint: pgError.hint },
        retryable: false
      };
    }

    // Server errors (5xx)
    if (pgError.code?.startsWith('5') || 
        pgError.message?.includes('500') ||
        pgError.message?.toLowerCase().includes('internal')) {
      return {
        category: 'SERVER_ERROR',
        message: pgError.message,
        userMessage: 'Server error. Please try again in a moment.',
        technicalDetails: { code: pgError.code, details: pgError.details },
        retryable: true
      };
    }
  }

  // Network errors
  if (error instanceof TypeError && 
      (error.message?.includes('fetch') || 
       error.message?.includes('network') ||
       error.message?.includes('Failed to fetch'))) {
    return {
      category: 'NETWORK_ERROR',
      message: error.message,
      userMessage: 'Network error. Please check your connection and try again.',
      technicalDetails: error,
      retryable: true
    };
  }

  // Timeout errors
  if (error.name === 'TimeoutError' || 
      error.message?.toLowerCase().includes('timeout')) {
    return {
      category: 'TIMEOUT',
      message: error.message || 'Request timeout',
      userMessage: 'Request timed out. Please try again.',
      technicalDetails: error,
      retryable: true
    };
  }

  // AbortError (not really an error, just cancelled)
  if (error.name === 'AbortError') {
    return {
      category: 'UNKNOWN',
      message: 'Request was cancelled',
      userMessage: 'Request was cancelled',
      technicalDetails: error,
      retryable: false
    };
  }

  // Generic fallback
  return {
    category: 'UNKNOWN',
    message: error.message || String(error),
    userMessage: 'Something went wrong. Please try again.',
    technicalDetails: error,
    retryable: true
  };
}

/**
 * Check if error is a Postgrest error
 */
function isPostgrestError(error: any): error is PostgrestError {
  return error && 
         typeof error === 'object' && 
         'code' in error && 
         'message' in error &&
         'details' in error;
}

/**
 * Get user-friendly error message
 */
export function getUserErrorMessage(error: any): string {
  return categorizeError(error).userMessage;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  return categorizeError(error).retryable;
}
