import React, { useState } from 'react';
import { getMediaUrl } from '../../api/client';

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
  fallbackSrc = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=75&w=800',
  onClick,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const optimizedSrc = getOptimizedImageUrl(src, width, quality);

  return (
    <div
      onClick={onClick}
      className={'relative overflow-hidden bg-slate-900/80 ' + (containerClassName || '')}
    >
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 animate-pulse" />
      )}

      <img
        src={hasError ? fallbackSrc : (optimizedSrc || fallbackSrc)}
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
        className={'w-full h-full object-cover transition-all duration-700 ease-out ' +
          (isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105 blur-sm') +
          ' ' + (className || '')}
      />
    </div>
  );
};

export default OptimizedImage;
