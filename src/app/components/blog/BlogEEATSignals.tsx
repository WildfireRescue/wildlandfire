// =====================================================
// BLOG E-E-A-T SIGNALS COMPONENT
// Display trust signals (Expertise, Experience, Authority, Trust)
// =====================================================

import { CheckCircle2, User, Calendar } from 'lucide-react';
import type { BlogPost } from '../../../lib/blogTypes';

interface BlogEEATSignalsProps {
  post: BlogPost;
}

export function BlogEEATSignals({ post }: BlogEEATSignalsProps) {
  const hasEEATSignals = 
    post.author_role || 
    post.author_bio || 
    post.reviewed_by || 
    post.fact_checked ||
    post.last_updated_at;
  
  if (!hasEEATSignals) return null;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  return (
    <div className="bg-muted/30 border border-border rounded-xl p-6 space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        About This Article
      </h3>
      
      <div className="space-y-3">
        {/* Author Info */}
        {post.author_name && (
          <div className="flex items-start gap-3">
            <User size={18} className="text-primary mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium">{post.author_name}</div>
              {post.author_role && (
                <div className="text-sm text-muted-foreground">{post.author_role}</div>
              )}
              {post.author_bio && (
                <p className="text-sm text-muted-foreground mt-1">{post.author_bio}</p>
              )}
            </div>
          </div>
        )}
        
        {/* Fact Checked Badge */}
        {post.fact_checked && (
          <div className="flex items-start gap-3">
            <CheckCircle2 size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-green-700 dark:text-green-500">Fact-Checked Content</div>
              {post.reviewed_by && (
                <div className="text-sm text-muted-foreground">Reviewed by {post.reviewed_by}</div>
              )}
            </div>
          </div>
        )}
        
        {/* Last Updated */}
        {post.last_updated_at && (
          <div className="flex items-start gap-3">
            <Calendar size={18} className="text-primary mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm text-muted-foreground">
                Last updated: {formatDate(post.last_updated_at)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
