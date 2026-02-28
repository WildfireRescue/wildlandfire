import React, { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadArticleImage } from '../../lib/articleImage';

interface FeaturedImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onAltChange?: (alt: string) => void;
  altText?: string;
}

export default function FeaturedImageUpload({
  value,
  onChange,
  onAltChange,
  altText = '',
}: FeaturedImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const result = await uploadArticleImage(file);
      if ('error' in result) {
        setError(result.error);
        return;
      }
      onChange(result.publicUrl);
    } catch (err: any) {
      setError(err?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Featured Image</label>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="flex items-center justify-center gap-2 px-4 py-3 border border-border rounded-lg hover:bg-muted/50 transition cursor-pointer">
              {uploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-sm">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload size={18} />
                  <span className="text-sm">Choose Image</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
          {value && (
            <button
              onClick={() => onChange('')}
              className="px-3 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition"
              title="Remove image"
            >
              <X size={18} />
            </button>
          )}
        </div>
        {error && (
          <p className="text-sm text-destructive mt-2">{error}</p>
        )}
      </div>

      {/* URL Input Fallback */}
      <div>
        <label className="block text-sm font-medium mb-2">Or paste URL</label>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="w-full px-4 py-2 bg-input-background border border-border rounded-lg text-sm"
        />
      </div>

      {/* Preview */}
      {value && (
        <div>
          <p className="text-sm font-medium mb-2">Preview</p>
          <div className="relative bg-muted rounded-lg p-4 flex items-center justify-center overflow-hidden">
            <img
              src={value}
              alt={altText || 'Featured image preview'}
              className="max-w-full max-h-64 object-contain"
            />
          </div>
        </div>
      )}

      {/* Alt Text */}
      {onAltChange && (
        <div>
          <label className="block text-sm font-medium mb-2">Image Alt Text (for accessibility)</label>
          <input
            type="text"
            value={altText}
            onChange={(e) => onAltChange(e.target.value)}
            placeholder="Describe the image..."
            className="w-full px-4 py-2 bg-input-background border border-border rounded-lg text-sm"
          />
        </div>
      )}
    </div>
  );
}
