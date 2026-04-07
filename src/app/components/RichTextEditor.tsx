import { useEffect, useRef, useState } from 'react';
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
  Type,
} from 'lucide-react';
import { uploadArticleImage } from '../../lib/articleImage';

// ── Types ─────────────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

interface LinkModalState {
  open: boolean;
  url: string;
  openInNewTab: boolean;
  /** Selected text at modal open — used to determine if a selection exists */
  anchorText: string;
  /** True when cursor is inside an existing link */
  isEditing: boolean;
}

interface ImageModalState {
  open: boolean;
  file: File | null;
  previewUrl: string;
  altText: string;
}

const EMPTY_LINK: LinkModalState = { open: false, url: '', openInNewTab: false, anchorText: '', isEditing: false };
const EMPTY_IMAGE: ImageModalState = { open: false, file: null, previewUrl: '', altText: '' };

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
      // onMouseDown + preventDefault keeps editor focus & selection intact
      onMouseDown={(e) => { e.preventDefault(); onAction(); }}
      disabled={disabled}
      title={title}
      aria-pressed={active}
      className={`p-1.5 rounded text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${active ? 'bg-slate-200 text-slate-900' : ''}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="w-px bg-slate-200 mx-0.5 self-stretch" aria-hidden />;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [linkModal, setLinkModal] = useState<LinkModalState>(EMPTY_LINK);
  const [imageModal, setImageModal] = useState<ImageModalState>(EMPTY_IMAGE);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // H1 is reserved for the post title — enforce heading hierarchy
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'rounded-lg max-w-full h-auto' },
      }),
      Placeholder.configure({ placeholder: 'Start writing your article…' }),
      CharacterCount,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm prose-slate max-w-none p-5 min-h-[28rem] focus:outline-none bg-white text-slate-900',
        spellcheck: 'true',
      },
    },
  });

  // Sync externally provided value (e.g. loading an article into form)
  // without clobbering in-progress edits.
  useEffect(() => {
    if (!editor || editor.isFocused) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value]); // `editor` intentionally omitted — stable ref after mount

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
      case 'h2':        editor.chain().focus().setHeading({ level: 2 }).run(); break;
      case 'h3':        editor.chain().focus().setHeading({ level: 3 }).run(); break;
      case 'blockquote': editor.chain().focus().setBlockquote().run(); break;
      case 'codeBlock': editor.chain().focus().setCodeBlock().run(); break;
      default:          editor.chain().focus().setParagraph().run();
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
    const href = url.trim();
    if (!href || !editor) return;

    const attrs = openInNewTab
      ? { href, target: '_blank', rel: 'noopener noreferrer' }
      : { href, target: null as unknown as string, rel: null as unknown as string };

    if (isEditing) {
      editor.chain().focus().extendMarkRange('link').updateAttributes('link', attrs).run();
    } else if (anchorText) {
      // Text was selected — apply link mark to the selection
      editor.chain().focus().setLink(attrs).run();
    } else {
      // No selection — insert the URL as linked text
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imageModal.previewUrl) URL.revokeObjectURL(imageModal.previewUrl);
    const name = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').trim();
    setImageModal({ open: true, file, previewUrl: URL.createObjectURL(file), altText: name });
    e.target.value = '';
  };

  const handleImageUploadConfirm = async () => {
    const { file, altText, previewUrl } = imageModal;
    if (!file || !editor) return;
    setUploadingImage(true);
    setImageError(null);
    setImageModal(EMPTY_IMAGE);
    try {
      const result = await uploadArticleImage(file);
      if ('error' in result) { setImageError(result.error); return; }
      editor.chain().focus().setImage({ src: result.publicUrl, alt: altText || file.name }).run();
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

  // ── Donate CTA insertion ───────────────────────────────────────────────────

  const insertDonateCTA = () => {
    editor?.chain().focus().insertContent(
      '<p><a href="/donate">&#8594; Donate Now and help families recover</a></p>'
    ).run();
  };

  // ── Derived state ──────────────────────────────────────────────────────────

  const wordCount = editor?.storage?.characterCount?.words() ?? 0;
  const canUndo = !!editor?.can().undo();
  const canRedo = !!editor?.can().redo();

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="border border-slate-200 rounded-lg bg-white">

      {/* ── BubbleMenu: contextual inline toolbar (Notion-style) ──────────── */}
      {editor && (
        <BubbleMenu
          editor={editor}
          options={{ placement: 'top' }}
          className="flex items-center gap-0.5 bg-slate-900 text-white rounded-lg shadow-xl px-1.5 py-1 border border-slate-700"
        >
          <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
            className={`px-2 py-1 rounded text-sm font-bold hover:bg-white/20 transition-colors ${editor.isActive('bold') ? 'bg-white/20' : ''}`} title="Bold">
            B
          </button>
          <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
            className={`px-2 py-1 rounded text-sm italic hover:bg-white/20 transition-colors ${editor.isActive('italic') ? 'bg-white/20' : ''}`} title="Italic">
            I
          </button>
          <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
            className={`px-2 py-1 rounded text-sm underline hover:bg-white/20 transition-colors ${editor.isActive('underline') ? 'bg-white/20' : ''}`} title="Underline">
            U
          </button>
          <span className="w-px bg-white/30 mx-0.5 self-stretch" />
          <button type="button" onMouseDown={(e) => { e.preventDefault(); openLinkModal(); }}
            className={`p-1.5 rounded hover:bg-white/20 transition-colors ${editor.isActive('link') ? 'bg-white/20' : ''}`} title="Link">
            <LinkIcon size={13} />
          </button>
          <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetAllMarks().run(); }}
            className="p-1.5 rounded hover:bg-white/20 transition-colors" title="Clear formatting">
            <RemoveFormatting size={13} />
          </button>
        </BubbleMenu>
      )}

      {/* ── Sticky Toolbar ────────────────────────────────────────────────── */}
      <div
        className="bg-white border-b border-slate-200 rounded-t-lg px-2 py-1.5 flex flex-wrap items-center gap-0.5 sticky z-40"
        style={{ top: 'var(--nav-height, 5.5rem)' }}
      >
        {/* Block style */}
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
        <TBtn
          onAction={() => imageInputRef.current?.click()}
          disabled={uploadingImage}
          title="Upload image"
        >
          {uploadingImage ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
        </TBtn>
        <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />

        <Divider />

        {/* Donate CTA — quick insert for nonprofit conversion content */}
        <TBtn onAction={insertDonateCTA} title="Insert Donate CTA">
          <Heart size={15} />
        </TBtn>

        <Divider />

        <TBtn onAction={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear formatting">
          <RemoveFormatting size={15} />
        </TBtn>

        <Divider />

        <TBtn onAction={() => editor?.chain().focus().undo().run()} disabled={!canUndo} title="Undo (⌘Z)">
          <UndoIcon size={15} />
        </TBtn>
        <TBtn onAction={() => editor?.chain().focus().redo().run()} disabled={!canRedo} title="Redo (⌘⇧Z)">
          <RedoIcon size={15} />
        </TBtn>

        {/* Keyboard hint */}
        <span className="ml-auto text-[10px] text-slate-400 hidden sm:block pr-1" aria-hidden>
          Ctrl/⌘ + B/I/U · Select text for quick menu
        </span>
      </div>

      {imageError && (
        <div className="px-4 py-2 text-sm text-red-600 bg-red-50 border-b border-red-100 flex items-center justify-between">
          <span>{imageError}</span>
          <button type="button" onClick={() => setImageError(null)} className="text-red-400 hover:text-red-600 ml-4">
            <X size={14} />
          </button>
        </div>
      )}

      {/* TipTap editor canvas */}
      <EditorContent editor={editor} />

      {/* Word count footer */}
      <div className="px-4 py-2 border-t border-slate-100 rounded-b-lg flex items-center justify-between">
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <Type size={11} />
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </span>
        {editor?.isActive('link') && (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); openLinkModal(); }}
            className="text-[11px] text-blue-500 hover:underline"
          >
            Edit link
          </button>
        )}
      </div>

      {/* ── Link Modal ─────────────────────────────────────────────────────── */}
      {linkModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setLinkModal(EMPTY_LINK); }}
        >
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
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
                <input
                  type="url"
                  value={linkModal.url}
                  onChange={(e) => setLinkModal(p => ({ ...p, url: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') submitLink(); }}
                  placeholder="https://example.com"
                  autoFocus
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={linkModal.openInNewTab}
                  onChange={(e) => setLinkModal(p => ({ ...p, openInNewTab: e.target.checked }))}
                  className="rounded"
                />
                <ExternalLink size={13} />
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
                <button type="button" onClick={() => setLinkModal(EMPTY_LINK)} className="px-4 py-2 text-sm rounded-lg border border-slate-300 hover:bg-slate-50">
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
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
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
                <span className="text-slate-400 font-normal">(required — describes image for SEO &amp; screen readers)</span>
              </label>
              <input
                type="text"
                value={imageModal.altText}
                onChange={(e) => setImageModal(p => ({ ...p, altText: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') handleImageUploadConfirm(); }}
                placeholder="Describe the image…"
                autoFocus
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={handleImageModalCancel} className="px-4 py-2 text-sm rounded-lg border border-slate-300 hover:bg-slate-50">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImageUploadConfirm}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
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


