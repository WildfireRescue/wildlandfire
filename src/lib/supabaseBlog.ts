// =====================================================
// SUPABASE BLOG QUERIES
// Typed queries for blog operations
// =====================================================

import { supabase } from './supabase';
import type { BlogPost, BlogCategory, UserProfile, PaginationOptions, BlogListFilters } from './blogTypes';
import { isAdminEmail } from './permissions';

export interface AuthorDefaults {
  author_id: string | null;
  author_email: string;
  author_name: string;
  author_role: string;
  author_bio: string;
}

const ORG_AUTHOR_FALLBACK = 'The Wildland Fire Recovery Fund';
const ROLE_FALLBACK = 'Contributor';
const BIO_FALLBACK = `Contributor at ${ORG_AUTHOR_FALLBACK}.`;

let hasLoggedMissingScheduledPublisher = false;

function pickFirstNonEmptyString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length > 0) return trimmed;
    }
  }
  return null;
}

function readProfileString(record: Record<string, unknown> | null, keys: string[]): string | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length > 0) return trimmed;
    }
  }
  return null;
}

function titleCaseWords(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function deriveNameFromEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const localPart = email.split('@')[0]?.trim();
  if (!localPart) return null;
  const cleaned = localPart.replace(/[._-]+/g, ' ');
  return titleCaseWords(cleaned);
}

function humanizeProfileRole(role: string | null): string | null {
  if (!role) return null;
  const normalized = role.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === 'admin') return 'Administrator';
  if (normalized === 'editor') return 'Editor';
  if (normalized === 'user' || normalized === 'viewer') return ROLE_FALLBACK;
  return titleCaseWords(normalized.replace(/[_-]+/g, ' '));
}

/**
 * Convert scheduled posts whose time has arrived into published posts.
 * This is non-blocking for callers and safely no-ops when the RPC is not deployed yet.
 */
export async function publishDueScheduledPosts() {
  try {
    const { data, error } = await supabase.rpc('publish_due_scheduled_posts');
    if (error) {
      return { updatedCount: 0, error };
    }

    const updatedCount = typeof data === 'number' ? data : Number(data ?? 0);
    return {
      updatedCount: Number.isFinite(updatedCount) ? updatedCount : 0,
      error: null,
    };
  } catch (e: any) {
    return {
      updatedCount: 0,
      error: { message: e?.message || 'Unexpected error in scheduled post publisher', code: 'UNEXPECTED' },
    };
  }
}

async function publishDueScheduledPostsNonBlocking() {
  const { updatedCount, error } = await publishDueScheduledPosts();

  if (error) {
    const message = error?.message || '';
    const isMissingFn = error?.code === '42883' || message.includes('publish_due_scheduled_posts');

    if (isMissingFn) {
      if (!hasLoggedMissingScheduledPublisher) {
        console.info('[publishDueScheduledPosts] RPC not available yet. Apply migration 014 to enable scheduling automation.');
        hasLoggedMissingScheduledPublisher = true;
      }
      return;
    }

    console.warn('[publishDueScheduledPosts] Non-blocking publish check failed:', error);
    return;
  }

  if (updatedCount > 0) {
    console.log('[publishDueScheduledPosts] Published scheduled posts:', updatedCount);
  }
}

/**
 * Resolve author defaults from current authenticated user + optional profile row.
 * Never throws; always returns sensible fallbacks.
 */
export async function getCurrentUserAuthorDefaults() {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData.user;

    if (userError || !user) {
      return {
        defaults: {
          author_id: null,
          author_email: 'unknown',
          author_name: ORG_AUTHOR_FALLBACK,
          author_role: ROLE_FALLBACK,
          author_bio: BIO_FALLBACK,
        } as AuthorDefaults,
        error: userError || null,
      };
    }

    const userMeta = (user.user_metadata || {}) as Record<string, unknown>;
    const appMeta = (user.app_metadata || {}) as Record<string, unknown>;

    let profileRecord: Record<string, unknown> | null = null;
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!profileError && profileData && typeof profileData === 'object') {
      profileRecord = profileData as Record<string, unknown>;
    } else if (profileError && profileError.code !== 'PGRST116') {
      console.warn('[getCurrentUserAuthorDefaults] Profile fetch failed (non-blocking):', profileError.message);
    }

    const profileRole = pickFirstNonEmptyString(
      readProfileString(profileRecord, ['author_role', 'role_title', 'job_title', 'title']),
      humanizeProfileRole(readProfileString(profileRecord, ['role'])),
      humanizeProfileRole(pickFirstNonEmptyString(appMeta.role, userMeta.role))
    );

    const authorName = pickFirstNonEmptyString(
      readProfileString(profileRecord, ['author_name', 'full_name', 'display_name', 'name']),
      pickFirstNonEmptyString(
        userMeta.author_name,
        userMeta.full_name,
        userMeta.display_name,
        userMeta.name,
        userMeta.preferred_username
      ),
      deriveNameFromEmail(user.email),
      ORG_AUTHOR_FALLBACK
    );

    const authorRole = pickFirstNonEmptyString(
      profileRole,
      pickFirstNonEmptyString(
        userMeta.author_role,
        userMeta.title,
        userMeta.job_title,
        userMeta.position
      ),
      ROLE_FALLBACK
    );

    const authorBio = pickFirstNonEmptyString(
      readProfileString(profileRecord, ['author_bio', 'bio', 'about', 'description']),
      pickFirstNonEmptyString(userMeta.author_bio, userMeta.bio, userMeta.about, userMeta.description),
      BIO_FALLBACK
    );

    return {
      defaults: {
        author_id: user.id,
        author_email: user.email || 'unknown',
        author_name: authorName || ORG_AUTHOR_FALLBACK,
        author_role: authorRole || ROLE_FALLBACK,
        author_bio: authorBio || BIO_FALLBACK,
      } as AuthorDefaults,
      error: null,
    };
  } catch (e: any) {
    console.warn('[getCurrentUserAuthorDefaults] Unexpected error (non-blocking):', e?.message || e);
    return {
      defaults: {
        author_id: null,
        author_email: 'unknown',
        author_name: ORG_AUTHOR_FALLBACK,
        author_role: ROLE_FALLBACK,
        author_bio: BIO_FALLBACK,
      } as AuthorDefaults,
      error: null,
    };
  }
}

// =====================================================
// POSTS
// =====================================================

/**
 * Fetch published posts with pagination
 */
export async function getPublishedPosts(options: PaginationOptions = { page: 1, perPage: 12 }) {
  try {
    await publishDueScheduledPostsNonBlocking();

    const { page, perPage } = options;
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    console.log('[getPublishedPosts] Fetching posts:', { page, perPage, from, to });
    // Fetch legacy posts (hosted) and new articles (hosted + external) and merge them
    const [postsRes, articlesRes] = await Promise.all([
      supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .eq('noindex', false)
        .order('published_at', { ascending: false }),
      supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
    ]);

    const postsData = postsRes.data as BlogPost[] | null;
    const postsError = postsRes.error || null;
    const articlesData = articlesRes.data as any[] | null;
    const articlesError = articlesRes.error || null;

    if (postsError) {
      console.error('[getPublishedPosts] Error fetching legacy posts:', postsError);
      return { posts: null, error: postsError, total: 0 };
    }
    if (articlesError) {
      console.error('[getPublishedPosts] Error fetching articles:', articlesError);
      // don't block entirely for articles errors; continue with posts only
    }

    // Map articles to the BlogPost shape (lightweight) so they can be listed alongside legacy posts
    const articlePosts: BlogPost[] = (articlesData || []).map((a: any) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      excerpt: a.subtitle || null,
      content_markdown: '',
      content_html: null,
      meta_title: a.og_title || null,
      meta_description: a.og_description || null,
      canonical_url: a.external_url || null,
      focus_keyword: null,
      secondary_keywords: null,
      cover_image_url: a.featured_image || a.og_image || null,
      featured_image_url: a.featured_image || a.og_image || null,
      featured_image_alt_text: null,
      og_image_url: a.og_image || null,
      og_title: a.og_title || null,
      og_description: a.og_description || null,
      twitter_card: 'summary_large_image',
      category: 'News',
      tags: [],
      status: 'published',
      published_at: a.published_at || null,
      scheduled_for: null,
      featured: false,
      allow_indexing: true,
      allow_follow: true,
      robots_directives: 'index, follow',
      sitemap_priority: 0.5,
      author_id: null,
      author_name: a.author || a.source_name || null,
      author_email: '',
      author_role: null,
      author_bio: null,
      reviewed_by: null,
      fact_checked: false,
      created_at: a.created_at,
      updated_at: a.updated_at,
      last_updated_at: a.updated_at || null,
      reading_time_minutes: a.reading_time || 5,
      faq_json: null,
      view_count: 0,
      noindex: false,
      sources: null,
      outbound_links_verified: false
    }));

    // Combine and sort by published_at desc
    const combined = [...(postsData || []), ...articlePosts];
    combined.sort((x, y) => {
      const dx = x.published_at ? new Date(x.published_at).getTime() : 0;
      const dy = y.published_at ? new Date(y.published_at).getTime() : 0;
      return dy - dx;
    });

    const total = combined.length;
    const pageSlice = combined.slice(from, to + 1);

    console.log('[getPublishedPosts] Success:', { count: pageSlice.length, total });
    return { posts: pageSlice as BlogPost[] | null, error: null, total };
  } catch (e: any) {
    console.error('[getPublishedPosts] Unexpected error:', e);
    return { posts: null, error: e, total: 0 };
  }
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
 * Returns null for not found, throws for real errors
 */
export async function getPostBySlug(slug: string, includeUnpublished: boolean = false) {
  try {
    if (!includeUnpublished) {
      await publishDueScheduledPostsNonBlocking();
    }

    if (!includeUnpublished) {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .eq('noindex', false)
        .single();
      
      // PGRST116 means not found - return null gracefully
      if (error && error.code === 'PGRST116') {
        return { post: null, error: null };
      }
      
      // Other errors are returned for handling
      return { post: data as BlogPost | null, error };
    } else {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .single();
      
      // PGRST116 means not found - return null gracefully
      if (error && error.code === 'PGRST116') {
        return { post: null, error: null };
      }
      
      // Other errors are returned for handling
      return { post: data as BlogPost | null, error };
    }
  } catch (err) {
    // Catch any unexpected errors (network, etc.)
    console.error('[getPostBySlug] Unexpected error:', err);
    return { post: null, error: err as any };
  }
}

/**
 * Fetch featured posts
 */
export async function getFeaturedPosts(limit: number = 3) {
  try {
    await publishDueScheduledPostsNonBlocking();

    console.log('[getFeaturedPosts] Fetching featured posts:', { limit });

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .eq('noindex', false)
      .eq('featured', true)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[getFeaturedPosts] Error:', error);
      return { posts: null, error };
    }

    console.log('[getFeaturedPosts] Success:', { count: data?.length || 0 });
    return { posts: data as BlogPost[] | null, error: null };
  } catch (e: any) {
    console.error('[getFeaturedPosts] Unexpected error:', e);
    return { posts: null, error: e };
  }
}

/**
 * Fetch posts by category
 */
export async function getPostsByCategory(category: string, options: PaginationOptions = { page: 1, perPage: 12 }) {
  try {
    await publishDueScheduledPostsNonBlocking();

    const { page, perPage } = options;

    console.log('[getPostsByCategory] Fetching posts:', { category, page, perPage });

    // Fetch both legacy posts and articles
    const [postsRes, articlesRes] = await Promise.all([
      supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .eq('noindex', false)
        .eq('category', category)
        .order('published_at', { ascending: false }),
      supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
    ]);

    const postsData = postsRes.data as BlogPost[] | null;
    const postsError = postsRes.error;
    const articlesData = articlesRes.data as any[] | null;

    if (postsError) {
      console.error('[getPostsByCategory] Error:', postsError);
      return { posts: null, error: postsError, total: 0 };
    }

    // Map articles to BlogPost shape and filter by category (since articles table doesn't have category column)
    const articlePosts: BlogPost[] = (articlesData || [])
      .filter((a: any) => {
        // Articles are always "News" category for now
        return category.toLowerCase() === 'news';
      })
      .map((a: any) => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        excerpt: a.subtitle || null,
        content_markdown: '',
        content_html: null,
        meta_title: a.og_title || null,
        meta_description: a.og_description || null,
        canonical_url: a.external_url || null,
        focus_keyword: null,
        secondary_keywords: null,
        cover_image_url: a.featured_image || a.og_image || null,
        featured_image_url: a.featured_image || a.og_image || null,
        featured_image_alt_text: null,
        og_image_url: a.og_image || null,
        og_title: a.og_title || null,
        og_description: a.og_description || null,
        twitter_card: 'summary_large_image',
        category: 'News',
        tags: [],
        status: 'published',
        published_at: a.published_at || null,
        scheduled_for: null,
        featured: false,
        allow_indexing: true,
        allow_follow: true,
        robots_directives: 'index, follow',
        sitemap_priority: 0.5,
        author_id: null,
        author_name: a.author || a.source_name || null,
        author_email: '',
        author_role: null,
        author_bio: null,
        reviewed_by: null,
        fact_checked: false,
        created_at: a.created_at,
        updated_at: a.updated_at,
        last_updated_at: a.updated_at || null,
        reading_time_minutes: a.reading_time || 5,
        faq_json: null,
        view_count: 0,
        noindex: false,
        sources: null,
        outbound_links_verified: false
      }));

    // Combine and sort by published_at
    const allPosts = [...(postsData || []), ...articlePosts]
      .sort((a, b) => {
        const dateA = new Date(a.published_at || 0).getTime();
        const dateB = new Date(b.published_at || 0).getTime();
        return dateB - dateA;
      });

    // Apply pagination after combining
    const from = (page - 1) * perPage;
    const to = from + perPage;
    const paginatedPosts = allPosts.slice(from, to);

    console.log('[getPostsByCategory] Success:', { count: paginatedPosts.length, total: allPosts.length });
    return { posts: paginatedPosts, error: null, total: allPosts.length };
  } catch (e: any) {
    console.error('[getPostsByCategory] Unexpected error:', e);
    return { posts: null, error: e, total: 0 };
  }
}

/**
 * Fetch posts by tag
 */
export async function getPostsByTag(tag: string, options: PaginationOptions = { page: 1, perPage: 12 }) {
  await publishDueScheduledPostsNonBlocking();

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

  await publishDueScheduledPostsNonBlocking();

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
  try {
    console.log('[createPost] Creating post:', { 
      title: postData.title, 
      slug: postData.slug,
      status: postData.status 
    });

    const baseSlug = (postData.slug || '').trim();
    if (!baseSlug) {
      return {
        post: null,
        error: { message: 'Slug is required', code: 'VALIDATION' },
      };
    }

    const maxSlugAttempts = 25;
    let resolvedSlug = baseSlug;
    let insertError: any = null;

    const isDuplicateSlugError = (error: any) => {
      const message = String(error?.message || '').toLowerCase();
      return error?.code === '23505' && (message.includes('posts_slug_key') || message.includes('slug'));
    };

    for (let attempt = 0; attempt < maxSlugAttempts; attempt++) {
      const candidateSlug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
      const payload = { ...postData, slug: candidateSlug };
      const { error } = await supabase
        .from('posts')
        .insert([payload]);

      if (!error) {
        resolvedSlug = candidateSlug;
        insertError = null;
        break;
      }

      if (baseSlug && isDuplicateSlugError(error)) {
        insertError = error;
        continue;
      }

      insertError = error;
      break;
    }

    if (insertError) {
      const slugError = baseSlug && isDuplicateSlugError(insertError)
        ? {
            ...insertError,
            message: 'Unable to create a unique slug automatically. Please choose a different slug.',
          }
        : insertError;

      console.error('[createPost] Supabase error:', {
        message: slugError.message,
        code: slugError.code,
        details: slugError.details,
        hint: slugError.hint
      });
      return { post: null, error: slugError };
    }

    let post: BlogPost | null = null;
    if (resolvedSlug) {
      const { data: selectedPost, error: selectError } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', resolvedSlug)
        .maybeSingle();

      if (selectError) {
        console.warn('[createPost] Insert succeeded but follow-up select failed (non-blocking):', selectError.message);
      } else if (selectedPost) {
        post = selectedPost as BlogPost;
      }
    }

    if (!post) {
      post = {
        ...(postData as BlogPost),
        slug: resolvedSlug,
        id: '',
      };
    }

    console.log('[createPost] Success:', { slug: post.slug });
    return { post, error: null };
  } catch (e: any) {
    console.error('[createPost] Unexpected error:', e);
    return { 
      post: null, 
      error: { message: e?.message || 'Unexpected error during post creation', code: 'UNEXPECTED' } 
    };
  }
}

/**
 * Update existing post
 */
export async function updatePost(slug: string, postData: Partial<BlogPost>) {
  const { error } = await supabase
    .from('posts')
    .update(postData)
    .eq('slug', slug);

  if (error) {
    return { post: null, error };
  }

  const { data: selectedPost, error: selectError } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (selectError) {
    console.warn('[updatePost] Update succeeded but follow-up select failed (non-blocking):', selectError.message);
    return {
      post: {
        ...(postData as BlogPost),
        id: '',
        slug,
      },
      error: null,
    };
  }

  return { post: selectedPost as BlogPost | null, error: null };
}

/**
 * Update existing post by id (preferred when slug can be edited)
 */
export async function updatePostById(id: string, postData: Partial<BlogPost>) {
  const { error } = await supabase
    .from('posts')
    .update(postData)
    .eq('id', id);

  if (error) {
    return { post: null, error };
  }

  const { data: selectedPost, error: selectError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (selectError) {
    console.warn('[updatePostById] Update succeeded but follow-up select failed (non-blocking):', selectError.message);
    return {
      post: {
        ...(postData as BlogPost),
        id,
        slug: postData.slug || '',
      },
      error: null,
    };
  }

  return { post: selectedPost as BlogPost | null, error: null };
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
  try {
    console.log('[getCategories] Fetching categories...');

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('[getCategories] Error:', error);
      return { categories: null, error };
    }

    console.log('[getCategories] Success:', { count: data?.length || 0 });
    return { categories: data as BlogCategory[] | null, error: null };
  } catch (e: any) {
    console.error('[getCategories] Unexpected error:', e);
    return { categories: null, error: e };
  }
}

/**
 * Fetch category by slug
 */
export async function getCategoryBySlug(slug: string) {
  try {
    console.log('[getCategoryBySlug] Fetching category:', slug);

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('[getCategoryBySlug] Error:', error);
      return { category: null, error };
    }

    console.log('[getCategoryBySlug] Success:', data?.name);
    return { category: data as BlogCategory | null, error: null };
  } catch (e: any) {
    console.error('[getCategoryBySlug] Unexpected error:', e);
    return { category: null, error: e };
  }
}

// =====================================================
// PROFILES
// =====================================================

/**
 * Get current user's profile
 * Returns the user's profile from the profiles table
 * This is OPTIONAL - if profile doesn't exist or errors (500), operations can still continue
 * Profile is only used for role-based UI, not for core functionality
 */
export async function getCurrentUserProfile() {
  try {
    // Get the current user from auth
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.warn('[getCurrentUserProfile] Auth error (non-blocking):', userError.message);
      return { profile: null, error: null }; // Don't propagate auth errors
    }
    
    if (!user) {
      console.log('[getCurrentUserProfile] No authenticated user');
      return { profile: null, error: null };
    }

    console.log('[getCurrentUserProfile] Attempting to fetch profile for user:', user.id);

    // Fetch the profile using the user's ID
    // This may fail with 500 if RLS policies are misconfigured - that's OK
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle(); // Use maybeSingle to handle 0 or 1 rows gracefully

    if (error) {
      // Log but don't throw - profile is optional
      if (error.code === 'PGRST116') {
        console.warn('[getCurrentUserProfile] No profile row found (non-blocking):', {
          userId: user.id,
          email: user.email,
          note: 'User can still use the app via admin allowlist'
        });
      } else if (error.code === '500' || error.message?.includes('500')) {
        console.warn('[getCurrentUserProfile] Profile fetch returned 500 (non-blocking):', {
          error: error.message,
          note: 'This is likely an RLS policy issue. User can still proceed via admin allowlist.'
        });
      } else {
        console.warn('[getCurrentUserProfile] Profile fetch error (non-blocking):', error.message);
      }
      // Return null profile, no error - don't block operations
      return { profile: null, error: null };
    }

    if (data) {
      console.log('[getCurrentUserProfile] Profile found:', { id: data.id, email: data.email, role: data.role });
      return { profile: data as UserProfile, error: null };
    } else {
      console.log('[getCurrentUserProfile] No profile data returned (non-blocking)');
      return { profile: null, error: null };
    }
  } catch (e: any) {
    // Catch any unexpected errors - don't propagate them
    console.warn('[getCurrentUserProfile] Unexpected error (non-blocking):', e.message || e);
    return { profile: null, error: null };
  }
}

/**
 * Check if current user is an editor or admin
 * Returns true if user has editor or admin role, OR if email is in admin allowlist
 * Returns false if user is not authenticated or doesn't have permissions
 * 
 * IMPORTANT: This function is non-blocking. Profile fetch errors (including 500) will not prevent
 * admin allowlist checks from working.
 */
export async function isCurrentUserEditor(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('[isCurrentUserEditor] No authenticated user');
      return false;
    }

    console.log('[isCurrentUserEditor] Checking permissions for:', user.email);
    
    // First check if email is in admin allowlist - this is the PRIMARY check
    // This works even if profiles table is broken
    if (isAdminEmail(user.email)) {
      console.log('[isCurrentUserEditor] ✅ User is in admin allowlist, granting access');
      return true;
    }

    // Secondary check: try to load profile from database
    // If this fails (500 error, RLS issue, etc.), we already checked allowlist above
    const { profile } = await getCurrentUserProfile();
    
    if (!profile) {
      console.log('[isCurrentUserEditor] No profile found and email not in allowlist');
      return false;
    }
    
    const hasPermission = profile.role === 'editor' || profile.role === 'admin';
    console.log('[isCurrentUserEditor] Profile-based permission check:', { 
      email: profile.email, 
      role: profile.role, 
      hasPermission 
    });
    
    return hasPermission;
  } catch (e: any) {
    console.warn('[isCurrentUserEditor] Error checking permissions (non-blocking):', e.message || e);
    return false;
  }
}

/**
 * Check if current user is an admin
 * Returns true only if user has admin role
 * IMPORTANT: This is non-blocking. Profile fetch errors will not throw.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const { profile } = await getCurrentUserProfile();
    
    // getCurrentUserProfile now returns null error on failure (non-blocking)
    if (!profile) {
      console.log('[isCurrentUserAdmin] No profile found');
      return false;
    }
    
    const isAdmin = profile.role === 'admin';
    console.log('[isCurrentUserAdmin] Admin check:', { 
      email: profile.email, 
      role: profile.role, 
      isAdmin 
    });
    
    return isAdmin;
  } catch (e: any) {
    console.warn('[isCurrentUserAdmin] Unexpected error (non-blocking):', e.message || e);
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
