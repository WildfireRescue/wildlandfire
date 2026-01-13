// =====================================================
// BLOG RELATED POSTS COMPONENT
// Shows related posts at bottom of blog post page
// =====================================================

import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { BlogPostCard } from './BlogPostCard';
import { getRelatedPosts } from '../../../lib/supabaseBlog';
import type { BlogPost } from '../../../lib/blogTypes';

interface BlogRelatedPostsProps {
  category: string | null;
  currentSlug: string;
  limit?: number;
}

export function BlogRelatedPosts({ category, currentSlug, limit = 3 }: BlogRelatedPostsProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelated() {
      if (!category) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { posts: relatedPosts } = await getRelatedPosts(category, currentSlug, limit);
      setPosts(relatedPosts || []);
      setLoading(false);
    }

    fetchRelated();
  }, [category, currentSlug, limit]);

  if (loading) {
    return (
      <div className="mt-20 pt-12 border-t border-border/20">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) return null;

  return (
    <div className="mt-20 pt-12 border-t border-border/20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-heading">
          Related Articles
        </h2>
        <a
          href="#blog"
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
        >
          View All <ArrowRight size={16} />
        </a>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <BlogPostCard key={post.id} post={post} index={index} />
        ))}
      </div>
    </div>
  );
}
