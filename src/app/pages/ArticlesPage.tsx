import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export function ArticlesPage({ slug }: { slug?: string }) {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [article, setArticle] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const flag = sessionStorage.getItem('allow_articles');
    if (!flag) {
      // Not allowed — show friendly notice instead of redirecting (better UX for troubleshooting)
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
    setErrorMessage(null);
    try {
      const url = `https://${projectId}.supabase.co/rest/v1/articles?published=eq.true&order=published_at.desc&select=id,title,slug,excerpt,cover_url,published_at`;
      const res = await fetch(url, {
        headers: {
          apikey: publicAnonKey,
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      if (!res.ok) {
        const text = await res.text();
        const msg = `Failed to load articles (status ${res.status})` + (text ? `: ${text}` : '');
        console.error(msg);
        setErrorMessage(msg);
        setArticles([]);
        return;
      }
      const data = await res.json();
      setArticles(data || []);
    } catch (e: any) {
      console.error('Failed to fetch articles', e);
      setErrorMessage(e?.message || 'An unexpected error occurred while fetching articles.');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchArticle(slug: string) {
    setLoading(true);
    setErrorMessage(null);
    try {
      const url = `https://${projectId}.supabase.co/rest/v1/articles?slug=eq.${encodeURIComponent(slug)}&select=*`;
      const res = await fetch(url, {
        headers: {
          apikey: publicAnonKey,
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      if (!res.ok) {
        const text = await res.text();
        const msg = `Failed to load article (status ${res.status})` + (text ? `: ${text}` : '');
        console.error(msg);
        setErrorMessage(msg);
        setArticle(null);
        return;
      }
      const data = await res.json();
      setArticle(data?.[0] || null);
    } catch (e: any) {
      console.error('Failed to fetch article', e);
      setErrorMessage(e?.message || 'An unexpected error occurred while fetching the article.');
      setArticle(null);
    } finally {
      setLoading(false);
    }
  }

  if (allowed === null) {
    return null; // avoid flashing
  }

  if (!allowed) {
    return (
      <div className="min-h-screen pt-24 pb-20 bg-background relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl mx-auto text-center py-24"
          >
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Articles — Access Required</h2>
            <p className="text-muted-foreground mb-6">This page is only accessible when opened from the footer link. Click the button below to open Articles now.</p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => {
                // set the session flag and navigate — the app will consume the flag and render the page
                sessionStorage.setItem('allow_articles', '1');
                window.location.hash = 'articles';
              }}>
                Open Articles
              </Button>
              <Button variant="ghost" onClick={() => window.location.hash = ''}>Back to Home</Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background relative overflow-hidden">
      {/* Hero */}
      <section className="py-12 bg-gradient-to-br from-background to-primary/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-6xl mb-4 text-foreground">Articles</h1>
            <p className="text-lg md:text-xl text-muted-foreground">Curated articles and resources about wildfire recovery, prevention, and community support.</p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-8">
        {!slug && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            {loading && <p className="text-muted-foreground">Loading articles…</p>}

            {errorMessage && (
              <div className="p-4 mb-4 bg-yellow-50 text-yellow-900 rounded-md">
                <p className="font-medium">We couldn't load articles right now.</p>
                <p className="text-sm mb-3 break-words">{errorMessage}</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={fetchArticles}>Retry</Button>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              {articles.map((a) => (
                <article key={a.id} className="p-6 bg-card border border-border rounded-2xl">
                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <h2 className="text-2xl font-semibold text-foreground mb-2">{a.title}</h2>
                      {a.excerpt && <p className="text-muted-foreground">{a.excerpt}</p>}
                    </div>

                    <div className="mt-auto flex items-center">
                      <Button variant="outline" onClick={() => {
                        sessionStorage.setItem('allow_articles', '1');
                        window.location.hash = `articles/${a.slug}`;
                      }}>
                        Read Article
                      </Button>
                      <span className="text-sm text-muted-foreground ml-auto">{a.published_at ? new Date(a.published_at).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                </article>
              ))}

              {(!loading && articles.length === 0) && (
                <div className="col-span-2 p-6 text-center">
                  <p className="text-muted-foreground">No articles published yet. Add one in Supabase Studio to get started.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {slug && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto bg-card/50 border border-border rounded-2xl p-8 mt-6"
          >
            {loading && <p className="text-muted-foreground">Loading article…</p>}

            {errorMessage && (
              <div className="p-4 mb-4 bg-yellow-50 text-yellow-900 rounded-md">
                <p className="font-medium">We couldn't load this article right now.</p>
                <p className="text-sm mb-3 break-words">{errorMessage}</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => fetchArticle(slug)}>Retry</Button>
                </div>
              </div>
            )}

            {!loading && article && (
              <article className="prose prose-lg text-foreground max-w-none">
                <h1 className="mb-4">{article.title}</h1>
                {article.cover_url && (
                  <img src={article.cover_url} alt={article.title} className="w-full rounded-lg mb-6" />
                )}
                {article.published_at && <p className="text-sm text-muted-foreground mb-6">Published {new Date(article.published_at).toLocaleDateString()}</p>}

                <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content || article.excerpt || ''}</ReactMarkdown>

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
          </motion.div>
        )}
      </div>
    </div>
  );
}
