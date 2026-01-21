// =====================================================
// BLOG POST META COMPONENT
// SEO meta tags using react-helmet-async
// =====================================================

import { Helmet } from 'react-helmet-async';
import { getBlogPostUrl } from '../../../lib/blogHelpers.ts';
import type { BlogPost } from '../../../lib/blogTypes';

interface BlogPostMetaProps {
  post: BlogPost;
}

export function BlogPostMeta({ post }: BlogPostMetaProps) {
  const title = post.meta_title || `${post.title} | The Wildland Fire Recovery Fund Blog`;
  const description = post.meta_description || post.excerpt || '';
  const canonicalUrl = post.canonical_url || getBlogPostUrl(post.slug);
  const ogImage = post.og_image_url || post.cover_image_url || 'https://thewildlandfirerecoveryfund.org/Images/logo-512.png';
  const robots = post.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large';

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content={robots} />
      <meta name="googlebot" content={robots} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="article" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="The Wildland Fire Recovery Fund" />
      <meta property="og:locale" content="en_US" />
      
      {/* Article Meta */}
      {post.published_at && (
        <meta property="article:published_time" content={post.published_at} />
      )}
      {post.updated_at && (
        <meta property="article:modified_time" content={post.updated_at} />
      )}
      {post.author_name && (
        <meta property="article:author" content={post.author_name} />
      )}
      {post.category && (
        <meta property="article:section" content={post.category} />
      )}
      {post.tags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={post.title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@wildfirerecovery" />

      {/* Additional Meta */}
      <meta name="author" content={post.author_name || 'The Wildland Fire Recovery Fund'} />
      {post.tags.length > 0 && (
        <meta name="keywords" content={post.tags.join(', ')} />
      )}

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: description,
          image: ogImage,
          datePublished: post.published_at,
          dateModified: post.updated_at,
          author: {
            '@type': 'Person',
            name: post.author_name || 'The Wildland Fire Recovery Fund'
          },
          publisher: {
            '@type': 'Organization',
            name: 'The Wildland Fire Recovery Fund',
            logo: {
              '@type': 'ImageObject',
              url: 'https://thewildlandfirerecoveryfund.org/Images/logo-512.png'
            }
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': canonicalUrl
          },
          ...(post.category && { articleSection: post.category }),
          ...(post.tags.length > 0 && { keywords: post.tags.join(', ') })
        })}
      </script>

      {/* Breadcrumb Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://thewildlandfirerecoveryfund.org'
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Blog',
              item: 'https://thewildlandfirerecoveryfund.org/#blog'
            },
            ...(post.category ? [{
              '@type': 'ListItem',
              position: 3,
              name: post.category,
              item: `https://thewildlandfirerecoveryfund.org/#blog/category/${post.category}`
            }] : []),
            {
              '@type': 'ListItem',
              position: post.category ? 4 : 3,
              name: post.title
            }
          ]
        })}
      </script>

      {/* FAQ Structured Data (if exists) */}
      {post.faq_json && post.faq_json.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: post.faq_json.map(faq => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer
              }
            }))
          })}
        </script>
      )}
    </Helmet>
  );
}
