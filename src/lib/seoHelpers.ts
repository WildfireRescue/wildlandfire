// =====================================================
// SEO META TAG HELPERS
// Generate comprehensive meta tags for blog posts
// =====================================================

import type { BlogPost } from './blogTypes';

export interface MetaTags {
  // Basic Meta
  title: string;
  description: string;
  canonical?: string;
  robots: string;
  keywords?: string;
  
  // Open Graph
  ogType: string;
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogUrl?: string;
  ogSiteName: string;
  
  // Twitter
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage?: string;
  twitterImageAlt?: string;
  twitterSite?: string;
  twitterCreator?: string;
  
  // Article Specific
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleAuthor?: string;
  articleSection?: string;
  articleTag?: string[];
}

/**
 * Generate comprehensive meta tags for a blog post
 * Implements proper fallback hierarchy for SEO optimization
 */
export function generateMetaTags(
  post: BlogPost,
  siteUrl: string = window.location.origin,
  siteName: string = 'Wildland Fire Recovery Fund',
  twitterHandle?: string
): MetaTags {
  // Build canonical URL (no hash fragments for browser history routing)
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const canonicalUrl = post.canonical_url || postUrl;
  
  // Title hierarchy: meta_title > title
  const title = post.meta_title || post.title;
  
  // Description hierarchy: meta_description > excerpt > truncated content
  const description = post.meta_description || 
    post.excerpt || 
    post.content_markdown.slice(0, 160).trim() + '...';
  
  // OG Title hierarchy: og_title > meta_title > title
  const ogTitle = post.og_title || post.meta_title || post.title;
  
  // OG Description hierarchy: og_description > meta_description > excerpt
  const ogDescription = post.og_description || 
    post.meta_description || 
    post.excerpt || 
    post.content_markdown.slice(0, 160).trim() + '...';
  
  // Image hierarchy: og_image_url > featured_image_url > cover_image_url
  const imageUrl = post.og_image_url || post.featured_image_url || post.cover_image_url;
  const imageAlt = post.featured_image_alt_text || post.title;
  
  // Robots directives with proper fallback
  const robots = post.robots_directives || 
    (post.allow_indexing && post.allow_follow ? 'index,follow' :
     post.allow_indexing && !post.allow_follow ? 'index,nofollow' :
     !post.allow_indexing && post.allow_follow ? 'noindex,follow' :
     'noindex,nofollow');
  
  // Keywords: combine focus + secondary
  const keywords = [post.focus_keyword, ...(post.secondary_keywords || [])]
    .filter(Boolean)
    .join(', ');
  
  return {
    // Basic Meta
    title,
    description,
    canonical: canonicalUrl,
    robots,
    keywords: keywords || undefined,
    
    // Open Graph
    ogType: 'article',
    ogTitle,
    ogDescription,
    ogImage: imageUrl || undefined,
    ogImageAlt: imageUrl ? imageAlt : undefined,
    ogUrl: postUrl,
    ogSiteName: siteName,
    
    // Twitter
    twitterCard: post.twitter_card || 'summary_large_image',
    twitterTitle: ogTitle,
    twitterDescription: ogDescription,
    twitterImage: imageUrl || undefined,
    twitterImageAlt: imageUrl ? imageAlt : undefined,
    twitterSite: twitterHandle,
    twitterCreator: twitterHandle,
    
    // Article Specific
    articlePublishedTime: post.published_at || undefined,
    articleModifiedTime: post.last_updated_at || post.updated_at,
    articleAuthor: post.author_name || undefined,
    articleSection: post.category || undefined,
    articleTag: post.tags.length > 0 ? post.tags : undefined,
  };
}

/**
 * Render meta tags as HTML string (for SSR or dynamic injection)
 */
export function renderMetaTags(tags: MetaTags): string {
  const metaElements: string[] = [];
  
  // Basic meta tags
  if (tags.description) {
    metaElements.push(`<meta name="description" content="${escapeHtml(tags.description)}">`);
  }
  if (tags.keywords) {
    metaElements.push(`<meta name="keywords" content="${escapeHtml(tags.keywords)}">`);
  }
  if (tags.robots) {
    metaElements.push(`<meta name="robots" content="${tags.robots}">`);
  }
  
  // Canonical
  if (tags.canonical) {
    metaElements.push(`<link rel="canonical" href="${escapeHtml(tags.canonical)}">`);
  }
  
  // Open Graph
  metaElements.push(`<meta property="og:type" content="${tags.ogType}">`);
  metaElements.push(`<meta property="og:title" content="${escapeHtml(tags.ogTitle)}">`);
  metaElements.push(`<meta property="og:description" content="${escapeHtml(tags.ogDescription)}">`);
  if (tags.ogUrl) {
    metaElements.push(`<meta property="og:url" content="${escapeHtml(tags.ogUrl)}">`);
  }
  metaElements.push(`<meta property="og:site_name" content="${escapeHtml(tags.ogSiteName)}">`);
  
  if (tags.ogImage) {
    metaElements.push(`<meta property="og:image" content="${escapeHtml(tags.ogImage)}">`);
    if (tags.ogImageAlt) {
      metaElements.push(`<meta property="og:image:alt" content="${escapeHtml(tags.ogImageAlt)}">`);
    }
  }
  
  // Twitter
  metaElements.push(`<meta name="twitter:card" content="${tags.twitterCard}">`);
  metaElements.push(`<meta name="twitter:title" content="${escapeHtml(tags.twitterTitle)}">`);
  metaElements.push(`<meta name="twitter:description" content="${escapeHtml(tags.twitterDescription)}">`);
  
  if (tags.twitterImage) {
    metaElements.push(`<meta name="twitter:image" content="${escapeHtml(tags.twitterImage)}">`);
    if (tags.twitterImageAlt) {
      metaElements.push(`<meta name="twitter:image:alt" content="${escapeHtml(tags.twitterImageAlt)}">`);
    }
  }
  
  if (tags.twitterSite) {
    metaElements.push(`<meta name="twitter:site" content="${tags.twitterSite}">`);
  }
  if (tags.twitterCreator) {
    metaElements.push(`<meta name="twitter:creator" content="${tags.twitterCreator}">`);
  }
  
  // Article meta
  if (tags.articlePublishedTime) {
    metaElements.push(`<meta property="article:published_time" content="${tags.articlePublishedTime}">`);
  }
  if (tags.articleModifiedTime) {
    metaElements.push(`<meta property="article:modified_time" content="${tags.articleModifiedTime}">`);
  }
  if (tags.articleAuthor) {
    metaElements.push(`<meta property="article:author" content="${escapeHtml(tags.articleAuthor)}">`);
  }
  if (tags.articleSection) {
    metaElements.push(`<meta property="article:section" content="${escapeHtml(tags.articleSection)}">`);
  }
  if (tags.articleTag) {
    tags.articleTag.forEach(tag => {
      metaElements.push(`<meta property="article:tag" content="${escapeHtml(tag)}">`);
    });
  }
  
  return metaElements.join('\n');
}

/**
 * Generate JSON-LD structured data for blog post (BlogPosting schema)
 * Optimized for Google rich results eligibility
 */
export function generateArticleStructuredData(
  post: BlogPost,
  siteUrl: string = window.location.origin,
  organizationName: string = 'The Wildland Fire Recovery Fund',
  organizationLogo: string = `${window.location.origin}/Images/logo-512.png`
) {
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const imageUrl = post.og_image_url || post.featured_image_url || post.cover_image_url;
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.meta_description || post.content_markdown?.slice(0, 160),
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: post.published_at || new Date().toISOString(),
    dateModified: post.last_updated_at || post.updated_at || post.published_at || new Date().toISOString(),
    author: {
      '@type': post.author_role ? 'Person' : 'Organization',
      name: post.author_name || organizationName,
      ...(post.author_role && { jobTitle: post.author_role }),
      ...(post.author_bio && { description: post.author_bio }),
    },
    publisher: {
      '@type': 'Organization',
      name: organizationName,
      logo: {
        '@type': 'ImageObject',
        url: organizationLogo,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    ...(post.fact_checked && {
      isAccessibleForFree: true,
      reviewedBy: post.reviewed_by ? {
        '@type': 'Person',
        name: post.reviewed_by,
      } : undefined,
    }),
    ...(post.category && {
      articleSection: post.category,
    }),
    ...(post.tags.length > 0 && {
      keywords: post.tags.join(', '),
    }),
  };
  
  return structuredData;
}

/**
 * Helper to escape HTML in meta tag values
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}

/**
 * Update document head with meta tags (client-side)
 */
export function updateDocumentMeta(tags: MetaTags, siteName: string = 'The Wildland Fire Recovery Fund'): void {
  // Update title with site name appended
  document.title = `${tags.title} | ${siteName}`;
  
  // Helper to set or update meta tag
  const setMeta = (selector: string, content: string) => {
    let element = document.querySelector(selector) as HTMLMetaElement;
    if (!element) {
      element = document.createElement('meta');
      const [attr, value] = selector.match(/\[(.+)="(.+)"\]/)?.slice(1) || [];
      if (attr && value) {
        element.setAttribute(attr, value);
      }
      document.head.appendChild(element);
    }
    element.content = content;
  };
  
  // Helper to set or update link tag
  const setLink = (rel: string, href: string) => {
    let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
    if (!element) {
      element = document.createElement('link');
      element.rel = rel;
      document.head.appendChild(element);
    }
    element.href = href;
  };
  
  // Basic meta
  setMeta('meta[name="description"]', tags.description);
  if (tags.keywords) setMeta('meta[name="keywords"]', tags.keywords);
  setMeta('meta[name="robots"]', tags.robots);
  
  // Canonical
  if (tags.canonical) setLink('canonical', tags.canonical);
  
  // Open Graph
  setMeta('meta[property="og:type"]', tags.ogType);
  setMeta('meta[property="og:title"]', tags.ogTitle);
  setMeta('meta[property="og:description"]', tags.ogDescription);
  if (tags.ogUrl) {
    setMeta('meta[property="og:url"]', tags.ogUrl);
  }
  setMeta('meta[property="og:site_name"]', tags.ogSiteName);
  if (tags.ogImage) {
    setMeta('meta[property="og:image"]', tags.ogImage);
    if (tags.ogImageAlt) setMeta('meta[property="og:image:alt"]', tags.ogImageAlt);
  }
  
  // Twitter
  setMeta('meta[name="twitter:card"]', tags.twitterCard);
  setMeta('meta[name="twitter:title"]', tags.twitterTitle);
  setMeta('meta[name="twitter:description"]', tags.twitterDescription);
  if (tags.twitterImage) {
    setMeta('meta[name="twitter:image"]', tags.twitterImage);
    if (tags.twitterImageAlt) setMeta('meta[name="twitter:image:alt"]', tags.twitterImageAlt);
  }
  if (tags.twitterSite) setMeta('meta[name="twitter:site"]', tags.twitterSite);
  
  // Article meta
  if (tags.articlePublishedTime) {
    setMeta('meta[property="article:published_time"]', tags.articlePublishedTime);
  }
  if (tags.articleModifiedTime) {
    setMeta('meta[property="article:modified_time"]', tags.articleModifiedTime);
  }
}
