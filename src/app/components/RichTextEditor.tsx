import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { 
  Bold as BoldIcon, 
  Italic as ItalicIcon, 
  Heading1, 
  Heading2, 
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo2 as UndoIcon,
  Redo2 as RedoIcon
} from 'lucide-react';
import { uploadArticleImage } from '../../lib/articleImage';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { HTMLAttributes: { class: 'list-disc list-inside' } },
        orderedList: { HTMLAttributes: { class: 'list-decimal list-inside' } },
      }),
      Link.configure({ 
        openOnClick: false, 
        autolink: true,
        HTMLAttributes: { class: 'text-primary underline' }
      }),
      Image.configure({ 
        allowBase64: true, 
        HTMLAttributes: { class: 'max-w-full h-auto rounded' } 
      }),
    ],
    content: value,
    onUpdate: ({ editor: editorInstance }) => {
      onChange(editorInstance.getHTML());
    },
  });

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    try {
      const result = await uploadArticleImage(file);
      if ('error' in result) {
        alert(`Image upload failed: ${result.error}`);
        return;
      }
      editor.chain().focus().setImage({ src: result.publicUrl }).run();
    } catch (err) {
      console.error('Image upload error:', err);
      alert('Failed to upload image');
    }
  };

  const handleLinkInsert = () => {
    if (!editor) return;
    const url = prompt('Enter link URL:');
    if (!url) return;
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  if (!editor) {
    return (
      <div className="border border-border rounded-lg p-4 bg-muted/50 text-muted-foreground">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-muted/30 border-b border-border p-3 flex flex-wrap gap-1">
        {/* Headings */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-muted/50 transition ${editor.isActive('heading', { level: 1 }) ? 'bg-primary text-white' : ''}`}
          title="Heading 1"
        >
          <Heading1 size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-muted/50 transition ${editor.isActive('heading', { level: 2 }) ? 'bg-primary text-white' : ''}`}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-muted/50 transition ${editor.isActive('heading', { level: 3 }) ? 'bg-primary text-white' : ''}`}
          title="Heading 3"
        >
          <Heading3 size={18} />
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

        {/* Media & Links */}
        <button
          onClick={handleLinkInsert}
          className="p-2 rounded hover:bg-muted/50 transition"
          title="Insert Link"
        >
          <LinkIcon size={18} />
        </button>
        <label className="p-2 rounded hover:bg-muted/50 transition cursor-pointer" title="Insert Image">
          <ImageIcon size={18} />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageFile}
            className="hidden"
          />
        </label>

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
