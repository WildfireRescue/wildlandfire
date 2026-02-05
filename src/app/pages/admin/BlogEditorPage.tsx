// =====================================================
// BLOG EDITOR PAGE (ADMIN)
// Create and edit blog posts - simplified version
// Full-featured admin dashboard can be added later
// =====================================================

import { useEffect, useState, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../../../lib/supabase.ts';
import { Button } from '../../components/ui/button';
import { Mail, LogOut, Save, Eye, AlertCircle, Info } from 'lucide-react';
import { createPost, getCategories } from '../../../lib/supabaseBlog.ts';
import { generateSlug, calculateReadingTime } from '../../../lib/blogHelpers.ts';
import { withTimeout, TimeoutError } from '../../../lib/promiseUtils.ts';
import { checkEditorPermissions, getPermissionInstructions, type PermissionCheckResult } from '../../../lib/permissions.ts';
import type { BlogCategory } from '../../../lib/blogTypes';

export function BlogEditorPage() {
  console.log('[BlogEditorPage] Component mounted');
  
  // Permission checking
  const [permissionResult, setPermissionResult] = useState<PermissionCheckResult | null>(null);
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
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
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
  // DO NOT register auth listener here - it's handled in AuthProvider
  useEffect(() => {
    let mounted = true;
    
    async function checkAuth() {
      setIsCheckingAuth(true);
      setAuthError(null);
      
      try {
        // First, check if there's an auth code in the URL that needs to be exchanged
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        
        if (code) {
          console.log('[BlogEditor] Auth code detected, exchanging for session...');
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          
          if (error) {
            console.error('[BlogEditor] Code exchange error:', error);
          } else {
            console.log('[BlogEditor] Code exchanged successfully');
            
            // Give session a moment to settle
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Clean up the URL to remove the code
            if (mounted) {
              window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
            }
          }
        }
        
        if (!mounted) return;
        
        console.log('[BlogEditor] Checking permissions...');
        const result = await checkEditorPermissions();
        
        if (!mounted) return;
        
        console.log('[BlogEditor] Permission check result:', {
          status: result.status,
          hasAccess: result.hasAccess,
          email: result.user?.email
        });
        
        setPermissionResult(result);
      } catch (e: any) {
        if (!mounted) return;
        
        console.error('[BlogEditor] Permission check error:', e);
        
        // On ANY error, default to showing login page rather than error screen
        setPermissionResult({
          status: 'no_session',
          hasAccess: false,
          user: null,
          profile: null,
          message: 'Please log in to access the editor.',
          technicalDetails: null
        });
      }
      
      setIsCheckingAuth(false);
    }
    
    checkAuth();

    // ❌ DO NOT subscribe to auth state changes here
    // The listener is already registered in AuthProvider (App.tsx)
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
    
    // Track if timeout warning was shown
    let timeoutWarningShown = false;

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

      const authorEmail = permissionResult?.user?.email || 'unknown';
      const authorName = authorEmail.split('@')[0];

      const postData = {
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt.trim() || null,
        meta_title: metaTitle.trim() || null,
        meta_description: metaDescription.trim() || null,
        content_markdown: content.trim(),
        cover_image_url: coverUrl.trim() || null,
        category: category || null,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        status,
        published_at: status === 'published' ? new Date().toISOString() : null,
        reading_time_minutes: readingTime,
        featured,
        author_email: authorEmail,
        author_name: authorName,
      };

      console.log('[BlogEditor] Attempting to save post:', postData);
      
      // Set up a timeout warning after 10 seconds
      const timeoutWarning = setTimeout(() => {
        if (!timeoutWarningShown) {
          timeoutWarningShown = true;
          setSaveMsg('⏳ Save taking longer than expected... Please wait or check your connection.');
        }
      }, 10000);
      
      // Wrap the createPost call with a 15-second timeout using withTimeout
      const savePromise = createPost(postData);
      const { post, error } = await withTimeout(
        savePromise,
        15000,
        'Save operation timed out after 15 seconds. Please check your connection and try again.'
      );
      
      // Clear the warning timeout
      clearTimeout(timeoutWarning);
      
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
      setMetaTitle('');
      setMetaDescription('');
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
      // ALWAYS clear saving state, no matter what happens
      setSaving(false);
    }
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

  // No permission result yet
  if (!permissionResult) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <p className="text-destructive">Failed to check permissions</p>
          </div>
        </div>
      </div>
    );
  }

  // Logged OUT (no session)
  if (permissionResult.status === 'no_session') {
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

  // Logged IN but no access (no profile, insufficient role, or error)
  if (!permissionResult.hasAccess) {
    const instructions = getPermissionInstructions(permissionResult.status);
    const userEmail = permissionResult.user?.email || 'Unknown';
    
    return (
      <div className="min-h-screen pt-28 pb-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-destructive/10 border border-destructive/20 rounded-xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <AlertCircle className="w-8 h-8 text-destructive flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-destructive mb-2">Access Denied</h2>
                <p className="text-destructive mb-2">
                  {permissionResult.message}
                </p>
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
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Status: <code className="text-primary">{permissionResult.status}</code>
                    </p>
                    {permissionResult.profile && (
                      <p className="text-sm text-muted-foreground">
                        Current Role: <code className="text-foreground">{permissionResult.profile.role}</code>
                      </p>
                    )}
                  </div>
                  <pre className="bg-muted/50 p-3 rounded text-xs text-foreground overflow-x-auto">
{instructions}</pre>
                </div>
              </details>
            )}
            
            <div className="flex gap-3">
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
              >
                Return Home
              </Button>
              <Button
                onClick={signOut}
                variant="outline"
                className="ml-auto"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Successfully authenticated with editor access
  const userEmail = permissionResult.user?.email || 'Unknown';
  const userRole = permissionResult.profile?.role || 'allowlist';

  // Logged IN and IS EDITOR - Main Editor UI
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

          {/* SEO Fields */}
          <div className="bg-muted/30 border border-border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-sm">SEO Fields</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                SEO Title <span className="text-muted-foreground font-normal">(≤60 characters)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value.slice(0, 60))}
                  placeholder="SEO optimized title for search engines"
                  maxLength={60}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="absolute right-3 top-3 text-xs text-muted-foreground">{metaTitle.length}/60</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Meta Description <span className="text-muted-foreground font-normal">(≤160 characters)</span>
              </label>
              <div className="relative">
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value.slice(0, 160))}
                  placeholder="Summary that appears in search results"
                  maxLength={160}
                  rows={3}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <span className="absolute right-3 bottom-3 text-xs text-muted-foreground">{metaDescription.length}/160</span>
              </div>
            </div>
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
