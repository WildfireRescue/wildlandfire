import React, { useState } from 'react';
import { uploadArticleImage } from '../../lib/articleImage.ts';

type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: number; text: string }
  | { type: 'image'; src: string; alt?: string; caption?: string }
  | { type: 'quote'; text: string; cite?: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'divider' };

export default function ArticleEditor({ value = [], onChange }: { value?: Block[]; onChange: (blocks: Block[]) => void }) {
  const [blocks, setBlocks] = useState<Block[]>(value as Block[]);
  const [saving, setSaving] = useState(false);

  const update = (next: Block[]) => {
    setBlocks(next);
    onChange(next);
  };

  async function handleImageFile(file: File, index: number | null = null) {
    setSaving(true);
    try {
      const res = await uploadArticleImage(file);
      if ('error' in res) throw new Error(res.error);
      const imgBlock: Block = { type: 'image', src: res.publicUrl, alt: file.name, caption: '' };
      if (index === null) update([...blocks, imgBlock]);
      else {
        const next = [...blocks];
        next.splice(index, 0, imgBlock);
        update(next);
      }
    } catch (err) {
      console.error(err);
      alert('Image upload failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {blocks.map((b, i) => (
        <div key={i} className="p-3 border rounded">
          <div className="flex justify-between items-center mb-2">
            <strong>{b.type}</strong>
            <div>
              <button onClick={() => { const next = blocks.filter((_, idx) => idx !== i); update(next); }} className="text-sm text-red-600">Delete</button>
            </div>
          </div>
          {b.type === 'paragraph' && (
            <textarea value={b.text} onChange={(e) => { const next = [...blocks]; next[i] = { ...b, text: e.target.value }; update(next); }} className="w-full" />
          )}
          {b.type === 'heading' && (
            <input value={b.text} onChange={(e) => { const next = [...blocks]; next[i] = { ...b, text: e.target.value }; update(next); }} className="w-full" />
          )}
          {b.type === 'image' && (
            <div>
              <img src={b.src} alt={b.alt} className="max-w-full mb-2" />
              <input value={b.caption || ''} onChange={(e) => { const next = [...blocks]; next[i] = { ...(b as any), caption: e.target.value }; update(next); }} placeholder="Caption" className="w-full" />
            </div>
          )}
          {b.type === 'quote' && (
            <div>
              <textarea value={b.text} onChange={(e) => { const next = [...blocks]; next[i] = { ...b, text: e.target.value }; update(next); }} />
            </div>
          )}
          {b.type === 'list' && (
            <div>
              {(b.items || []).map((it, idx) => (
                <input key={idx} value={it} onChange={(e) => { const next = [...blocks]; const items = [...(b.items || [])]; items[idx] = e.target.value; next[i] = { ...(b as any), items }; update(next); }} className="w-full mb-1" />
              ))}
              <button onClick={() => { const next = [...blocks]; const items = [...(b.items || []), '']; next[i] = { ...(b as any), items }; update(next); }} className="text-sm">Add list item</button>
            </div>
          )}
        </div>
      ))}

      <div className="flex gap-2">
        <button onClick={() => update([...blocks, { type: 'paragraph', text: '' }])} className="btn">Add paragraph</button>
        <button onClick={() => update([...blocks, { type: 'heading', level: 2, text: '' }])} className="btn">Add heading</button>
        <label className="btn">
          Add image
          <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }} className="hidden" />
        </label>
        <button onClick={() => update([...blocks, { type: 'quote', text: '' }])} className="btn">Add quote</button>
        <button onClick={() => update([...blocks, { type: 'list', ordered: false, items: [''] }])} className="btn">Add list</button>
        <button onClick={() => update([...blocks, { type: 'divider' }])} className="btn">Add divider</button>
      </div>

      {saving ? <div>Uploading...</div> : null}
    </div>
  );
}
