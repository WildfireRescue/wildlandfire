// =====================================================
// BLOG TYPE DEFINITIONS
// Enhanced with comprehensive SEO, E-E-A-T, and metadata fields
// =====================================================

export interface BlogPost {
  // Core fields
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_markdown: string;
  content_html: string | null;
  
  // SEO & Metadata
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  focus_keyword: string | null;
  secondary_keywords: string[] | null;
  
  // Images & Social
  cover_image_url: string | null;
  featured_image_url: string | null;
  featured_image_alt_text: string | null;
  og_image_url: string | null;
  og_image_width: number;
  og_image_height: number;
  og_image_type: string;
  og_title: string | null;
  og_description: string | null;
  twitter_card: string;
  
  // Categories & Tags
  category: string | null;
  tags: string[];
  
  // Publishing & Discovery
  status: 'draft' | 'scheduled' | 'published';
  published_at: string | null;
  scheduled_for: string | null;
  featured: boolean;
  allow_indexing: boolean;
  allow_follow: boolean;
  robots_directives: string;
  sitemap_priority: number;
  
  // Trust / E-E-A-T
  author_id: string | null;
  author_name: string | null;
  author_email: string;
  author_role: string | null;
  author_bio: string | null;
  reviewed_by: string | null;
  fact_checked: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  last_updated_at: string | null;
  
  // Additional
  reading_time_minutes: number;
  faq_json: FAQ[] | null;
  view_count: number;
  noindex: boolean; // deprecated in favor of allow_indexing
  
  // Backlinks / Citations
  sources: Source[] | null;
  outbound_links_verified: boolean;
}

export interface Source {
  label: string;
  url: string;
}

export interface BlogCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string; // This is the auth.users.id
  email: string;
  role: 'user' | 'editor' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export interface BlogPostFormData {
  // Core fields
  title: string;
  slug: string;
  excerpt: string;
  content_markdown: string;
  
  // SEO & Metadata
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  focus_keyword: string;
  secondary_keywords: string[];
  
  // Images & Social
  cover_image_url: string;
  featured_image_url: string;
  featured_image_alt_text: string;
  og_image_url: string;
  og_image_width: number;
  og_image_height: number;
  og_image_type: string;
  og_title: string;
  og_description: string;
  twitter_card: string;
  
  // Categories & Tags
  category: string;
  tags: string[];
  
  // Publishing & Discovery
  status: 'draft' | 'scheduled' | 'published';
  scheduled_for: string;
  featured: boolean;
  allow_indexing: boolean;
  allow_follow: boolean;
  robots_directives: string;
  sitemap_priority: number;
  
  // Trust / E-E-A-T
  author_name: string;
  author_role: string;
  author_bio: string;
  reviewed_by: string;
  fact_checked: boolean;
  
  // Backlinks / Citations
  sources: Source[];
  outbound_links_verified: boolean;
  
  // Deprecated
  noindex: boolean;
}

export interface PaginationOptions {
  page: number;
  perPage: number;
}

export interface BlogListFilters {
  category?: string;
  tag?: string;
  search?: string;
  status?: 'draft' | 'scheduled' | 'published';
}
