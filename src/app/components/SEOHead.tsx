import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const defaultSEO = {
  title: 'Wildfire Relief Donations for Long-Term Recovery | The Wildland Fire Recovery Fund',
  description: 'Support wildfire relief donations to help families rebuild. The Wildland Fire Recovery Fund provides long-term wildfire recovery aid to displaced families and firefighters. 501(c)(3) nonprofit.',
  keywords: 'wildfire relief donations, wildfire recovery, wildfire relief fund, wildfire survivor support, fire victim donations, wildfire recovery fund, firefighter family grants, wildfire emergency aid, nonprofit wildfire relief, tax-deductible wildfire donation',
  image: 'https://thewildlandfirerecoveryfund.org/Images/hero/hero-1200.webp',
  url: 'https://thewildlandfirerecoveryfund.org',
  siteName: 'The Wildland Fire Recovery Fund'
};

export function SEOHead({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website'
}: SEOHeadProps) {
  const seoTitle = title || defaultSEO.title;
  const seoDescription = description || defaultSEO.description;
  const seoKeywords = keywords || defaultSEO.keywords;
  const seoImage = image || defaultSEO.image;
  const seoUrl = url || defaultSEO.url;

  useEffect(() => {
    // Update document title
    document.title = seoTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, name);
        document.head.appendChild(tag);
      }
      
      tag.setAttribute('content', content);
    };

    // Standard meta tags
    updateMetaTag('description', seoDescription);
    updateMetaTag('keywords', seoKeywords);
    updateMetaTag('author', 'The Wildland Fire Recovery Fund');
    updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    
    // Open Graph meta tags (Facebook, LinkedIn)
    updateMetaTag('og:title', seoTitle, true);
    updateMetaTag('og:description', seoDescription, true);
    updateMetaTag('og:image', seoImage, true);
    updateMetaTag('og:image:width', '1200', true);
    updateMetaTag('og:image:height', '630', true);
    updateMetaTag('og:image:type', 'image/webp', true);
    updateMetaTag('og:url', seoUrl, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', defaultSEO.siteName, true);
    updateMetaTag('og:locale', 'en_US', true);
    
    // Twitter Card meta tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', seoTitle);
    updateMetaTag('twitter:description', seoDescription);
    updateMetaTag('twitter:image', seoImage);
    
    // Additional SEO meta tags
    updateMetaTag('theme-color', '#FF9933');
    updateMetaTag('msapplication-TileColor', '#FF9933');
    
    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = seoUrl;

  }, [seoTitle, seoDescription, seoKeywords, seoImage, seoUrl, type]);

  return null;
}