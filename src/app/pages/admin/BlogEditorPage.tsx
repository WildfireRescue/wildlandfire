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

  // Post fields (minimal editor fields)
  const [title, setTitle] = useState("");
  const autoSlug = useMemo(() => generateSlug(title), [title]);
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

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
      const authorName = authorEmail.split("@")[0];

      const postData = {
        title: title.trim(),
        slug: finalSlug,
        content_markdown: content.trim(),
        status: "draft" as const,
        published_at: null,
        reading_time_minutes: readingTime,
        featured: false,
        author_email: authorEmail,
        author_name: authorName,
        excerpt: null,
        meta_title: null,
        meta_description: null,
        cover_image_url: null,
        category: null,
        tags: [],
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
            <span className="text-xs text-muted-foreground font-mono">{BUILD_TAG}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut size={16} className="mr-2" /> Sign Out
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content (Markdown) *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={14}
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg font-mono text-sm"
            />
          </div>

          {saveMsg && <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">{saveMsg}</div>}
          {saveErr && <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">{saveErr}</div>}

          <div className="flex gap-3">
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