-- Create articles table and article_blocks table
-- Migration: 007_create_articles.sql
BEGIN;

CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  subtitle text,
  status text DEFAULT 'draft',
  published_at timestamptz,
  type text NOT NULL DEFAULT 'hosted', -- 'hosted' | 'external'
  external_url text,
  source_name text,
  og_title text,
  og_description text,
  og_image text,
  og_favicon text,
  featured_image text,
  author text,
  reading_time integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- article_blocks stores block-based content for hosted articles (and notes for external)
CREATE TABLE IF NOT EXISTS article_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  role text DEFAULT 'body', -- 'body' | 'notes'
  blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_article_blocks_article_id ON article_blocks(article_id);

COMMIT;
