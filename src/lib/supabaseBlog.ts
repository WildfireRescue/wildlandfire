// =====================================================
// SUPABASE BLOG QUERIES
// Typed queries for blog operations
// =====================================================

import { supabase } from './supabase';
import type { BlogPost, BlogCategory, UserProfile, PaginationOptions, BlogListFilters } from './blogTypes';

// =====================================================
// POSTS
// =====================================================

/**
 * Fetch published posts with pagination
 */
export async function getPublishedPosts(options: PaginationOptions = { page: 1, perPage: 12 }) {
  const { page, perPage } = options;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .eq('noindex', false)
    .order('published_at', { ascending: false })
    .range(from, to);

  return { posts: data as BlogPost[] | null, error, total: count || 0 };
}

/**
 * Fetch all posts (for editors)
 */
export async function getAllPosts(filters?: BlogListFilters, options: PaginationOptions = { page: 1, perPage: 20 }) {
  const { page, perPage } = options;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .order('updated_at', { ascending: false });

  // Apply filters
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.tag) {
    query = query.contains('tags', [filters.tag]);
  }
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`);
  }

  const { data, error, count } = await query.range(from, to);

  return { posts: data as BlogPost[] | null, error, total: count || 0 };
}

/**
 * Fetch single post by slug
 */
export async function getPostBySlug(slug: string, includeUnpublished: boolean = false) {
  if (!includeUnpublished) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .eq('noindex', false)
      .single();
    return { post: data as BlogPost | null, error };
  } else {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single();
    return { post: data as BlogPost | null, error };
  }
}

/**
 * Fetch featured posts
 */
export async function getFeaturedPosts(limit: number = 3) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .eq('noindex', false)
    .eq('featured', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  return { posts: data as BlogPost[] | null, error };
}

/**
 * Fetch posts by category
 */
export async function getPostsByCategory(category: string, options: PaginationOptions = { page: 1, perPage: 12 }) {
  const { page, perPage } = options;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .eq('noindex', false)
    .eq('category', category)
    .order('published_at', { ascending: false })
    .range(from, to);

  return { posts: data as BlogPost[] | null, error, total: count || 0 };
}

/**
 * Fetch posts by tag
 */
export async function getPostsByTag(tag: string, options: PaginationOptions = { page: 1, perPage: 12 }) {
  const { page, perPage } = options;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .eq('noindex', false)
    .contains('tags', [tag])
    .order('published_at', { ascending: false })
    .range(from, to);

  return { posts: data as BlogPost[] | null, error, total: count || 0 };
}

/**
 * Fetch related posts (same category, exclude current)
 */
export async function getRelatedPosts(category: string | null, currentSlug: string, limit: number = 3) {
  if (!category) return { posts: null, error: null };

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .eq('noindex', false)
    .eq('category', category)
    .neq('slug', currentSlug)
    .order('published_at', { ascending: false })
    .limit(limit);

  return { posts: data as BlogPost[] | null, error };
}

/**
 * Create new post
 */
export async function createPost(postData: Partial<BlogPost>) {
  const { data, error } = await supabase
    .from('posts')
    .insert([postData])
    .select()
    .single();

  return { post: data as BlogPost | null, error };
}

/**
 * Update existing post
 */
export async function updatePost(slug: string, postData: Partial<BlogPost>) {
  const { data, error } = await supabase
    .from('posts')
    .update(postData)
    .eq('slug', slug)
    .select()
    .single();

  return { post: data as BlogPost | null, error };
}

/**
 * Delete post
 */
export async function deletePost(slug: string) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('slug', slug);

  return { error };
}

/**
 * Increment view count
 */
export async function incrementViewCount(slug: string) {
  const { error } = await supabase.rpc('increment_post_views', { post_slug: slug });
  return { error };
}

// =====================================================
// CATEGORIES
// =====================================================

/**
 * Fetch all categories
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  return { categories: data as BlogCategory[] | null, error };
}

/**
 * Fetch category by slug
 */
export async function getCategoryBySlug(slug: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  return { category: data as BlogCategory | null, error };
}

// =====================================================
// PROFILES
// =====================================================

/**
 * Get current user's profile
 * Returns the user's profile from the profiles table
 * This is required for permission checks and role-based access
 */
export async function getCurrentUserProfile() {
  try {
    // Get the current user from auth
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('[getCurrentUserProfile] Auth error:', userError);
      return { profile: null, error: userError };
    }
    
    if (!user) {
      console.warn('[getCurrentUserProfile] No authenticated user');
      return { profile: null, error: null };
    }

    console.log('[getCurrentUserProfile] Fetching profile for user:', user.id);

    // Fetch the profile using the user's ID
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id) // Changed from user_id to id
      .single();

    if (error) {
      // If no profile found, log a detailed error
      if (error.code === 'PGRST116') {
        console.error('[getCurrentUserProfile] No profile found for user. This might mean:');
        console.error('  1. The user signed up before the profile trigger was added');
        console.error('  2. The profile was deleted');
        console.error('  3. The migration has not been run');
        console.error('  User ID:', user.id);
        console.error('  User Email:', user.email);
      } else {
        console.error('[getCurrentUserProfile] Database error:', error);
      }
      return { profile: null, error };
    }

    console.log('[getCurrentUserProfile] Profile found:', { id: data.id, email: data.email, role: data.role });
    return { profile: data as UserProfile | null, error: null };
  } catch (e) {
    console.error('[getCurrentUserProfile] Unexpected error:', e);
    return { profile: null, error: e as any };
  }
}

// Admin allowlist - must match the list in migration 006_blog_admin_rls_fix.sql
const ADMIN_EMAILS = [
  'earl@thewildlandfirerecoveryfund.org',
  'admin@thewildlandfirerecoveryfund.org',
  'editor@thewildlandfirerecoveryfund.org'
];

/**
 * Check if an email is in the admin allowlist
 */
export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Check if current user is an editor or admin
 * Returns true if user has editor or admin role, OR if email is in admin allowlist
 * Returns false if user is not authenticated or doesn't have permissions
 */
export async function isCurrentUserEditor(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('[isCurrentUserEditor] No authenticated user');
      return false;
    }

    console.log('[isCurrentUserEditor] Checking permissions for:', user.email);
    
    // First check if email is in admin allowlist
    if (isAdminEmail(user.email)) {
      console.log('[isCurrentUserEditor] User is in admin allowlist, granting access');
      return true;
    }

    const { profile, error } = await getCurrentUserProfile();
    
    if (error) {
      console.error('[isCurrentUserEditor] Error fetching profile:', error.message);
      // If profile fetch fails but user is in allowlist, still grant access
      return isAdminEmail(user.email);
    }
    
    if (!profile) {
      console.warn('[isCurrentUserEditor] No profile found for current user');
      // Already checked allowlist above, so return false
      return false;
    }
    
    const hasPermission = profile.role === 'editor' || profile.role === 'admin';
    console.log('[isCurrentUserEditor] Permission check:', { 
      email: profile.email, 
      role: profile.role, 
      hasPermission 
    });
    
    return hasPermission;
  } catch (e) {
    console.error('[isCurrentUserEditor] Unexpected error:', e);
    return false;
  }
}

/**
 * Check if current user is an admin
 * Returns true only if user has admin role
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const { profile, error } = await getCurrentUserProfile();
    
    if (error) {
      console.error('[isCurrentUserAdmin] Error fetching profile:', error.message);
      return false;
    }
    
    if (!profile) {
      console.warn('[isCurrentUserAdmin] No profile found for current user');
      return false;
    }
    
    const isAdmin = profile.role === 'admin';
    console.log('[isCurrentUserAdmin] Admin check:', { 
      email: profile.email, 
      role: profile.role, 
      isAdmin 
    });
    
    return isAdmin;
  } catch (e) {
    console.error('[isCurrentUserAdmin] Unexpected error:', e);
    return false;
  }
}

// =====================================================
// STORAGE
// =====================================================

/**
 * Upload image to blog storage bucket
 */
export async function uploadBlogImage(file: File, path: string) {
  const { data, error } = await supabase.storage
    .from('blog')
    .upload(path, file, {
      cacheControl: '31536000',
      upsert: false
    });

  if (error) return { url: null, error };

  const { data: { publicUrl } } = supabase.storage
    .from('blog')
    .getPublicUrl(data.path);

  return { url: publicUrl, error: null };
}

/**
 * Delete image from blog storage bucket
 */
export async function deleteBlogImage(path: string) {
  const { error } = await supabase.storage
    .from('blog')
    .remove([path]);

  return { error };
}

/**
 * Get public URL for blog image
 */
export function getBlogImageUrl(path: string): string {
  const { data } = supabase.storage
    .from('blog')
    .getPublicUrl(path);

  return data.publicUrl;
}
