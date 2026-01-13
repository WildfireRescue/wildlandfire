// =====================================================
// BLOG SOURCES COMPONENT
// Display citations and sources for credibility
// =====================================================

import { ExternalLink } from 'lucide-react';
import type { BlogPost } from '../../lib/blogTypes';

interface BlogSourcesProps {
  post: BlogPost;
}

export function BlogSources({ post }: BlogSourcesProps) {
  if (!post.sources || post.sources.length === 0) return null;
  
  return (
    <div className="border-t border-border pt-8 mt-12">
      <h3 className="text-lg font-semibold mb-4">Sources & References</h3>
      <ol className="space-y-2 text-sm">
        {post.sources.map((source, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-muted-foreground min-w-[1.5rem]">{index + 1}.</span>
            <div className="flex-1">
              <span className="font-medium">{source.label}</span>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-primary hover:underline inline-flex items-center gap-1"
              >
                <span className="break-all">{source.url}</span>
                <ExternalLink size={12} className="flex-shrink-0" />
              </a>
            </div>
          </li>
        ))}
      </ol>
      
      {post.outbound_links_verified && (
        <p className="text-xs text-muted-foreground mt-4 italic">
          ✓ All external links have been verified for accuracy and relevance.
        </p>
      )}
    </div>
  );
}
