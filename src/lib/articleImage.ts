import { supabase } from './supabase';

export async function uploadArticleImage(file: File): Promise<{ publicUrl: string } | { error: string }> {
  try {
    const now = new Date();
    const path = `article-images/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${cryptoUUID()}-${sanitizeFilename(file.name)}`;

    const { data, error } = await supabase.storage
      .from('article-images')
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (error) return { error: error.message };

    const { data: publicData } = supabase.storage.from('article-images').getPublicUrl(data.path);
    return { publicUrl: publicData.publicUrl };
  } catch (err: any) {
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
  return Math.random().toString(36).slice(2, 10);
}
