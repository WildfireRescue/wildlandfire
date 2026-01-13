// =====================================================
// BLOG POST PAGE
// Single blog post view with premium reading experience
// Enhanced with comprehensive SEO meta tags and structured data
// =====================================================

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '../components/ui/button';
import { BlogPostMeta } from '../components/blog/BlogPostMeta';
import { BlogBreadcrumbs } from '../components/blog/BlogBreadcrumbs';
import { BlogAuthorBlock } from '../components/blog/BlogAuthorBlock';
import { BlogReadingProgress } from '../components/blog/BlogReadingProgress';
import { BlogTableOfContents } from '../components/blog/BlogTableOfContents';
import { BlogShareButtons } from '../components/blog/BlogShareButtons';
import { BlogRelatedPosts } from '../components/blog/BlogRelatedPosts';
import { BlogEEATSignals } from '../components/blog/BlogEEATSignals';
import { BlogSources } from '../components/blog/BlogSources';
import { getPostBySlug } from '../../lib/supabaseBlog';
import { generateMetaTags, updateDocumentMeta, generateArticleStructuredData } from '../../lib/seoHelpers';
import { safeImageSrc, safeMarkdownContent, coerceToString, PLACEHOLDER_IMAGE } from '../../lib/blogImages';
import type { BlogPost } from '../../lib/blogTypes';

interface BlogPostPageProps {
  slug: string;
}

export function BlogPostPage({ slug }: BlogPostPageProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // HOOK 1: Load post data
  useEffect(() => {
    async function loadPost() {
      setLoading(true);
      setError(null);

      try {
        console.log('[BlogPostPage] Loading post:', slug);
        
        const { post: fetchedPost, error: fetchError } = await getPostBySlug(slug);

        if (fetchError) {
          console.error('[BlogPostPage] Fetch error:', fetchError);
          throw fetchError;
        }
        
        if (!fetchedPost) {
          console.warn('[BlogPostPage] Post not found:', slug);
          throw new Error('Post not found');
        }

        console.log('[BlogPostPage] Post loaded successfully:', {
          title: fetchedPost.title,
          slug: fetchedPost.slug,
          hasContent: !!fetchedPost.content_markdown,
          contentType: typeof fetchedPost.content_markdown
        });

        setPost(fetchedPost);
        
        // Generate and apply SEO meta tags
        const metaTags = generateMetaTags(fetchedPost);
        updateDocumentMeta(metaTags);
        
        // Add JSON-LD structured data
        const structuredData = generateArticleStructuredData(fetchedPost);
        let scriptTag = document.getElementById('article-structured-data') as HTMLScriptElement;
        if (!scriptTag) {
          scriptTag = document.createElement('script');
          scriptTag.id = 'article-structured-data';
          scriptTag.type = 'application/ld+json';
          document.head.appendChild(scriptTag);
        }
        scriptTag.textContent = JSON.stringify(structuredData);
        
      } catch (err: any) {
        console.error('[BlogPostPage] Error loading post:', err);
        setError(err?.message || 'Failed to load post');
        setPost(null);
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [slug]);

  // HOOK 2: Add IDs to headings for TOC navigation (runs after post is loaded)
  useEffect(() => {
    if (!post) return;

    const articleElement = document.querySelector('article.blog-content');
    if (!articleElement) return;

    const headings = articleElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((heading) => {
      const text = heading.textContent || '';
      const id = text
        .toLowerCase()
        .trim()
        .replace(/['"]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      heading.id = id;
    });
  }, [post]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-24">
        <div className="container mx-auto px-6 text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground mt-4">Loading post...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !post) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-24">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center">
            <p className="text-destructive text-lg mb-6">{error || 'Post not found'}</p>
            <Button onClick={() => (window.location.hash = 'blog')}>
              <ArrowLeft size={18} className="mr-2" />
              Back to Blog
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <BlogPostMeta post={post} />

      {/* Reading Progress Bar */}
      <BlogReadingProgress />

      <div className="min-h-screen bg-background pt-20 pb-24">
        {/* Centered Content Layout - No Sidebar */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-5xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => (window.location.hash = 'blog')}
            className="mb-8 -ml-4 text-muted-foreground hover:text-foreground transition-colors"
            size="sm"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Blog
          </Button>

          {/* Breadcrumbs */}
          <BlogBreadcrumbs category={post.category} title={post.title} />

          {/* Article Metadata & Author */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <BlogAuthorBlock
              author={post.author_name}
              publishedAt={post.published_at}
              updatedAt={post.updated_at}
              readingTime={post.reading_time_minutes}
              category={post.category}
            />
          </motion.div>

              {/* Article Title & Excerpt */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12 text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-8 leading-[1.1] tracking-tight text-heading">
              {coerceToString(post.title)}
            </h1>

            {post.excerpt && (
              <p className="text-lg md:text-xl lg:text-2xl leading-relaxed text-body-text-muted font-light max-w-3xl mx-auto">
                {coerceToString(post.excerpt)}
              </p>
            )}
          </motion.header>

          {/* Cover Image */}
          {post.cover_image_url && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-16 -mx-4 sm:mx-0"
            >
              <img
                src={safeImageSrc(post.cover_image_url, PLACEHOLDER_IMAGE)}
                alt={coerceToString(post.title) || 'Blog post cover'}
                className="rounded-none sm:rounded-2xl w-full border-0 sm:border border-border/30 shadow-2xl"
                loading="eager"
                decoding="async"
                onError={(e) => {
                  console.warn('[BlogPostPage] Cover image failed to load:', post.cover_image_url);
                  e.currentTarget.src = PLACEHOLDER_IMAGE;
                }}
              />
            </motion.div>
          )}

          {/* Inline Table of Contents - Collapsible */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12 max-w-3xl mx-auto"
          >
            <BlogTableOfContents content={safeMarkdownContent(post.content_markdown)} />
          </motion.div>

          {/* Article Content - Centered, Optimal Reading Width */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="blog-content max-w-3xl mx-auto"
          >
            <div className="prose prose-invert prose-lg max-w-none prose-p:leading-relaxed prose-p:mb-6">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {safeMarkdownContent(post.content_markdown)}
              </ReactMarkdown>
            </div>
          </motion.article>

          {/* Post Footer: Sources, E-E-A-T, Share */}
          <div className="max-w-3xl mx-auto mt-16 space-y-12">
            {/* Sources & Citations */}
            <BlogSources post={post} />

            {/* E-E-A-T Signals */}
            <div className="border-t border-border/30 pt-12">
              <BlogEEATSignals post={post} />
            </div>

            {/* Share Section */}
            <div className="border-t border-border/30 pt-12">
              <BlogShareButtons 
                title={coerceToString(post.title)} 
                excerpt={post.excerpt ? coerceToString(post.excerpt) : null} 
              />
            </div>
          </div>

          {/* Related Posts */}
          <div className="mt-20">
            <BlogRelatedPosts category={post.category} currentSlug={post.slug} />
          </div>

          {/* Back Button (bottom) */}
          <div className="mt-16 text-center">
            <Button
              variant="outline"
              onClick={() => (window.location.hash = 'blog')}
              className="px-8 py-6 font-medium text-base"
            >
              <ArrowLeft size={18} className="mr-2" />
              Back to All Posts
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
