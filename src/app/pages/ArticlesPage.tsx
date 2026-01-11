import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Button } from "../components/ui/button";
import { Calendar, ArrowLeft, Share2, Twitter, Facebook, Linkedin, Mail, Link2, Check } from "lucide-react";
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
      <div className="pt-32 pb-24">
        <div className="container mx-auto px-6 md:px-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center mb-20"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl mb-8 font-bold tracking-tight">
              Stories & <span className="text-primary">Updates</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground/80 leading-relaxed font-light">
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
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
              {articles.map((a, idx) => (
                <motion.article
                  key={a.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group bg-card/50 border border-border/40 rounded-xl overflow-hidden hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 flex flex-col backdrop-blur-sm"
                >
                  {a.cover_url && (
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={a.cover_url}
                        alt={a.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        width="800"
                        height="450"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-80" />
                    </div>
                  )}
                  
                  <div className="p-8 flex flex-col flex-1">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-primary transition-colors leading-tight tracking-tight">
                      {a.title}
                    </h2>
                    
                    {a.excerpt && (
                      <p className="text-muted-foreground/80 mb-6 leading-relaxed flex-1 font-light text-base">
                        {a.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/30">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          window.location.hash = `articles/${a.slug}`;
                        }}
                        className="text-primary hover:text-primary/90 font-medium -ml-4"
                      >
                        Read Article →
                      </Button>
                      
                      {a.published_at && (
                        <time className="flex items-center gap-2 text-xs text-muted-foreground/70 tracking-wide uppercase font-medium">
                          <Calendar size={14} />
                          {new Date(a.published_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </time>
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
    <div className="pt-20 pb-24 min-h-screen">
      <div className="w-full">
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground mt-4">Loading article...</p>
          </div>
        )}
        
        {errorMessage && (
          <div className="max-w-2xl mx-auto px-6 bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
            <p className="text-destructive">{errorMessage}</p>
          </div>
        )}

        {!loading && !article && !errorMessage && (
          <div className="max-w-2xl mx-auto px-6 text-center py-20">
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
            className="w-full"
          >
            {/* Article Header */}
            <div className="max-w-[720px] mx-auto px-6 mb-16 pt-4">
              <Button
                variant="ghost"
                onClick={() => (window.location.hash = "articles")}
                className="mb-12 -ml-4 text-muted-foreground hover:text-foreground transition-colors"
                size="sm"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Articles
              </Button>

              <h1 className="text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] font-bold mb-10 leading-[1.1] tracking-tight text-white">
                {article.title}
              </h1>

              {article.excerpt && (
                <p className="text-xl md:text-2xl leading-relaxed text-foreground/70 mb-10 font-light">
                  {article.excerpt}
                </p>
              )}

              <div className="flex items-center gap-8 text-sm text-muted-foreground pb-10 border-b border-border/20">
                {article.author && (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary font-bold text-base ring-2 ring-primary/20">
                      {article.author.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground/90 text-sm tracking-wide">
                        {article.author.split('@')[0].charAt(0).toUpperCase() + article.author.split('@')[0].slice(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">Author</span>
                    </div>
                  </div>
                )}
                {article.published_at && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={16} className="text-muted-foreground/60" />
                    <time className="font-medium tracking-wide">
                      {new Date(article.published_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </time>
                  </div>
                )}
              </div>
            </div>

            {/* Cover Image */}
            {article.cover_url && (
              <div className="max-w-[1000px] mx-auto px-6 mb-20">
                <div className="rounded-xl overflow-hidden border border-border/30 shadow-2xl shadow-black/20">
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
              </div>
            )}

            {/* Article Content */}
            <article
              className="
                prose prose-invert prose-lg max-w-[720px] mx-auto px-6
                prose-headings:scroll-mt-24
                prose-headings:font-bold
                prose-headings:tracking-tight
                prose-h1:hidden
                prose-h2:text-[1.875rem] prose-h2:mt-20 prose-h2:mb-6 prose-h2:leading-[1.2] prose-h2:text-white prose-h2:font-bold prose-h2:tracking-tight
                prose-h3:text-[1.5rem] prose-h3:mt-16 prose-h3:mb-5 prose-h3:leading-[1.3] prose-h3:text-white/95 prose-h3:font-bold prose-h3:tracking-tight
                prose-h4:text-[1.25rem] prose-h4:mt-12 prose-h4:mb-4 prose-h4:text-white/90 prose-h4:font-semibold
                prose-p:text-[1.0625rem] prose-p:leading-[1.75] prose-p:mb-7 prose-p:text-white/88
                prose-strong:text-white prose-strong:font-bold
                prose-em:text-white/90 prose-em:italic
                prose-ul:my-8 prose-ul:space-y-2.5
                prose-ol:my-8 prose-ol:space-y-2.5
                prose-li:text-[1.0625rem] prose-li:text-white/88 prose-li:leading-[1.75]
                prose-li:pl-2 prose-li:my-1.5
                prose-a:text-primary prose-a:underline prose-a:decoration-2 hover:prose-a:decoration-primary/60 prose-a:font-medium prose-a:transition-all prose-a:underline-offset-[3px] hover:prose-a:text-primary/90
                prose-blockquote:border-l-[3px] prose-blockquote:border-primary/70
                prose-blockquote:bg-primary/8
                prose-blockquote:rounded-r-md
                prose-blockquote:pl-6
                prose-blockquote:pr-5
                prose-blockquote:py-5
                prose-blockquote:my-10
                prose-blockquote:italic
                prose-blockquote:text-[1.0625rem]
                prose-blockquote:leading-[1.7]
                prose-blockquote:text-white/85
                prose-code:text-primary-foreground prose-code:bg-primary/90 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.9em] prose-code:font-semibold prose-code:font-mono
                prose-pre:bg-card/60 prose-pre:border prose-pre:border-border/50 prose-pre:shadow-lg prose-pre:text-[0.875rem] prose-pre:my-8 prose-pre:rounded-lg prose-pre:font-mono
                prose-img:rounded-lg prose-img:border prose-img:border-border/40 prose-img:shadow-2xl prose-img:my-10
                prose-hr:border-border/30 prose-hr:my-14
                first:prose-p:text-[1.1875rem] first:prose-p:leading-[1.65] first:prose-p:text-white/92 first:prose-p:font-medium first:prose-p:mb-8
              "
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {article.content || ""}
              </ReactMarkdown>
            </article>

            {/* Share Section */}
            <div className="max-w-[720px] mx-auto px-6 mt-16 pt-12 border-t border-border/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <Share2 size={20} className="text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground/90 tracking-wide">Share this article</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:text-primary hover:bg-primary/10"
                    onClick={() => {
                      const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`;
                      window.open(url, '_blank', 'width=550,height=420');
                    }}
                  >
                    <Twitter size={18} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:text-primary hover:bg-primary/10"
                    onClick={() => {
                      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
                      window.open(url, '_blank', 'width=550,height=420');
                    }}
                  >
                    <Facebook size={18} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:text-primary hover:bg-primary/10"
                    onClick={() => {
                      const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
                      window.open(url, '_blank', 'width=550,height=420');
                    }}
                  >
                    <Linkedin size={18} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:text-primary hover:bg-primary/10"
                    onClick={() => {
                      const subject = encodeURIComponent(article.title);
                      const body = encodeURIComponent(`Check out this article: ${window.location.href}`);
                      window.location.href = `mailto:?subject=${subject}&body=${body}`;
                    }}
                  >
                    <Mail size={18} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:text-primary hover:bg-primary/10"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(window.location.href);
                        const btn = document.activeElement as HTMLButtonElement;
                        const icon = btn.querySelector('svg');
                        if (icon) {
                          icon.outerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                          setTimeout(() => {
                            icon.outerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`;
                          }, 2000);
                        }
                      } catch (err) {
                        console.error('Failed to copy:', err);
                      }
                    }}
                  >
                    <Link2 size={18} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="max-w-[720px] mx-auto px-6 mt-8 pb-4">
              <Button
                variant="outline"
                onClick={() => (window.location.hash = "articles")}
                className="text-sm px-6 py-5 font-medium"
              >
                <ArrowLeft size={18} className="mr-2" />
                Back to All Articles
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
