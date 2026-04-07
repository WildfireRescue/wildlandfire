import { supabase } from './supabase';

// Max upload size: 10 MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/svg+xml',
]);

export async function uploadArticleImage(
  file: File,
): Promise<{ publicUrl: string } | { error: string }> {
  // ── Client-side validation ─────────────────────────────────────────────────
  if (!ALLOWED_TYPES.has(file.type)) {
    return {
      error: `Unsupported file type: ${file.type || 'unknown'}. Please upload a JPG, PNG, GIF, WebP, AVIF, or SVG.`,
    };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { error: `Image is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum size is 10 MB.` };
  }

  try {
    const now = new Date();
    // Path is relative to the bucket root — do NOT prefix with the bucket name.
    // Final URL: {supabase_url}/storage/v1/object/public/article-images/{path}
    const path = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      `${cryptoUUID()}-${sanitizeFilename(file.name)}`,
    ].join('/');

    const { data, error } = await supabase.storage
      .from('article-images')
      .upload(path, file, {
        cacheControl: '31536000', // 1 year — immutable uploads
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      const msg = String(error.message || 'Upload failed');
      const lower = msg.toLowerCase();

      if (lower.includes('row-level security') || lower.includes('violates row-level security')) {
        return {
          error:
            'Upload blocked by Supabase storage policy. ' +
            'Run supabase/migrations/019_fix_article_images_bucket.sql and ' +
            'ensure you are signed in with an allowlisted editor/admin email.',
        };
      }

      if (lower.includes('bucket') && lower.includes('not found')) {
        return {
          error:
            'Storage bucket "article-images" does not exist. ' +
            'Run supabase/migrations/019_fix_article_images_bucket.sql.',
        };
      }

      return { error: msg };
    }

    const { data: publicData } = supabase.storage
      .from('article-images')
      .getPublicUrl(data.path);

    if (!publicData?.publicUrl) {
      return { error: 'Upload succeeded but could not generate a public URL. Check bucket visibility setting.' };
    }

    return { publicUrl: publicData.publicUrl };
  } catch (err: unknown) {
    return { error: String(err) };
  }
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

function cryptoUUID() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    // @ts-ignore
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

