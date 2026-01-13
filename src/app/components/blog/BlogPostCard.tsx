// =====================================================
// BLOG POST CARD COMPONENT
// Card for displaying blog post preview in lists/grids
// =====================================================

import { motion } from 'motion/react';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { BlogCategoryBadge } from './BlogCategoryBadge';
import { formatDate, getReadTimeText } from '../../../lib/blogHelpers';
import type { BlogPost } from '../../../lib/blogTypes';

interface BlogPostCardProps {
  post: BlogPost;
  index?: number;
  featured?: boolean;
}

export function BlogPostCard({ post, index = 0, featured = false }: BlogPostCardProps) {
  const handleClick = () => {
    window.location.hash = `blog/${post.slug}`;
  };

  if (featured) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="group relative bg-card/50 border border-border/40 rounded-2xl overflow-hidden hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 backdrop-blur-sm cursor-pointer"
        onClick={handleClick}
      >
        <div className="grid md:grid-cols-2 gap-6">
          {/* Cover Image */}
          {post.cover_image_url && (
            <div className="relative h-72 md:h-full overflow-hidden">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent md:bg-gradient-to-r" />
              {post.featured && (
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                    Featured
                  </span>
                </div>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="p-8 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <BlogCategoryBadge category={post.category} size="sm" />
              {post.published_at && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock size={12} />
                  {getReadTimeText(post.reading_time_minutes)}
                </span>
              )}
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4 group-hover:text-primary transition-colors leading-tight tracking-tight">
              {post.title}
            </h2>
            
            {post.excerpt && (
              <p className="text-muted-foreground/80 mb-6 leading-relaxed text-base line-clamp-3">
                {post.excerpt}
              </p>
            )}
            
            <div className="flex items-center justify-between mt-auto pt-4">
              <Button
                variant="ghost"
                className="text-primary hover:text-primary/90 font-medium -ml-4"
              >
                Read Article →
              </Button>
              
              {post.published_at && (
                <time className="flex items-center gap-2 text-xs text-muted-foreground/70">
                  <Calendar size={14} />
                  {formatDate(post.published_at)}
                </time>
              )}
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group bg-card/50 border border-border/40 rounded-xl overflow-hidden hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 flex flex-col backdrop-blur-sm cursor-pointer h-full"
      onClick={handleClick}
    >
      {/* Cover Image */}
      {post.cover_image_url && (
        <div className="relative h-64 overflow-hidden">
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-80" />
          {post.featured && (
            <div className="absolute top-4 right-4">
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                Featured
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-3">
          <BlogCategoryBadge category={post.category} size="sm" />
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock size={12} />
            {getReadTimeText(post.reading_time_minutes)}
          </span>
        </div>
        
        <h2 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-primary transition-colors leading-tight tracking-tight line-clamp-2">
          {post.title}
        </h2>
        
        {post.excerpt && (
          <p className="text-muted-foreground/80 mb-4 leading-relaxed flex-1 font-light text-sm line-clamp-3">
            {post.excerpt}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
          <Button
            variant="ghost"
            className="text-primary hover:text-primary/90 font-medium -ml-4 text-sm"
          >
            Read More →
          </Button>
          
          {post.published_at && (
            <time className="flex items-center gap-2 text-xs text-muted-foreground/70">
              <Calendar size={14} />
              {formatDate(post.published_at)}
            </time>
          )}
        </div>
      </div>
    </motion.article>
  );
}
