import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { StarterKit } from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import CharacterCount from '@tiptap/extension-character-count';
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Code2,
  Minus,
  Link as LinkIcon,
  ImagePlus,
  Loader2,
  X,
  ExternalLink,
  Undo2 as UndoIcon,
  Redo2 as RedoIcon,
  RemoveFormatting,
  Heart,
  Flame,
  HelpCircle,
  Star,
  Type,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { uploadArticleImage } from '../../lib/articleImage';
import { DonationBlock, insertDonationBlock, DONATION_BLOCK_LABELS } from './editor/donationBlockExtension';
import { getSlashCommandExtension } from './editor/slashCommand';

// ── Types ─────────────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

interface LinkModalState {
  open: boolean;
  url: string;
  openInNewTab: boolean;
  /** Selected text at the time the modal was opened */
  anchorText: string;
  /** True when the cursor was inside an existing link at modal open */
  isEditing: boolean;
}

interface ImageModalState {
  open: boolean;
  file: File | null;
  previewUrl: string;
  altText: string;
}

const EMPTY_LINK: LinkModalState = {
  open: false, url: '', openInNewTab: false, anchorText: '', isEditing: false,
};
const EMPTY_IMAGE: ImageModalState = {
  open: false, file: null, previewUrl: '', altText: '',
};

// ── URL normalization ─────────────────────────────────────────────────────────

/**
 * Ensures URLs always have a scheme so links work correctly.
 * Accepts: https://, http://, /relative, #anchor, mailto:, tel:
 * Promotes: example.com → https://example.com
 */
function normalizeUrl(raw: string): string {
  const url = raw.trim();
  if (!url) return '';
  // Already has a scheme or is a relative path / anchor / protocol
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (
    url.startsWith('/') ||
    url.startsWith('#') ||
    /^mailto:/i.test(url) ||
    /^tel:/i.test(url)
  ) return url;
  // Bare domain like "example.com" → prepend https://
  return `https://${url}`;
}

// ── Toolbar button helper ─────────────────────────────────────────────────────

interface TBtnProps {
  onAction: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function TBtn({ onAction, active, disabled, title, children }: TBtnProps) {
  return (
    <button
      type="button"
      // onMouseDown + preventDefault preserves editor focus & selection
      onMouseDown={(e) => { e.preventDefault(); onAction(); }}
      disabled={disabled}
      title={title}
      aria-pressed={active}
      className={[
        'p-1.5 rounded transition-colors',
        'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        active ? 'bg-slate-200 text-slate-900' : '',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="w-px bg-slate-200 mx-0.5 self-stretch" aria-hidden />;
}

// ── Modal shared styles (force light rendering regardless of OS theme) ─────────

/**
 * The site uses a dark theme by default. Modal form controls inherit the dark
 * foreground color (#f5f1ed — near-white) which is invisible on a white bg.
 * Adding these explicit colors overrides the inheritance chain.
 */
const MODAL_INPUT_CLASS =
  'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm ' +
  'text-slate-900 bg-white placeholder-slate-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

// ── Component ──────────────────────────────────────────────────────────────────

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  /** Saves the ProseMirror cursor position before the file-picker dialog opens */
  const savedEditorPosRef = useRef<number>(0);

  const [linkModal, setLinkModal] = useState<LinkModalState>(EMPTY_LINK);
  const [imageModal, setImageModal] = useState<ImageModalState>(EMPTY_IMAGE);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [showDonationTools, setShowDonationTools] = useState(false);
  const [showQualityPanel, setShowQualityPanel] = useState(false);

  // Ref-based bridge so handleDrop/handlePaste can call latest openImageModal
  // without capturing a stale closure inside useEditor
  const dragImageRef = useRef<((file: File) => void) | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'editor-image' },
      }),
      Placeholder.configure({ placeholder: 'Start writing\u2026 or type / for commands' }),
      CharacterCount,
      DonationBlock,
      getSlashCommandExtension(),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm prose-slate max-w-none p-5 min-h-[28rem] ' +
               'focus:outline-none bg-white text-slate-900',
        spellcheck: 'true',
      },
      handleDrop(_view, event) {
        const files = (event as DragEvent).dataTransfer?.files;
        if (files?.length && files[0].type.startsWith('image/')) {
          event.preventDefault();
          dragImageRef.current?.(files[0]);
          return true;
        }
        return false;
      },
      handlePaste(_view, event) {
        const items = (event as ClipboardEvent).clipboardData?.items;
        if (items) {
          for (const item of Array.from(items)) {
            if (item.type.startsWith('image/')) {
              const file = item.getAsFile();
              if (file) {
                event.preventDefault();
                dragImageRef.current?.(file);
                return true;
              }
            }
          }
        }
        return false;
      },
    },
  });

  // ── Shared image modal opener (toolbar, drag, paste) ────────────────────

  const openImageModal = useCallback((file: File) => {
    if (editor) {
      savedEditorPosRef.current = editor.state.selection.anchor;
    }
    const previewUrl = URL.createObjectURL(file);
    const altText = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .trim();
    setImageModal({ open: true, file, previewUrl, altText });
  }, [editor]);

  // Keep the drag ref in sync with the latest openImageModal
  useEffect(() => {
    dragImageRef.current = openImageModal;
  }, [openImageModal]);

  // Sync externally supplied value without overwriting an in-progress edit
  useEffect(() => {
    if (!editor || editor.isFocused) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value]);

  // ── Block style helpers ────────────────────────────────────────────────────

  const getBlockStyle = (): string => {
    if (!editor) return 'paragraph';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    if (editor.isActive('heading', { level: 3 })) return 'h3';
    if (editor.isActive('blockquote')) return 'blockquote';
    if (editor.isActive('codeBlock')) return 'codeBlock';
    return 'paragraph';
  };

  const setBlockStyle = (val: string) => {
    if (!editor) return;
    switch (val) {
      case 'h2':         editor.chain().focus().setHeading({ level: 2 }).run(); break;
      case 'h3':         editor.chain().focus().setHeading({ level: 3 }).run(); break;
      case 'blockquote': editor.chain().focus().setBlockquote().run(); break;
      case 'codeBlock':  editor.chain().focus().setCodeBlock().run(); break;
      default:           editor.chain().focus().setParagraph().run();
    }
  };

  // ── Link modal ─────────────────────────────────────────────────────────────

  const openLinkModal = () => {
    if (!editor) return;
    const attrs = editor.getAttributes('link');
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, '');
    setLinkModal({
      open: true,
      url: attrs.href ?? '',
      openInNewTab: attrs.target === '_blank',
      anchorText: selectedText,
      isEditing: editor.isActive('link'),
    });
  };

  const submitLink = () => {
    const { url, openInNewTab, isEditing, anchorText } = linkModal;
    const href = normalizeUrl(url);
    if (!href || !editor) return;

    const attrs = openInNewTab
      ? { href, target: '_blank', rel: 'noopener noreferrer' }
      : { href, target: null as unknown as string, rel: null as unknown as string };

    if (isEditing) {
      editor.chain().focus().extendMarkRange('link').updateAttributes('link', attrs).run();
    } else if (anchorText) {
      // Text was selected — apply the link mark to the selection
      editor.chain().focus().setLink(attrs).run();
    } else {
      // No selection — insert the URL as clickable text
      editor.chain().focus()
        .insertContent({ type: 'text', text: href, marks: [{ type: 'link', attrs }] })
        .run();
    }
    setLinkModal(EMPTY_LINK);
  };

  const removeLink = () => {
    editor?.chain().focus().extendMarkRange('link').unsetLink().run();
    setLinkModal(EMPTY_LINK);
  };

  // ── Image modal ────────────────────────────────────────────────────────────

  const handleImageButtonClick = () => {
    if (editor) {
      savedEditorPosRef.current = editor.state.selection.anchor;
    }
    imageInputRef.current?.click();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imageModal.previewUrl) URL.revokeObjectURL(imageModal.previewUrl);
    openImageModal(file);
    e.target.value = '';
  };

  const handleImageUploadConfirm = async () => {
    const { file, altText, previewUrl } = imageModal;
    if (!file || !editor) return;

    setUploadingImage(true);
    setImageError(null);
    setImageModal(EMPTY_IMAGE); // close modal; spinner appears on toolbar button

    try {
      const result = await uploadArticleImage(file);

      if ('error' in result) {
        setImageError(result.error);
        return;
      }

      // Restore cursor to saved position before inserting image
      const savedPos = savedEditorPosRef.current;
      const chain = editor.chain().focus();
      if (savedPos > 0 && savedPos <= editor.state.doc.content.size) {
        chain.setTextSelection(savedPos);
      }
      const inserted = chain.setImage({ src: result.publicUrl, alt: altText || file.name }).run();

      if (!inserted) {
        // setImage can fail if cursor is inside an incompatible node (e.g. table cell)
        // Fall back to inserting at the end of the document
        console.warn('[RichTextEditor] setImage failed at saved position — inserting at end of document');
        editor.chain().focus().setTextSelection(editor.state.doc.content.size).setImage({
          src: result.publicUrl,
          alt: altText || file.name,
        }).run();
      }
    } catch (err: unknown) {
      setImageError((err as Error)?.message ?? 'Image upload failed');
    } finally {
      setUploadingImage(false);
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleImageModalCancel = () => {
    if (imageModal.previewUrl) URL.revokeObjectURL(imageModal.previewUrl);
    setImageModal(EMPTY_IMAGE);
  };

  // ── Derived toolbar state ─────────────────────────────────────────────────

  const wordCount = editor?.storage?.characterCount?.words() ?? 0;
  const canUndo = !!editor?.can().undo();
  const canRedo = !!editor?.can().redo();

  // ── SEO Quality signals ───────────────────────────────────────────────────

  const html = editor?.getHTML() ?? '';
  const qHasH2 = /<h2\b/i.test(html);
  const qHasCTA = /data-block="cta"/.test(html) || /href="\/donate"/i.test(html);
  const qHasImage = /<img\b/i.test(html);
  const qIsThin = wordCount > 0 && wordCount < 300;
  const qualityIssues = [!qHasH2, !qHasCTA, !qHasImage, qIsThin].filter(Boolean).length;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="border border-slate-200 rounded-lg bg-white">

      {/* ── BubbleMenu: appears on text selection (Notion-style) ──────────── */}
      {editor && (
        <BubbleMenu
          editor={editor}
          options={{ placement: 'top' }}
          className="flex items-center gap-0.5 bg-slate-900 text-white rounded-lg shadow-xl px-1.5 py-1 border border-slate-700"
        >
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
            className={`px-2 py-1 rounded text-sm font-bold hover:bg-white/20 transition-colors ${editor.isActive('bold') ? 'bg-white/20' : ''}`}
            title="Bold (⌘B)"
          >B</button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
            className={`px-2 py-1 rounded text-sm italic hover:bg-white/20 transition-colors ${editor.isActive('italic') ? 'bg-white/20' : ''}`}
            title="Italic (⌘I)"
          >I</button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
            className={`px-2 py-1 rounded text-sm underline hover:bg-white/20 transition-colors ${editor.isActive('underline') ? 'bg-white/20' : ''}`}
            title="Underline (⌘U)"
          >U</button>
          <span className="w-px bg-white/30 mx-0.5 self-stretch" />
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); openLinkModal(); }}
            className={`p-1.5 rounded hover:bg-white/20 transition-colors ${editor.isActive('link') ? 'bg-white/20' : ''}`}
            title="Link"
          ><LinkIcon size={13} /></button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetAllMarks().run(); }}
            className="p-1.5 rounded hover:bg-white/20 transition-colors"
            title="Clear formatting"
          ><RemoveFormatting size={13} /></button>
        </BubbleMenu>
      )}

      {/* ── Sticky Toolbar ────────────────────────────────────────────────── */}
      <div
        className="bg-white border-b border-slate-200 rounded-t-lg px-2 py-1.5 flex flex-wrap items-center gap-0.5 sticky z-40"
        style={{ top: 'var(--nav-height, 5.5rem)' }}
      >
        {/* Block style selector */}
        <select
          value={getBlockStyle()}
          onChange={(e) => setBlockStyle(e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
          title="Block style"
          className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-700 text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="paragraph">Paragraph</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="blockquote">Quote</option>
          <option value="codeBlock">Code Block</option>
        </select>

        <Divider />

        <TBtn onAction={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} title="Bold (⌘B)">
          <BoldIcon size={15} />
        </TBtn>
        <TBtn onAction={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} title="Italic (⌘I)">
          <ItalicIcon size={15} />
        </TBtn>
        <TBtn onAction={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive('underline')} title="Underline (⌘U)">
          <UnderlineIcon size={15} />
        </TBtn>

        <Divider />

        <TBtn onAction={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} title="Bullet list">
          <List size={15} />
        </TBtn>
        <TBtn onAction={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} title="Numbered list">
          <ListOrdered size={15} />
        </TBtn>
        <TBtn onAction={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')} title="Block quote">
          <Quote size={15} />
        </TBtn>
        <TBtn onAction={() => editor?.chain().focus().toggleCodeBlock().run()} active={editor?.isActive('codeBlock')} title="Code block">
          <Code2 size={15} />
        </TBtn>

        <Divider />

        <TBtn onAction={openLinkModal} active={editor?.isActive('link')} title="Insert / edit link">
          <LinkIcon size={15} />
        </TBtn>
        <TBtn onAction={() => editor?.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
          <Minus size={15} />
        </TBtn>
        {/* Image button — saves cursor before picker opens; drag & drop also works */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); handleImageButtonClick(); }}
          disabled={uploadingImage}
          title="Upload image (drag & drop or paste also works)"
          className="p-1.5 rounded text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {uploadingImage ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
        </button>
        <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />

        <Divider />

        {/* Donation blocks toggle */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); setShowDonationTools((v) => !v); }}
          title="Donation funnel blocks"
          className={[
            'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors',
            showDonationTools
              ? 'bg-orange-100 text-orange-700 border border-orange-200'
              : 'text-slate-600 hover:bg-orange-50 hover:text-orange-600',
          ].join(' ')}
        >
          <Heart size={13} />
          <span className="hidden sm:inline">Donate</span>
          {showDonationTools ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>

        <Divider />

        <TBtn onAction={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear all formatting">
          <RemoveFormatting size={15} />
        </TBtn>

        <Divider />

        <TBtn onAction={() => editor?.chain().focus().undo().run()} disabled={!canUndo} title="Undo (⌘Z)">
          <UndoIcon size={15} />
        </TBtn>
        <TBtn onAction={() => editor?.chain().focus().redo().run()} disabled={!canRedo} title="Redo (⌘⇧Z)">
          <RedoIcon size={15} />
        </TBtn>

        <span className="ml-auto text-[10px] text-slate-400 hidden sm:block pr-1 select-none" aria-hidden>
          / for commands · ⌘B/I/U · Select for quick menu
        </span>
      </div>

      {/* ── Donation Blocks Sub-toolbar ────────────────────────────────── */}
      {showDonationTools && (
        <div className="bg-orange-50 border-b border-orange-100 px-3 py-2 flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-semibold text-orange-600 uppercase tracking-wider mr-1">
            Insert Block:
          </span>
          <DonationToolBtn blockType="cta"       icon={<Heart size={13} />}       color="orange" label="Donate CTA"       editor={editor} />
          <DonationToolBtn blockType="appeal"    icon={<Flame size={13} />}       color="red"    label="Emotional Appeal" editor={editor} />
          <DonationToolBtn blockType="pullquote" icon={<span className="font-serif text-base leading-none select-none">&ldquo;</span>} color="blue" label="Pull Quote" editor={editor} />
          <DonationToolBtn blockType="faq"       icon={<HelpCircle size={13} />}  color="green"  label="FAQ Item"         editor={editor} />
          <DonationToolBtn blockType="callout"   icon={<Star size={13} />}        color="amber"  label="Callout Box"      editor={editor} />
          <span className="ml-auto text-[10px] text-orange-400 select-none hidden sm:block">
            or type / in editor
          </span>
        </div>
      )}

      {/* Upload error banner */}
      {imageError && (
        <div className="px-4 py-2 text-sm text-red-700 bg-red-50 border-b border-red-100 flex items-center justify-between" role="alert">
          <span>{imageError}</span>
          <button type="button" onClick={() => setImageError(null)} className="text-red-400 hover:text-red-600 ml-4 flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      {/* TipTap editor canvas */}
      <EditorContent editor={editor} />

      {/* Word count footer */}
      <div className="px-4 py-2 border-t border-slate-100 rounded-b-lg flex items-center justify-between bg-white">
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <Type size={11} />
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </span>
        <div className="flex items-center gap-3">
          {editor?.isActive('link') && (
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); openLinkModal(); }}
              className="text-[11px] text-blue-600 hover:underline"
            >
              Edit link
            </button>
          )}
          {/* Quality panel toggle */}
          <button
            type="button"
            onClick={() => setShowQualityPanel((v) => !v)}
            className={[
              'flex items-center gap-1 text-[11px] rounded px-1.5 py-0.5 transition-colors',
              qualityIssues > 0
                ? 'text-amber-600 hover:bg-amber-50'
                : 'text-green-600 hover:bg-green-50',
            ].join(' ')}
            title="Content quality signals"
          >
            {qualityIssues > 0 ? <AlertTriangle size={11} /> : <CheckCircle size={11} />}
            {qualityIssues > 0
              ? `${qualityIssues} signal${qualityIssues > 1 ? 's' : ''}`
              : 'Quality OK'}
            {showQualityPanel ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>
        </div>
      </div>

      {/* ── SEO Content Quality Panel ──────────────────────────────────── */}
      {showQualityPanel && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 rounded-b-lg space-y-1.5">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Content Quality Check
          </p>
          <QualityRow ok={qHasH2}    label="H2 heading"    okText="At least one H2 heading found."             warnText="No H2 — add one to improve structure and SEO." />
          <QualityRow ok={qHasCTA}   label="Donation CTA"  okText="Donation CTA detected."                     warnText="No donation CTA — insert a Donate CTA block or /donate link." />
          <QualityRow ok={qHasImage} label="Image"         okText="At least one image found."                  warnText="No images — adding one improves engagement and ranking." />
          <QualityRow ok={!qIsThin}  label="Content depth" okText={`${wordCount} words — good length.`}       warnText={`Only ${wordCount} words — aim for 600+ for SEO impact.`} />
        </div>
      )}

      {/* ── Link Modal ─────────────────────────────────────────────────────── */}
      {linkModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setLinkModal(EMPTY_LINK); }}
        >
          {/*
           * colorScheme: 'light' forces native form controls (checkbox, etc.)
           * inside this modal to render with light-mode OS styling, ensuring
           * they are visible even when the OS or browser is in dark mode.
           */}
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
            style={{ colorScheme: 'light' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 text-base">
                {linkModal.isEditing ? 'Edit Link' : 'Insert Link'}
              </h3>
              <button type="button" onClick={() => setLinkModal(EMPTY_LINK)} className="p-1 rounded hover:bg-slate-100 text-slate-500">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL</label>
                {/*
                 * type="text" (not "url") avoids browser URL validation UI that
                 * can grey-out or invalidate in-progress edits. We normalize
                 * the URL ourselves in submitLink().
                 */}
                <input
                  type="text"
                  value={linkModal.url}
                  onChange={(e) => setLinkModal(p => ({ ...p, url: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') submitLink(); }}
                  placeholder="https://example.com"
                  autoFocus
                  className={MODAL_INPUT_CLASS}
                />
                {linkModal.url && !linkModal.url.startsWith('http') && !linkModal.url.startsWith('/') && !linkModal.url.startsWith('#') && (
                  <p className="text-xs text-amber-600 mt-1">
                    Will be saved as: {normalizeUrl(linkModal.url)}
                  </p>
                )}
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={linkModal.openInNewTab}
                  onChange={(e) => setLinkModal(p => ({ ...p, openInNewTab: e.target.checked }))}
                  className="rounded accent-blue-600"
                />
                <ExternalLink size={13} className="text-slate-500" />
                Open in new tab
              </label>
            </div>

            <div className="flex items-center justify-between mt-6">
              {linkModal.isEditing ? (
                <button type="button" onClick={removeLink} className="text-sm text-red-600 hover:underline">
                  Remove link
                </button>
              ) : <div />}
              <div className="flex gap-2">
                <button type="button" onClick={() => setLinkModal(EMPTY_LINK)} className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitLink}
                  disabled={!linkModal.url.trim()}
                  className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {linkModal.isEditing ? 'Save' : 'Insert'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Image Modal ───────────────────────────────────────────────────── */}
      {imageModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onMouseDown={(e) => { if (e.target === e.currentTarget) handleImageModalCancel(); }}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
            style={{ colorScheme: 'light' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 text-base">Upload Image</h3>
              <button type="button" onClick={handleImageModalCancel} className="p-1 rounded hover:bg-slate-100 text-slate-500">
                <X size={18} />
              </button>
            </div>

            {imageModal.previewUrl && (
              <img
                src={imageModal.previewUrl}
                alt="Preview"
                className="w-full max-h-48 object-contain rounded-lg border border-slate-200 mb-4 bg-slate-50"
              />
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Alt text{' '}
                <span className="text-red-500">*</span>
                <span className="text-slate-400 font-normal ml-1">(describes image for SEO &amp; screen readers)</span>
              </label>
              <input
                type="text"
                value={imageModal.altText}
                onChange={(e) => setImageModal(p => ({ ...p, altText: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter' && imageModal.altText.trim()) handleImageUploadConfirm(); }}
                placeholder="Describe the image…"
                autoFocus
                className={MODAL_INPUT_CLASS}
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={handleImageModalCancel} className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImageUploadConfirm}
                disabled={!imageModal.altText.trim()}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Upload &amp; Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

type DonationColor = 'orange' | 'red' | 'blue' | 'green' | 'amber';

const COLOR_CLASSES: Record<DonationColor, string> = {
  orange: 'bg-white border-orange-300 text-orange-700 hover:bg-orange-50',
  red:    'bg-white border-red-300    text-red-700    hover:bg-red-50',
  blue:   'bg-white border-blue-300   text-blue-700   hover:bg-blue-50',
  green:  'bg-white border-green-300  text-green-700  hover:bg-green-50',
  amber:  'bg-white border-amber-300  text-amber-700  hover:bg-amber-50',
};

interface DonationToolBtnProps {
  blockType: string;
  icon: React.ReactNode;
  color: DonationColor;
  label: string;
  editor: ReturnType<typeof useEditor>;
}

function DonationToolBtn({ blockType, icon, color, label, editor }: DonationToolBtnProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        if (editor) insertDonationBlock(editor, blockType);
      }}
      disabled={!editor}
      title={`Insert ${DONATION_BLOCK_LABELS[blockType] ?? label} block (or type /${blockType} in editor)`}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors disabled:opacity-40 ${COLOR_CLASSES[color]}`}
    >
      {icon}
      {label}
    </button>
  );
}

function QualityRow({
  ok, label, okText, warnText,
}: {
  ok: boolean; label: string; okText: string; warnText: string;
}) {
  return (
    <div className="flex items-start gap-2 text-[11px]">
      <span className={`mt-0.5 flex-shrink-0 ${ok ? 'text-green-500' : 'text-amber-500'}`}>
        {ok ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
      </span>
      <span className={ok ? 'text-slate-500' : 'text-amber-700'}>
        <strong className="font-medium">{label}:</strong>{' '}
        {ok ? okText : warnText}
      </span>
    </div>
  );
}
