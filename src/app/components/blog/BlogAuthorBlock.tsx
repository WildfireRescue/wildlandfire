// =====================================================
// BLOG AUTHOR BLOCK COMPONENT
// Displays author info, date, reading time, category
// =====================================================

import { Calendar, Clock } from 'lucide-react';
import { formatDate, getReadTimeText } from '../../../lib/blogHelpers';
import { BlogCategoryBadge } from './BlogCategoryBadge';

interface BlogAuthorBlockProps {
  author: string | null;
  publishedAt: string | null;
  updatedAt?: string;
  readingTime: number;
  category?: string | null;
  showCategory?: boolean;
}

export function BlogAuthorBlock({
  author,
  publishedAt,
  updatedAt,
  readingTime,
  category,
  showCategory = true
}: BlogAuthorBlockProps) {
  const displayDate = publishedAt || updatedAt;
  const authorName = author ? author.split('@')[0].charAt(0).toUpperCase() + author.split('@')[0].slice(1) : 'Anonymous';

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-t border-b border-border/20 py-4">
      {/* Author */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary font-bold text-sm ring-2 ring-primary/20">
          {authorName.charAt(0)}
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-foreground/90 text-sm">
            {authorName}
          </span>
          <span className="text-xs text-muted-foreground">Author</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-border/40" />

      {/* Published Date */}
      {displayDate && (
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-muted-foreground/60" />
          <time className="font-medium">
            {formatDate(displayDate, 'long')}
          </time>
        </div>
      )}

      {/* Reading Time */}
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-muted-foreground/60" />
        <span className="font-medium">
          {getReadTimeText(readingTime)}
        </span>
      </div>

      {/* Category Badge */}
      {showCategory && category && (
        <>
          <div className="h-6 w-px bg-border/40" />
          <BlogCategoryBadge category={category} size="sm" />
        </>
      )}
    </div>
  );
}
