/**
 * Lightweight browser cache utility implementing Stale-While-Revalidate (SWR)
 * for instant 0ms UI rendering while revalidating fresh data in the background.
 */

const PREFIX = 'swastik_cache_';

export const getCachedData = (key, fallback = null) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(`${PREFIX}${key}`);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed?.data !== undefined ? parsed.data : fallback;
  } catch (err) {
    console.warn(`[Cache read error for ${key}]:`, err);
    return fallback;
  }
};

export const setCachedData = (key, data) => {
  if (typeof window === 'undefined') return;
  try {
    const item = {
      timestamp: Date.now(),
      data,
    };
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(item));
  } catch (err) {
    // QuotaExceededError or private browsing restrictions
    console.warn(`[Cache write error for ${key}]:`, err);
  }
};

export const clearCachedData = (key) => {
  if (typeof window === 'undefined') return;
  try {
    if (key) {
      localStorage.removeItem(`${PREFIX}${key}`);
    } else {
      // Clear all swastik cache items
      Object.keys(localStorage)
        .filter((k) => k.startsWith(PREFIX))
        .forEach((k) => localStorage.removeItem(k));
    }
  } catch (err) {
    console.warn('[Cache clear error]:', err);
  }
};
