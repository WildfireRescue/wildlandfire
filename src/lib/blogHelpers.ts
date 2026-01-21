// =====================================================
// BLOG HELPER FUNCTIONS
// =====================================================

import type { Heading } from './blogTypes';

/**
 * Calculate reading time based on average reading speed of 200 words per minute
 */
export function calculateReadingTime(markdown: string): number {
  const wordsPerMinute = 200;
  const words = markdown.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return Math.max(1, minutes); // Minimum 1 minute
}

/**
 * Generate URL-friendly slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extract headings from markdown for Table of Contents
 */
export function extractHeadings(markdown: string): Heading[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Heading[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = generateSlug(text);
    
    headings.push({ id, text, level });
  }

  return headings;
}

/**
 * Format date for display
 */
export function formatDate(dateString: string, format: 'short' | 'long' = 'short'): string {
  const date = new Date(dateString);
  
  if (format === 'long') {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Parse tags from comma-separated string
 */
export function parseTags(tagString: string): string[] {
  return tagString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .map(tag => tag.toLowerCase());
}

/**
 * Format tags for display (capitalize first letter)
 */
export function formatTag(tag: string): string {
  return tag.charAt(0).toUpperCase() + tag.slice(1);
}

/**
 * Get estimated read time text
 */
export function getReadTimeText(minutes: number): string {
  return `${minutes} min read`;
}

/**
 * Get category color class for badges
 */
export function getCategoryColor(category: string | null): string {
  const colors: Record<string, string> = {
    news: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    stories: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    resources: 'bg-green-500/10 text-green-400 border-green-500/20',
    updates: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };
  
  const categoryKey = (category || '').toLowerCase();
  return colors[categoryKey] || 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20';
}

/**
 * Extract excerpt from markdown if not provided
 */
export function extractExcerpt(markdown: string, maxLength: number = 160): string {
  // Remove markdown syntax
  const plainText = markdown
    .replace(/^#{1,6}\s+/gm, '') // Remove headings
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`(.+?)`/g, '$1') // Remove inline code
    .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
    .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
    .trim();
  
  return truncateText(plainText, maxLength);
}

/**
 * Check if user is authenticated editor
 */
export function isEditor(userRole: string | null): boolean {
  return userRole === 'editor' || userRole === 'admin';
}

/**
 * Get full blog post URL
 */
export function getBlogPostUrl(slug: string): string {
  return `https://thewildlandfirerecoveryfund.org/#blog/${slug}`;
}

/**
 * Get absolute URL for any path
 */
export function getAbsoluteUrl(path: string): string {
  return `https://thewildlandfirerecoveryfund.org${path}`;
}
