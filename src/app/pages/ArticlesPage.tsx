import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Button } from "../components/ui/button";
import { Calendar, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

export function ArticlesPage({ slug }: { slug?: string }) {
  const [articles, setArticles] = useState<any[]>([]);
  const [article, setArticle] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    slug ? fetchArticle(slug) : fetchArticles();
  }, [slug]);

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

  // Articles List View
  if (!slug) {
    return (
      <div className="min-h-screen pt-24 pb-20 bg-background">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl mb-6">
              Stories & <span className="text-primary">Updates</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Real stories from the front lines of wildfire recovery and the latest updates from our team.
            </p>
          </motion.div>

          {/* Loading/Error States */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground mt-4">Loading articles...</p>
            </div>
          )}
          
          {errorMessage && (
            <div className="max-w-2xl mx-auto bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
              <p className="text-destructive">{errorMessage}</p>
            </div>
          )}

          {/* Articles Grid */}
          {!loading && !errorMessage && articles.length === 0 && (
            <div className="max-w-2xl mx-auto text-center py-12">
              <p className="text-muted-foreground text-lg">No articles published yet. Check back soon!</p>
            </div>
          )}

          {!loading && articles.length > 0 && (
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
              {articles.map((a, idx) => (
                <motion.article
                  key={a.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 flex flex-col"
                >
                  {a.cover_url && (
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={a.cover_url}
                        alt={a.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                    </div>
                  )}
                  
                  <div className="p-6 flex flex-col flex-1">
                    <h2 className="text-2xl font-semibold mb-3 hover:text-primary transition-colors">
                      {a.title}
                    </h2>
                    
                    {a.excerpt && (
                      <p className="text-muted-foreground mb-4 leading-relaxed flex-1">
                        {a.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        onClick={() => {
                          window.location.hash = `articles/${a.slug}`;
                        }}
                      >
                        Read Article
                      </Button>
                      
                      {a.published_at && (
                        <span className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar size={16} />
                          {new Date(a.published_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Single Article View
  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="container mx-auto px-4">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground mt-4">Loading article...</p>
          </div>
        )}
        
        {errorMessage && (
          <div className="max-w-2xl mx-auto bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
            <p className="text-destructive">{errorMessage}</p>
          </div>
        )}

        {!loading && !article && !errorMessage && (
          <div className="max-w-2xl mx-auto text-center py-12">
            <p className="text-muted-foreground text-lg">Article not found.</p>
            <Button
              className="mt-6"
              onClick={() => (window.location.hash = "articles")}
            >
              <ArrowLeft size={18} className="mr-2" />
              Back to Articles
            </Button>
          </div>
        )}

        {!loading && article && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Article Header */}
            <div className="mb-8">
              <Button
                variant="ghost"
                onClick={() => (window.location.hash = "articles")}
                className="mb-6"
              >
                <ArrowLeft size={18} className="mr-2" />
                Back to Articles
              </Button>

              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {article.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {article.author && (
                  <span>By {article.author}</span>
                )}
                {article.published_at && (
                  <span className="flex items-center gap-2">
                    <Calendar size={16} />
                    {new Date(article.published_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                )}
              </div>
            </div>

            {/* Cover Image */}
            {article.cover_url && (
              <div className="mb-10 rounded-2xl overflow-hidden border border-border">
                <img
                  src={article.cover_url}
                  alt={article.title}
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Article Content */}
            <article
              className="
                prose prose-invert prose-lg max-w-none
                prose-headings:scroll-mt-24
                prose-h1:text-4xl prose-h1:tracking-tight prose-h1:mb-6
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4
                prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-3
                prose-p:leading-8 prose-p:mb-6
                prose-ul:my-6 prose-li:my-2
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                prose-blockquote:border-l-4 prose-blockquote:border-primary/60
                prose-blockquote:bg-card/40
                prose-blockquote:rounded-xl
                prose-blockquote:px-6
                prose-blockquote:py-4
                prose-blockquote:not-italic
                prose-code:text-primary prose-code:bg-card/40 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-card prose-pre:border prose-pre:border-border
                prose-img:rounded-xl prose-img:border prose-img:border-border
              "
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {article.content || ""}
              </ReactMarkdown>
            </article>

            {/* Back Button */}
            <div className="mt-12 pt-8 border-t border-border">
              <Button
                size="lg"
                onClick={() => (window.location.hash = "articles")}
              >
                <ArrowLeft size={18} className="mr-2" />
                Back to Articles
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
