import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { supabase } from "../../../lib/supabase";
import { Button } from "../../components/ui/button";
import { Mail, LogOut, Save, Eye, AlertCircle, Info } from "lucide-react";
import { createPost, getCategories } from "../../../lib/supabaseBlog";
import { generateSlug, calculateReadingTime } from "../../../lib/blogHelpers";
import { withTimeout, TimeoutError } from "../../../lib/promiseUtils";
import {
  checkEditorPermissions,
  getPermissionInstructions,
  type PermissionCheckResult,
} from "../../../lib/permissions";
import type { BlogCategory } from "../../../lib/blogTypes";

const BUILD_TAG = "BLOG_EDITOR_NOHANG_2026-02-20_0940";

export function BlogEditorPage() {
  console.log("[BlogEditorPage] RENDER", BUILD_TAG);

  const [permissionResult, setPermissionResult] = useState<PermissionCheckResult | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [categories, setCategories] = useState<BlogCategory[]>([]);

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSent, setLoginSent] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);

  // Core fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  
  // SEO & Metadata
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [secondaryKeywords, setSecondaryKeywords] = useState("");
  
  // Images & Social
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [featuredImageAltText, setFeaturedImageAltText] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [twitterCard, setTwitterCard] = useState("summary_large_image");
  
  // Categories & Tags
  const [category, setCategory] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  
  // Publishing
  const [status, setStatus] = useState<"draft" | "scheduled" | "published">("draft");
  const [scheduledFor, setScheduledFor] = useState("");
  const [featured, setFeatured] = useState(false);
  const [allowIndexing, setAllowIndexing] = useState(true);
  const [allowFollow, setAllowFollow] = useState(true);
  const [robotsDirectives, setRobotsDirectives] = useState("");
  const [sitemapPriority, setSitemapPriority] = useState("0.8");
  
  // E-E-A-T / Author
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [authorBio, setAuthorBio] = useState("");
  const [reviewedBy, setReviewedBy] = useState("");
  const [factChecked, setFactChecked] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const autoSlug = useMemo(() => generateSlug(title), [title]);
  const slugTouched = useRef(false);

  useEffect(() => {
    if (!slugTouched.current) setSlug(autoSlug);
  }, [autoSlug]);

  function getEmailRedirectTo() {
    return `${window.location.origin}/auth-callback`;
  }

  // ✅ NO-HANG permission boot
  useEffect(() => {
    let mounted = true;

    async function boot() {
      setIsCheckingAuth(true);

      // HARD FALLBACK after 8s no matter what
      const hardStop = setTimeout(() => {
        if (!mounted) return;
        console.error("[BlogEditorPage] HARD STOP: permissions still not resolved after 8s");
        setPermissionResult({
          status: "error",
          hasAccess: false,
          user: null,
          profile: null,
          message:
            "Permissions check is hanging. This is almost always (1) cached old JS bundle, or (2) a stuck network request / blocked profiles RLS.",
          technicalDetails: { build: BUILD_TAG },
        });
        setIsCheckingAuth(false);
      }, 8000);

      try {
        console.log("[BlogEditorPage] calling checkEditorPermissions()", BUILD_TAG);
        const result = await checkEditorPermissions();
        console.log("[BlogEditorPage] permission result:", result);

        if (!mounted) return;
        setPermissionResult(result);
      } catch (e) {
        console.error("[BlogEditorPage] permission check threw:", e);
        if (!mounted) return;
        setPermissionResult({
          status: "error",
          hasAccess: false,
          user: null,
          profile: null,
          message: "Permission check failed unexpectedly.",
          technicalDetails: e,
        });
      } finally {
        clearTimeout(hardStop);
        if (mounted) setIsCheckingAuth(false);
      }
    }

    boot();

    return () => {
      mounted = false;
    };
  }, []);

  // Load categories with timeout protection
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        // Add 5 second timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Categories load timeout')), 5000)
        );
        
        const categoriesPromise = getCategories();
        const { categories: cats } = await Promise.race([
          categoriesPromise,
          timeoutPromise
        ]) as Awaited<ReturnType<typeof getCategories>>;
        
        if (isMounted) {
          setCategories(cats || []);
        }
      } catch (e) {
        if (isMounted) {
          console.warn('[BlogEditorPage] Categories load failed (non-blocking):', e);
          setCategories([]);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  async function sendMagicLink() {
    setLoginError(null);
    setLoginSent(false);
    setLoginBusy(true);

    try {
      const email = loginEmail.trim().toLowerCase();
      if (!email) return setLoginError("Please enter an email address.");
      if (!email.includes("@") || !email.includes(".")) return setLoginError("Enter a valid email.");

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: getEmailRedirectTo(), shouldCreateUser: false },
      });

      if (error) return setLoginError(error.message);
      setLoginSent(true);
    } finally {
      setLoginBusy(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function savePost() {
    setSaving(true);
    setSaveMsg(null);
    setSaveErr(null);

    try {
      if (!title.trim()) throw new Error("Title is required");
      if (!content.trim()) throw new Error("Content is required");

      const finalSlug = slug || autoSlug;
      const readingTime = calculateReadingTime(content);

      const authorEmail = permissionResult?.user?.email || "unknown";

      const postData = {
        // Core
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt.trim() || null,
        content_markdown: content.trim(),
        
        // SEO & Metadata
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        canonical_url: canonicalUrl || null,
        focus_keyword: focusKeyword || null,
        secondary_keywords: secondaryKeywords ? secondaryKeywords.split(",").map((k) => k.trim()).filter(Boolean) : [],
        
        // Images & Social
        cover_image_url: coverImageUrl || null,
        featured_image_url: featuredImageUrl || null,
        featured_image_alt_text: featuredImageAltText || null,
        og_image_url: ogImageUrl || null,
        og_title: ogTitle || null,
        og_description: ogDescription || null,
        twitter_card: twitterCard,
        
        // Categories & Tags
        category: category || null,
        tags: tagsInput ? tagsInput.split(",").map((t) => t.trim()).filter(Boolean) : [],
        
        // Publishing
        status: status as "draft" | "scheduled" | "published",
        scheduled_for: status === "scheduled" && scheduledFor ? scheduledFor : null,
        featured: featured,
        allow_indexing: allowIndexing,
        allow_follow: allowFollow,
        robots_directives: robotsDirectives || null,
        sitemap_priority: parseFloat(sitemapPriority) || 0.8,
        
        // E-E-A-T / Author
        author_email: authorEmail,
        author_name: authorName || null,
        author_role: authorRole || null,
        author_bio: authorBio || null,
        reviewed_by: reviewedBy || null,
        fact_checked: factChecked,
        
        // Metadata
        reading_time_minutes: readingTime,
        published_at: status === "published" ? new Date().toISOString() : null,
      };

      const { post, error } = await withTimeout(
        createPost(postData),
        15000,
        "Save timed out after 15 seconds."
      );

      if (error) throw new Error(error.message || "Save failed");
      if (!post) throw new Error("No post returned");

      setSaveMsg("✅ Saved draft!");
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (e: any) {
      const msg = e instanceof TimeoutError ? e.message : e?.message ?? "Save failed";
      setSaveErr(msg);
    } finally {
      setSaving(false);
    }
  }

  // ---------------- UI ----------------

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto bg-card border border-border rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground mb-2">Checking permissions…</p>
            <p className="text-xs text-muted-foreground">
              Build: <span className="font-mono">{BUILD_TAG}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!permissionResult) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <p className="text-destructive">No permission result</p>
            <p className="text-xs text-muted-foreground mt-2 font-mono">{BUILD_TAG}</p>
          </div>
        </div>
      </div>
    );
  }

  // Logged OUT
  if (permissionResult.status === "no_session") {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto">
            <div className="bg-card border border-border rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-2">
                <Mail size={24} className="text-primary" />
                <h1 className="text-2xl font-bold">Blog Editor Login</h1>
              </div>
              <p className="text-xs text-muted-foreground mb-6 font-mono">{BUILD_TAG}</p>

              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg"
                disabled={loginBusy}
              />

              {loginError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mt-4">
                  <p className="text-destructive text-sm">{loginError}</p>
                </div>
              )}

              {loginSent && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-4">
                  <p className="text-primary text-sm font-medium">✅ Check your email for the login link!</p>
                </div>
              )}

              <Button onClick={sendMagicLink} disabled={loginBusy} className="w-full mt-4">
                {loginBusy ? "Sending…" : "Send Magic Link"}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Logged IN but denied / error
  if (!permissionResult.hasAccess) {
    const instructions = getPermissionInstructions(permissionResult);
    return (
      <div className="min-h-screen pt-28 pb-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-destructive/10 border border-destructive/20 rounded-xl p-8">
            <h2 className="text-xl font-bold text-destructive mb-2">Access / Permission Issue</h2>
            <p className="text-destructive mb-4">{permissionResult.message}</p>
            <p className="text-xs text-muted-foreground mb-6 font-mono">Build: {BUILD_TAG}</p>

            <details className="bg-background border border-border rounded-lg p-4 mb-6">
              <summary className="cursor-pointer text-primary font-medium flex items-center gap-2">
                <Info className="w-4 h-4" /> Details
              </summary>
              <pre className="bg-muted/50 p-3 rounded text-xs overflow-x-auto mt-3">
{JSON.stringify(permissionResult.technicalDetails ?? null, null, 2)}
              </pre>
              <pre className="bg-muted/50 p-3 rounded text-xs overflow-x-auto mt-3">
{instructions.join("\n")}
              </pre>
            </details>

            <div className="flex gap-3">
              <Button onClick={() => window.location.reload()} variant="outline">
                Retry
              </Button>
              <Button onClick={signOut} variant="outline" className="ml-auto">
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Logged IN and has access
  return (
    <div className="min-h-screen pt-28 pb-20 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Blog Editor</h1>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut size={16} className="mr-2" /> Sign Out
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 space-y-8">
          {/* CORE FIELDS */}
          <div>
            <h2 className="text-lg font-bold mb-4 text-primary">Core Content</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post title..."
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Slug *</label>
                <input
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    slugTouched.current = true;
                  }}
                  placeholder={autoSlug}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">Auto: {autoSlug}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Excerpt</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Short summary (optional)..."
                  rows={2}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Content (Markdown) *</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Post content in markdown..."
                  rows={14}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* SEO FIELDS */}
          <div>
            <h2 className="text-lg font-bold mb-4 text-primary">SEO & Metadata</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Meta Title</label>
                <input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Page title for search engines..."
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Focus Keyword</label>
                <input
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  placeholder="Primary keyword..."
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Meta Description</label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Description for search engines (160 chars)..."
                  rows={2}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Secondary Keywords (comma-separated)</label>
                <input
                  value={secondaryKeywords}
                  onChange={(e) => setSecondaryKeywords(e.target.value)}
                  placeholder="keyword1, keyword2, keyword3..."
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Canonical URL</label>
                <input
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://example.com/article (optional)..."
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* IMAGES & SOCIAL */}
          <div>
            <h2 className="text-lg font-bold mb-4 text-primary">Images & Social</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cover Image URL</label>
                <input
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Featured Image URL</label>
                <input
                  value={featuredImageUrl}
                  onChange={(e) => setFeaturedImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Featured Image Alt Text</label>
                <input
                  value={featuredImageAltText}
                  onChange={(e) => setFeaturedImageAltText(e.target.value)}
                  placeholder="Description of the image..."
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">OG Image URL</label>
                <input
                  value={ogImageUrl}
                  onChange={(e) => setOgImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Twitter Card</label>
                <select
                  value={twitterCard}
                  onChange={(e) => setTwitterCard(e.target.value)}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg text-sm"
                >
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary Large Image</option>
                  <option value="player">Player</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">OG Title</label>
                <input
                  value={ogTitle}
                  onChange={(e) => setOgTitle(e.target.value)}
                  placeholder="Social media title..."
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">OG Description</label>
                <textarea
                  value={ogDescription}
                  onChange={(e) => setOgDescription(e.target.value)}
                  placeholder="Social media description..."
                  rows={2}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* CATEGORIES & TAGS */}
          <div>
            <h2 className="text-lg font-bold mb-4 text-primary">Categories & Tags</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg text-sm"
                >
                  <option value="">Select a category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                <input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="tag1, tag2, tag3..."
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* PUBLISHING */}
          <div>
            <h2 className="text-lg font-bold mb-4 text-primary">Publishing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "draft" | "scheduled" | "published")}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                </select>
              </div>

              {status === "scheduled" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Scheduled For</label>
                  <input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg text-sm"
                  />
                </div>
              )}

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="featured"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="featured" className="text-sm font-medium cursor-pointer">Featured Post</label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="allow-indexing"
                  checked={allowIndexing}
                  onChange={(e) => setAllowIndexing(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="allow-indexing" className="text-sm font-medium cursor-pointer">Allow Indexing</label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="allow-follow"
                  checked={allowFollow}
                  onChange={(e) => setAllowFollow(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="allow-follow" className="text-sm font-medium cursor-pointer">Allow Follow</label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sitemap Priority (0.0-1.0)</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={sitemapPriority}
                  onChange={(e) => setSitemapPriority(e.target.value)}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Robots Directives</label>
                <input
                  value={robotsDirectives}
                  onChange={(e) => setRobotsDirectives(e.target.value)}
                  placeholder="noindex, nofollow (optional)..."
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* E-E-A-T / AUTHOR */}
          <div>
            <h2 className="text-lg font-bold mb-4 text-primary">Expertise, Experience, Authority, Trustworthiness</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Author Name</label>
                <input
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Full name..."
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Author Role</label>
                <input
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  placeholder="Expert, Journalist, etc..."
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Author Bio</label>
                <textarea
                  value={authorBio}
                  onChange={(e) => setAuthorBio(e.target.value)}
                  placeholder="Author biography and credentials..."
                  rows={2}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Reviewed By</label>
                <input
                  value={reviewedBy}
                  onChange={(e) => setReviewedBy(e.target.value)}
                  placeholder="Reviewer name (for credibility)..."
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="fact-checked"
                  checked={factChecked}
                  onChange={(e) => setFactChecked(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="fact-checked" className="text-sm font-medium cursor-pointer">Fact Checked</label>
              </div>
            </div>
          </div>

          {/* MESSAGES & BUTTONS */}
          {saveMsg && <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">{saveMsg}</div>}
          {saveErr && <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">{saveErr}</div>}

          <div className="flex gap-3 pt-4">
            <Button onClick={savePost} disabled={saving} className="flex-1">
              <Save size={18} className="mr-2" />
              {saving ? "Saving…" : "Save Draft"}
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = "/blog")}>
              <Eye size={18} className="mr-2" /> View Blog
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}