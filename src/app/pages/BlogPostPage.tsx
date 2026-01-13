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
import type { BlogPost } from '../../lib/blogTypes';

interface BlogPostPageProps {
  slug: string;
}

export function BlogPostPage({ slug }: BlogPostPageProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPost() {
      setLoading(true);
      setError(null);

      try {
        const { post: fetchedPost, error: fetchError } = await getPostBySlug(slug);

        if (fetchError) throw fetchError;
        if (!fetchedPost) throw new Error('Post not found');

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
        setError(err?.message || 'Failed to load post');
        setPost(null);
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [slug]);

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

  // Add IDs to headings for TOC navigation
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

  return (
    <>
      {/* SEO Meta Tags */}
      <BlogPostMeta post={post} />

      {/* Reading Progress Bar */}
      <BlogReadingProgress />

      <div className="min-h-screen bg-background pt-20 pb-24">
        <div className="container mx-auto px-6 lg:px-8 max-w-screen-xl">
          <div className="grid lg:grid-cols-[1fr_280px] gap-12">
            {/* Main Content Column */}
            <div className="max-w-[75ch]">
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

              {/* Article Header */}
              <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1] tracking-tight text-heading">
                  {post.title}
                </h1>

                {post.excerpt && (
                  <p className="text-xl md:text-2xl leading-relaxed text-body-text-muted mb-8 font-light">
                    {post.excerpt}
                  </p>
                )}

                <BlogAuthorBlock
                  author={post.author_name}
                  publishedAt={post.published_at}
                  updatedAt={post.updated_at}
                  readingTime={post.reading_time_minutes}
                  category={post.category}
                />
              </motion.header>

              {/* Cover Image */}
              {post.cover_image_url && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-12"
                >
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="rounded-xl w-full border border-border/30 shadow-2xl"
                    loading="eager"
                    decoding="async"
                  />
                </motion.div>
              )}

              {/* Article Content */}
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="blog-content prose prose-lg prose-stone prose-invert max-w-none
                  prose-headings:scroll-mt-24
                  prose-headings:font-bold
                  prose-headings:tracking-tight
                  prose-h1:hidden
                  prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:leading-tight prose-h2:text-heading
                  prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-4 prose-h3:leading-snug prose-h3:text-heading
                  prose-h4:text-xl prose-h4:mt-8 prose-h4:mb-3 prose-h4:text-heading
                  prose-p:text-[1.0625rem] prose-p:leading-[1.75] prose-p:mb-6 prose-p:text-body-text
                  prose-strong:text-heading prose-strong:font-bold
                  prose-em:text-body-text prose-em:italic
                  prose-ul:my-6 prose-ul:space-y-2
                  prose-ol:my-6 prose-ol:space-y-2
                  prose-li:text-[1.0625rem] prose-li:text-body-text prose-li:leading-[1.75]
                  prose-li:pl-2 prose-li:my-1
                  prose-a:text-primary prose-a:underline prose-a:decoration-2 hover:prose-a:decoration-primary/60 
                  prose-a:font-medium prose-a:transition-all prose-a:underline-offset-[3px] hover:prose-a:text-primary/90
                  prose-blockquote:border-l-[3px] prose-blockquote:border-primary/70
                  prose-blockquote:bg-primary/5
                  prose-blockquote:rounded-r-md
                  prose-blockquote:pl-6
                  prose-blockquote:pr-5
                  prose-blockquote:py-4
                  prose-blockquote:my-8
                  prose-blockquote:italic
                  prose-blockquote:text-[1.0625rem]
                  prose-blockquote:leading-[1.7]
                  prose-blockquote:text-body-text-muted
                  prose-code:text-primary-foreground prose-code:bg-primary/90 prose-code:px-1.5 prose-code:py-0.5 
                  prose-code:rounded prose-code:text-[0.9em] prose-code:font-semibold prose-code:font-mono
                  prose-pre:bg-card/60 prose-pre:border prose-pre:border-border/50 prose-pre:shadow-lg 
                  prose-pre:text-[0.875rem] prose-pre:my-8 prose-pre:rounded-lg prose-pre:font-mono
                  prose-img:rounded-lg prose-img:border prose-img:border-border/40 prose-img:shadow-2xl prose-img:my-10
                  prose-hr:border-border/30 prose-hr:my-12
                  prose-table:border-collapse prose-table:my-8
                  prose-th:bg-card prose-th:border prose-th:border-border/50 prose-th:px-4 prose-th:py-3 prose-th:text-left
                  prose-td:border prose-td:border-border/50 prose-td:px-4 prose-td:py-3
                  first:prose-p:text-[1.1875rem] first:prose-p:leading-[1.65] first:prose-p:text-heading first:prose-p:font-medium first:prose-p:mb-8"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {post.content_markdown}
                </ReactMarkdown>
              </motion.article>

              {/* Sources & Citations */}
              <BlogSources post={post} />

              {/* Share Section */}
              <BlogShareButtons title={post.title} excerpt={post.excerpt} />

              {/* Related Posts */}
              <BlogRelatedPosts category={post.category} currentSlug={post.slug} />

              {/* Back Button (bottom) */}
              <div className="mt-12">
                <Button
                  variant="outline"
                  onClick={() => (window.location.hash = 'blog')}
                  className="px-6 py-5 font-medium"
                >
                  <ArrowLeft size={18} className="mr-2" />
                  Back to All Posts
                </Button>
              </div>
            </div>

            {/* Sidebar: TOC (desktop only, sticky) */}
            <aside className="hidden lg:block space-y-6">
              <div className="sticky top-24">
                <BlogTableOfContents content={post.content_markdown} />
                
                {/* E-E-A-T Signals */}
                <div className="mt-6">
                  <BlogEEATSignals post={post} />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
