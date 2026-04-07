/**
 * donationBlockExtension.ts
 *
 * TipTap v3 custom Node extension for donation-focused content blocks.
 *
 * Renders as:  <div data-block="<type>" class="not-prose donation-block donation-block--<type>">
 *               ... child blocks (paragraphs, links) ...
 *             </div>
 *
 * The `not-prose` class opts this element out of Tailwind Typography on the
 * public blog page. The custom `donation-block` and `donation-block--*` classes
 * are defined in theme.css for both the editor (`.tiptap`) and frontend contexts.
 *
 * DOMPurify on BlogPostPage must include ADD_ATTR: ['data-block'] so the
 * attribute survives sanitisation.
 */

import { Node, mergeAttributes } from '@tiptap/core';
import type { Editor } from '@tiptap/core';

// ── Block type labels used in the UI ─────────────────────────────────────────

export const DONATION_BLOCK_LABELS: Record<string, string> = {
  cta:      'Donate CTA',
  appeal:   'Emotional Appeal',
  pullquote:'Pull Quote',
  faq:      'FAQ Item',
  callout:  'Callout Box',
};

// ── Default editable content for each block type ────────────────────────────

const BLOCK_CONTENT: Record<string, object[]> = {
  cta: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', marks: [{ type: 'bold' }], text: 'Help wildfire survivors rebuild their lives' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Your tax-deductible donation provides emergency housing, food, and long-term recovery support to families and firefighters affected by wildfires.',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          marks: [
            {
              type: 'link',
              attrs: { href: '/donate', target: null, rel: 'noopener noreferrer', class: null },
            },
          ],
          text: 'Donate Now — 100% Tax-Deductible →',
        },
      ],
    },
  ],

  appeal: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', marks: [{ type: 'bold' }], text: 'The fire took everything in minutes.' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: "Families lost not just their homes — but their memories, their children's sense of safety, and their ability to imagine tomorrow. Your gift helps them begin again.",
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          marks: [
            {
              type: 'link',
              attrs: { href: '/donate', target: null, rel: 'noopener noreferrer', class: null },
            },
          ],
          text: '→ Stand with wildfire families — donate today',
        },
      ],
    },
  ],

  pullquote: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          marks: [{ type: 'italic' }],
          text: '"Your help arrived when we had nothing left. You gave us hope."',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: '— A wildfire survivor, Los Angeles County' }],
    },
  ],

  faq: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          marks: [{ type: 'bold' }],
          text: 'Question: How does my donation help wildfire survivors?',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Answer: 100% of your donation goes directly to families affected by wildfires — covering emergency housing, food, clothing, and long-term recovery assistance.',
        },
      ],
    },
  ],

  callout: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', marks: [{ type: 'bold' }], text: 'Did you know? ' },
        {
          type: 'text',
          text: 'Over 90% of wildfire survivors face financial hardship within the first 30 days of losing their home.',
        },
      ],
    },
  ],
};

// ── TipTap Node Extension ────────────────────────────────────────────────────

export const DonationBlock = Node.create({
  name: 'donationBlock',

  /**
   * Belongs to the "block" group so it can appear at the document's top level
   * alongside paragraphs, headings, lists, etc.
   */
  group: 'block',

  /**
   * Must contain at least one block-level child (paragraph, heading, list …).
   */
  content: 'block+',

  /** Allow users to drag the entire block as a unit. */
  draggable: true,

  /**
   * Marks this node as "defining" — TipTap will not try to break it apart when
   * inserting content, which prevents accidental block splits.
   */
  defining: true,

  addAttributes() {
    return {
      blockType: {
        default: 'cta',
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-block') ?? 'cta',
        renderHTML: (attrs) => ({ 'data-block': attrs.blockType }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-block]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        // `not-prose` opts this element out of @tailwindcss/typography on the blog page.
        // The remaining classes are defined in theme.css for both editor and frontend.
        class: `not-prose donation-block donation-block--${node.attrs.blockType}`,
      }),
      0, // content hole — where child nodes render
    ];
  },
});

// ── Helper: insert a block at the current cursor ─────────────────────────────

/**
 * Inserts a donation block node at the editor's current cursor position.
 * Uses TipTap's JSON prosemirror format to guarantee correct round-tripping.
 */
export function insertDonationBlock(editor: Editor, blockType: string): void {
  editor
    .chain()
    .focus()
    .insertContent({
      type: 'donationBlock',
      attrs: { blockType },
      content: BLOCK_CONTENT[blockType] ?? BLOCK_CONTENT.cta,
    })
    .run();
}
