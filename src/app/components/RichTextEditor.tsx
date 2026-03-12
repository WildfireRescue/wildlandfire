import { useRef, useEffect } from 'react';
import { 
  Bold as BoldIcon, 
  Italic as ItalicIcon, 
  Heading2,
  List,
  ListOrdered,
  Undo2 as UndoIcon,
  Redo2 as RedoIcon
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (editorRef.current && isInitialMount.current && value) {
      editorRef.current.innerHTML = value;
      isInitialMount.current = false;
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
  };

  const handleHeading = () => {
    applyFormat('formatBlock', '<h2>');
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

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="bg-white border-b border-border p-3 flex flex-wrap gap-1 text-slate-700">
        <button
          onClick={handleHeading}
          className="p-2 rounded hover:bg-slate-100 transition"
          title="Heading"
        >
          <Heading2 size={18} />
        </button>

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

      {/* Editor Content (contentEditable) */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        spellCheck
        onInput={handleInput}
        data-placeholder="Start writing your article..."
        className="prose prose-sm max-w-none p-4 min-h-80 focus:outline-none overflow-y-auto bg-white text-slate-900 border-none empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none"
        style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}
      />
    </div>
  );
}
