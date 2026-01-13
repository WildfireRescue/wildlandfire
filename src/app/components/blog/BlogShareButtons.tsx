// =====================================================
// BLOG SHARE BUTTONS COMPONENT
// Social sharing buttons for blog posts
// =====================================================

import { useState } from 'react';
import { Share2, Twitter, Facebook, Linkedin, Mail, Link2, Check } from 'lucide-react';
import { Button } from '../ui/button';

interface BlogShareButtonsProps {
  title: string;
  excerpt?: string | null;
}

export function BlogShareButtons({ title, excerpt }: BlogShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;

  const twitterText = excerpt ? `${title} - ${excerpt}` : title;
  
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(twitterText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this article: ${url}`)}`
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openShareWindow = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'width=550,height=420,noopener,noreferrer');
  };

  return (
    <div className="mt-16 pt-12 border-t border-border/20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Share2 size={20} className="text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground/90 tracking-wide">
            Share this article
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 transition-colors"
            onClick={() => openShareWindow(shareUrls.twitter)}
            aria-label="Share on Twitter"
          >
            <Twitter size={18} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="hover:text-[#1877F2] hover:bg-[#1877F2]/10 transition-colors"
            onClick={() => openShareWindow(shareUrls.facebook)}
            aria-label="Share on Facebook"
          >
            <Facebook size={18} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-colors"
            onClick={() => openShareWindow(shareUrls.linkedin)}
            aria-label="Share on LinkedIn"
          >
            <Linkedin size={18} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="hover:text-primary hover:bg-primary/10 transition-colors"
            onClick={() => window.location.href = shareUrls.email}
            aria-label="Share via Email"
          >
            <Mail size={18} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="hover:text-primary hover:bg-primary/10 transition-colors"
            onClick={handleCopyLink}
            aria-label={copied ? 'Link copied' : 'Copy link'}
          >
            {copied ? <Check size={18} /> : <Link2 size={18} />}
          </Button>
        </div>
      </div>
    </div>
  );
}
