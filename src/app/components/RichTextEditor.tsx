import { useRef, useEffect, useState } from 'react';
import { 
  Bold as BoldIcon, 
  Italic as ItalicIcon, 
  List,
  ListOrdered,
  ImagePlus,
  Loader2,
  Minus,
  RemoveFormatting,
  Undo2 as UndoIcon,
  Redo2 as RedoIcon
} from 'lucide-react';
import { uploadArticleImage } from '../../lib/articleImage';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

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

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handleBlockFormat = (format: 'p' | 'h2' | 'h3' | 'blockquote' | 'pre') => {
    applyFormat('formatBlock', `<${format}>`);
  };

  const handleBold = () => {
    applyFormat('bold');
  };

  const handleItalic = () => {
    applyFormat('italic');
  };

  const handleBulletList = () => {
    applyFormat('insertUnorderedList');
  };

  const handleOrderedList = () => {
    applyFormat('insertOrderedList');
  };

  const handleLink = () => {
    const url = prompt('Enter link URL:');
    if (url) {
      applyFormat('createLink', url);
    }
  };

  const handleUndo = () => {
    applyFormat('undo');
  };

  const handleRedo = () => {
    applyFormat('redo');
  };

  const handleHorizontalRule = () => {
    applyFormat('insertHorizontalRule');
  };

  const handleClearFormatting = () => {
    applyFormat('removeFormat');
  };

  const handleImageButton = () => {
    imageInputRef.current?.click();
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setImageError(null);

    try {
      const result = await uploadArticleImage(file);
      if ('error' in result) {
        setImageError(result.error);
        return;
      }

      const sanitizedUrl = result.publicUrl.replace(/"/g, '&quot;');
      const sanitizedAlt = file.name.replace(/"/g, '&quot;');
      applyFormat('insertHTML', `<img src="${sanitizedUrl}" alt="${sanitizedAlt}" />`);
      handleInput();
    } catch (error: any) {
      setImageError(error?.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  return (
    <div className="border border-border rounded-lg bg-white">
      {/* Toolbar */}
      <div className="bg-white border-b border-border p-3 flex flex-wrap gap-1 text-slate-700 sticky top-0 z-50 shadow-md">
        <select
          defaultValue=""
          onChange={(e) => {
            const next = e.target.value as 'p' | 'h2' | 'h3' | 'blockquote' | 'pre' | '';
            if (!next) return;
            handleBlockFormat(next);
            e.target.value = '';
          }}
          className="px-2 py-1 rounded border border-border bg-white text-xs"
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
          <BoldIcon size={18} />
        </button>
        <button
          onClick={handleItalic}
          className="p-2 rounded hover:bg-slate-100 transition"
          title="Italic"
        >
          <ItalicIcon size={18} />
        </button>

        <div className="w-px bg-border mx-1" />

        <button
          onClick={handleBulletList}
          className="p-2 rounded hover:bg-slate-100 transition"
          title="Bullet List"
        >
          <List size={18} />
        </button>
        <button
          onClick={handleOrderedList}
          className="p-2 rounded hover:bg-slate-100 transition"
          title="Numbered List"
        >
          <ListOrdered size={18} />
        </button>

        <div className="w-px bg-border mx-1" />

        <button
          onClick={handleLink}
          className="p-2 rounded hover:bg-slate-100 transition"
          title="Insert Link"
        >
          🔗
        </button>

        <button
          onClick={handleHorizontalRule}
          className="p-2 rounded hover:bg-slate-100 transition"
          title="Horizontal Rule"
        >
          <Minus size={18} />
        </button>

        <button
          onClick={handleImageButton}
          disabled={uploadingImage}
          className="p-2 rounded hover:bg-slate-100 transition disabled:opacity-50"
          title="Upload Image"
        >
          {uploadingImage ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
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
          <RemoveFormatting size={18} />
        </button>

        <div className="w-px bg-border mx-1" />

        <button
          onClick={handleUndo}
          className="p-2 rounded hover:bg-slate-100 transition"
          title="Undo"
        >
          <UndoIcon size={18} />
        </button>
        <button
          onClick={handleRedo}
          className="p-2 rounded hover:bg-slate-100 transition"
          title="Redo"
        >
          <RedoIcon size={18} />
        </button>
      </div>

      {imageError && (
        <div className="px-4 py-2 text-sm text-destructive bg-destructive/10 border-b border-destructive/20">
          {imageError}
        </div>
      )}

      {/* Editor Content (contentEditable) */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        spellCheck
        onInput={handleInput}
        data-placeholder="Start writing your article..."
        className="prose prose-sm max-w-none p-4 min-h-80 focus:outline-none bg-white text-slate-900 border-none empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none"
        style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}
      />
    </div>
  );
}
