import { getBaseURL } from '@/api/axios';
import { Platform } from 'react-native';

export const PLACEHOLDER_IMAGES: Record<string, string> = {
  Shirts: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80',
  Pants: 'https://images.unsplash.com/photo-1542272604-780c36856d66?w=500&q=80',
  Shoes: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80',
  Jackets: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80',
  Accessories: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
  Default: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&q=80',
};

export function getFallbackImage(category?: string): string {
  if (!category) return PLACEHOLDER_IMAGES.Default;
  const key = Object.keys(PLACEHOLDER_IMAGES).find(
    (k) => k.toLowerCase() === category.toLowerCase()
  );
  return key ? PLACEHOLDER_IMAGES[key] : PLACEHOLDER_IMAGES.Default;
}

/**
 * Standard helper to convert relative or dev backend image paths into a fully qualified image URL string.
 */
export function getImageUrl(url?: string, categoryFallback?: string): string {
  if (!url || url.trim() === '' || url === 'null' || url === 'undefined') {
    return getFallbackImage(categoryFallback);
  }

  if (
    url.startsWith('data:') ||
    url.startsWith('file:') ||
    url.startsWith('blob:') ||
    url.startsWith('http://') ||
    url.startsWith('https://')
  ) {
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      if (Platform.OS !== 'web') {
        const hostPart = getBaseURL().replace(/\/+$/, '');
        return url
          .replace(/http:\/\/localhost:\d+/, hostPart)
          .replace(/http:\/\/127\.0\.0\.1:\d+/, hostPart)
          .replace(/https:\/\/localhost:\d+/, hostPart)
          .replace(/https:\/\/127\.0\.0\.1:\d+/, hostPart);
      }
    }
    return url;
  }

  if (url.startsWith('/')) {
    const hostPart = getBaseURL().replace(/\/+$/, '');
    return `${hostPart}${url}`;
  }

  return url;
}

/**
 * Ensures image source is always formatted as { uri: string } or require() ID,
 * as required by React Native & Expo Image components.
 */
export function resolveImageUrl(source?: any, categoryFallback?: string): any {
  if (!source || source === '' || source === 'null' || source === 'undefined') {
    return { uri: getFallbackImage(categoryFallback) };
  }

  if (typeof source === 'number') {
    return source;
  }

  if (typeof source === 'object' && source !== null) {
    if (typeof source.uri === 'string' && source.uri.trim() !== '') {
      return { ...source, uri: getImageUrl(source.uri, categoryFallback) };
    }
    return { uri: getFallbackImage(categoryFallback) };
  }

  if (typeof source === 'string') {
    return { uri: getImageUrl(source, categoryFallback) };
  }

  return { uri: getFallbackImage(categoryFallback) };
}
