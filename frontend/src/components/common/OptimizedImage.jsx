import React, { useState, useEffect } from 'react';
import { getMediaUrl } from '../../api/client';

const DIVERSE_FALLBACKS = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=75&w=800',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=75&w=800',
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=75&w=800',
  'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=75&w=800',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=75&w=800',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=75&w=800',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=75&w=800',
  'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=75&w=800',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=75&w=800',
];

const getDeterministicFallback = (seedStr) => {
  if (!seedStr) return DIVERSE_FALLBACKS[0];
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % DIVERSE_FALLBACKS.length;
  return DIVERSE_FALLBACKS[index];
};

export const getOptimizedImageUrl = (url, width = 800, quality = 75) => {
  if (!url) return '';
  const mediaUrl = getMediaUrl(url);

  if (mediaUrl.includes('images.unsplash.com')) {
    try {
      const parsed = new URL(mediaUrl);
      parsed.searchParams.set('auto', 'format');
      parsed.searchParams.set('fit', 'crop');
      parsed.searchParams.set('q', quality.toString());
      parsed.searchParams.set('w', width.toString());
      return parsed.toString();
    } catch {
      return mediaUrl;
    }
  }

  if (mediaUrl.includes('res.cloudinary.com') && mediaUrl.includes('/upload/')) {
    if (!mediaUrl.includes('/w_') && !mediaUrl.includes('/f_auto')) {
      return mediaUrl.replace(
        '/upload/',
        '/upload/f_auto,q_auto,w_' + width + ',c_limit/'
      );
    }
  }

  return mediaUrl;
};

const OptimizedImage = ({
  src,
  alt = '',
  className = '',
  containerClassName = '',
  width = 800,
  quality = 75,
  priority = false,
  fallbackSrc,
  onClick,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Automatically reset image states whenever the image src or alt changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src, alt]);

  const chosenFallback = fallbackSrc || getDeterministicFallback(alt || src);
  const optimizedSrc = getOptimizedImageUrl(src, width, quality);
  const displaySrc = hasError ? chosenFallback : (optimizedSrc || chosenFallback);

  return (
    <div
      onClick={onClick}
      className={'relative overflow-hidden bg-slate-900/80 ' + (containerClassName || '')}
    >
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 animate-pulse" />
      )}

      <img
        src={displaySrc}
        alt={alt}
        decoding="async"
        loading={priority ? undefined : 'lazy'}
        fetchpriority={priority ? 'high' : undefined}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setIsLoaded(true);
          }
        }}
        className={'w-full h-full object-cover transition-opacity duration-300 ease-out ' +
          (isLoaded ? 'opacity-100' : 'opacity-0') +
          ' ' + (className || '')}
      />
    </div>
  );
};

export default OptimizedImage;
