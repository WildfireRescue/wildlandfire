/**
 * slashCommand.tsx
 *
 * TipTap v3 slash-command ( / ) extension with a React popup.
 *
 * Typing "/" at the start of an empty paragraph triggers a floating menu.
 * The user can navigate with ↑/↓ keys, filter by typing, and insert any
 * block or donation block with Enter or a click.
 *
 * Architecture:
 *   - SlashCommandList  — forwardRef React component (the visible popup)
 *   - SLASH_ITEMS       — full command catalogue
 *   - getSlashCommandExtension — factory that returns the TipTap Extension
 */

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Extension } from '@tiptap/core';
import { Suggestion } from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import type { Editor, Range } from '@tiptap/core';
import {
  List,
  ListOrdered,
  Quote,
  Code2,
  Minus,
  Heart,
  Flame,
  HelpCircle,
  Star,
  AlignLeft,
  Heading2,
  Heading3,
  Info,
} from 'lucide-react';
import { insertDonationBlock } from './donationBlockExtension';

// ── Item type ────────────────────────────────────────────────────────────────

export interface SlashItem {
  id: string;
  label: string;
  description: string;
  category: 'formatting' | 'donation';
  icon: React.ReactNode;
  action: (editor: Editor, range: Range) => void;
}

// ── Command catalogue ────────────────────────────────────────────────────────

const ALL_ITEMS: SlashItem[] = [
  // ── Formatting ──
  {
    id: 'paragraph',
    label: 'Paragraph',
    description: 'Normal body text',
    category: 'formatting',
    icon: <AlignLeft size={15} />,
    action: (editor, range) =>
      editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    id: 'h2',
    label: 'Heading 2',
    description: 'Large section heading',
    category: 'formatting',
    icon: <Heading2 size={15} />,
    action: (editor, range) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
  },
  {
    id: 'h3',
    label: 'Heading 3',
    description: 'Subsection heading',
    category: 'formatting',
    icon: <Heading3 size={15} />,
    action: (editor, range) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run(),
  },
  {
    id: 'bullet',
    label: 'Bullet List',
    description: 'Unordered list',
    category: 'formatting',
    icon: <List size={15} />,
    action: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    id: 'number',
    label: 'Numbered List',
    description: 'Ordered / numbered list',
    category: 'formatting',
    icon: <ListOrdered size={15} />,
    action: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    id: 'blockquote',
    label: 'Block Quote',
    description: 'Indented quote or callout',
    category: 'formatting',
    icon: <Quote size={15} />,
    action: (editor, range) =>
      editor.chain().focus().deleteRange(range).setBlockquote().run(),
  },
  {
    id: 'code',
    label: 'Code Block',
    description: 'Monospaced code snippet',
    category: 'formatting',
    icon: <Code2 size={15} />,
    action: (editor, range) =>
      editor.chain().focus().deleteRange(range).setCodeBlock().run(),
  },
  {
    id: 'divider',
    label: 'Divider',
    description: 'Horizontal rule / section break',
    category: 'formatting',
    icon: <Minus size={15} />,
    action: (editor, range) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },

  // ── Donation blocks ──
  {
    id: 'donate-cta',
    label: 'Donate CTA',
    description: 'Primary donation call-to-action box',
    category: 'donation',
    icon: <Heart size={15} className="text-orange-500" />,
    action: (editor, range) => {
      editor.chain().focus().deleteRange(range).run();
      insertDonationBlock(editor, 'cta');
    },
  },
  {
    id: 'appeal',
    label: 'Emotional Appeal',
    description: 'High-impact storytelling section',
    category: 'donation',
    icon: <Flame size={15} className="text-red-500" />,
    action: (editor, range) => {
      editor.chain().focus().deleteRange(range).run();
      insertDonationBlock(editor, 'appeal');
    },
  },
  {
    id: 'pullquote',
    label: 'Pull Quote',
    description: 'Highlighted survivor testimonial',
    category: 'donation',
    icon: (
      <span className="text-blue-500 font-serif text-base leading-none">"</span>
    ),
    action: (editor, range) => {
      editor.chain().focus().deleteRange(range).run();
      insertDonationBlock(editor, 'pullquote');
    },
  },
  {
    id: 'faq',
    label: 'FAQ Item',
    description: 'Question & answer for SEO',
    category: 'donation',
    icon: <HelpCircle size={15} className="text-green-600" />,
    action: (editor, range) => {
      editor.chain().focus().deleteRange(range).run();
      insertDonationBlock(editor, 'faq');
    },
  },
  {
    id: 'callout',
    label: 'Callout Box',
    description: 'Statistics or important facts',
    category: 'donation',
    icon: <Star size={15} className="text-amber-500" />,
    action: (editor, range) => {
      editor.chain().focus().deleteRange(range).run();
      insertDonationBlock(editor, 'callout');
    },
  },
  {
    id: 'impact',
    label: 'Impact Stat',
    description: 'Large-format impact number callout',
    category: 'donation',
    icon: <Info size={15} className="text-purple-500" />,
    action: (editor, range) => {
      editor.chain().focus().deleteRange(range).run();
      insertDonationBlock(editor, 'callout');
    },
  },
];

// ── Slash command popup (React component) ────────────────────────────────────

interface SlashListHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface SlashListProps {
  items: SlashItem[];
  command: (item: SlashItem) => void;
}

export const SlashCommandList = forwardRef<SlashListHandle, SlashListProps>(
  function SlashCommandList({ items, command }, ref) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // Reset selection when results change
    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    // Scroll the selected item into view
    useEffect(() => {
      itemRefs.current[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    useImperativeHandle(ref, () => ({
      onKeyDown({ event }) {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((i) => (i - 1 + items.length) % items.length);
          return true;
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex((i) => (i + 1) % items.length);
          return true;
        }
        if (event.key === 'Enter') {
          if (items[selectedIndex]) command(items[selectedIndex]);
          return true;
        }
        return false;
      },
    }));

    if (!items.length) {
      return (
        <div className="slash-popup">
          <p className="px-3 py-2 text-xs text-slate-400 italic">No matching commands</p>
        </div>
      );
    }

    const formattingItems = items.filter((i) => i.category === 'formatting');
    const donationItems = items.filter((i) => i.category === 'donation');

    let flatIndex = 0;
    const renderItem = (item: SlashItem) => {
      const idx = flatIndex++;
      return (
        <button
          key={item.id}
          ref={(el) => { itemRefs.current[idx] = el; }}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            command(item);
          }}
          className={[
            'slash-popup-item',
            idx === selectedIndex ? 'slash-popup-item--active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span className="slash-popup-icon">{item.icon}</span>
          <span className="slash-popup-text">
            <span className="slash-popup-label">{item.label}</span>
            <span className="slash-popup-description">{item.description}</span>
          </span>
        </button>
      );
    };

    return (
      <div className="slash-popup">
        {formattingItems.length > 0 && (
          <>
            <p className="slash-popup-category">FORMATTING</p>
            {formattingItems.map(renderItem)}
          </>
        )}
        {donationItems.length > 0 && (
          <>
            <p className="slash-popup-category">DONATION BLOCKS</p>
            {donationItems.map(renderItem)}
          </>
        )}
      </div>
    );
  },
);

// ── TipTap Extension factory ─────────────────────────────────────────────────

/**
 * Returns the configured SlashCommand TipTap extension.
 * Call once during useEditor() initialization.
 */
export function getSlashCommandExtension() {
  return Extension.create({
    name: 'slashCommand',

    addOptions() {
      return {
        suggestion: {
          char: '/',
          startOfLine: false,
          command({ editor, range, props }: { editor: Editor; range: Range; props: SlashItem }) {
            props.action(editor, range);
          },
        },
      };
    },

    addProseMirrorPlugins() {
      return [
        Suggestion({
          editor: this.editor,
          ...this.options.suggestion,

          items({ query }: { query: string }) {
            const q = query.toLowerCase().trim();
            if (!q) return ALL_ITEMS;
            return ALL_ITEMS.filter(
              (item) =>
                item.label.toLowerCase().includes(q) ||
                item.description.toLowerCase().includes(q) ||
                item.id.toLowerCase().includes(q),
            );
          },

          render() {
            let component: ReactRenderer<SlashListHandle, SlashListProps> | null = null;
            let popup: HTMLDivElement | null = null;

            function positionPopup(
              el: HTMLDivElement,
              clientRect: (() => DOMRect | null) | null | undefined,
            ) {
              if (!clientRect) return;
              const rect = clientRect();
              if (!rect) return;
              const vh = window.innerHeight;
              const estimatedH = 320;
              const left = Math.max(8, Math.min(rect.left, window.innerWidth - 260));
              const top =
                rect.bottom + estimatedH > vh
                  ? Math.max(8, rect.top - estimatedH - 6)
                  : rect.bottom + 6;
              el.style.top = `${top}px`;
              el.style.left = `${left}px`;
            }

            return {
              onStart(props) {
                component = new ReactRenderer<SlashListHandle, SlashListProps>(
                  SlashCommandList,
                  {
                    props: { items: props.items as SlashItem[], command: props.command as (item: SlashItem) => void },
                    editor: props.editor,
                  },
                );

                popup = document.createElement('div');
                popup.style.cssText = 'position:fixed;z-index:9999;';
                popup.appendChild(component.element);
                document.body.appendChild(popup);
                positionPopup(popup, props.clientRect);
              },

              onUpdate(props) {
                component?.updateProps({
                  items: props.items as SlashItem[],
                  command: props.command as (item: SlashItem) => void,
                });
                if (popup) positionPopup(popup, props.clientRect);
              },

              onKeyDown(props) {
                if (props.event.key === 'Escape') {
                  popup?.remove();
                  popup = null;
                  component?.destroy();
                  component = null;
                  return true;
                }
                return component?.ref?.onKeyDown(props) ?? false;
              },

              onExit() {
                popup?.remove();
                popup = null;
                component?.destroy();
                component = null;
              },
            };
          },
        }),
      ];
    },
  });
}
