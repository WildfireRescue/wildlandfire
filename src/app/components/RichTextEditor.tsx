import { useRef, useEffect, useState } from 'react';
import { 
  Bold as BoldIcon, 
  Italic as ItalicIcon, 
  List,
  ListOrdered,
  ImagePlus,
  Link as LinkIcon,
  Loader2,
  Minus,
  RemoveFormatting,
  Undo2 as UndoIcon,
  Redo2 as RedoIcon,
  ExternalLink,
  X,
} from 'lucide-react';
import { uploadArticleImage } from '../../lib/articleImage';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
}

interface LinkModalState {
  open: boolean;
  url: string;
  anchorText: string;
  openInNewTab: boolean;
  existingAnchor: HTMLAnchorElement | null;
}

interface ImageModalState {
  open: boolean;
  file: File | null;
  previewUrl: string;
  altText: string;
}

const EMPTY_LINK_MODAL: LinkModalState = { open: false, url: '', anchorText: '', openInNewTab: false, existingAnchor: null };
const EMPTY_IMAGE_MODAL: ImageModalState = { open: false, file: null, previewUrl: '', altText: '' };

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [linkModal, setLinkModal] = useState<LinkModalState>(EMPTY_LINK_MODAL);
  const [imageModal, setImageModal] = useState<ImageModalState>(EMPTY_IMAGE_MODAL);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const applyFormat = (command: string, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    handleInput();
  };

  const handleBlockFormat = (format: 'p' | 'h2' | 'h3' | 'blockquote' | 'pre') => {
    applyFormat('formatBlock', `<${format}>`);
  };

  const handleBold = () => applyFormat('bold');
  const handleItalic = () => applyFormat('italic');
  const handleBulletList = () => applyFormat('insertUnorderedList');
  const handleOrderedList = () => applyFormat('insertOrderedList');
  const handleUndo = () => applyFormat('undo');
  const handleRedo = () => applyFormat('redo');
  const handleHorizontalRule = () => applyFormat('insertHorizontalRule');
  const handleClearFormatting = () => applyFormat('removeFormat');

  // ── Link helpers ────────────────────────────────────────────────

  const getParentAnchor = (): HTMLAnchorElement | null => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    let node: Node | null = sel.getRangeAt(0).commonAncestorContainer;
    while (node && node !== editorRef.current) {
      if ((node as Element).nodeName === 'A') return node as HTMLAnchorElement;
      node = node.parentNode;
    }
    return null;
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  };

  // Use onMouseDown + e.preventDefault() so the editor never loses focus/selection
  const handleLinkMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    saveSelection();
    const anchor = getParentAnchor();
    const selectedText = window.getSelection()?.toString() ?? '';
    if (anchor) {
      setLinkModal({ open: true, url: anchor.href, anchorText: anchor.textContent ?? '', openInNewTab: anchor.target === '_blank', existingAnchor: anchor });
    } else {
      setLinkModal({ open: true, url: '', anchorText: selectedText, openInNewTab: false, existingAnchor: null });
    }
  };

  const handleLinkSubmit = () => {
    const { url, anchorText, openInNewTab, existingAnchor } = linkModal;
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;
    const trimmedText = anchorText.trim();

    restoreSelection();
    editorRef.current?.focus();

    if (existingAnchor) {
      existingAnchor.href = trimmedUrl;
      if (trimmedText) existingAnchor.textContent = trimmedText;
      existingAnchor.target = openInNewTab ? '_blank' : '';
      existingAnchor.rel = openInNewTab ? 'noopener noreferrer' : '';
    } else {
      const a = document.createElement('a');
      a.href = trimmedUrl;
      a.textContent = trimmedText || trimmedUrl;
      if (openInNewTab) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      const range = savedRangeRef.current;
      if (range) {
        range.deleteContents();
        range.insertNode(a);
        const after = document.createRange();
        after.setStartAfter(a);
        after.collapse(true);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(after);
      }
    }

    handleInput();
    setLinkModal(EMPTY_LINK_MODAL);
  };

  const handleLinkRemove = () => {
    const { existingAnchor } = linkModal;
    if (existingAnchor) {
      const parent = existingAnchor.parentNode;
      while (existingAnchor.firstChild) parent?.insertBefore(existingAnchor.firstChild, existingAnchor);
      parent?.removeChild(existingAnchor);
      handleInput();
    }
    setLinkModal(EMPTY_LINK_MODAL);
  };

  // ── Image helpers ───────────────────────────────────────────────

  const handleImageButton = () => imageInputRef.current?.click();

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (imageModal.previewUrl) URL.revokeObjectURL(imageModal.previewUrl);
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').trim();
    setImageModal({ open: true, file, previewUrl: URL.createObjectURL(file), altText: cleanName });
    event.target.value = '';
  };

  const handleImageUploadConfirm = async () => {
    const { file, altText, previewUrl } = imageModal;
    if (!file) return;
    setUploadingImage(true);
    setImageError(null);
    setImageModal(EMPTY_IMAGE_MODAL);
    try {
      const result = await uploadArticleImage(file);
      if ('error' in result) { setImageError(result.error); return; }
      const sanitizedUrl = result.publicUrl.replace(/"/g, '&quot;');
      const sanitizedAlt = (altText || file.name).replace(/</g, '&lt;').replace(/"/g, '&quot;');
      applyFormat('insertHTML', `<img src="${sanitizedUrl}" alt="${sanitizedAlt}" />`);
      handleInput();
    } catch (error: unknown) {
      setImageError((error as Error)?.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleImageModalCancel = () => {
    if (imageModal.previewUrl) URL.revokeObjectURL(imageModal.previewUrl);
    setImageModal(EMPTY_IMAGE_MODAL);
  };

  return (
    <div className="border border-border rounded-lg bg-white">
      {/* Toolbar — sticky just under the fixed site nav */}
      <div
        className="bg-white border-b border-slate-200 rounded-t-lg p-2 flex flex-wrap gap-0.5 text-slate-700 sticky z-40"
        style={{ top: 'var(--nav-height, 5.5rem)' }}
      >
        <select
          defaultValue=""
          onChange={(e) => {
            const next = e.target.value as 'p' | 'h2' | 'h3' | 'blockquote' | 'pre' | '';
            if (!next) return;
            handleBlockFormat(next);
            e.target.value = '';
          }}
          className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-700 text-xs"
          title="Block style"
        >
          <option value="">Style</option>
          <option value="p">Paragraph</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="blockquote">Quote</option>
          <option value="pre">Code Block</option>
        </select>

        <div className="w-px bg-border mx-1" />

        <button
          onClick={handleBold}
          className="p-2 rounded hover:bg-slate-100 transition"
          title="Bold"
        >
          <BoldIcon size={16} />
        </button>
        <button
          onClick={handleItalic}
          className="p-2 rounded hover:bg-slate-100 transition"
          title="Italic"
        >
          <ItalicIcon size={16} />
        </button>

        <div className="w-px bg-border mx-1" />

        <button
          onClick={handleBulletList}
          className="p-2 rounded hover:bg-slate-100 transition"
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          onClick={handleOrderedList}
          className="p-2 rounded hover:bg-slate-100 transition"
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>

        <div className="w-px bg-border mx-1" />

        <button
          onMouseDown={handleLinkMouseDown}
          className="p-2 rounded hover:bg-slate-100 transition"
          title="Insert / Edit Link"
        >
          <LinkIcon size={16} />
        </button>

        <button
          onClick={handleHorizontalRule}
          className="p-2 rounded hover:bg-slate-100 transition"
          title="Horizontal Rule"
        >
          <Minus size={16} />
        </button>

        <button
          onClick={handleImageButton}
          disabled={uploadingImage}
          className="p-2 rounded hover:bg-slate-100 transition disabled:opacity-50"
          title="Upload Image"
        >
          {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
        </button>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        <div className="w-px bg-border mx-1" />

        <button
          onClick={handleClearFormatting}
          className="p-2 rounded hover:bg-slate-100 transition"
          title="Clear Formatting"
        >
          <RemoveFormatting size={16} />
        </button>

        <div className="w-px bg-border mx-1" />

        <button
          onClick={handleUndo}
          className="p-2 rounded hover:bg-slate-100 transition"
          title="Undo"
        >
          <UndoIcon size={16} />
        </button>
        <button
          onClick={handleRedo}
          className="p-2 rounded hover:bg-slate-100 transition"
          title="Redo"
        >
          <RedoIcon size={16} />
        </button>
      </div>

      {imageError && (
        <div className="px-4 py-2 text-sm text-destructive bg-destructive/10 border-b border-destructive/20">
          {imageError}
        </div>
      )}

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        spellCheck
        onInput={handleInput}
        data-placeholder="Start writing your article…"
        className="prose prose-sm max-w-none p-5 min-h-[28rem] focus:outline-none bg-white text-slate-900 border-none rounded-b-lg empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none"
        style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}
      />

      {/* ── Link Modal ────────────────────────────────────────────── */}
      {linkModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setLinkModal(EMPTY_LINK_MODAL); }}
        >
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 text-base">
                {linkModal.existingAnchor ? 'Edit Link' : 'Insert Link'}
              </h3>
              <button
                onClick={() => setLinkModal(EMPTY_LINK_MODAL)}
                className="p-1 rounded hover:bg-slate-100 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Anchor text</label>
                <input
                  type="text"
                  value={linkModal.anchorText}
                  onChange={(e) => setLinkModal(prev => ({ ...prev, anchorText: e.target.value }))}
                  placeholder="Link display text"
                  autoFocus
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL</label>
                <input
                  type="url"
                  value={linkModal.url}
                  onChange={(e) => setLinkModal(prev => ({ ...prev, url: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleLinkSubmit(); }}
                  placeholder="https://example.com"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={linkModal.openInNewTab}
                  onChange={(e) => setLinkModal(prev => ({ ...prev, openInNewTab: e.target.checked }))}
                  className="rounded"
                />
                <ExternalLink size={14} />
                Open in new tab
              </label>
            </div>

            <div className="flex items-center justify-between mt-6">
              {linkModal.existingAnchor ? (
                <button
                  onClick={handleLinkRemove}
                  className="text-sm text-red-600 hover:text-red-700 hover:underline"
                >
                  Remove link
                </button>
              ) : <div />}
              <div className="flex gap-2">
                <button
                  onClick={() => setLinkModal(EMPTY_LINK_MODAL)}
                  className="px-4 py-2 text-sm rounded-lg border border-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLinkSubmit}
                  disabled={!linkModal.url.trim()}
                  className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {linkModal.existingAnchor ? 'Save' : 'Insert'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Image Alt Text Modal ──────────────────────────────────── */}
      {imageModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onMouseDown={(e) => { if (e.target === e.currentTarget) handleImageModalCancel(); }}
        >
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 text-base">Upload Image</h3>
              <button
                onClick={handleImageModalCancel}
                className="p-1 rounded hover:bg-slate-100 text-slate-500"
              >
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
                <span className="text-slate-400 font-normal">(describes the image for SEO &amp; accessibility)</span>
              </label>
              <input
                type="text"
                value={imageModal.altText}
                onChange={(e) => setImageModal(prev => ({ ...prev, altText: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') handleImageUploadConfirm(); }}
                placeholder="Describe the image…"
                autoFocus
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={handleImageModalCancel}
                className="px-4 py-2 text-sm rounded-lg border border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
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
