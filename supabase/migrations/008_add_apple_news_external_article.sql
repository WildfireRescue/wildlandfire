-- Migration: Add Apple News external article as an 'external' article row
BEGIN;

-- Insert article row (adjust published_at if desired)
INSERT INTO articles (
  slug, title, subtitle, status, published_at, type, external_url, source_name,
  og_title, og_description, og_image, og_favicon, featured_image, author, created_at, updated_at
)
VALUES (
  'apple-news-maui-fire-federal-housing',
  'Maui Fire Survivors Face Tough Choices When Federal Housing Program Ends',
  'The state is seeking another extension to the FEMA housing program that thousands of Maui residents have relied on since losing their homes in the 2023 wildfires.',
  'published',
  now(),
  'external',
  'https://apple.news/AooqMzSAgS8OLUAAuO6y41g',
  'Apple News',
  'Maui Fire Survivors Face Tough Choices When Federal Housing Program Ends — Honolulu Civil Beat',
  'The state is seeking another extension to the FEMA housing program that thousands of Maui residents have relied on since losing their homes in the 2023 wildfires. It’s currently set to end Feb. 28.',
  'https://c.apple.news/AgEXQW9vcU16U0FnUzhPTFVBQXVPNnk0MWcAMA',
  'https://apple.news/images/favicon.ico',
  'https://c.apple.news/AgEXQW9vcU16U0FnUzhPTFVBQXVPNnk0MWcAMA',
  'Honolulu Civil Beat',
  now(), now()
);

-- Add an empty 'notes' block for optional editorial notes
WITH a AS (
  SELECT id FROM articles WHERE slug = 'apple-news-maui-fire-federal-housing' LIMIT 1
)
INSERT INTO article_blocks (article_id, role, blocks, created_at, updated_at)
SELECT id, 'notes', '[]'::jsonb, now(), now() FROM a;

COMMIT;
