// =====================================================
// BLOG CATEGORY BADGE COMPONENT
// Displays category with color-coded badge
// =====================================================

import { getCategoryColor, formatTag } from '../../../lib/blogHelpers';

interface BlogCategoryBadgeProps {
  category: string | null;
  size?: 'sm' | 'md';
  className?: string;
}

export function BlogCategoryBadge({ category, size = 'md', className = '' }: BlogCategoryBadgeProps) {
  if (!category) return null;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${getCategoryColor(category)} ${sizeClasses[size]} ${className}`}
    >
      {formatTag(category)}
    </span>
  );
}
