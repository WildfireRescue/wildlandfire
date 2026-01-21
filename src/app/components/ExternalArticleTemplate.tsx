import React from 'react';
import ArticleContent from './ArticleContent';

export default function ExternalArticleTemplate({ article }: any) {
  const notes = article?.article_blocks?.find((b: any) => b.role === 'notes')?.blocks || [];

  return (
    <div className="min-h-screen bg-background pt-20 pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-3xl">
        <header className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{article.title || article.og_title}</h1>
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
            {article.author && <span>{article.author}</span>}
            {article.source_name && <span>• {article.source_name}</span>}
            {article.published_at && <span>• {new Date(article.published_at).toLocaleDateString()}</span>}
          </div>
        </header>

        {article.og_image || article.featured_image ? (
          <div className="mb-6 -mx-4 sm:mx-0">
            <img src={article.og_image || article.featured_image} alt={article.title || article.og_title} className="w-full rounded" />
          </div>
        ) : null}

        {article.og_description && <p className="text-lg text-muted-foreground mb-6">{article.og_description}</p>}

        <div className="text-center mb-8">
          <a href={article.external_url} target="_blank" rel="noreferrer" className="inline-block bg-primary text-white px-6 py-3 rounded-md shadow-md">Read Original</a>
        </div>

        {notes.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Our Notes</h2>
            <ArticleContent blocks={notes} />
          </section>
        )}
      </div>
    </div>
  );
}
