import React from 'react';
import ArticleContent from './ArticleContent';

export default function HostedArticleTemplate({ article }: any) {
  const blocks = article?.article_blocks?.find((b: any) => b.role === 'body')?.blocks || [];
  
  console.log('[HostedArticleTemplate] Article:', article?.slug);
  console.log('[HostedArticleTemplate] Article blocks:', article?.article_blocks?.length);
  console.log('[HostedArticleTemplate] Body blocks:', blocks?.length);
  console.log('[HostedArticleTemplate] First block type:', blocks?.[0]?.type);
  console.log('[HostedArticleTemplate] HTML length:', blocks?.[0]?.html?.length);
  console.log('[HostedArticleTemplate] First 100 chars:', blocks?.[0]?.html?.substring(0, 100));

  return (
    <div className="min-h-screen bg-background pt-20 pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <header className="text-center mb-8 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{article.title}</h1>
          {article.subtitle && <p className="text-lg text-muted-foreground">{article.subtitle}</p>}
        </header>

        {article.featured_image && (
          <div className="mb-8 -mx-4 sm:mx-0">
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full object-cover max-h-[60vh]"
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        )}

        <ArticleContent blocks={blocks} />
      </div>
    </div>
  );
}
