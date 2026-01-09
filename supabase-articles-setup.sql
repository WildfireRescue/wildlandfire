-- Drop existing table and policies if they exist
DROP TABLE IF EXISTS articles CASCADE;

-- Create articles table
CREATE TABLE articles (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  cover_url TEXT,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to published articles
CREATE POLICY "Public can view published articles"
  ON articles
  FOR SELECT
  USING (published = true);

-- Policy: Allow authenticated authors to insert their own articles
CREATE POLICY "Authors can insert their own articles"
  ON articles
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' = author
  );

-- Policy: Allow authors to update their own articles
CREATE POLICY "Authors can update their own articles"
  ON articles
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' = author
  )
  WITH CHECK (
    auth.jwt() ->> 'email' = author
  );

-- Policy: Allow authors to delete their own articles
CREATE POLICY "Authors can delete their own articles"
  ON articles
  FOR DELETE
  USING (
    auth.jwt() ->> 'email' = author
  );

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);

-- Create index on published and published_at for faster queries
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published, published_at DESC);
