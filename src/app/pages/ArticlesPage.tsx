import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Button } from "../components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

export function ArticlesPage({ slug }: { slug?: string }) {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [article, setArticle] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const flag = sessionStorage.getItem("allow_articles");
    if (!flag) {
      setAllowed(false);
      return;
    }
    sessionStorage.removeItem("allow_articles");
    setAllowed(true);
  }, []);

  useEffect(() => {
    if (allowed) {
      slug ? fetchArticle(slug) : fetchArticles();
    }
  }, [allowed, slug]);

  async function fetchArticles() {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/rest/v1/articles?published=eq.true&order=published_at.desc`,
        {
          headers: {
            apikey: publicAnonKey,
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await res.json();
      setArticles(data || []);
    } catch {
      setErrorMessage("Unable to load articles.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchArticle(slug: string) {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/rest/v1/articles?slug=eq.${slug}&select=*`,
        {
          headers: {
            apikey: publicAnonKey,
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await res.json();
      setArticle(data?.[0] || null);
    } catch {
      setErrorMessage("Unable to load article.");
    } finally {
      setLoading(false);
    }
  }

  if (allowed === null) return null;

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Button
          onClick={() => {
            sessionStorage.setItem("allow_articles", "1");
            window.location.hash = "articles";
          }}
        >
          Open Articles
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="container mx-auto px-4">
        {!slug && (
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-semibold mb-6">
              Articles
            </h1>

            {loading && <p className="text-muted-foreground">Loading…</p>}
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}

            <div className="grid md:grid-cols-2 gap-6">
              {articles.map((a) => (
                <article
                  key={a.id}
                  className="bg-card border border-border rounded-2xl p-6 flex flex-col"
                >
                  <h2 className="text-2xl font-semibold mb-2">{a.title}</h2>
                  {a.excerpt && (
                    <p className="text-muted-foreground mb-4">
                      {a.excerpt}
                    </p>
                  )}
                  <div className="mt-auto flex items-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        sessionStorage.setItem("allow_articles", "1");
                        window.location.hash = `articles/${a.slug}`;
                      }}
                    >
                      Read Article
                    </Button>
                    {a.published_at && (
                      <span className="ml-auto text-sm text-muted-foreground">
                        {new Date(a.published_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {slug && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto bg-card/60 border border-border rounded-2xl p-8"
          >
            {loading && <p className="text-muted-foreground">Loading…</p>}
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}

            {!loading && article && (
              <article
                className="
                  prose prose-invert prose-lg max-w-none
                  prose-headings:scroll-mt-24
                  prose-h1:text-4xl prose-h1:tracking-tight
                  prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                  prose-p:leading-7
                  prose-ul:my-4 prose-li:my-1
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-blockquote:border-l-primary/60
                  prose-blockquote:bg-card/40
                  prose-blockquote:rounded-xl
                  prose-blockquote:px-5
                  prose-blockquote:py-3
                "
              >
                <h1 className="not-prose text-4xl md:text-5xl font-semibold mb-3">
                  {article.title}
                </h1>

                {article.author && (
                  <p className="not-prose text-sm text-muted-foreground mb-1">
                    By {article.author}
                  </p>
                )}

                {article.published_at && (
                  <p className="not-prose text-sm text-muted-foreground mb-6">
                    Published{" "}
                    {new Date(article.published_at).toLocaleDateString()}
                  </p>
                )}

                {article.cover_url && (
                  <img
                    src={article.cover_url}
                    alt={article.title}
                    className="w-full rounded-2xl mb-8 border border-border"
                  />
                )}

                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {article.content || ""}
                </ReactMarkdown>

                <div className="not-prose mt-10">
                  <Button
                    size="lg"
                    onClick={() => (window.location.hash = "articles")}
                  >
                    Back to Articles
                  </Button>
                </div>
              </article>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
