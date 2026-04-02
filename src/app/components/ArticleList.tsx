import { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Loader2, AlertCircle, ExternalLink, Globe } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { BlogPost } from '../../lib/blogTypes';
import { Button } from './ui/button';
import { publishDueScheduledPosts } from '../../lib/supabaseBlog';

interface ArticleListProps {
  onSelectArticle: (article: BlogPost) => void;
  onPublishArticle?: (article: BlogPost) => void;
  refreshTrigger?: number;
  currentEditingId?: string | null;
}

export default function ArticleList({ onSelectArticle, onPublishArticle, refreshTrigger, currentEditingId }: ArticleListProps) {
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'updated_at' | 'title' | 'status'>('updated_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [activeStatusFilter, setActiveStatusFilter] = useState<'all' | 'draft' | 'scheduled' | 'published'>('draft');

  // Load articles
  const loadArticles = async () => {
    setLoading(true);
    setError(null);

    try {
      await publishDueScheduledPosts();

      let query = supabase
        .from('posts')
        .select('*')
        .order(sortField, { ascending: sortDir === 'asc' });

      const { data, error: err } = await query;

      if (err) throw err;

      setArticles((data as BlogPost[]) || []);
    } catch (err: any) {
      console.error('[ArticleList] Error loading articles:', err);
      setError(err?.message || 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [sortField, sortDir]);

  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) loadArticles();
  }, [refreshTrigger]);

  // Status counts for tabs
  const statusCounts = {
    all: articles.length,
    draft: articles.filter((a) => (a.status || 'draft') === 'draft').length,
    scheduled: articles.filter((a) => a.status === 'scheduled').length,
    published: articles.filter((a) => a.status === 'published').length,
  };

  // Filter articles by status tab, then search
  const byStatus = activeStatusFilter === 'all'
    ? articles
    : articles.filter((a) => (a.status || 'draft') === activeStatusFilter);

  const filteredArticles = byStatus.filter((article) => {
    const term = searchTerm.toLowerCase();
    return (
      article.title?.toLowerCase().includes(term) ||
      article.slug?.toLowerCase().includes(term) ||
      article.author_name?.toLowerCase().includes(term)
    );
  });

  // Delete article
  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    setDeleting(slug);
    try {
      const { error: err } = await supabase
        .from('posts')
        .delete()
        .eq('slug', slug);

      if (err) throw err;

      setArticles((prev) => prev.filter((a) => a.slug !== slug));
    } catch (err: any) {
      console.error('[ArticleList] Delete error:', err);
      alert(`Delete failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setDeleting(null);
    }
  };

  // Format date
  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Status badge
  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors[status] || 'bg-gray-100'}`}>
        {status || 'draft'}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Articles</h2>
          {statusCounts.draft > 0 && (
            <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-0.5 rounded-full font-medium">
              {statusCounts.draft} draft{statusCounts.draft !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-1 bg-muted/40 p-1 rounded-lg">
          {(['draft', 'scheduled', 'published', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveStatusFilter(tab)}
              className={`flex-1 text-xs px-1.5 py-1.5 rounded-md font-medium transition ${
                activeStatusFilter === tab
                  ? 'bg-card shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="ml-1 opacity-70">({statusCounts[tab]})</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search title, slug, author…"
            className="w-full pl-9 pr-4 py-2 bg-input-background border border-border rounded-lg text-xs"
          />
        </div>

        {/* Sort Options */}
        <div className="flex gap-2">
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as any)}
            className="px-3 py-2 bg-input-background border border-border rounded-lg text-xs"
          >
            <option value="updated_at">Updated</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
          </select>
          <button
            onClick={() => setSortDir(sortDir === 'desc' ? 'asc' : 'desc')}
            className="px-3 py-2 bg-input-background border border-border rounded-lg text-xs hover:bg-muted/50 transition"
          >
            {sortDir === 'desc' ? '↓' : '↑'}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
          <AlertCircle size={18} className="text-destructive mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-destructive">{error}</p>
            <Button onClick={loadArticles} variant="ghost" size="sm" className="mt-2">
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading articles...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredArticles.length === 0 && !error && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            {searchTerm
              ? 'No articles match your search.'
              : activeStatusFilter !== 'all'
              ? `No ${activeStatusFilter} posts.`
              : 'No articles yet.'}
          </p>
        </div>
      )}

      {/* Articles List */}
      {!loading && filteredArticles.length > 0 && (
        <div className="flex-1 overflow-y-auto space-y-1">
          {filteredArticles.map((article) => {
            const isCurrentlyEditing = article.id === currentEditingId;
            const isDraft = (article.status || 'draft') === 'draft';
            const isScheduled = article.status === 'scheduled';
            const isPublished = article.status === 'published';
            return (
              <div
                key={article.id}
                className={`rounded-lg border p-3 transition ${
                  isCurrentlyEditing
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border hover:bg-muted/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {statusBadge(article.status)}
                      {isCurrentlyEditing && (
                        <span className="text-xs text-primary font-medium">← editing</span>
                      )}
                    </div>
                    <p className="font-medium text-sm truncate mt-1" title={article.title}>
                      {article.title || '(Untitled)'}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono truncate">{article.slug}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Updated {formatDate(article.updated_at)}
                      {article.author_name ? ` · ${article.author_name}` : ''}
                    </p>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex items-center gap-1 mt-2">
                  <button
                    onClick={() => onSelectArticle(article)}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-primary hover:bg-primary/10 rounded transition font-medium"
                    title={isDraft ? 'Continue editing draft' : 'Edit article'}
                  >
                    <Edit2 size={13} />
                    {isDraft ? 'Continue Draft' : isScheduled ? 'Edit' : 'Edit'}
                  </button>
                  {(isDraft || isScheduled) && onPublishArticle && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Publish "${article.title}"?\n\nThis will make it live on the blog immediately.`)) {
                          onPublishArticle(article);
                        }
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20 rounded transition font-medium"
                      title="Publish this post"
                    >
                      <Globe size={13} />
                      Publish
                    </button>
                  )}
                  {isPublished && (
                    <a
                      href={`/blog/${article.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded transition"
                      title="View live post"
                    >
                      <ExternalLink size={13} />
                      View Live
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(article.slug, article.title)}
                    disabled={deleting === article.slug}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-destructive hover:bg-destructive/10 rounded transition ml-auto disabled:opacity-50"
                    title="Delete article"
                  >
                    {deleting === article.slug ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
