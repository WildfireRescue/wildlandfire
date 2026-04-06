/**
 * TrustBar.tsx — compact above-fold credibility strip
 *
 * Renders immediately after the Hero with zero motion/react dependency
 * so it never delays below-fold lazy imports. CSS-only entry animation.
 */

const trustItems = [
  { emoji: '🏛️', text: '501(c)(3) Nonprofit' },
  { emoji: '💳', text: '100% Tax-Deductible' },
  { emoji: '⚡', text: 'Rapid Emergency Response' },
  { emoji: '🔍', text: 'Full Financial Transparency' },
  { emoji: '🤝', text: 'Direct Aid to Those in Need' },
];

export function TrustBar() {
  return (
    <section
      id="trust"
      aria-label="Trust indicators"
      className="py-5 bg-card/60 border-y border-border"
    >
      <div className="container mx-auto px-4">
        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          {trustItems.map((item) => (
            <li
              key={item.text}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
            >
              <span aria-hidden="true">{item.emoji}</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
