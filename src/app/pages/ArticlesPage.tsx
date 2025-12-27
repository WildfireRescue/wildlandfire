import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function ArticlesPage({ slug }: { slug?: string }) {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [article, setArticle] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const flag = sessionStorage.getItem('allow_articles');
    if (!flag) {
      // Not allowed — redirect to home
      window.location.hash = 'home';
      setAllowed(false);
      return;
    }

    // Consume the flag so direct reload won't work
    sessionStorage.removeItem('allow_articles');
    setAllowed(true);
  }, []);

  useEffect(() => {
    if (allowed) {
      if (slug) {
        fetchArticle(slug);
      } else {
        fetchArticles();
      }
    }
  }, [allowed, slug]);

  async function fetchArticles() {
    setLoading(true);
    try {
      const url = `https://${projectId}.supabase.co/rest/v1/articles?published=eq.true&order=published_at.desc&select=id,title,slug,excerpt,cover_url,published_at`;
      const res = await fetch(url, {
        headers: {
          apikey: publicAnonKey,
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      const data = await res.json();
      setArticles(data || []);
    } catch (e) {
      console.error('Failed to fetch articles', e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchArticle(slug: string) {
    setLoading(true);
    try {
      const url = `https://${projectId}.supabase.co/rest/v1/articles?slug=eq.${encodeURIComponent(slug)}&select=*`;
      const res = await fetch(url, {
        headers: {
          apikey: publicAnonKey,
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      const data = await res.json();
      setArticle(data?.[0] || null);
    } catch (e) {
      console.error('Failed to fetch article', e);
    } finally {
      setLoading(false);
    }
  }

  if (allowed === null) {
    return null; // avoid flashing
  }

  if (!allowed) {
    return null; // redirected
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          {!slug && (
            <>
              <h1 className="text-4xl md:text-6xl mb-6">Articles</h1>
              <p className="text-muted-foreground mb-8">
                Curated articles and resources about wildfire recovery, prevention, and community support.
              </p>

              {loading && <p className="text-muted-foreground">Loading...</p>}

              <div className="space-y-6 text-left">
                {articles.map((a) => (
                  <article key={a.id} className="p-6 border border-border rounded-lg">
                    <h2 className="text-2xl mb-2">{a.title}</h2>
                    {a.excerpt && <p className="text-muted-foreground mb-4">{a.excerpt}</p>}
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => {
                        // keep access flag for next page
                        sessionStorage.setItem('allow_articles', '1');
                        window.location.hash = `articles/${a.slug}`;
                      }}>
                        Read Article
                      </Button>
                      <span className="text-sm text-muted-foreground ml-auto">{new Date(a.published_at).toLocaleDateString()}</span>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {slug && (
            <div className="text-left">
              {loading && <p className="text-muted-foreground">Loading...</p>}
              {!loading && article && (
                <article>
                  <h1 className="text-4xl mb-4">{article.title}</h1>
                  {article.cover_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={article.cover_url} alt={article.title} className="w-full rounded-lg mb-4" />
                  )}
                  {article.published_at && <p className="text-sm text-muted-foreground mb-6">Published {new Date(article.published_at).toLocaleDateString()}</p>}
                  <div className="prose max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content || article.excerpt || ''}</ReactMarkdown>
                  </div>

                  <div className="mt-8">
                    <Button size="lg" onClick={() => (window.location.hash = 'articles')}>
                      Back to Articles
                    </Button>
                  </div>
                </article>
              )}

              {!loading && !article && (
                <div>
                  <p className="text-muted-foreground">Article not found.</p>
                  <Button size="lg" onClick={() => (window.location.hash = 'articles')}>
                    Back to Articles
                  </Button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
