// =====================================================
// BLOG TYPE DEFINITIONS
// =====================================================

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_markdown: string;
  content_html: string | null;
  cover_image_url: string | null;
  og_image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  category: string | null;
  tags: string[];
  status: 'draft' | 'published';
  published_at: string | null;
  updated_at: string;
  created_at: string;
  author_id: string | null;
  author_name: string | null;
  author_email: string;
  reading_time_minutes: number;
  faq_json: FAQ[] | null;
  noindex: boolean;
  featured: boolean;
  view_count: number;
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
  id: string;
  user_id: string;
  email: string;
  role: 'viewer' | 'editor' | 'admin';
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
  title: string;
  slug: string;
  excerpt: string;
  content_markdown: string;
  cover_image_url: string;
  og_image_url: string;
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  featured: boolean;
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
  status?: 'draft' | 'published';
}
