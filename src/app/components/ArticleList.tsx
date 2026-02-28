import { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { BlogPost } from '../../lib/blogTypes';
import { Button } from './ui/button';

interface ArticleListProps {
  onSelectArticle: (article: BlogPost) => void;
}

export default function ArticleList({ onSelectArticle }: ArticleListProps) {
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'updated_at' | 'title' | 'status'>('updated_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [deleting, setDeleting] = useState<string | null>(null);

  // Load articles
  const loadArticles = async () => {
    setLoading(true);
    setError(null);

    try {
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

  // Filter articles by search
  const filteredArticles = articles.filter((article) => {
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
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold">Articles ({filteredArticles.length})</h2>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, slug, or author..."
            className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg text-sm"
          />
        </div>

        {/* Sort Options */}
        <div className="flex gap-2">
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as any)}
            className="px-3 py-2 bg-input-background border border-border rounded-lg text-sm"
          >
            <option value="updated_at">Updated</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
          </select>
          <button
            onClick={() => setSortDir(sortDir === 'desc' ? 'asc' : 'desc')}
            className="px-3 py-2 bg-input-background border border-border rounded-lg text-sm hover:bg-muted/50 transition"
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
            {searchTerm ? 'No articles match your search.' : 'No articles yet.'}
          </p>
        </div>
      )}

      {/* Articles Table */}
      {!loading && filteredArticles.length > 0 && (
        <div className="flex-1 overflow-y-auto border border-border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Title</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Updated</th>
                <th className="px-4 py-3 text-left font-medium">Author</th>
                <th className="px-4 py-3 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map((article) => (
                <tr key={article.id} className="border-b border-border hover:bg-muted/30 transition">
                  <td className="px-4 py-3">
                    <div className="max-w-xs">
                      <p className="font-medium truncate">{article.title}</p>
                      <p className="text-xs text-muted-foreground font-mono">{article.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">{statusBadge(article.status)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(article.updated_at)}
                  </td>
                  <td className="px-4 py-3 text-sm">{article.author_name || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onSelectArticle(article)}
                        className="p-2 text-primary hover:bg-primary/10 rounded transition"
                        title="Edit article"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(article.slug, article.title)}
                        disabled={deleting === article.slug}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded transition disabled:opacity-50"
                        title="Delete article"
                      >
                        {deleting === article.slug ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
