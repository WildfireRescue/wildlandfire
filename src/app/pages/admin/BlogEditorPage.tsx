import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { supabase } from "../../../lib/supabase.ts";
import { Button } from "../../components/ui/button";
import { Mail, LogOut, Save, Eye, AlertCircle, Info } from "lucide-react";
import { createPost, getCategories } from "../../../lib/supabaseBlog.ts";
import { generateSlug, calculateReadingTime } from "../../../lib/blogHelpers.ts";
import { withTimeout, TimeoutError } from "../../../lib/promiseUtils.ts";
import {
  checkEditorPermissions,
  getPermissionInstructions,
  type PermissionCheckResult,
} from "../../../lib/permissions.ts";
import type { BlogCategory } from "../../../lib/blogTypes";

export function BlogEditorPage() {
  // Permission checking
  const [permissionResult, setPermissionResult] = useState<PermissionCheckResult | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [categories, setCategories] = useState<BlogCategory[]>([]);

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSent, setLoginSent] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);

  // Post fields
  const [title, setTitle] = useState("");
  const autoSlug = useMemo(() => generateSlug(title), [title]);
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [content, setContent] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [featured, setFeatured] = useState(false);

  // UI states
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const slugTouched = useRef(false);

  // Auto-generate slug
  useEffect(() => {
    if (!slugTouched.current) setSlug(autoSlug);
  }, [autoSlug]);

  function getEmailRedirectTo() {
    return `${window.location.origin}/auth-callback`;
  }

  // ✅ Hard timeout wrapper that NEVER throws uncaught errors
  async function safePermissionCheck(): Promise<PermissionCheckResult> {
    const timeoutMs = 8000;

    const timeoutPromise = new Promise<PermissionCheckResult>((resolve) => {
      setTimeout(() => {
        resolve({
          status: "no_session",
          hasAccess: false,
          user: null,
          profile: null,
          message:
            "Permission check timed out. You are signed in, but the permissions lookup is not responding. (Likely RLS/policies on profiles).",
          technicalDetails: null,
        });
      }, timeoutMs);
    });

    try {
      // Race: either permissions resolve, or we fall back without crashing
      return await Promise.race([checkEditorPermissions(), timeoutPromise]);
    } catch (e: any) {
      console.error("[BlogEditor] Permission check crashed:", e);
      return {
        status: "no_session",
        hasAccess: false,
        user: null,
        profile: null,
        message: "Permission check failed. Please try again.",
        technicalDetails: e?.message ?? null,
      };
    }
  }

  // ✅ Boot logic: use session first so we don't loop
  useEffect(() => {
    let mounted = true;

    async function boot() {
      setIsCheckingAuth(true);
      setAuthError(null);

      try {
        const { data } = await supabase.auth.getSession();

        // If no session -> show login immediately (no waiting)
        if (!data.session) {
          if (!mounted) return;
          setPermissionResult({
            status: "no_session",
            hasAccess: false,
            user: null,
            profile: null,
            message: "Please log in to access the editor.",
            technicalDetails: null,
          });
          setIsCheckingAuth(false);
          return;
        }

        // Session exists -> run permission check safely
        const result = await safePermissionCheck();
        if (!mounted) return;

        // IMPORTANT: If we timed out but session exists, keep user from looping:
        // show "access denied" screen instead of bouncing back to login form.
        setPermissionResult(result);
      } catch (e: any) {
        console.error("[BlogEditor] boot error:", e);
        if (!mounted) return;
        setAuthError(e?.message ?? "Unexpected auth error");
        setPermissionResult({
          status: "no_session",
          hasAccess: false,
          user: null,
          profile: null,
          message: "Please log in to access the editor.",
          technicalDetails: null,
        });
      } finally {
        if (mounted) setIsCheckingAuth(false);
      }
    }

    boot();

    // Re-run when auth changes (magic link sign-in, sign-out, refresh)
    const { data: sub } = supabase.auth.onAuthStateChange((_event) => {
      console.log("[BlogEditor] auth state changed:", _event);
      boot();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      const { categories: cats } = await getCategories();
      setCategories(cats || []);
      if (cats && cats.length > 0 && !category) setCategory(cats[0].slug);
    }
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendMagicLink() {
    setLoginError(null);
    setLoginSent(false);
    setLoginBusy(true);

    try {
      const email = loginEmail.trim().toLowerCase();
      if (!email) {
        setLoginError("Please enter an email address.");
        return;
      }
      if (!email.includes("@") || !email.includes(".")) {
        setLoginError("Please enter a valid email address.");
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getEmailRedirectTo(),
          shouldCreateUser: false,
        },
      });

      if (error) {
        let msg = error.message;
        if (msg.includes("invalid_redirect")) msg = "Invalid redirect URL in Supabase settings.";
        setLoginError(msg);
        return;
      }

      setLoginSent(true);
    } catch (e: any) {
      setLoginError(e?.message ?? "Unexpected error");
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
      if (!finalSlug) throw new Error("Slug is required");

      const readingTime = calculateReadingTime(content);
      const authorEmail = permissionResult?.user?.email || "unknown";
      const authorName = authorEmail.split("@")[0];

      const postData = {
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt.trim() || null,
        meta_title: metaTitle.trim() || null,
        meta_description: metaDescription.trim() || null,
        content_markdown: content.trim(),
        cover_image_url: coverUrl.trim() || null,
        category: category || null,
        tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
        reading_time_minutes: readingTime,
        featured,
        author_email: authorEmail,
        author_name: authorName,
      };

      const savePromise = createPost(postData);
      const { post, error } = await withTimeout(
        savePromise,
        15000,
        "Save timed out after 15 seconds. Check connection and try again."
      );

      if (error) throw new Error(error.message || "Failed to save post");
      if (!post) throw new Error("No post returned from DB");

      setSaveMsg("✅ Post saved!");
      setTimeout(() => setSaveMsg(null), 4000);
    } catch (e: any) {
      const msg = e instanceof TimeoutError ? e.message : e?.message ?? "Save failed";
      setSaveErr(msg);
      setTimeout(() => setSaveErr(null), 8000);
    } finally {
      setSaving(false);
    }
  }

  // UI: Checking authentication status
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto bg-card border border-border rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground mb-2">Checking permissions…</p>
            <p className="text-xs text-muted-foreground">
              If this keeps looping, permissions lookup is timing out (RLS/policies).
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No permission result yet
  if (!permissionResult) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <p className="text-destructive">Failed to check permissions</p>
            {authError && <p className="text-xs text-muted-foreground mt-2">{authError}</p>}
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
              <div className="flex items-center gap-3 mb-6">
                <Mail size={24} className="text-primary" />
                <h1 className="text-2xl font-bold">Blog Editor Login</h1>
              </div>

              <p className="text-muted-foreground mb-6">Enter your authorized email to receive a magic link.</p>

              <div className="space-y-4">
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  disabled={loginBusy}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loginBusy) sendMagicLink();
                  }}
                />

                {loginError && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <p className="text-destructive text-sm whitespace-pre-line">{loginError}</p>
                  </div>
                )}

                {loginSent && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <p className="text-primary text-sm font-medium mb-2">✅ Check your email for the login link!</p>
                    <p className="text-muted-foreground text-xs">Check spam too. You can resend after 30 seconds.</p>
                  </div>
                )}

                <Button onClick={sendMagicLink} disabled={loginBusy} className="w-full">
                  {loginBusy ? "Sending…" : loginSent ? "Resend Magic Link" : "Send Magic Link"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Logged IN but no access OR permission lookup timed out
  if (!permissionResult.hasAccess) {
    const instructions = getPermissionInstructions(permissionResult.status);
    const userEmail = permissionResult.user?.email || "(signed-in user)";

    return (
      <div className="min-h-screen pt-28 pb-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-destructive/10 border border-destructive/20 rounded-xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <AlertCircle className="w-8 h-8 text-destructive flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-destructive mb-2">Access / Permission Check Issue</h2>
                <p className="text-destructive mb-2">{permissionResult.message}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Logged in as: <strong>{userEmail}</strong>
                </p>
              </div>
            </div>

            {instructions && (
              <details className="bg-background border border-border rounded-lg p-4 mb-6">
                <summary className="cursor-pointer text-primary font-medium flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Technical Details & Fix Instructions
                </summary>
                <div className="mt-4 space-y-3">
                  <pre className="bg-muted/50 p-3 rounded text-xs text-foreground overflow-x-auto">{instructions}</pre>
                </div>
              </details>
            )}

            <div className="flex gap-3">
              <Button onClick={() => window.location.reload()} variant="outline">
                Retry
              </Button>
              <Button onClick={signOut} variant="outline" className="ml-auto">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Logged in and has access
  const userEmail = permissionResult.user?.email || "Unknown";
  const userRole = permissionResult.profile?.role || "allowlist";

  return (
    <div className="min-h-screen pt-28 pb-20 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Blog Editor</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Signed in as <strong>{userEmail}</strong> ({userRole})
            </span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut size={16} className="mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Slug *</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                slugTouched.current = true;
              }}
              placeholder="post-slug"
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content (Markdown) *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
            />
          </div>

          {saveMsg && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-primary">{saveMsg}</p>
            </div>
          )}

          {saveErr && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive">{saveErr}</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button onClick={savePost} disabled={saving} className="flex-1">
              <Save size={18} className="mr-2" />
              {saving ? "Saving..." : "Save Post"}
            </Button>

            <Button variant="outline" onClick={() => (window.location.href = "/blog")}>
              <Eye size={18} className="mr-2" />
              View Blog
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}