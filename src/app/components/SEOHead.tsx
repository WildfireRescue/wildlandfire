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
  title: 'The Wildland Fire Recovery Fund - Helping Wildfire Survivors Rebuild',
  description: 'The Wildland Fire Recovery Fund provides emergency assistance, housing support, and resources to wildfire survivors. 501(c)(3) nonprofit committed to rapid emergency response and transparent aid distribution.',
  keywords: 'wildfire relief, wildfire survivors, fire disaster relief, emergency housing assistance, wildfire recovery fund, fire victim support, nonprofit wildfire aid, California wildfire relief, firefighter support, fire emergency grants',
  image: 'https://images.unsplash.com/photo-1562457346-b1b743feb764?w=1200&h=630&fit=crop',
  url: 'https://wildlandfirerecoveryfund.org',
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