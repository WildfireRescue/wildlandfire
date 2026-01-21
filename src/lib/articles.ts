import { supabase } from './supabase';

export type Article = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  type: 'hosted' | 'external';
  external_url?: string;
  source_name?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_favicon?: string;
  featured_image?: string;
  author?: string;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export async function getArticleBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*, article_blocks(*)')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      // Log but don't throw - let caller handle
      console.error('[getArticleBySlug] Error:', error);
      return null;
    }
    
    return data as any;
  } catch (err) {
    // Catch network errors, etc.
    console.error('[getArticleBySlug] Unexpected error:', err);
    return null;
  }
}

export async function createOrUpdateArticle(article: Partial<Article> & { slug: string }) {
  try {
    const { slug, ...rest } = article;
    // upsert by slug
    const { data, error } = await supabase.from('articles').upsert({ slug, ...rest }, { onConflict: 'slug' }).select().single();
    if (error) throw error;
    return data as Article;
  } catch (err) {
    throw err;
  }
}

export async function saveArticleBlocks(articleId: string, role: string, blocks: any[]) {
  const { data, error } = await supabase.from('article_blocks').upsert({ article_id: articleId, role, blocks }).select().single();
  if (error) throw error;
  return data;
}
