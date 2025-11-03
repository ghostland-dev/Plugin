import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function SEOHead({ title, description, image, keywords, canonical }) {
  const location = useLocation();
  const siteUrl = 'https://aishield.app'; // Remplacez par votre URL de production
  const fullUrl = `${siteUrl}${location.pathname}`;

  useEffect(() => {
    // Mettre à jour le title
    if (title) {
      document.title = title;
    }

    // Mettre à jour les meta tags
    const updateMetaTag = (property, content) => {
      if (!content) return;
      
      let element = document.querySelector(`meta[${property.startsWith('og:') ? 'property' : 'name'}="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(property.startsWith('og:') ? 'property' : 'name', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Meta tags SEO
    if (description) {
      updateMetaTag('description', description);
      updateMetaTag('og:description', description);
      updateMetaTag('twitter:description', description);
    }

    if (title) {
      updateMetaTag('og:title', title);
      updateMetaTag('twitter:title', title);
    }

    if (image) {
      updateMetaTag('og:image', image);
      updateMetaTag('twitter:image', image);
    }

    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    // Canonical URL
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonical || fullUrl);

    // Open Graph URL
    updateMetaTag('og:url', fullUrl);
    updateMetaTag('twitter:url', fullUrl);
  }, [title, description, image, keywords, canonical, fullUrl]);

  return null;
}

