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
import { createPost, getCategories, isCurrentUserEditor, getCurrentUserProfile } from '../../../lib/supabaseBlog';
import { generateSlug, calculateReadingTime } from '../../../lib/blogHelpers';
import { withTimeout, TimeoutError } from '../../../lib/promiseUtils';
import type { BlogCategory } from '../../../lib/blogTypes';

export function BlogEditorPage() {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [isEditor, setIsEditor] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
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
  // DO NOT register auth listener here - it's handled in App.tsx
  useEffect(() => {
    let mounted = true;
    
    async function checkAuth() {
      setIsCheckingAuth(true);
      setAuthError(null);
      
      try {
        console.log('[BlogEditor] Checking auth...');
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return; // Component unmounted, stop processing
        
        if (sessionError) {
          console.error('[BlogEditor] Session error:', sessionError);
          setAuthError(`Session error: ${sessionError.message}`);
          setIsCheckingAuth(false);
          return;
        }
        
        const session = data.session;
        const email = session?.user?.email ?? null;
        
        console.log('[BlogEditor] Session check:', {
          hasSession: !!session,
          email,
          userId: session?.user?.id,
        });
        
        setSessionEmail(email);
        
        if (email) {
          console.log('[BlogEditor] Checking editor status for:', email);
          
          // This call is now non-blocking - profile 500 errors won't break it
          const editorStatus = await isCurrentUserEditor();
          
          if (!mounted) return; // Component unmounted, stop processing
          
          console.log('[BlogEditor] Editor status:', editorStatus);
          setIsEditor(editorStatus);
          
          if (!editorStatus) {
            // This call is also non-blocking now
            const { profile } = await getCurrentUserProfile();
            
            if (!mounted) return; // Component unmounted, stop processing
            
            console.log('[BlogEditor] User profile:', profile);
            if (!profile) {
              setAuthError('No profile found and email not in admin allowlist. Please contact an administrator.');
            } else {
              setAuthError(`Your role is: ${profile.role}. You need editor or admin role.`);
            }
          }
        } else {
          console.log('[BlogEditor] No authenticated user');
        }
      } catch (e: any) {
        if (!mounted) return; // Component unmounted, stop processing
        console.error('[BlogEditor] Auth check error:', e);
        setAuthError(`Unexpected error: ${e?.message || 'Unknown error'}`);
      } finally {
        if (mounted) {
          setIsCheckingAuth(false);
        }
      }
    }
    
    checkAuth();

    // ❌ DO NOT subscribe to auth state changes here
    // The listener is already registered in App.tsx
    // Multiple listeners cause AbortError, memory leaks, and stuck states

    // Cleanup function
    return () => {
      mounted = false;
      console.log('[BlogEditor] Component unmounted');
    };
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
    return `${window.location.origin}/#auth-callback`;
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
    // Clear previous messages and set saving state
    setSaving(true);
    setSaveMsg(null);
    setSaveErr(null);

    try {
      // Validate required fields
      if (!title.trim()) {
        throw new Error('Title is required');
      }
      if (!content.trim()) {
        throw new Error('Content is required');
      }

      const finalSlug = slug || autoSlug;
      if (!finalSlug) {
        throw new Error('Slug is required');
      }

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

      console.log('[BlogEditor] Attempting to save post:', postData);
      
      // Wrap the createPost call with a 15-second timeout
      const savePromise = createPost(postData);
      const { post, error } = await withTimeout(
        savePromise,
        15000,
        'Save operation timed out. Please check your connection and try again.'
      );
      
      console.log('[BlogEditor] Save result:', { post, error });
      
      if (error) {
        console.error('[BlogEditor] Supabase error:', error);
        
        // Provide detailed error messages
        let errorMessage = 'Failed to save post';
        
        if (error.message) {
          errorMessage = error.message;
        }
        
        if (error.code === 'PGRST301') {
          errorMessage = 'Permission denied. You may not have the required permissions to create posts.';
        } else if (error.code === '23505') {
          errorMessage = 'A post with this slug already exists. Please use a different slug.';
        } else if (error.code === '42501') {
          errorMessage = 'Database permission denied. Please ensure RLS policies are configured correctly.';
        }
        
        throw new Error(errorMessage);
      }

      if (!post) {
        throw new Error('Post was not created. No data returned from database.');
      }

      console.log('[BlogEditor] Post saved successfully:', post.id);
      setSaveMsg(`✅ Post saved successfully! ${status === 'published' ? 'Post is now live.' : 'Saved as draft.'}`);
      
      // Reset form after successful save
      setTitle('');
      setSlug('');
      slugTouched.current = false;
      setExcerpt('');
      setContent('');
      setCoverUrl('');
      setTags('');
      setFeatured(false);
      setStatus('draft');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSaveMsg(null), 5000);
      
    } catch (e: any) {
      console.error('[BlogEditor] Save error:', e);
      
      let errorMessage = 'Failed to save post';
      
      if (e instanceof TimeoutError) {
        errorMessage = e.message;
      } else if (e?.message) {
        errorMessage = e.message;
      }
      
      setSaveErr(errorMessage);
      
      // Clear error message after 10 seconds
      setTimeout(() => setSaveErr(null), 10000);
    } finally {
      // ALWAYS clear saving state
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !loginBusy && !loginSent) {
                      sendMagicLink();
                    }
                  }}
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

  // Checking authentication status
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto bg-card border border-border rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  // Logged IN but not an editor
  if (!isEditor) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto bg-destructive/10 border border-destructive/20 rounded-xl p-8">
            <h2 className="text-xl font-bold text-destructive mb-4">Access Denied</h2>
            <p className="text-destructive mb-2">
              You don't have editor permissions.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Logged in as: <strong>{sessionEmail}</strong>
            </p>
            
            {authError && (
              <div className="bg-background border border-border rounded-lg p-4 mb-6">
                <p className="text-sm text-destructive font-mono">{authError}</p>
              </div>
            )}
            
            <div className="bg-background border border-border rounded-lg p-4 mb-6">
              <p className="text-sm font-semibold mb-2">Troubleshooting:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Make sure you've been granted editor access</li>
                <li>Try signing out and signing back in</li>
                <li>Contact an administrator if the issue persists</li>
              </ul>
            </div>
            
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
