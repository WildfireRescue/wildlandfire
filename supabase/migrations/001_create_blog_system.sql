-- =====================================================
-- WILDLAND FIRE RECOVERY FUND - BLOG SYSTEM
-- Migration: Create posts, categories, and storage
-- =====================================================

-- Drop old articles table (clean break)
DROP TABLE IF EXISTS articles CASCADE;

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Insert default categories
INSERT INTO categories (slug, name, description) VALUES
  ('news', 'News', 'Latest news and announcements'),
  ('stories', 'Survivor Stories', 'Stories from wildfire survivors'),
  ('resources', 'Resources', 'Helpful resources and guides'),
  ('updates', 'Fund Updates', 'Updates from our team')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- POSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content_markdown TEXT NOT NULL,
  content_html TEXT,
  cover_image_url TEXT,
  og_image_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  author_id UUID,
  author_name TEXT,
  author_email TEXT NOT NULL,
  reading_time_minutes INTEGER DEFAULT 5,
  faq_json JSONB,
  noindex BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status_published ON posts(status, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_posts_updated ON posts(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(featured, published_at DESC) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_email);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - POSTS
-- =====================================================

-- Public can view published posts that are not noindexed
CREATE POLICY "Public can view published posts"
  ON posts FOR SELECT
  USING (status = 'published' AND noindex = false);

-- Public can view all categories
CREATE POLICY "Public can view categories"
  ON categories FOR SELECT
  USING (true);

-- =====================================================
-- STORAGE BUCKET FOR BLOG IMAGES
-- =====================================================

-- Note: Storage bucket 'blog' must be created in Supabase Dashboard
-- Then run these policies via Supabase SQL Editor:

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('blog', 'blog', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage policies will be created in next migration after profiles table

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL SEED DATA (OPTIONAL)
-- =====================================================

-- You can add sample posts here for testing
-- INSERT INTO posts (slug, title, excerpt, content_markdown, author_email, author_name, status, published_at, category, tags)
-- VALUES (
--   'welcome-to-our-blog',
--   'Welcome to Our Blog',
--   'We are excited to share stories, updates, and resources with you.',
--   '# Welcome\n\nThis is our first blog post...',
--   'info@thewildlandfirerecoveryfund.org',
--   'The Team',
--   'published',
--   NOW(),
--   'news',
--   ARRAY['announcement', 'welcome']
-- );
