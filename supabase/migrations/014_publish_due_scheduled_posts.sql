-- =====================================================
-- Publish due scheduled posts
-- Migration: 014_publish_due_scheduled_posts.sql
-- Purpose: Convert posts from status='scheduled' to status='published'
--          once scheduled_for <= now()
-- =====================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.publish_due_scheduled_posts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count INTEGER := 0;
BEGIN
  UPDATE public.posts
  SET
    status = 'published',
    published_at = COALESCE(published_at, scheduled_for, NOW()),
    updated_at = NOW()
  WHERE status = 'scheduled'
    AND scheduled_for IS NOT NULL
    AND scheduled_for <= NOW();

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.publish_due_scheduled_posts() TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.publish_due_scheduled_posts() IS
  'Publishes due scheduled posts by setting status=published and published_at when scheduled_for <= now().';

COMMIT;
