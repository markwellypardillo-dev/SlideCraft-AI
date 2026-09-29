import { SlideDeck } from '../types/deck';

function getScopedDeckKey(userId?: string | null): string {
  const safeId = (userId || 'guest').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `slidecraft_offline_decks_v2_${safeId}`;
}

function getScopedActiveKey(userId?: string | null): string {
  const safeId = (userId || 'guest').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `slidecraft_active_deck_v2_${safeId}`;
}

/**
 * Save presentation decks to local offline storage cache, strictly scoped to the user ID
 */
export function saveDecksToOfflineCache(decks: SlideDeck[], userId?: string | null): void {
  try {
    const key = getScopedDeckKey(userId);
    localStorage.setItem(key, JSON.stringify(decks));
  } catch (err) {
    console.warn('Failed to write decks to offline storage cache:', err);
  }
}

/**
 * Retrieve saved presentation decks from local offline storage cache, strictly scoped to the user ID
 */
export function getDecksFromOfflineCache(userId?: string | null): SlideDeck[] {
  try {
    const key = getScopedDeckKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as SlideDeck[];
  } catch (err) {
    console.warn('Failed to read decks from offline storage cache:', err);
    return [];
  }
}

/**
 * Save active deck state to local offline storage cache, strictly scoped to the user ID
 */
export function saveActiveDeckToOfflineCache(deck: SlideDeck, userId?: string | null): void {
  try {
    const key = getScopedActiveKey(userId);
    localStorage.setItem(key, JSON.stringify(deck));
  } catch (err) {
    console.warn('Failed to save active deck to offline storage cache:', err);
  }
}

/**
 * Retrieve active deck from local offline storage cache, strictly scoped to the user ID
 */
export function getActiveDeckFromOfflineCache(userId?: string | null): SlideDeck | null {
  try {
    const key = getScopedActiveKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as SlideDeck;
  } catch (err) {
    console.warn('Failed to load active deck from offline storage cache:', err);
    return null;
  }
}

/**
 * Clear legacy shared cache keys to prevent data leaking between accounts
 */
export function clearLegacySharedCaches(): void {
  try {
    localStorage.removeItem('slidecraft_offline_decks_v2');
    localStorage.removeItem('slidecraft_active_deck_v2');
  } catch {}
}

/**
 * Check if the PWA service worker is active and caching resources
 */
export async function getOfflineCacheStats(userId?: string | null): Promise<{
  isCached: boolean;
  deckCount: number;
  estimatedStorageKb: number;
}> {
  const decks = getDecksFromOfflineCache(userId);
  const rawData = localStorage.getItem(getScopedDeckKey(userId)) || '';
  const estimatedStorageKb = Math.round(rawData.length / 1024);

  const hasServiceWorker = 'serviceWorker' in navigator && !!navigator.serviceWorker.controller;

  return {
    isCached: hasServiceWorker || decks.length > 0,
    deckCount: decks.length,
    estimatedStorageKb,
  };
}
