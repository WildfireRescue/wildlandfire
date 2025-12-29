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

  const slugTouched = useRef(false);

  useEffect(() => {
    if (!slugTouched.current) setSlug(autoSlug);
  }, [autoSlug]);

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
    return `${window.location.origin}/#publish`;
  }

  // ✅ FIXED MAGIC LINK LOGIN
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

      if (!isAllowedPublisher(email)) {
        setLoginError('This email is not authorized to publish.');
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getEmailRedirectTo(),
          shouldCreateUser: false, // 🔒 prevents signup (FIX)
        },
      });

      if (error) {
        setLoginError(error.message);
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
      const author = sessionEmail?.toLowerCase();
      if (!author) throw new Error('Not signed in.');
      if (!isAllowedPublisher(author)) throw new Error('Not authorized.');

      const finalSlug = slugify(slug || title);
      if (!title.trim()) throw new Error('Title required.');
      if (!finalSlug) throw new Error('Slug required.');
      if (!content.trim()) throw new Error('Content required.');

      const payload = {
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt.trim() || null,
        cover_url: coverUrl.trim() || null,
        content: content.trim(),
        published,
        published_at: published ? new Date().toISOString() : null,
        author,
      };

      const q =
        mode === 'upsert'
          ? supabase.from('articles').upsert(payload, { onConflict: 'slug' })
          : supabase.from('articles').insert(payload);

      const { error } = await q;
      if (error) throw error;

      setSaveMsg(mode === 'upsert' ? '✅ Saved / Updated' : '✅ Published');
      setTitle('');
      setSlug('');
      slugTouched.current = false;
      setExcerpt('');
      setCoverUrl('');
      setContent('');
      setPublished(true);
      setMode('insert');
    } catch (e: any) {
      setSaveErr(e.message ?? 'Publish failed');
    } finally {
      setSaving(false);
    }
  }

  async function deleteBySlug() {
    setSaving(true);
    setSaveMsg(null);
    setSaveErr(null);

    try {
      const finalSlug = slugify(slug || title);
      if (!finalSlug) throw new Error('Slug required');

      const { error } = await supabase.from('articles').delete().eq('slug', finalSlug);
      if (error) throw error;

      setSaveMsg('🗑️ Deleted (if you were the author)');
    } catch (e: any) {
      setSaveErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  // ---------- UI ----------

  if (!sessionEmail) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 40 }}>
        <h1>Publisher Login</h1>

        <input
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          placeholder="you@thewildlandfirerecoveryfund.org"
          style={{ width: '100%', padding: 12, marginBottom: 12 }}
        />

        <button onClick={sendMagicLink} disabled={loginBusy}>
          {loginBusy ? 'Sending…' : 'Send magic link'}
        </button>

        {loginSent && <p>✅ Check your email</p>}
        {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 40 }}>
      <h1>Publish Article</h1>
      <p>Signed in as {sessionEmail}</p>

      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <input
        value={slug}
        onChange={(e) => {
          slugTouched.current = true;
          setSlug(e.target.value);
        }}
        placeholder={autoSlug}
      />

      <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Excerpt" />
      <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="Cover URL" />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={10} />

      <button onClick={publishNow} disabled={saving}>
        {mode === 'upsert' ? 'Save / Update' : 'Publish'}
      </button>

      <button onClick={deleteBySlug} disabled={saving}>
        Delete by slug
      </button>

      {saveMsg && <p>{saveMsg}</p>}
      {saveErr && <p style={{ color: 'red' }}>{saveErr}</p>}
    </div>
  );
}