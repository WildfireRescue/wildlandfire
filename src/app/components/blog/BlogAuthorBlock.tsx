// =====================================================
// BLOG AUTHOR BLOCK COMPONENT
// Displays author info, date, reading time, category
// =====================================================

import { Calendar, Clock } from 'lucide-react';
import { formatDate, getReadTimeText } from '../../../lib/blogHelpers.ts';
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
  const authorName = author ? author.split('@')[0].charAt(0).toUpperCase() + author.split('@')[0].slice(1) : 'The Wildland Fire Recovery Fund';

  // Use organization logo if author is generic/email
  const isOrganization = !author || author.includes('@thewildlandfirerecoveryfund.org');

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-t border-b border-border/20 py-4">
      {/* Author */}
      <div className="flex items-center gap-2">
        {isOrganization ? (
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center ring-2 ring-primary/20 overflow-hidden flex-shrink-0">
            <img 
              src="/Images/logo-128.png" 
              alt="Wildland Fire Recovery Fund" 
              className="w-8 h-8 object-contain"
              loading="lazy"
              onError={(e) => {
                // Fallback to gradient circle with initials
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.className = "w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary font-bold text-sm ring-2 ring-primary/20";
                  parent.textContent = authorName.charAt(0);
                }
              }}
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary font-bold text-sm ring-2 ring-primary/20 flex-shrink-0">
            {authorName.charAt(0)}
          </div>
        )}
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
