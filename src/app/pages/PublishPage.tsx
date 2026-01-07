import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';

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
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 16px' }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Publisher Login</h1>
        <p style={{ opacity: 0.8, marginBottom: 20 }}>
          Sign in with your email to publish articles.
        </p>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="you@thewildlandfirerecoveryfund.org"
            autoComplete="email"
            style={{
              flex: 1,
              padding: '12px 14px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.04)',
              color: 'inherit',
            }}
          />
          <button
            onClick={sendMagicLink}
            disabled={loginBusy}
            style={{
              padding: '12px 16px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.08)',
              cursor: loginBusy ? 'not-allowed' : 'pointer',
              opacity: loginBusy ? 0.7 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {loginBusy ? 'Sending…' : 'Send magic link'}
          </button>
        </div>

        <div style={{ marginTop: 14, opacity: 0.75, fontSize: 13, lineHeight: 1.4 }}>
          Allowed publishers:
          <div style={{ marginTop: 6 }}>
            earl@thewildlandfirerecoveryfund.org • jason@thewildlandfirerecoveryfund.org •
            drew@thewildlandfirerecoveryfund.org • kendra@thewildlandfirerecoveryfund.org
          </div>
        </div>

        {loginSent && <div style={{ marginTop: 14, opacity: 0.9 }}>✅ Check your inbox for the magic link.</div>}
        {loginError && (
          <div style={{ marginTop: 14, color: '#ff6b6b', whiteSpace: 'pre-wrap' }}>{loginError}</div>
        )}
      </div>
    );
  }

  // Logged IN but not allowed (extra safety)
  if (!isAllowedPublisher(sessionEmail)) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 16px' }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Not authorized</h1>
        <p style={{ opacity: 0.85 }}>
          You are signed in as <strong>{sessionEmail}</strong>, but this email is not allowed to publish.
        </p>
        <div style={{ marginTop: 18 }}>
          <button
            onClick={signOut}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  // Logged IN
  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '40px 16px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>Publish an Article</h1>
          <div style={{ opacity: 0.75, fontSize: 14 }}>
            Signed in as <strong>{sessionEmail}</strong>
          </div>
        </div>

        <button
          onClick={signOut}
          style={{
            padding: '10px 14px',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          Sign out
        </button>
      </div>

      <div style={{ marginTop: 18, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', gap: 10, alignItems: 'center', opacity: 0.9 }}>
          <input type="radio" name="mode" checked={mode === 'insert'} onChange={() => setMode('insert')} />
          <span>Create new (insert)</span>
        </label>
        <label style={{ display: 'flex', gap: 10, alignItems: 'center', opacity: 0.9 }}>
          <input type="radio" name="mode" checked={mode === 'upsert'} onChange={() => setMode('upsert')} />
          <span>Update if slug exists (upsert)</span>
        </label>
      </div>

      <div style={{ marginTop: 18, display: 'grid', gap: 14 }}>
        <label>
          <div style={{ marginBottom: 6, opacity: 0.85 }}>Title</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Rebuilding After the Fire: What Recovery Really Means"
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.04)',
              color: 'inherit',
            }}
          />
        </label>

        <label>
          <div style={{ marginBottom: 6, opacity: 0.85 }}>Slug (URL)</div>
          <input
            value={slug}
            onChange={(e) => {
              slugTouched.current = true;
              setSlug(e.target.value);
            }}
            placeholder={autoSlug}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.04)',
              color: 'inherit',
            }}
          />
          <div style={{ marginTop: 6, opacity: 0.65, fontSize: 12 }}>
            Tip: keep slugs short, like <code style={{ opacity: 0.9 }}>rebuilding-after-the-fire</code>
          </div>
        </label>

        <label>
          <div style={{ marginBottom: 6, opacity: 0.85 }}>Excerpt</div>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            placeholder="1–2 sentences that show in the articles list + Google."
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.04)',
              color: 'inherit',
              resize: 'vertical',
            }}
          />
        </label>

        <label>
          <div style={{ marginBottom: 6, opacity: 0.85 }}>Cover image URL (optional)</div>
          <input
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://..."
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.04)',
              color: 'inherit',
            }}
          />
        </label>

        <label>
          <div style={{ marginBottom: 6, opacity: 0.85 }}>Content</div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            placeholder="Write your article here..."
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.04)',
              color: 'inherit',
              resize: 'vertical',
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            }}
          />
        </label>

        <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          <span style={{ opacity: 0.9 }}>Publish immediately</span>
        </label>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={publishNow}
            disabled={saving}
            style={{
              padding: '14px 16px',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.10)',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              minWidth: 160,
            }}
          >
            {saving ? 'Saving…' : mode === 'upsert' ? 'Save / Update' : 'Publish'}
          </button>

          <button
            onClick={deleteBySlug}
            disabled={saving}
            style={{
              padding: '14px 16px',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'transparent',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              minWidth: 160,
            }}
            title="Deletes the article with this slug (only if you are the author)"
          >
            Delete by slug
          </button>
        </div>

        {saveMsg && <div style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{saveMsg}</div>}
        {saveErr && <div style={{ marginTop: 8, color: '#ff6b6b', whiteSpace: 'pre-wrap' }}>{saveErr}</div>}
      </div>
    </div>
  );
}