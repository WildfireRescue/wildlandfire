// =====================================================
// BLOG IMAGE & CONTENT UTILITIES
// Defensive helpers for rendering blog content safely
// =====================================================

import { supabase } from './supabase';

/**
 * Default bucket name for blog images
 * Change this if using a different bucket name
 */
export const BLOG_IMAGE_BUCKET = 'blog';

/**
 * Fallback placeholder image for missing covers
 */
export const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"%3E%3Crect fill="%23374151" width="800" height="400"/%3E%3Ctext fill="%239CA3AF" font-family="system-ui" font-size="48" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';

/**
 * Resolves cover image from various possible formats to a usable URL
 * 
 * Handles:
 * - Full URLs (http/https)
 * - Supabase Storage paths (e.g. "covers/myfile.png")
 * - Objects with url or path properties
 * - null/undefined/empty values
 * 
 * @param cover - The cover value from the database (string, object, or null)
 * @returns A valid URL string or null if the cover cannot be resolved
 */
export function resolveCoverImageSrc(cover: unknown): string | null {
  // Handle null/undefined/empty
  if (!cover) {
    return null;
  }

  // Handle string values
  if (typeof cover === 'string') {
    const trimmed = cover.trim();
    
    // Empty string
    if (!trimmed) {
      return null;
    }
    
    // Full URL (http/https)
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    
    // Assume it's a Storage path - generate public URL
    try {
      const { data } = supabase.storage
        .from(BLOG_IMAGE_BUCKET)
        .getPublicUrl(trimmed);
      
      return data.publicUrl || null;
    } catch (error) {
      console.warn('[resolveCoverImageSrc] Failed to resolve storage path:', trimmed, error);
      return null;
    }
  }

  // Handle object values (e.g. { url: "...", path: "..." })
  if (typeof cover === 'object' && cover !== null) {
    const obj = cover as Record<string, unknown>;
    
    // Try url property first
    if (obj.url && typeof obj.url === 'string') {
      return resolveCoverImageSrc(obj.url);
    }
    
    // Try path property
    if (obj.path && typeof obj.path === 'string') {
      return resolveCoverImageSrc(obj.path);
    }
    
    console.warn('[resolveCoverImageSrc] Object format not recognized:', cover);
    return null;
  }

  // Unexpected type
  console.warn('[resolveCoverImageSrc] Unexpected cover type:', typeof cover, cover);
  return null;
}

/**
 * Coerces any value to a safe string for rendering
 * Prevents React error #310 (rendering objects as children)
 * 
 * @param value - Any value that needs to be rendered as text
 * @returns A safe string representation
 */
export function coerceToString(value: unknown): string {
  // Already a string
  if (typeof value === 'string') {
    return value;
  }

  // Null or undefined
  if (value == null) {
    return '';
  }

  // Boolean
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  // Number
  if (typeof value === 'number') {
    return String(value);
  }

  // Array or Object - stringify safely
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch (error) {
      console.warn('[coerceToString] Failed to stringify object:', error);
      return '[Complex Object]';
    }
  }

  // Fallback for any other type
  try {
    return String(value);
  } catch (error) {
    console.warn('[coerceToString] Failed to convert value:', error);
    return '';
  }
}

/**
 * Safely extracts and coerces content for markdown rendering
 * Ensures the markdown renderer always receives a valid string
 * 
 * @param content - Content from database (could be string, object, etc.)
 * @returns Safe markdown string
 */
export function safeMarkdownContent(content: unknown): string {
  const str = coerceToString(content);
  
  // If the coercion resulted in JSON, warn the developer
  if (str.trim().startsWith('{') || str.trim().startsWith('[')) {
    console.warn('[safeMarkdownContent] Content appears to be JSON/object, not markdown:', str.substring(0, 100));
  }
  
  return str;
}

/**
 * Safely creates dangerouslySetInnerHTML prop
 * Ensures __html is always a string to prevent React errors
 * 
 * @param html - HTML content (could be string, object, etc.)
 * @returns Safe object for dangerouslySetInnerHTML
 */
export function safeDangerousHTML(html: unknown): { __html: string } {
  return {
    __html: coerceToString(html)
  };
}

/**
 * Generates a safe image src with fallback
 * 
 * @param cover - Cover image value from database
 * @param fallback - Optional fallback URL (defaults to placeholder)
 * @returns A valid image URL (never null)
 */
export function safeImageSrc(cover: unknown, fallback: string = PLACEHOLDER_IMAGE): string {
  console.log('[safeImageSrc] Input:', { cover, type: typeof cover });
  const resolved = resolveCoverImageSrc(cover);
  console.log('[safeImageSrc] Resolved:', resolved);
  return resolved || fallback;
}

/**
 * Validates and encodes a slug for safe URL usage
 * 
 * @param slug - Post slug from database
 * @returns URL-safe slug
 */
export function safeSlug(slug: unknown): string {
  const str = coerceToString(slug);
  return encodeURIComponent(str.trim());
}
