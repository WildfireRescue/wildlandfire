import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { Button } from '../components/ui/button';
import { Mail, LogOut, FileText, Link as LinkIcon, Image, Eye, EyeOff, Trash2, Upload } from 'lucide-react';

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

  // CSV Import states
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  // HTML Import states
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [htmlContent, setHtmlContent] = useState('');
  const [importMode, setImportMode] = useState<'csv' | 'html'>('csv');

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
    //   http://localhost:5173/
    //   https://thewildlandfirerecoveryfund.org/
    return `${window.location.origin}/`;
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

  // CSV Import function
  async function handleCSVImport() {
    if (!importFile) return;

    setImporting(true);
    setImportResults(null);
    setSaveMsg(null);
    setSaveErr(null);

    try {
      const author = sessionEmail?.toLowerCase() ?? null;
      if (!author) throw new Error('Not signed in.');
      if (!isAllowedPublisher(author)) throw new Error('Not authorized to publish.');

      // Read CSV file
      const text = await importFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must have a header row and at least one data row.');
      }

      // Parse header
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const requiredFields = ['title', 'content'];
      const missingFields = requiredFields.filter(field => !headers.includes(field));
      
      if (missingFields.length > 0) {
        throw new Error(`CSV missing required columns: ${missingFields.join(', ')}`);
      }

      // Parse rows
      const results = { success: 0, failed: 0, errors: [] as string[] };

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        try {
          // Simple CSV parser (handles basic cases)
          const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(v => 
            v.trim().replace(/^"|"$/g, '')
          ) || [];

          const row: any = {};
          headers.forEach((header, idx) => {
            row[header] = values[idx] || '';
          });

          // Validate required fields
          if (!row.title?.trim()) {
            throw new Error(`Row ${i}: Title is required`);
          }
          if (!row.content?.trim()) {
            throw new Error(`Row ${i}: Content is required`);
          }

          // Generate slug if not provided
          const finalSlug = row.slug?.trim() 
            ? slugify(row.slug.trim()) 
            : slugify(row.title.trim());

          if (!finalSlug) {
            throw new Error(`Row ${i}: Could not generate valid slug`);
          }

          // Prepare article payload
          const payload = {
            title: row.title.trim(),
            slug: finalSlug,
            excerpt: row.excerpt?.trim() || null,
            cover_url: row.cover_url?.trim() || null,
            content: row.content.trim(),
            published: row.published?.toLowerCase() === 'true' || row.published === '1',
            published_at: (row.published?.toLowerCase() === 'true' || row.published === '1') 
              ? new Date().toISOString() 
              : null,
            author,
          };

          // Insert into Supabase
          const { error } = await supabase.from('articles').insert(payload);
          
          if (error) {
            throw new Error(error.message);
          }

          results.success++;
        } catch (rowError: any) {
          results.failed++;
          results.errors.push(rowError.message || `Row ${i}: Unknown error`);
        }
      }

      setImportResults(results);
      setImportFile(null);
      
    } catch (e: any) {
      setSaveErr(e?.message ?? 'Import failed.');
    } finally {
      setImporting(false);
    }
  }

  // HTML Import function
  async function handleHTMLImport() {
    setImporting(true);
    setImportResults(null);
    setSaveMsg(null);
    setSaveErr(null);

    try {
      const author = sessionEmail?.toLowerCase() ?? null;
      if (!author) throw new Error('Not signed in.');
      if (!isAllowedPublisher(author)) throw new Error('Not authorized to publish.');

      let htmlText = htmlContent;
      
      // If file is uploaded, read it
      if (htmlFile) {
        htmlText = await htmlFile.text();
      }

      if (!htmlText.trim()) {
        throw new Error('Please provide HTML content or upload an HTML file.');
      }

      // Parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');

      // Extract title (from h1, title tag, or first heading)
      let articleTitle = 
        doc.querySelector('h1')?.textContent?.trim() ||
        doc.querySelector('title')?.textContent?.trim() ||
        doc.querySelector('h2')?.textContent?.trim() ||
        'Untitled Article';

      // Extract excerpt (from meta description or first paragraph)
      let articleExcerpt = 
        doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ||
        doc.querySelector('p')?.textContent?.trim()?.slice(0, 200) ||
        null;

      // Extract cover image (from meta og:image or first img)
      let coverImage = 
        doc.querySelector('meta[property="og:image"]')?.getAttribute('content')?.trim() ||
        doc.querySelector('img')?.getAttribute('src')?.trim() ||
        null;

      // Extract main content
      // Try to find article, main, or body content
      let contentElement = 
        doc.querySelector('article') ||
        doc.querySelector('main') ||
        doc.querySelector('.content') ||
        doc.querySelector('#content') ||
        doc.body;

      let articleContent = contentElement?.innerHTML?.trim() || htmlText;

      // Clean up the HTML content (remove scripts, styles, etc.)
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = articleContent;
      tempDiv.querySelectorAll('script, style, nav, header, footer, aside').forEach(el => el.remove());
      articleContent = tempDiv.innerHTML.trim();

      if (!articleContent) {
        throw new Error('Could not extract content from HTML.');
      }

      // Generate slug
      const finalSlug = slugify(articleTitle);
      if (!finalSlug) {
        throw new Error('Could not generate valid slug from title.');
      }

      // Prepare article payload
      const payload = {
        title: articleTitle,
        slug: finalSlug,
        excerpt: articleExcerpt,
        cover_url: coverImage,
        content: articleContent,
        published: false, // Default to draft for HTML imports
        published_at: null,
        author,
      };

      // Insert into Supabase
      const { error } = await supabase.from('articles').insert(payload);
      
      if (error) {
        throw new Error(error.message);
      }

      setImportResults({ success: 1, failed: 0, errors: [] });
      setHtmlFile(null);
      setHtmlContent('');
      setSaveMsg(`✅ Article "${articleTitle}" imported successfully as draft!`);
      
    } catch (e: any) {
      setSaveErr(e?.message ?? 'HTML import failed.');
    } finally {
      setImporting(false);
    }
  }

  // ---------- UI ----------

  // Logged OUT
  if (!sessionEmail) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-background">
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
      <div className="min-h-screen pt-28 pb-20 bg-background">
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
    <div className="min-h-screen pt-28 pb-20 bg-background">
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

          {/* CSV Import Section */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/20 text-primary">
                <Upload size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Bulk Import Articles</h2>
                <p className="text-sm text-muted-foreground">Upload from CSV or HTML</p>
              </div>
            </div>

            {/* Import Mode Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setImportMode('csv')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  importMode === 'csv'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card/80 text-muted-foreground hover:text-foreground'
                }`}
              >
                CSV Import
              </button>
              <button
                onClick={() => setImportMode('html')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  importMode === 'html'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card/80 text-muted-foreground hover:text-foreground'
                }`}
              >
                HTML Import
              </button>
            </div>

            {/* CSV Import */}
            {importMode === 'csv' && (
              <>
                <div className="bg-card/80 backdrop-blur rounded-xl p-4 mb-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    <strong className="text-foreground">CSV Format:</strong> Your file should include these columns:
                  </p>
                  <div className="font-mono text-xs bg-background/50 rounded p-3 border border-border overflow-x-auto">
                    <div className="text-primary">title,slug,excerpt,cover_url,content,published</div>
                    <div className="text-muted-foreground mt-1">
                      "My Article Title","","Short excerpt...","https://...","Full article content...","true"
                    </div>
                  </div>
                  <ul className="text-xs text-muted-foreground mt-3 space-y-1 ml-4">
                    <li>• <strong className="text-foreground">Required:</strong> title, content</li>
                    <li>• <strong className="text-foreground">Optional:</strong> slug (auto-generated if empty), excerpt, cover_url, published (true/false, default: false)</li>
                    <li>• All articles will be attributed to: <span className="text-primary">{sessionEmail}</span></li>
                  </ul>
                </div>

                <div className="flex gap-4 items-end flex-wrap">
                  <div className="flex-1 min-w-[250px]">
                    <label className="block text-sm font-medium mb-2">Select CSV File</label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                  </div>

                  <Button
                    onClick={handleCSVImport}
                    disabled={!importFile || importing}
                    size="lg"
                    className="min-w-[180px]"
                  >
                    {importing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload size={18} className="mr-2" />
                        Import CSV
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}

            {/* HTML Import */}
            {importMode === 'html' && (
              <>
                <div className="bg-card/80 backdrop-blur rounded-xl p-4 mb-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    <strong className="text-foreground">HTML Import:</strong> Upload an HTML file or paste HTML content
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                    <li>• Automatically extracts title from <code className="text-primary">&lt;h1&gt;</code> or <code className="text-primary">&lt;title&gt;</code></li>
                    <li>• Extracts excerpt from meta description or first paragraph</li>
                    <li>• Extracts cover image from meta tags or first <code className="text-primary">&lt;img&gt;</code></li>
                    <li>• Extracts content from <code className="text-primary">&lt;article&gt;</code>, <code className="text-primary">&lt;main&gt;</code>, or body</li>
                    <li>• Imported as draft by default (you can publish later)</li>
                    <li>• All articles attributed to: <span className="text-primary">{sessionEmail}</span></li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Upload HTML File</label>
                    <input
                      type="file"
                      accept=".html,.htm"
                      onChange={(e) => setHtmlFile(e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    — OR —
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Paste HTML Content</label>
                    <textarea
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      rows={8}
                      placeholder="<html>&#10;  <head><title>Article Title</title></head>&#10;  <body>&#10;    <article>...</article>&#10;  </body>&#10;</html>"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-y font-mono text-xs"
                    />
                  </div>

                  <Button
                    onClick={handleHTMLImport}
                    disabled={(!htmlFile && !htmlContent.trim()) || importing}
                    size="lg"
                    className="w-full"
                  >
                    {importing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload size={18} className="mr-2" />
                        Import from HTML
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}

            {/* Import Results */}
            {importResults && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-card rounded-xl border border-border"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-sm">
                    <span className="text-green-400 font-semibold">✓ {importResults.success} succeeded</span>
                  </div>
                  {importResults.failed > 0 && (
                    <div className="text-sm">
                      <span className="text-destructive font-semibold">✗ {importResults.failed} failed</span>
                    </div>
                  )}
                </div>
                
                {importResults.errors.length > 0 && (
                  <div className="mt-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                    <p className="text-xs font-semibold text-destructive mb-2">Errors:</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {importResults.errors.map((error, idx) => (
                        <p key={idx} className="text-xs text-destructive/80">• {error}</p>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
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