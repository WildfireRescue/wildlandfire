// =====================================================
// BLOG CATEGORY PAGE
// Category archive page with filtered posts
// =====================================================

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Button } from '../components/ui/button';
import { BlogPostCard } from '../components/blog/BlogPostCard';
import { BlogPagination } from '../components/blog/BlogPagination';
import { BlogBreadcrumbs } from '../components/blog/BlogBreadcrumbs';
import { getPostsByCategory, getCategoryBySlug } from '../../lib/supabaseBlog.ts';
import { withTimeout, TimeoutError } from '../../lib/promiseUtils.ts';
import { formatTag } from '../../lib/blogHelpers.ts';
import type { BlogPost, BlogCategory } from '../../lib/blogTypes';

export function BlogCategoryPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [category, setCategory] = useState<BlogCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const perPage = 12;

  // Fetch category info
  useEffect(() => {
    if (!categorySlug) return;
    
    let mounted = true;
    
    async function loadCategory() {
      try {
        const categoryPromise = getCategoryBySlug(categorySlug);
        const { category: cat, error } = await withTimeout(
          categoryPromise,
          10000,
          'Failed to load category: Request timed out'
        );
        
        if (!mounted) return;
        
        if (error) {
          console.error('[BlogCategory] Error loading category:', error);
        }
        
        setCategory(cat);
      } catch (e: any) {
        if (!mounted) return;
        console.error('[BlogCategory] Failed to load category:', e);
      }
    }
    
    loadCategory();
    
    return () => {
      mounted = false;
    };
  }, [categorySlug]);

  // Fetch posts for category
  useEffect(() => {
    let mounted = true;
    
    async function loadPosts() {
      setLoading(true);
      setError(null);

      try {
        console.log('[BlogCategory] Loading posts for category:', categorySlug);
        
        const postsPromise = getPostsByCategory(
          categorySlug,
          { page: currentPage, perPage }
        );
        
        const { posts: fetchedPosts, total, error: fetchError } = await withTimeout(
          postsPromise,
          15000,
          'Failed to load posts: Request timed out'
        );

        if (!mounted) return;

        if (fetchError) {
          console.error('[BlogCategory] Error:', fetchError);
          throw new Error(fetchError.message || 'Failed to load posts');
        }

        setPosts(fetchedPosts || []);
        setTotalPages(Math.ceil((total || 0) / perPage));
      } catch (err: any) {
        if (!mounted) return;
        
        let errorMessage = 'Failed to load posts';
        
        if (err instanceof TimeoutError) {
          errorMessage = err.message;
        } else if (err?.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        setPosts([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPosts();
    
    return () => {
      mounted = false;
    };
  }, [categorySlug, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categoryName = category?.name || formatTag(categorySlug);
  const categoryDescription = category?.description || `All posts in ${categoryName}`;

  return (
    <>
      <Helmet>
        <title>{categoryName} | Blog | The Wildland Fire Recovery Fund</title>
        <meta name="description" content={categoryDescription} />
        <link rel="canonical" href={`https://thewildlandfirerecoveryfund.org/#blog/category/${categorySlug}`} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
      </Helmet>

      <div className="min-h-screen bg-background pt-32 pb-24">
        <div className="container mx-auto px-6 md:px-8 max-w-7xl">
          {/* Back Button */}
          <Link to="/blog">
            <Button
              variant="ghost"
              className="mb-8 text-muted-foreground hover:text-foreground transition-colors"
              size="sm"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to All Posts
            </Button>
          </Link>

          {/* Breadcrumbs */}
          <BlogBreadcrumbs category={categorySlug} />

          {/* Category Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-heading mb-4">
              {categoryName}
            </h1>
            <p className="text-lg text-body-text-muted leading-relaxed">
              {categoryDescription}
            </p>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground mt-4">Loading posts...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="max-w-2xl mx-auto bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
              <p className="text-destructive">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && posts.length === 0 && (
            <div className="max-w-2xl mx-auto text-center py-20">
              <p className="text-muted-foreground text-lg">
                No posts found in this category yet.
              </p>
              <Link to="/blog">
                <Button className="mt-6">
                  View All Posts
                </Button>
              </Link>
            </div>
          )}

          {/* Posts Grid */}
          {!loading && !error && posts.length > 0 && (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post, index) => (
                  <BlogPostCard key={post.id} post={post} index={index} />
                ))}
              </div>

              {/* Pagination */}
              <BlogPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
