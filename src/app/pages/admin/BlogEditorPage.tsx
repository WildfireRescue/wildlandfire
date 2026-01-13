// =====================================================
// BLOG EDITOR PAGE (ADMIN)
// Create and edit blog posts - simplified version
// Full-featured admin dashboard can be added later
// =====================================================

import { useEffect, useState, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Mail, LogOut, Save, Eye } from 'lucide-react';
import { createPost, getCategories, isCurrentUserEditor } from '../../../lib/supabaseBlog';
import { generateSlug, calculateReadingTime } from '../../../lib/blogHelpers';
import type { BlogCategory } from '../../../lib/blogTypes';

export function BlogEditorPage() {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [isEditor, setIsEditor] = useState(false);
  const [categories, setCategories] = useState<BlogCategory[]>([]);

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSent, setLoginSent] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);

  // Post fields
  const [title, setTitle] = useState('');
  const autoSlug = useMemo(() => generateSlug(title), [title]);
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
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

  // Load session + check editor status
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const email = data.session?.user?.email ?? null;
      setSessionEmail(email);
      
      if (email) {
        const editorStatus = await isCurrentUserEditor();
        setIsEditor(editorStatus);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      const email = sess?.user?.email ?? null;
      setSessionEmail(email);
      
      if (email) {
        const editorStatus = await isCurrentUserEditor();
        setIsEditor(editorStatus);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      const { categories: cats } = await getCategories();
      setCategories(cats || []);
      if (cats && cats.length > 0 && !category) {
        setCategory(cats[0].slug);
      }
    }
    loadCategories();
  }, []);

  function getEmailRedirectTo() {
    return `${window.location.origin}/`;
  }

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

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getEmailRedirectTo(),
          shouldCreateUser: false,
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

  async function savePost() {
    setSaving(true);
    setSaveMsg(null);
    setSaveErr(null);

    try {
      if (!title.trim()) throw new Error('Title is required');
      if (!content.trim()) throw new Error('Content is required');

      const finalSlug = slug || autoSlug;
      if (!finalSlug) throw new Error('Slug is required');

      const readingTime = calculateReadingTime(content);

      const postData = {
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt.trim() || null,
        content_markdown: content.trim(),
        cover_image_url: coverUrl.trim() || null,
        category: category || null,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        status,
        published_at: status === 'published' ? new Date().toISOString() : null,
        reading_time_minutes: readingTime,
        featured,
        author_email: sessionEmail!,
        author_name: sessionEmail?.split('@')[0],
      };

      console.log('Attempting to save post:', postData);
      
      const { post, error } = await createPost(postData);
      
      console.log('Save result:', { post, error });
      
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || 'Failed to save post');
      }

      setSaveMsg('✅ Post saved successfully!');
      
      // Reset form
      setTitle('');
      setSlug('');
      slugTouched.current = false;
      setExcerpt('');
      setContent('');
      setCoverUrl('');
      setTags('');
      setFeatured(false);
      setStatus('draft');
    } catch (e: any) {
      console.error('Save error:', e);
      setSaveErr(e?.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  }

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
                <Mail size={24} className="text-primary" />
                <h1 className="text-2xl font-bold">Blog Editor Login</h1>
              </div>

              <p className="text-muted-foreground mb-6">
                Enter your authorized email to receive a magic link.
              </p>

              <div className="space-y-4">
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  disabled={loginBusy}
                />

                {loginError && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <p className="text-destructive text-sm whitespace-pre-line">{loginError}</p>
                  </div>
                )}

                {loginSent && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <p className="text-primary text-sm">✅ Check your email for the login link!</p>
                  </div>
                )}

                <Button
                  onClick={sendMagicLink}
                  disabled={loginBusy || loginSent}
                  className="w-full"
                >
                  {loginBusy ? 'Sending...' : loginSent ? 'Link Sent!' : 'Send Magic Link'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Logged IN but not an editor
  if (!isEditor) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center">
            <p className="text-destructive text-lg mb-6">
              You don't have editor permissions. Contact an administrator.
            </p>
            <Button onClick={signOut} variant="outline">
              <LogOut size={18} className="mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Logged IN and IS EDITOR
  return (
    <div className="min-h-screen pt-28 pb-20 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Blog Editor</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Signed in as <strong>{sessionEmail}</strong>
            </span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut size={16} className="mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 space-y-6">
          {/* Title */}
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

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Slug * <span className="text-muted-foreground font-normal">(auto-generated from title)</span>
            </label>
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

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium mb-2">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary (optional)"
              rows={3}
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-2">Content (Markdown) *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content in Markdown..."
              rows={16}
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
            />
          </div>

          {/* Cover Image URL */}
          <div>
            <label className="block text-sm font-medium mb-2">Cover Image URL</label>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Category & Tags Row */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">None</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="wildfire, recovery, story"
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Status & Featured Row */}
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={status === 'published'}
                onChange={(e) => setStatus(e.target.checked ? 'published' : 'draft')}
                id="published"
                className="w-5 h-5"
              />
              <label htmlFor="published" className="text-sm font-medium">Publish immediately</label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                id="featured"
                className="w-5 h-5"
              />
              <label htmlFor="featured" className="text-sm font-medium">Featured post</label>
            </div>
          </div>

          {/* Messages */}
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

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={savePost}
              disabled={saving}
              className="flex-1"
            >
              <Save size={18} className="mr-2" />
              {saving ? 'Saving...' : 'Save Post'}
            </Button>

            <Button
              variant="outline"
              onClick={() => window.location.hash = 'blog'}
            >
              <Eye size={18} className="mr-2" />
              View Blog
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
