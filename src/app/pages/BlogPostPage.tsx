import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
import { getPostBySlug } from '../../lib/supabaseBlog.ts';
import { getArticleBySlug } from '../../lib/articles.ts';
import HostedArticleTemplate from '../components/HostedArticleTemplate';
import ExternalArticleTemplate from '../components/ExternalArticleTemplate';
import { generateMetaTags, updateDocumentMeta, generateArticleStructuredData } from '../../lib/seoHelpers.ts';
import { safeImageSrc, safeMarkdownContent, coerceToString, PLACEHOLDER_IMAGE } from '../../lib/blogImages.ts';
import { debugLog, debugError, debugTiming } from '../../lib/debug.ts';
import { categorizeError, getUserErrorMessage, isRetryableError } from '../../lib/errorHandling.ts';
import type { BlogPost } from '../../lib/blogTypes';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCategory, setErrorCategory] = useState<string | null>(null);
  const [isRetryable, setIsRetryable] = useState(true);

  // HOOK 1: Load post data
  useEffect(() => {
    // Redirect if no slug provided
    if (!slug) {
      navigate('/blog');
      return;
    }

    let isMounted = true;
    const abortController = new AbortController();

    async function loadPost() {
      const endTiming = debugTiming('BlogPostPage.loadPost');
      
      // Only update state if still mounted
      if (!isMounted) return;
      
      setLoading(true);
      setError(null);

      try {
        debugLog('=== BlogPostPage Load Started ===');
        debugLog('Slug:', slug);
        debugLog('Route:', window.location.hash);
        
        // Log the exact Supabase query that will be executed
        debugLog('Executing Supabase Query:', {
          table: 'posts',
          select: '*',
          filters: [
            { field: 'slug', operator: 'eq', value: slug },
            { field: 'status', operator: 'eq', value: 'published' },
            { field: 'noindex', operator: 'eq', value: false }
          ],
          modifier: 'single()'
        });
        
        const queryStartTime = performance.now();
        const { post: fetchedPost, error: fetchError } = await getPostBySlug(slug);
        const queryEndTime = performance.now();
        
        // Check if component was unmounted or slug changed
        if (!isMounted || abortController.signal.aborted) {
          debugLog('Request aborted or component unmounted');
          return;
        }
        
        debugLog('Supabase Query Completed:', {
          duration: `${(queryEndTime - queryStartTime).toFixed(2)}ms`,
          hasPost: !!fetchedPost,
          hasError: !!fetchError
        });

        // Handle errors from the query
        if (fetchError) {
          const categorized = categorizeError(fetchError);
          debugError('Post fetch returned an error', {
            error: fetchError,
            category: categorized.category,
            userMessage: categorized.userMessage
          });
          
          // For certain errors, don't even try the fallback
          if (categorized.category === 'PERMISSION_DENIED') {
            throw new Error(categorized.userMessage);
          }
          
          // For other errors, log and try fallback
          debugLog('Will try articles table fallback despite error');
        }

        if (!fetchedPost) {
          debugLog('Post not found in legacy posts table, trying new articles table:', slug);
          
          debugLog('Executing Articles Query:', {
            table: 'articles',
            filters: [{ field: 'slug', operator: 'eq', value: slug }]
          });
          
          const articleQueryStart = performance.now();
          const article = await getArticleBySlug(slug);
          const articleQueryEnd = performance.now();
          
          // Check again before updating state
          if (!isMounted || abortController.signal.aborted) {
            debugLog('Request aborted or component unmounted');
            return;
          }
          
          debugLog('Articles Query Completed:', {
            duration: `${(articleQueryEnd - articleQueryStart).toFixed(2)}ms`,
            hasArticle: !!article
          });
          
          if (article) {
            debugLog('Article found in articles table:', {
              id: article.id,
              title: article.title || article.og_title,
              type: article.type
            });
            
            // attach to state in a lightweight wrapper
            setPost({ __article: article });
            
            // Update document metadata for articles
            const articleTitle = article.title || article.og_title || 'Article';
            const articleDescription = article.og_description || article.description || (article.content_html ? article.content_html.replace(/<[^>]*>/g, '').slice(0, 160) : '');
            
            updateDocumentMeta({
              title: articleTitle,
              description: articleDescription,
              canonical: article.canonical_url || `${window.location.origin}/blog/${slug}`,
              robots: 'index,follow',
              ogType: 'article',
              ogTitle: article.og_title || articleTitle,
              ogDescription: article.og_description || articleDescription,
              ogImage: article.og_image,
              ogUrl: `${window.location.origin}/blog/${slug}`,
              ogSiteName: 'The Wildland Fire Recovery Fund',
              twitterCard: 'summary_large_image',
              twitterTitle: article.og_title || articleTitle,
              twitterDescription: article.og_description || articleDescription,
              twitterImage: article.og_image,
              articlePublishedTime: article.published_at,
              articleModifiedTime: article.updated_at,
            });
            
            // Add JSON-LD BlogPosting structured data for articles
            const articleStructuredData = {
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: articleTitle,
              description: articleDescription,
              image: article.og_image ? [article.og_image] : undefined,
              datePublished: article.published_at || new Date().toISOString(),
              dateModified: article.updated_at || article.published_at || new Date().toISOString(),
              author: {
                '@type': 'Organization',
                name: 'The Wildland Fire Recovery Fund',
              },
              publisher: {
                '@type': 'Organization',
                name: 'The Wildland Fire Recovery Fund',
                logo: {
                  '@type': 'ImageObject',
                  url: `${window.location.origin}/Images/logo-512.png`,
                },
              },
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `${window.location.origin}/blog/${slug}`,
              },
            };
            
            let scriptTag = document.getElementById('article-structured-data') as HTMLScriptElement;
            if (!scriptTag) {
              scriptTag = document.createElement('script');
              scriptTag.id = 'article-structured-data';
              scriptTag.type = 'application/ld+json';
              document.head.appendChild(scriptTag);
            }
            scriptTag.textContent = JSON.stringify(articleStructuredData);
            
            setLoading(false);
            endTiming();
            debugLog('=== BlogPostPage Load Complete (Articles) ===');
            return;
          }

          // Post not found in either table
          debugError('Post not found in any source', { slug, tables: ['posts', 'articles'] });
          
          // Set not-found state (not an error, just missing)
          if (isMounted) {
            setError(null); // Clear error since this is just "not found"
            setErrorCategory('NOT_FOUND');
            setIsRetryable(false);
            setPost(null);
            setLoading(false);
          }
          
          endTiming();
          debugLog('=== BlogPostPage Load Complete (Not Found) ===');
          return;
        }

        debugLog('Post loaded successfully from legacy posts table:', {
          id: fetchedPost.id,
          title: fetchedPost.title,
          slug: fetchedPost.slug,
          status: fetchedPost.status,
          hasContent: !!fetchedPost.content_markdown,
          contentLength: fetchedPost.content_markdown?.length || 0,
          contentType: typeof fetchedPost.content_markdown,
          publishedAt: fetchedPost.published_at
        });

        setPost(fetchedPost);
        
        // Generate and apply SEO meta tags
        const metaTags = generateMetaTags(fetchedPost);
        updateDocumentMeta(metaTags, 'The Wildland Fire Recovery Fund');
        
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
        
        endTiming();
        debugLog('=== BlogPostPage Load Complete (Posts) ===');
        
      } catch (err: any) {
        // Don't treat AbortError as a real error
        if (err.name === 'AbortError' || abortController.signal.aborted) {
          debugLog('Fetch aborted cleanly');
          return;
        }
        
        // Only update state if still mounted
        if (!isMounted) return;
        
        // Categorize the error for better UX
        const categorized = categorizeError(err);
        
        debugError('Error loading post', {
          error: err,
          category: categorized.category,
          userMessage: categorized.userMessage,
          retryable: categorized.retryable,
          technicalDetails: categorized.technicalDetails
        });
        
        setError(categorized.userMessage);
        setErrorCategory(categorized.category);
        setIsRetryable(categorized.retryable);
        setPost(null);
        endTiming();
      } finally {
        // Only update loading state if still mounted
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPost();

    // Cleanup function - runs when slug changes or component unmounts
    return () => {
      debugLog('Cleaning up BlogPostPage effect for slug:', slug);
      isMounted = false;
      abortController.abort();
      
      // Reset document title to default when leaving the page
      document.title = 'The Wildland Fire Recovery Fund';
      
      // Remove article structured data when leaving
      const scriptTag = document.getElementById('article-structured-data');
      if (scriptTag) {
        scriptTag.remove();
      }
    };
  }, [slug]);

  // HOOK 2: Add IDs to headings for TOC navigation (runs after post is loaded)
  useEffect(() => {
    if (!post) return;

    // Use a slight delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(() => {
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
    }, 0);

    // Cleanup timeout on unmount or post change
    return () => {
      clearTimeout(timeoutId);
    };
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

  // Error State - Enhanced with categorization
  if (error || !post) {
    const handleRetry = () => {
      window.location.reload();
    };

    const handleGoBack = () => {
      navigate('/blog');
    };

    // Determine error icon and message
    const isNotFound = errorCategory === 'NOT_FOUND' || (!error && !post);
    const isPermission = errorCategory === 'PERMISSION_DENIED';
    const isNetwork = errorCategory === 'NETWORK_ERROR';
    const isServer = errorCategory === 'SERVER_ERROR';

    return (
      <div className="min-h-screen bg-background pt-20 pb-24">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className={`rounded-xl p-8 text-center ${
            isNotFound ? 'bg-muted/50 border border-border' :
            isPermission ? 'bg-destructive/10 border border-destructive/20' :
            'bg-warning/10 border border-warning/20'
          }`}>
            {/* Icon */}
            <div className="mb-4">
              {isNotFound ? (
                <div className="text-6xl">📄</div>
              ) : isPermission ? (
                <div className="text-6xl">🔒</div>
              ) : isNetwork ? (
                <div className="text-6xl">📡</div>
              ) : isServer ? (
                <div className="text-6xl">⚠️</div>
              ) : (
                <div className="text-6xl">❌</div>
              )}
            </div>

            {/* Title */}
            <h1 className={`text-2xl font-bold mb-4 ${
              isNotFound ? 'text-foreground' :
              isPermission ? 'text-destructive' :
              'text-warning'
            }`}>
              {isNotFound ? 'Post Not Found' :
               isPermission ? 'Access Denied' :
               isNetwork ? 'Connection Error' :
               isServer ? 'Server Error' :
               'Something Went Wrong'}
            </h1>

            {/* Message */}
            <p className="text-muted-foreground text-lg mb-6">
              {error || (isNotFound ? 'The post you\'re looking for doesn\'t exist or has been removed.' : 'Unable to load this post.')}
            </p>

            {/* Category hint for debugging */}
            {errorCategory && import.meta.env.DEV && (
              <p className="text-xs text-muted-foreground mb-4 font-mono">
                Error Category: {errorCategory}
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleGoBack} variant="outline">
                <ArrowLeft size={18} className="mr-2" />
                Back to Blog
              </Button>
              
              {isRetryable && !isNotFound && (
                <Button onClick={handleRetry}>
                  Try Again
                </Button>
              )}
            </div>

            {/* Additional help */}
            {isNetwork && (
              <p className="text-sm text-muted-foreground mt-6">
                Please check your internet connection and try again.
              </p>
            )}
            
            {isServer && (
              <p className="text-sm text-muted-foreground mt-6">
                Our servers are experiencing issues. Please try again in a few moments.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // If the post is from the new articles table, render with new templates
  if ((post as any).__article) {
    const article = (post as any).__article;
    if (article.type === 'external') {
      return <ExternalArticleTemplate article={article} />;
    }
    return <HostedArticleTemplate article={article} />;
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
          <Link to="/blog">
            <Button
              variant="ghost"
              className="mb-8 -ml-4 text-muted-foreground hover:text-foreground transition-colors"
              size="sm"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Blog
            </Button>
          </Link>

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
            <div className="prose prose-invert prose-lg max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-6 leading-relaxed">{children}</p>,
                }}
              >
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
            <Link to="/blog">
              <Button
                variant="outline"
                className="px-8 py-6 font-medium text-base"
              >
                <ArrowLeft size={18} className="mr-2" />
                Back to All Posts
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
