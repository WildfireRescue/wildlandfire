import React, { useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
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
  // Memoize editor config to prevent unnecessary re-initialization
  const editorConfig = useMemo(() => ({
    extensions: [StarterKit],
    content: value,
  }), [value]);

  const editor = useEditor({
    ...editorConfig,
    onCreate: () => {
      // Initialize with current value
    },
    onUpdate: ({ editor: editorInstance }) => {
      onChange(editorInstance.getHTML());
    },
  });

  const handleLinkInsert = () => {
    if (!editor) return;
    const url = prompt('Enter link URL:');
    if (!url) return;
    editor.chain().focus().setLink({ href: url }).run();
  };

  if (!editor) {
    return (
      <div className="border border-border rounded-lg p-4 bg-muted/50 text-muted-foreground min-h-80 flex items-center justify-center">
        Initializing editor...
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-muted/30 border-b border-border p-3 flex flex-wrap gap-1">
        {/* Heading */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-muted/50 transition ${editor.isActive('heading', { level: 2 }) ? 'bg-primary text-white' : ''}`}
          title="Heading"
        >
          <Heading2 size={18} />
        </button>

        <div className="w-px bg-border mx-1" />

        {/* Formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-muted/50 transition ${editor.isActive('bold') ? 'bg-primary text-white' : ''}`}
          title="Bold"
        >
          <BoldIcon size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-muted/50 transition ${editor.isActive('italic') ? 'bg-primary text-white' : ''}`}
          title="Italic"
        >
          <ItalicIcon size={18} />
        </button>

        <div className="w-px bg-border mx-1" />

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-muted/50 transition ${editor.isActive('bulletList') ? 'bg-primary text-white' : ''}`}
          title="Bullet List"
        >
          <List size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-muted/50 transition ${editor.isActive('orderedList') ? 'bg-primary text-white' : ''}`}
          title="Numbered List"
        >
          <ListOrdered size={18} />
        </button>

        <div className="w-px bg-border mx-1" />

        {/* Link */}
        <button
          onClick={handleLinkInsert}
          className="p-2 rounded hover:bg-muted/50 transition"
          title="Insert Link"
        >
          🔗
        </button>

        <div className="w-px bg-border mx-1" />

        {/* Undo/Redo */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded hover:bg-muted/50 transition"
          title="Undo"
        >
          <UndoIcon size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded hover:bg-muted/50 transition"
          title="Redo"
        >
          <RedoIcon size={18} />
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="prose prose-sm dark:prose-invert max-w-none p-4 min-h-80 focus:outline-none overflow-y-auto"
      />
    </div>
  );
}
