import React, { useMemo } from 'react';

type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: number; text: string }
  | { type: 'image'; src: string; alt?: string; caption?: string }
  | { type: 'html'; html: string }
  | { type: 'quote'; text: string; cite?: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'divider' };

export default function ArticleContent({ blocks }: { blocks: Block[] }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <article className="prose prose-lg md:prose-xl max-w-[72ch] mx-auto px-4 sm:px-6">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'paragraph':
            return <p key={i}>{b.text}</p>;
          case 'heading':
            if (b.level === 2) return <h2 key={i}>{b.text}</h2>;
            if (b.level === 3) return <h3 key={i}>{b.text}</h3>;
            return <h4 key={i}>{b.text}</h4>;
          case 'image':
            return (
              <figure key={i} className="my-6">
                <img src={b.src} alt={b.alt || ''} className="w-full h-auto object-contain" />
                {b.caption ? <figcaption className="text-sm text-muted-foreground">{b.caption}</figcaption> : null}
              </figure>
            );
          case 'html': {
            const raw = (b as any).html || '';
            const transformed = useMemo(() => {
              try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(raw, 'text/html');

                // Constrain images: make them responsive, limit max-height, center
                const imgs = Array.from(doc.querySelectorAll('img'));
                imgs.forEach((img) => {
                  img.style.maxWidth = '100%';
                  img.style.height = 'auto';
                  img.style.display = 'block';
                  img.style.margin = '0 auto';
                  img.style.objectFit = 'contain';
                  img.style.maxHeight = '60vh';
                });

                // Ensure iframes / embeds are responsive
                const iframes = Array.from(doc.querySelectorAll('iframe'));
                iframes.forEach((fr) => {
                  fr.style.maxWidth = '100%';
                  fr.style.width = '100%';
                });

                return doc.body.innerHTML;
              } catch (e) {
                return raw;
              }
            }, [raw]);

            return (
              <div
                key={i}
                className="prose prose-lg md:prose-xl max-w-none [&_p]:mb-6 [&_p]:leading-relaxed [&_p]:text-base md:[&_p]:text-lg [&_h2]:text-2xl md:[&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mt-12 [&_h2]:mb-6 [&_h3]:text-xl md:[&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-4"
                dangerouslySetInnerHTML={{ __html: transformed }}
              />
            );
          }
          case 'quote':
            return (
              <blockquote key={i} className="pl-4 border-l-4 italic">
                <p>{b.text}</p>
                {b.cite ? <cite className="block mt-2">{b.cite}</cite> : null}
              </blockquote>
            );
          case 'list':
            return b.ordered ? (
              <ol key={i}>{b.items.map((it, idx) => <li key={idx}>{it}</li>)}</ol>
            ) : (
              <ul key={i}>{b.items.map((it, idx) => <li key={idx}>{it}</li>)}</ul>
            );
          case 'divider':
            return <hr key={i} className="my-8" />;
          default:
            return null;
        }
      })}
    </article>
  );
}
