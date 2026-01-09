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
      <div className="pt-28 pb-20">
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
                        width="800"
                        height="450"
                        loading="lazy"
                        decoding="async"
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
    <div className="pt-28 pb-20">
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
            <div className="mb-12 text-center">
              <Button
                variant="ghost"
                onClick={() => (window.location.hash = "articles")}
                className="mb-8 mx-auto"
              >
                <ArrowLeft size={18} className="mr-2" />
                Back to Articles
              </Button>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                {article.title}
              </h1>

              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground flex-wrap">
                {article.author && (
                  <span className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                      {article.author.charAt(0).toUpperCase()}
                    </div>
                    {article.author.split('@')[0].charAt(0).toUpperCase() + article.author.split('@')[0].slice(1)}
                  </span>
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
              <div className="mb-16 rounded-3xl overflow-hidden border border-border shadow-2xl shadow-primary/5">
                <img
                  src={article.cover_url}
                  alt={article.title}
                  className="w-full h-auto"
                  width="1200"
                  height="675"
                  loading="eager"
                  decoding="async"
                />
              </div>
            )}

            {/* Article Content */}
            <article
              className="
                prose prose-invert prose-xl max-w-none
                prose-headings:scroll-mt-24
                prose-headings:font-bold
                prose-h1:hidden
                prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:text-white prose-h2:border-l-4 prose-h2:border-primary prose-h2:pl-6
                prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-4 prose-h3:text-primary
                prose-p:leading-relaxed prose-p:mb-8 prose-p:text-foreground/90
                prose-strong:text-white prose-strong:font-semibold
                prose-ul:my-8 prose-ul:space-y-3
                prose-li:text-foreground/90 prose-li:leading-relaxed
                prose-li:pl-2
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-medium prose-a:transition-all
                prose-blockquote:border-l-4 prose-blockquote:border-primary
                prose-blockquote:bg-primary/5
                prose-blockquote:rounded-r-2xl
                prose-blockquote:px-8
                prose-blockquote:py-6
                prose-blockquote:not-italic
                prose-blockquote:text-foreground/90
                prose-blockquote:shadow-lg
                prose-code:text-primary prose-code:bg-primary/10 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:font-semibold
                prose-pre:bg-card prose-pre:border prose-pre:border-border prose-pre:shadow-xl
                prose-img:rounded-2xl prose-img:border prose-img:border-border prose-img:shadow-lg
                prose-hr:border-border prose-hr:my-12
              "
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {article.content || ""}
              </ReactMarkdown>
            </article>

            {/* Back Button */}
            <div className="mt-16 pt-12 border-t border-border/50 text-center">
              <Button
                size="lg"
                onClick={() => (window.location.hash = "articles")}
                className="text-lg px-8"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Articles
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
