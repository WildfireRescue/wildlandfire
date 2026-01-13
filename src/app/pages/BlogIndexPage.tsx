// =====================================================
// BLOG INDEX PAGE
// Main blog listing page with pagination and filters
// =====================================================

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { BlogPostCard } from '../components/blog/BlogPostCard';
import { BlogPagination } from '../components/blog/BlogPagination';
import { getPublishedPosts, getFeaturedPosts, getCategories } from '../../lib/supabaseBlog';
import type { BlogPost, BlogCategory } from '../../lib/blogTypes';

export function BlogIndexPage() {
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
    async function loadCategories() {
      const { categories: cats } = await getCategories();
      setCategories(cats || []);
    }
    loadCategories();
  }, []);

  // Fetch featured posts (only on first page)
  useEffect(() => {
    if (currentPage === 1 && !selectedCategory) {
      async function loadFeatured() {
        const { posts: featured } = await getFeaturedPosts(1);
        setFeaturedPosts(featured || []);
      }
      loadFeatured();
    } else {
      setFeaturedPosts([]);
    }
  }, [currentPage, selectedCategory]);

  // Fetch posts
  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      setError(null);

      try {
        const { posts: fetchedPosts, total, error: fetchError } = await getPublishedPosts({
          page: currentPage,
          perPage
        });

        if (fetchError) throw fetchError;

        setPosts(fetchedPosts || []);
        setTotalPages(Math.ceil((total || 0) / perPage));
      } catch (err: any) {
        setError(err?.message || 'Failed to load posts');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryFilter = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    // Navigate to category page
    if (category) {
      window.location.hash = `blog/category/${category}`;
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
