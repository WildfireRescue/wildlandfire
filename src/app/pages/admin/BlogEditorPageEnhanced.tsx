// =====================================================
// ENHANCED BLOG EDITOR PAGE (ADMIN)
// Full-featured editor with SEO, E-E-A-T, and metadata fields
// =====================================================

import { useEffect, useState, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../../../lib/supabase.ts';
import ArticleEditor from '../../components/ArticleEditor';
import { createOrUpdateArticle, saveArticleBlocks } from '../../../lib/articles.ts';
import { uploadArticleImage } from '../../../lib/articleImage.ts';
import { Button } from '../../components/ui/button';
import { Mail, LogOut, Save, Eye, ChevronDown, ChevronUp, AlertCircle, Info } from 'lucide-react';
import { createPost, getCategories } from '../../../lib/supabaseBlog.ts';
import { generateSlug, calculateReadingTime } from '../../../lib/blogHelpers.ts';
import type { BlogCategory, Source } from '../../../lib/blogTypes';
import { checkEditorPermissions, getPermissionInstructions, type PermissionCheckResult } from '../../../lib/permissions.ts';

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({ title, subtitle, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-card hover:bg-muted/50 transition-colors"
      >
        <div className="text-left">
          <h3 className="font-semibold">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      
      {isOpen && (
        <div className="p-6 pt-4 space-y-4 border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
}

export function BlogEditorPageEnhanced() {
  // Permission checking
  const [permissionResult, setPermissionResult] = useState<PermissionCheckResult | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [categories, setCategories] = useState<BlogCategory[]>([]);

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSent, setLoginSent] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);

  // Core fields
  const [title, setTitle] = useState('');
  const autoSlug = useMemo(() => generateSlug(title), [title]);
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  
  // SEO & Metadata
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState('');
  
  // Images & Social
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [featuredImageAlt, setFeaturedImageAlt] = useState('');
  const [ogImageUrl, setOgImageUrl] = useState('');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [twitterCard, setTwitterCard] = useState('summary_large_image');
  
  // Publishing & Discovery
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'draft' | 'scheduled' | 'published'>('draft');
  const [scheduledFor, setScheduledFor] = useState('');
  const [featured, setFeatured] = useState(false);
  const [allowIndexing, setAllowIndexing] = useState(true);
  const [allowFollow, setAllowFollow] = useState(true);
  const [robotsDirectives, setRobotsDirectives] = useState('index,follow');
  const [sitemapPriority, setSitemapPriority] = useState(0.7);
  
  // Trust / E-E-A-T
  const [authorName, setAuthorName] = useState('The Wildland Fire Recovery Fund');
  const [authorRole, setAuthorRole] = useState('');
  const [authorBio, setAuthorBio] = useState('');
  const [reviewedBy, setReviewedBy] = useState('');
  const [factChecked, setFactChecked] = useState(false);
  
  // Backlinks / Citations
  const [sources, setSources] = useState<Source[]>([]);
  const [outboundLinksVerified, setOutboundLinksVerified] = useState(false);

  // New Articles system state
  const [articleType, setArticleType] = useState<'hosted' | 'external'>('hosted');
  const [articleBlocks, setArticleBlocks] = useState<any[]>([]);
  const [articleFeaturedImage, setArticleFeaturedImage] = useState('');
  const [articleExternalUrl, setArticleExternalUrl] = useState('');
  const [articleSourceName, setArticleSourceName] = useState('');
  const [articleOgTitle, setArticleOgTitle] = useState('');
  const [articleOgDescription, setArticleOgDescription] = useState('');
  const [articleSaving, setArticleSaving] = useState(false);

  // UI states
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const slugTouched = useRef(false);

  // Auto-generate slug
  useEffect(() => {
    if (!slugTouched.current) setSlug(autoSlug);
  }, [autoSlug]);

  // Check permissions on mount
  useEffect(() => {
    let mounted = true;
    
    async function checkAuth() {
      setIsCheckingAuth(true);
      
      try {
        console.log('[BlogEditorEnhanced] Checking permissions...');
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Permission check timed out after 10 seconds')), 10000)
        );
        
        const result = await Promise.race([
          checkEditorPermissions(),
          timeoutPromise
        ]) as any;
        
        if (!mounted) return;
        
        console.log('[BlogEditorEnhanced] Permission check result:', {
          status: result.status,
          hasAccess: result.hasAccess,
          email: result.user?.email
        });
        
        setPermissionResult(result);
      } catch (e: any) {
        if (!mounted) return;
        
        console.error('[BlogEditorEnhanced] Permission check error:', e);
        
        // On ANY error, default to showing login page rather than error screen
        // This is safer for UX - user can always try to login
        setPermissionResult({
          status: 'no_session',
          hasAccess: false,
          user: null,
          profile: null,
          message: 'Please log in to access the editor.',
          technicalDetails: null
        });
      } finally {
        if (mounted) {
          setIsCheckingAuth(false);
        }
      }
    }
    
    checkAuth();

    return () => {
      mounted = false;
      console.log('[BlogEditorEnhanced] Component unmounted');
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
    // CRITICAL: Must use path-based URL (not hash #) because app uses React Router
    return `${window.location.origin}/auth-callback`;
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

  function addSource() {
    setSources([...sources, { label: '', url: '' }]);
  }

  function removeSource(index: number) {
    setSources(sources.filter((_, i) => i !== index));
  }

  function updateSource(index: number, field: 'label' | 'url', value: string) {
    const updated = [...sources];
    updated[index][field] = value;
    setSources(updated);
  }

  async function savePost() {
    // Clear previous messages and set saving state
    setSaving(true);
    setSaveMsg(null);
    setSaveErr(null);
    
    // Track if timeout warning was shown
    let timeoutWarningShown = false;

    try {
      // Validation
      if (!title.trim()) throw new Error('Title is required');
      if (!content.trim()) throw new Error('Content is required');

      const finalSlug = slug || autoSlug;
      if (!finalSlug) throw new Error('Slug is required');
      
      if (featuredImageUrl && !featuredImageAlt) {
        throw new Error('Featured image alt text is required for accessibility');
      }
      
      if (metaTitle && metaTitle.length > 60) {
        console.warn('Meta title exceeds 60 characters');
      }
      
      if (metaDescription && metaDescription.length > 160) {
        console.warn('Meta description exceeds 160 characters');
      }

      const readingTime = calculateReadingTime(content);

      // Build post data with all new fields
      const postData = {
        // Core
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt.trim() || null,
        content_markdown: content.trim(),
        
        // SEO & Metadata
        meta_title: metaTitle.trim() || null,
        meta_description: metaDescription.trim() || null,
        canonical_url: canonicalUrl.trim() || null,
        focus_keyword: focusKeyword.trim() || null,
        secondary_keywords: secondaryKeywords 
          ? secondaryKeywords.split(',').map(k => k.trim()).filter(Boolean)
          : [],
        
        // Images & Social
        cover_image_url: featuredImageUrl.trim() || null,
        featured_image_url: featuredImageUrl.trim() || null,
        featured_image_alt_text: featuredImageAlt.trim() || null,
        og_image_url: ogImageUrl.trim() || featuredImageUrl.trim() || null,
        og_title: ogTitle.trim() || null,
        og_description: ogDescription.trim() || null,
        twitter_card: twitterCard,
        
        // Publishing & Discovery
        category: category || null,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        status,
        published_at: status === 'published' ? new Date().toISOString() : null,
        scheduled_for: status === 'scheduled' && scheduledFor ? new Date(scheduledFor).toISOString() : null,
        featured,
        allow_indexing: allowIndexing,
        allow_follow: allowFollow,
        robots_directives: robotsDirectives,
        sitemap_priority: sitemapPriority,
        noindex: !allowIndexing, // backwards compatibility
        
        // Trust / E-E-A-T
        author_name: authorName.trim(),
        author_email: permissionResult?.user?.email || 'unknown',
        author_role: authorRole.trim() || null,
        author_bio: authorBio.trim() || null,
        reviewed_by: reviewedBy.trim() || null,
        fact_checked: factChecked,
        
        // Metadata
        reading_time_minutes: readingTime,
        
        // Backlinks / Citations
        sources: sources.filter(s => s.label && s.url),
        outbound_links_verified: outboundLinksVerified,
      };

      console.log('[BlogEditorEnhanced] Attempting to save post:', postData);
      
      // Set up a timeout warning after 10 seconds
      const timeoutWarning = setTimeout(() => {
        if (!timeoutWarningShown) {
          timeoutWarningShown = true;
          setSaveMsg('⏳ Save taking longer than expected... Please wait or check your connection.');
        }
      }, 10000);
      
      // Create the save promise with a 15-second hard timeout
      const saveResult = await Promise.race([
        createPost(postData),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Save operation timed out after 15 seconds. Please try again.')), 15000)
        )
      ]);
      
      // Clear the warning timeout
      clearTimeout(timeoutWarning);
      
      const { post, error } = saveResult;
      
      console.log('[BlogEditorEnhanced] Save result:', { post, error });
      
      if (error) {
        console.error('[BlogEditorEnhanced] Supabase error:', error);
        
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

      console.log('[BlogEditorEnhanced] Post saved successfully:', post.id);
      setSaveMsg(`✅ Post saved successfully! ${status === 'published' ? 'Post is now live.' : 'Saved as draft.'}`);
      
      // Reset form after successful save
      setTimeout(() => {
        resetForm();
      }, 1500);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSaveMsg(null), 5000);
      
    } catch (e: any) {
      console.error('[BlogEditorEnhanced] Save error:', e);
      
      let errorMessage = 'Failed to save post';
      
      if (e?.message) {
        errorMessage = e.message;
      }
      
      setSaveErr(errorMessage);
      
      // Clear error message after 10 seconds
      setTimeout(() => setSaveErr(null), 10000);
    } finally {
      // ALWAYS clear saving state, no matter what
      setSaving(false);
    }
  }

  function resetForm() {
    setTitle('');
    setSlug('');
    slugTouched.current = false;
    setExcerpt('');
    setContent('');
    setMetaTitle('');
    setMetaDescription('');
    setCanonicalUrl('');
    setFocusKeyword('');
    setSecondaryKeywords('');
    setFeaturedImageUrl('');
    setFeaturedImageAlt('');
    setOgImageUrl('');
    setOgTitle('');
    setOgDescription('');
    setTags('');
    setScheduledFor('');
    setFeatured(false);
    setAuthorRole('');
    setAuthorBio('');
    setReviewedBy('');
    setFactChecked(false);
    setSources([]);
    setOutboundLinksVerified(false);
    setStatus('draft');
  }

  // Character count helper
  const CharCount = ({ current, max, warn = true }: { current: number; max: number; warn?: boolean }) => {
    const isOver = current > max;
    const isNear = current > max * 0.9;
    return (
      <span className={`text-xs ${isOver ? 'text-destructive' : isNear && warn ? 'text-yellow-500' : 'text-muted-foreground'}`}>
        {current}/{max}
      </span>
    );
  };

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

  // LOGGED IN with EDITOR ACCESS - Show editor UI
  return (
    <div className="min-h-screen pt-28 pb-20 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Enhanced Blog Editor</h1>
            <p className="text-muted-foreground mt-1">SEO-optimized publishing with E-E-A-T signals</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              <strong>{userEmail}</strong>
              <span className="ml-2 text-xs">({userRole})</span>
            </span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut size={16} className="mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* ==================== CORE CONTENT ==================== */}
          <CollapsibleSection title="📝 Core Content" subtitle="Essential post information" defaultOpen={true}>
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Compelling article title"
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium mb-2">
                URL Slug * <span className="text-muted-foreground font-normal">(auto-generated)</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  slugTouched.current = true;
                }}
                placeholder="post-url-slug"
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium mb-2">Excerpt / Summary</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief summary for article cards and previews"
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
                placeholder="Write your article content using Markdown formatting..."
                rows={18}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Reading time: ~{calculateReadingTime(content)} min
              </p>
            </div>
          </CollapsibleSection>

          {/* ==================== ARTICLES (NEW SYSTEM) ==================== */}
          <CollapsibleSection title="📰 Articles (New system)" subtitle="Create or edit articles using the new block model">
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Article Type</label>
                  <select value={articleType} onChange={(e) => setArticleType(e.target.value as any)} className="w-full px-4 py-3 bg-input-background border border-border rounded-lg">
                    <option value="hosted">Hosted (full content)</option>
                    <option value="external">External (link post)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Featured Image URL</label>
                  <div className="flex gap-2">
                    <input type="url" value={articleFeaturedImage} onChange={(e) => setArticleFeaturedImage(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
                    <label className="btn">
                      Upload
                      <input type="file" accept="image/*" onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const r = await uploadArticleImage(f);
                        if ('publicUrl' in r) setArticleFeaturedImage(r.publicUrl);
                        else alert('Upload failed: ' + (r as any).error);
                      }} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {articleType === 'external' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium mb-2">External URL</label>
                  <div className="flex gap-2">
                    <input type="url" value={articleExternalUrl} onChange={(e) => setArticleExternalUrl(e.target.value)} placeholder="https://example.com/article" className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
                    <Button onClick={async () => {
                      if (!articleExternalUrl) return alert('Enter URL first');
                      try {
                        const res = await fetch('/.netlify/functions/fetch-og', { method: 'POST', body: JSON.stringify({ url: articleExternalUrl }) });
                        const json = await res.json();
                        setArticleOgTitle(json.og_title || '');
                        setArticleOgDescription(json.og_description || '');
                        setArticleSourceName(json.og_site || '');
                        if (json.og_image) setArticleFeaturedImage(json.og_image);
                        if (json.favicon) {
                          // store favicon in source field if needed
                        }
                      } catch (err) {
                        console.error(err);
                        alert('Failed to fetch OpenGraph metadata');
                      }
                    }}>Fetch OG</Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <input type="text" value={articleSourceName} onChange={(e) => setArticleSourceName(e.target.value)} placeholder="Source name (e.g., Apple News)" className="px-3 py-2 bg-input-background border border-border rounded-lg" />
                    <input type="text" value={articleOgTitle} onChange={(e) => setArticleOgTitle(e.target.value)} placeholder="OG Title (optional)" className="px-3 py-2 bg-input-background border border-border rounded-lg" />
                  </div>
                  <textarea value={articleOgDescription} onChange={(e) => setArticleOgDescription(e.target.value)} placeholder="OG Description / Excerpt" rows={2} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Article Blocks</label>
                <ArticleEditor value={articleBlocks} onChange={(b) => setArticleBlocks(b)} />
              </div>

              <div className="flex gap-3">
                <Button onClick={async () => {
                  setArticleSaving(true);
                  try {
                    const slugToUse = slug || autoSlug || generateSlug(articleOgTitle || title || 'article');
                    const articlePayload: any = {
                      slug: slugToUse,
                      title: title || articleOgTitle || 'Untitled',
                      subtitle: excerpt || null,
                      type: articleType,
                      external_url: articleType === 'external' ? articleExternalUrl : null,
                      source_name: articleSourceName || null,
                      og_title: articleOgTitle || null,
                      og_description: articleOgDescription || null,
                      og_image: articleFeaturedImage || null,
                      featured_image: articleFeaturedImage || null,
                      author: authorName || null,
                    };

                    const saved = await createOrUpdateArticle(articlePayload as any);
                    if (articleBlocks && articleBlocks.length > 0) {
                      await saveArticleBlocks(saved.id, articleType === 'external' ? 'notes' : 'body', articleBlocks);
                    }

                    alert('Article saved');
                  } catch (err) {
                    console.error(err);
                    alert('Failed to save article');
                  } finally {
                    setArticleSaving(false);
                  }
                }} disabled={articleSaving}>
                  {articleSaving ? 'Saving...' : 'Save Article'}
                </Button>
              </div>
            </div>
          </CollapsibleSection>

          {/* ==================== SEO OPTIMIZATION ==================== */}
          <CollapsibleSection title="🔍 SEO Optimization" subtitle="Search engine metadata and keywords">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Meta Title */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Meta Title</label>
                  <CharCount current={metaTitle.length} max={60} />
                </div>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="SEO title (60 chars max, fallback: title)"
                  maxLength={70}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Meta Description */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Meta Description</label>
                  <CharCount current={metaDescription.length} max={160} />
                </div>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="SEO description (160 chars max, fallback: excerpt)"
                  rows={2}
                  maxLength={180}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Focus Keyword */}
              <div>
                <label className="block text-sm font-medium mb-2">Focus Keyword</label>
                <input
                  type="text"
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  placeholder="wildfire recovery"
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Secondary Keywords */}
              <div>
                <label className="block text-sm font-medium mb-2">Secondary Keywords</label>
                <input
                  type="text"
                  value={secondaryKeywords}
                  onChange={(e) => setSecondaryKeywords(e.target.value)}
                  placeholder="fire aid, disaster relief (comma-separated)"
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Canonical URL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Canonical URL</label>
                <input
                  type="url"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://example.com/original-article (prevent duplicate content)"
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* ==================== IMAGES & SOCIAL SHARING ==================== */}
          <CollapsibleSection title="🖼️ Images & Social Sharing" subtitle="Featured images and Open Graph tags">
            <div className="space-y-4">
              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium mb-2">Featured Image URL *</label>
                <input
                  type="url"
                  value={featuredImageUrl}
                  onChange={(e) => setFeaturedImageUrl(e.target.value)}
                  placeholder="https://example.com/featured-image.jpg"
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Featured Image Alt Text */}
              <div>
                <label className="block text-sm font-medium mb-2">Featured Image Alt Text *</label>
                <input
                  type="text"
                  value={featuredImageAlt}
                  onChange={(e) => setFeaturedImageAlt(e.target.value)}
                  placeholder="Descriptive alt text for accessibility & SEO"
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Required if featured image is provided (accessibility)
                </p>
              </div>

              {/* OG Image */}
              <div>
                <label className="block text-sm font-medium mb-2">Open Graph Image URL</label>
                <input
                  type="url"
                  value={ogImageUrl}
                  onChange={(e) => setOgImageUrl(e.target.value)}
                  placeholder="Custom social sharing image (fallback: featured image)"
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* OG Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Open Graph Title</label>
                <input
                  type="text"
                  value={ogTitle}
                  onChange={(e) => setOgTitle(e.target.value)}
                  placeholder="Social sharing title (fallback: meta title)"
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* OG Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Open Graph Description</label>
                <textarea
                  value={ogDescription}
                  onChange={(e) => setOgDescription(e.target.value)}
                  placeholder="Social sharing description (fallback: meta description)"
                  rows={2}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Twitter Card */}
              <div>
                <label className="block text-sm font-medium mb-2">Twitter Card Type</label>
                <select
                  value={twitterCard}
                  onChange={(e) => setTwitterCard(e.target.value)}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary Large Image</option>
                  <option value="app">App</option>
                  <option value="player">Player</option>
                </select>
              </div>
            </div>
          </CollapsibleSection>

          {/* ==================== AUTHOR & E-E-A-T ==================== */}
          <CollapsibleSection title="✍️ Author & E-E-A-T" subtitle="Expertise, Experience, Authority, Trust signals">
            <div className="space-y-4">
              {/* Author Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Author Name *</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="The Wildland Fire Recovery Fund"
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Author Role */}
              <div>
                <label className="block text-sm font-medium mb-2">Author Role / Title</label>
                <input
                  type="text"
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  placeholder="Executive Director, Disaster Relief Specialist, etc."
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Author Bio */}
              <div>
                <label className="block text-sm font-medium mb-2">Author Bio</label>
                <textarea
                  value={authorBio}
                  onChange={(e) => setAuthorBio(e.target.value)}
                  placeholder="Brief bio highlighting expertise and credentials"
                  rows={3}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Reviewed By */}
              <div>
                <label className="block text-sm font-medium mb-2">Reviewed By</label>
                <input
                  type="text"
                  value={reviewedBy}
                  onChange={(e) => setReviewedBy(e.target.value)}
                  placeholder="Name of fact-checker or reviewer"
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Fact Checked */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={factChecked}
                  onChange={(e) => setFactChecked(e.target.checked)}
                  id="factChecked"
                  className="w-5 h-5"
                />
                <label htmlFor="factChecked" className="text-sm font-medium">
                  This content has been fact-checked
                </label>
              </div>
            </div>
          </CollapsibleSection>

          {/* ==================== PUBLISHING & DISCOVERY ==================== */}
          <CollapsibleSection title="📢 Publishing & Discovery" subtitle="Publication settings and search engine directives">
            <div className="space-y-4">
              {/* Category & Tags */}
              <div className="grid md:grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="wildfire, recovery, story (comma-separated)"
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-2">Publication Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                </select>
              </div>

              {/* Scheduled For */}
              {status === 'scheduled' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Scheduled Publication Time</label>
                  <input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-6">
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

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allowIndexing}
                    onChange={(e) => {
                      setAllowIndexing(e.target.checked);
                      if (e.target.checked) {
                        setRobotsDirectives(allowFollow ? 'index,follow' : 'index,nofollow');
                      } else {
                        setRobotsDirectives(allowFollow ? 'noindex,follow' : 'noindex,nofollow');
                      }
                    }}
                    id="allowIndexing"
                    className="w-5 h-5"
                  />
                  <label htmlFor="allowIndexing" className="text-sm font-medium">Allow search indexing</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allowFollow}
                    onChange={(e) => {
                      setAllowFollow(e.target.checked);
                      if (e.target.checked) {
                        setRobotsDirectives(allowIndexing ? 'index,follow' : 'noindex,follow');
                      } else {
                        setRobotsDirectives(allowIndexing ? 'index,nofollow' : 'noindex,nofollow');
                      }
                    }}
                    id="allowFollow"
                    className="w-5 h-5"
                  />
                  <label htmlFor="allowFollow" className="text-sm font-medium">Allow link following</label>
                </div>
              </div>

              {/* Robots Directives */}
              <div>
                <label className="block text-sm font-medium mb-2">Robots Meta Directives</label>
                <input
                  type="text"
                  value={robotsDirectives}
                  onChange={(e) => setRobotsDirectives(e.target.value)}
                  placeholder="index,follow"
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Common: index,follow | noindex,nofollow | index,nofollow | noindex,follow
                </p>
              </div>

              {/* Sitemap Priority */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Sitemap Priority: {sitemapPriority.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={sitemapPriority}
                  onChange={(e) => setSitemapPriority(parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  0.0 (lowest) to 1.0 (highest). Default: 0.7
                </p>
              </div>
            </div>
          </CollapsibleSection>

          {/* ==================== SOURCES & CITATIONS ==================== */}
          <CollapsibleSection title="🔗 Sources & Citations" subtitle="Build trust with external references">
            <div className="space-y-4">
              {/* Sources List */}
              <div>
                <label className="block text-sm font-medium mb-2">Citation Sources</label>
                {sources.map((source, index) => (
                  <div key={index} className="grid grid-cols-[1fr_2fr_auto] gap-2 mb-2">
                    <input
                      type="text"
                      value={source.label}
                      onChange={(e) => updateSource(index, 'label', e.target.value)}
                      placeholder="Label"
                      className="px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    <input
                      type="url"
                      value={source.url}
                      onChange={(e) => updateSource(index, 'url', e.target.value)}
                      placeholder="https://example.com"
                      className="px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeSource(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addSource}
                  className="mt-2"
                >
                  + Add Source
                </Button>
              </div>

              {/* Outbound Links Verified */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={outboundLinksVerified}
                  onChange={(e) => setOutboundLinksVerified(e.target.checked)}
                  id="outboundLinksVerified"
                  className="w-5 h-5"
                />
                <label htmlFor="outboundLinksVerified" className="text-sm font-medium">
                  All outbound links have been verified for quality and relevance
                </label>
              </div>
            </div>
          </CollapsibleSection>

          {/* ==================== MESSAGES & ACTIONS ==================== */}
          <div className="bg-card border border-border rounded-xl p-6">
            {/* Messages */}
            {saveMsg && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
                <p className="text-primary font-medium">{saveMsg}</p>
              </div>
            )}

            {saveErr && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
                <p className="text-destructive font-medium">{saveErr}</p>
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
                onClick={() => window.location.href = '/blog'}
              >
                <Eye size={18} className="mr-2" />
                View Blog
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
