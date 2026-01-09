import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { Button } from '../components/ui/button';
import { Mail, LogOut, FileText, Link as LinkIcon, Image, Eye, EyeOff, Trash2 } from 'lucide-react';

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ✅ Hard-lock who can publish
const ALLOWED_PUBLISHERS = new Set([
  'earl@thewildlandfirerecoveryfund.org',
  'jason@thewildlandfirerecoveryfund.org',
  'drew@thewildlandfirerecoveryfund.org',
  'kendra@thewildlandfirerecoveryfund.org',
]);

function isAllowedPublisher(email: string | null | undefined) {
  if (!email) return false;
  return ALLOWED_PUBLISHERS.has(email.toLowerCase());
}

export function PublishPage() {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSent, setLoginSent] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);

  // Article fields
  const [title, setTitle] = useState('');
  const autoSlug = useMemo(() => slugify(title), [title]);
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);

  // Insert vs Update
  const [mode, setMode] = useState<'insert' | 'upsert'>('insert');

  // UI states
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  // track if user manually edited slug (so we stop auto-overwriting)
  const slugTouched = useRef(false);

  useEffect(() => {
    if (!slugTouched.current) setSlug(autoSlug);
  }, [autoSlug]);

  // Load session + listen for changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessionEmail(data.session?.user?.email ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSessionEmail(sess?.user?.email ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  function getEmailRedirectTo() {
    // IMPORTANT: must be added in Supabase Auth → URL Configuration → Redirect URLs
    // Add both:
    //   http://localhost:5173/#publish
    //   https://thewildlandfirerecoveryfund.org/#publish
    return `${window.location.origin}/#publish`;
  }

  // ✅ Magic link login for INVITE-ONLY projects
  async function sendMagicLink() {
    setLoginError(null);
    setLoginSent(false);
    setLoginBusy(true);

    try {
      const email = loginEmail.trim().toLowerCase();
      if (!email) {
        setLoginError('Enter an email address.');
        return;
      }

      // Frontend lock
      if (!isAllowedPublisher(email)) {
        setLoginError('This email is not authorized to publish.');
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getEmailRedirectTo(),
          shouldCreateUser: false, // 🔒 KEY FIX: do NOT attempt to create users
        },
      });

      if (error) {
        const msg = error.message || 'Login failed.';
        // Helpful hint for the exact error you’re seeing
        if (msg.toLowerCase().includes('signups not allowed')) {
          setLoginError(
            `Signups are disabled (invite-only). This email must be invited first.\n\nFix:\nSupabase → Authentication → Users → Invite user → invite: ${email}\nThen try again.`
          );
        } else {
          setLoginError(msg);
        }
        return;
      }

      setLoginSent(true);
    } finally {
      setLoginBusy(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function publishNow() {
    setSaving(true);
    setSaveMsg(null);
    setSaveErr(null);

    try {
      const author = sessionEmail?.toLowerCase() ?? null;
      if (!author) throw new Error('Not signed in.');
      if (!isAllowedPublisher(author)) throw new Error('Not authorized to publish.');

      const finalSlug = slugify(slug || title);

      if (!title.trim()) throw new Error('Title is required.');
      if (!finalSlug) throw new Error('Slug is required.');
      if (!content.trim()) throw new Error('Content is required.');

      const payload = {
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt.trim() || null,
        cover_url: coverUrl.trim() || null,
        content: content.trim(),
        published,
        published_at: published ? new Date().toISOString() : null,
        author, // match your RLS policy (author = auth.jwt()->>'email')
      };

      const q =
        mode === 'upsert'
          ? supabase.from('articles').upsert(payload, { onConflict: 'slug' })
          : supabase.from('articles').insert(payload);

      const { error } = await q;
      if (error) throw new Error(error.message);

      setSaveMsg(mode === 'upsert' ? '✅ Saved (updated if slug existed).' : '✅ Published!');
      setTitle('');
      setSlug('');
      slugTouched.current = false;
      setExcerpt('');
      setCoverUrl('');
      setContent('');
      setPublished(true);
      setMode('insert');
    } catch (e: any) {
      setSaveErr(e?.message ?? 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteBySlug() {
    setSaving(true);
    setSaveMsg(null);
    setSaveErr(null);

    try {
      const author = sessionEmail?.toLowerCase() ?? null;
      if (!author) throw new Error('Not signed in.');
      if (!isAllowedPublisher(author)) throw new Error('Not authorized.');

      const finalSlug = slugify(slug || title);
      if (!finalSlug) throw new Error('Enter a slug (or title) to delete.');

      // RLS should enforce: only the author can delete their own articles
      const { error } = await supabase.from('articles').delete().eq('slug', finalSlug);
      if (error) throw new Error(error.message);

      setSaveMsg('🗑️ Deleted (only if you were the author).');
    } catch (e: any) {
      setSaveErr(e?.message ?? 'Delete failed.');
    } finally {
      setSaving(false);
    }
  }

  // ---------- UI ----------

  // Logged OUT
  if (!sessionEmail) {
    return (
      <div className="min-h-screen pt-24 pb-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto"
          >
            <div className="bg-card border border-border rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <Mail size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-semibold">Publisher Login</h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    Authorized team members only
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@thewildlandfirerecoveryfund.org"
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <Button
                  onClick={sendMagicLink}
                  disabled={loginBusy}
                  className="w-full"
                  size="lg"
                >
                  {loginBusy ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail size={18} className="mr-2" />
                      Send Magic Link
                    </>
                  )}
                </Button>
              </div>

              {loginSent && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl"
                >
                  <p className="text-green-400 text-sm">
                    ✅ Check your inbox for the magic link!
                  </p>
                </motion.div>
              )}

              {loginError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl"
                >
                  <p className="text-destructive text-sm whitespace-pre-wrap">{loginError}</p>
                </motion.div>
              )}

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Authorized Publishers:</p>
                <div className="flex flex-wrap gap-2">
                  {Array.from(ALLOWED_PUBLISHERS).map((email) => (
                    <span
                      key={email}
                      className="px-2 py-1 bg-primary/5 border border-primary/20 rounded-lg text-xs text-muted-foreground"
                    >
                      {email.split('@')[0]}@...
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Logged IN but not allowed (extra safety)
  if (!isAllowedPublisher(sessionEmail)) {
    return (
      <div className="min-h-screen pt-24 pb-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto"
          >
            <div className="bg-card border border-destructive/30 rounded-2xl p-8 text-center">
              <div className="inline-flex p-4 rounded-full bg-destructive/10 text-destructive mb-4">
                <LogOut size={32} />
              </div>
              <h1 className="text-2xl font-semibold mb-3">Not Authorized</h1>
              <p className="text-muted-foreground mb-6">
                You are signed in as <strong className="text-foreground">{sessionEmail}</strong>, but this email is not authorized to publish articles.
              </p>
              <Button onClick={signOut} variant="outline">
                <LogOut size={18} className="mr-2" />
                Sign Out
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Logged IN
  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Publish Article</h1>
              <p className="text-muted-foreground">
                Signed in as <span className="text-primary font-medium">{sessionEmail}</span>
              </p>
            </div>
            <Button onClick={signOut} variant="outline">
              <LogOut size={18} className="mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Mode Selection */}
          <div className="bg-card border border-border rounded-xl p-4 mb-6">
            <div className="flex gap-6 flex-wrap">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="mode"
                  checked={mode === 'insert'}
                  onChange={() => setMode('insert')}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm group-hover:text-primary transition-colors">
                  <strong>Create New</strong> — Insert new article
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="mode"
                  checked={mode === 'upsert'}
                  onChange={() => setMode('upsert')}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm group-hover:text-primary transition-colors">
                  <strong>Update Existing</strong> — Upsert by slug
                </span>
              </label>
            </div>
          </div>

          {/* Form */}
          <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
            {/* Title */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <FileText size={16} className="text-primary" />
                Article Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Rebuilding After the Fire: What Recovery Really Means"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-lg"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <LinkIcon size={16} className="text-primary" />
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  slugTouched.current = true;
                  setSlug(e.target.value);
                }}
                placeholder={autoSlug || 'article-url-slug'}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Auto-generated from title. Keep it short and URL-friendly.
              </p>
            </div>

            {/* Excerpt */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <FileText size={16} className="text-primary" />
                Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                placeholder="1-2 sentences that appear in article cards and search results..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-y"
              />
            </div>

            {/* Cover Image URL */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Image size={16} className="text-primary" />
                Cover Image URL <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              {coverUrl && (
                <div className="mt-3 rounded-xl overflow-hidden border border-border">
                  <img src={coverUrl} alt="Cover preview" className="w-full h-48 object-cover" />
                </div>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <FileText size={16} className="text-primary" />
                Article Content <span className="text-muted-foreground font-normal">(Markdown supported)</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                placeholder="Write your article here using Markdown formatting..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-y font-mono text-sm"
              />
            </div>

            {/* Published Toggle */}
            <div className="flex items-center gap-3 p-4 bg-background/50 rounded-xl border border-border">
              <input
                type="checkbox"
                id="published"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-5 h-5 text-primary rounded"
              />
              <label htmlFor="published" className="flex items-center gap-2 cursor-pointer">
                {published ? <Eye size={18} className="text-primary" /> : <EyeOff size={18} className="text-muted-foreground" />}
                <span className="font-medium">
                  {published ? 'Publish immediately' : 'Save as draft'}
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 flex-wrap">
              <Button
                onClick={publishNow}
                disabled={saving}
                size="lg"
                className="flex-1 min-w-[200px]"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FileText size={18} className="mr-2" />
                    {mode === 'upsert' ? 'Save / Update' : 'Publish Article'}
                  </>
                )}
              </Button>

              <Button
                onClick={deleteBySlug}
                disabled={saving}
                variant="outline"
                size="lg"
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
                title="Deletes the article with this slug (only if you are the author)"
              >
                <Trash2 size={18} className="mr-2" />
                Delete by Slug
              </Button>
            </div>

            {/* Success/Error Messages */}
            {saveMsg && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl"
              >
                <p className="text-green-400 whitespace-pre-wrap">{saveMsg}</p>
              </motion.div>
            )}

            {saveErr && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl"
              >
                <p className="text-destructive whitespace-pre-wrap">{saveErr}</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}