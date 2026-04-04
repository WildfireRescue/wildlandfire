// =====================================================
// BLOG INDEX PAGE
// Main blog listing page with pagination and filters
// =====================================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { BlogPostCard } from '../components/blog/BlogPostCard';
import { BlogPagination } from '../components/blog/BlogPagination';
import { getPublishedPosts, getFeaturedPosts, getCategories } from '../../lib/supabaseBlog.ts';
import { withTimeout, TimeoutError } from '../../lib/promiseUtils.ts';
import type { BlogPost, BlogCategory } from '../../lib/blogTypes';

export function BlogIndexPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const perPage = 12;

  // Fetch categories
  useEffect(() => {
    let mounted = true;
    
    async function loadCategories() {
      try {
        console.log('[BlogIndex] Loading categories...');
        
        const categoriesPromise = getCategories();
        const { categories: cats, error } = await withTimeout(
          categoriesPromise,
          10000,
          'Failed to load categories: Request timed out'
        );
        
        if (!mounted) return; // Component unmounted
        
        if (error) {
          console.error('[BlogIndex] Error loading categories:', error);
          return;
        }
        
        setCategories(cats || []);
      } catch (e: any) {
        if (!mounted) return;
        console.error('[BlogIndex] Failed to load categories:', e);
      }
    }
    
    loadCategories();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch featured posts and paginated posts in a single parallel load.
  // Previously these were two separate useEffects (firing sequentially);
  // now they run together to halve the number of render/loading phases.
  useEffect(() => {
    let mounted = true;

    async function loadPostsAndFeatured() {
      setLoading(true);
      setError(null);

      const isFirstPage = currentPage === 1 && !selectedCategory;

      try {
        console.log('[BlogIndex] Loading posts + featured in parallel...', { page: currentPage, isFirstPage });

        const [postsResult, featuredResult] = await Promise.all([
          withTimeout(
            getPublishedPosts({ page: currentPage, perPage }),
            15000,
            'Failed to load posts: Request timed out. Please check your connection and try again.'
          ),
          isFirstPage
            ? withTimeout(
                getFeaturedPosts(1),
                10000,
                'Failed to load featured posts: Request timed out.'
              )
            : Promise.resolve({ posts: [] as BlogPost[], error: null, total: 0 }),
        ]);

        if (!mounted) return;

        // Handle posts result
        if (postsResult.error) {
          let errorMessage = postsResult.error.message || 'Failed to load posts';
          if (postsResult.error.code === 'PGRST116') errorMessage = 'No posts found. Please check back later!';
          else if (postsResult.error.code === '42501') errorMessage = 'Database permission error. Please contact support.';
          else if (postsResult.error.code === '500') errorMessage = 'Server error. Our team has been notified. Please try again later.';
          throw new Error(errorMessage);
        }

        setPosts(postsResult.posts || []);
        setTotalPages(Math.ceil((postsResult.total || 0) / perPage));

        console.log('[BlogIndex] Posts loaded:', { count: postsResult.posts?.length || 0, total: postsResult.total });

        // Handle featured result
        if (isFirstPage) {
          if (featuredResult.error) {
            console.error('[BlogIndex] Error loading featured posts:', featuredResult.error);
            setFeaturedPosts([]);
          } else {
            setFeaturedPosts(featuredResult.posts || []);
          }
        } else {
          setFeaturedPosts([]);
        }

      } catch (err: any) {
        if (!mounted) return;

        console.error('[BlogIndex] Load error:', err);

        let errorMessage = 'Failed to load posts';
        if (err instanceof TimeoutError) {
          errorMessage = err.message;
        } else if (err?.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        setPosts([]);
        setFeaturedPosts([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPostsAndFeatured();

    return () => {
      mounted = false;
    };
  }, [currentPage, selectedCategory]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryFilter = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    // Navigate to category page
    if (category) {
      navigate(`/blog/category/${category}`);
    }
  };

  return (
    <>
      <Helmet>
        <title>Blog - Latest News & Stories | The Wildland Fire Recovery Fund</title>
        <meta 
          name="description" 
          content="Read the latest news, survivor stories, and updates from The Wildland Fire Recovery Fund. Stay informed about our work supporting wildfire survivors." 
        />
        <link rel="canonical" href="https://thewildlandfirerecoveryfund.org/#blog" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Blog | The Wildland Fire Recovery Fund" />
        <meta property="og:description" content="Latest news, stories, and updates from The Wildland Fire Recovery Fund" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://thewildlandfirerecoveryfund.org/#blog" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blog | The Wildland Fire Recovery Fund" />
        <meta name="twitter:description" content="Latest news, stories, and updates" />
      </Helmet>

      <div className="min-h-screen bg-background pt-32 pb-24">
        <div className="container mx-auto px-6 md:px-8 max-w-7xl">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl mb-8 font-bold tracking-tight text-heading">
              Our <span className="text-primary">Blog</span>
            </h1>
            <p className="text-lg md:text-xl text-body-text-muted leading-relaxed font-light">
              Stories, news, and updates from the frontlines of wildfire recovery.
            </p>
          </motion.div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-3 mb-12"
            >
              <button
                onClick={() => handleCategoryFilter(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  !selectedCategory
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card/50 text-muted-foreground hover:text-foreground hover:bg-card border border-border/40'
                }`}
              >
                All Posts
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryFilter(cat.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat.slug
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card/50 text-muted-foreground hover:text-foreground hover:bg-card border border-border/40'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </motion.div>
          )}

          {/* Featured Post */}
          {featuredPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-16"
            >
              <BlogPostCard post={featuredPosts[0]} featured={true} />
            </motion.div>
          )}

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

          {/* Posts Grid */}
          {!loading && !error && posts.length === 0 && (
            <div className="max-w-2xl mx-auto text-center py-20">
              <p className="text-muted-foreground text-lg">
                No posts published yet. Check back soon!
              </p>
            </div>
          )}

          {!loading && !error && posts.length > 0 && (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts
                  .filter(post => !featuredPosts.some(fp => fp.id === post.id))
                  .map((post, index) => (
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
