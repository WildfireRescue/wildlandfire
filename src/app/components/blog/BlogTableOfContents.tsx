// =====================================================
// BLOG TABLE OF CONTENTS COMPONENT
// Sticky TOC sidebar for desktop
// =====================================================

import { useEffect, useState } from 'react';
import { List } from 'lucide-react';
import { extractHeadings } from '../../../lib/blogHelpers';
import type { Heading } from '../../../lib/blogTypes';

interface BlogTableOfContentsProps {
  content: string;
}

export function BlogTableOfContents({ content }: BlogTableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const extracted = extractHeadings(content);
    setHeadings(extracted);
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 1.0
      }
    );

    // Find all heading elements and observe them
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div className="bg-card/30 border border-border/40 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <List size={18} className="text-primary" />
          <h3 className="font-bold text-foreground text-sm uppercase tracking-wide">
            Table of Contents
          </h3>
        </div>
        
        <nav className="space-y-1">
          {headings.map((heading) => (
            <button
              key={heading.id}
              onClick={() => handleClick(heading.id)}
              className={`block w-full text-left text-sm py-1.5 px-3 rounded-md transition-all ${
                activeId === heading.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              style={{
                paddingLeft: `${(heading.level - 1) * 0.75 + 0.75}rem`
              }}
            >
              {heading.text}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
