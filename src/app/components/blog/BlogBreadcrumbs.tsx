// =====================================================
// BLOG BREADCRUMBS COMPONENT
// Navigation breadcrumbs for blog pages
// =====================================================

import { Home, ChevronRight } from 'lucide-react';
import { formatTag } from '../../../lib/blogHelpers.ts';

interface BlogBreadcrumbsProps {
  category?: string | null;
  title?: string;
}

export function BlogBreadcrumbs({ category, title }: BlogBreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8" aria-label="Breadcrumb">
      <a
        href="#"
        className="hover:text-foreground transition-colors flex items-center gap-1"
        aria-label="Home"
      >
        <Home size={14} />
        <span>Home</span>
      </a>
      
      <ChevronRight size={14} />
      
      <a
        href="#blog"
        className="hover:text-foreground transition-colors"
      >
        Blog
      </a>
      
      {category && (
        <>
          <ChevronRight size={14} />
          <a
            href={`#blog/category/${category}`}
            className="hover:text-foreground transition-colors"
          >
            {formatTag(category)}
          </a>
        </>
      )}
      
      {title && (
        <>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium truncate max-w-[200px]" title={title}>
            {title}
          </span>
        </>
      )}
    </nav>
  );
}
