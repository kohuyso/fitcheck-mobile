import { Image } from 'expo-image';
import { getBaseURL } from '@/api/axios';
import { Platform } from 'react-native';

export const DEFAULT_BLURHASH = 'L6PZfSi_00Yy_3t7w[f600f6~qj[';

export const PLACEHOLDER_IMAGES: Record<string, string> = {
  Shirts: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&auto=format&fit=crop&q=75',
  Pants: 'https://images.unsplash.com/photo-1542272604-780c36856d66?w=400&auto=format&fit=crop&q=75',
  Shoes: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&auto=format&fit=crop&q=75',
  Jackets: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&auto=format&fit=crop&q=75',
  Accessories: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=75',
  Default: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&auto=format&fit=crop&q=75',
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
 * Also optimizes remote Unsplash parameters for faster downloading.
 */
export function getImageUrl(url?: string, categoryFallback?: string): string {
  if (!url || url.trim() === '' || url === 'null' || url === 'undefined') {
    return getFallbackImage(categoryFallback);
  }

  let finalUrl = url.trim();

  if (
    finalUrl.startsWith('data:') ||
    finalUrl.startsWith('file:') ||
    finalUrl.startsWith('blob:') ||
    finalUrl.startsWith('http://') ||
    finalUrl.startsWith('https://')
  ) {
    if (finalUrl.includes('localhost') || finalUrl.includes('127.0.0.1')) {
      if (Platform.OS !== 'web') {
        const hostPart = getBaseURL().replace(/\/+$/, '');
        finalUrl = finalUrl
          .replace(/http:\/\/localhost:\d+/, hostPart)
          .replace(/http:\/\/127\.0\.0\.1:\d+/, hostPart)
          .replace(/https:\/\/localhost:\d+/, hostPart)
          .replace(/https:\/\/127\.0\.0\.1:\d+/, hostPart);
      }
    }

    if (finalUrl.includes('images.unsplash.com') && !finalUrl.includes('auto=format')) {
      finalUrl += (finalUrl.includes('?') ? '&' : '?') + 'auto=format&fit=crop&w=400&q=75';
    }

    return finalUrl;
  }

  if (finalUrl.startsWith('/')) {
    const hostPart = getBaseURL().replace(/\/+$/, '');
    return `${hostPart}${finalUrl}`;
  }

  return finalUrl;
}

export type ImageSourceInput = string | number | { uri?: string } | null | undefined;
export type ImageSourceResolved = { uri: string } | number;

/**
 * Ensures image source is always formatted as { uri: string } or require() ID,
 * as required by React Native & Expo Image components.
 */
export function resolveImageUrl(source?: ImageSourceInput, categoryFallback?: string): ImageSourceResolved {
  if (!source || source === '' || source === 'null' || source === 'undefined') {
    return { uri: getFallbackImage(categoryFallback) };
  }

  if (typeof source === 'number') {
    return source;
  }

  if (typeof source === 'object' && source !== null) {
    if ('uri' in source && typeof source.uri === 'string' && source.uri.trim() !== '') {
      return { ...source, uri: getImageUrl(source.uri, categoryFallback) };
    }
    return { uri: getFallbackImage(categoryFallback) };
  }

  if (typeof source === 'string') {
    return { uri: getImageUrl(source, categoryFallback) };
  }

  return { uri: getFallbackImage(categoryFallback) };
}

/**
 * Prefetch images into memory and disk cache for instant display.
 */
export function prefetchImages(urls: (string | undefined | null)[]): void {
  try {
    const validUrls = urls
      .filter((u): u is string => Boolean(u && typeof u === 'string' && u.trim() !== ''))
      .map((u) => getImageUrl(u));

    if (validUrls.length > 0) {
      Image.prefetch(validUrls, 'memory-disk');
    }
  } catch (e) {
    // Silent fail for non-critical prefetch errors
  }
}

