"use client";

import { useEffect, useState, useRef } from "react";

/**
 * Lightweight stale-while-revalidate cache.
 * Persists in memory for the lifetime of the tab (lost on full refresh).
 *
 * Pattern:
 * - If URL is in cache and fresh (< ttl), return cached data INSTANTLY with no fetch.
 * - If URL is cached but stale, return cached data INSTANTLY + fire background fetch.
 * - If URL is not cached, return null + fetch.
 *
 * This eliminates the "blank page → wait 3s → content" pattern on every
 * navigation, making the app feel as responsive as Splitwise.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// In-memory cache — persists during the session
const cache = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL_MS = 30_000; // 30 seconds

export function useCachedFetch<T>(
  url: string | null,
  ttl: number = DEFAULT_TTL_MS
): { data: T | null; loading: boolean; refetch: () => void } {
  // Initialize with cached data if available (no render flash)
  const [data, setData] = useState<T | null>(() => {
    if (!url) return null;
    const entry = cache.get(url);
    return entry ? (entry.data as T) : null;
  });

  const [loading, setLoading] = useState(() => {
    if (!url) return false;
    const entry = cache.get(url);
    // Not loading if we have fresh cached data
    return !entry || Date.now() - entry.timestamp > ttl;
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const doFetch = () => {
    if (!url) return;
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((fresh) => {
        if (!mountedRef.current || fresh === null) return;
        cache.set(url, { data: fresh, timestamp: Date.now() });
        setData(fresh as T);
      })
      .catch(() => {})
      .finally(() => {
        if (mountedRef.current) setLoading(false);
      });
  };

  useEffect(() => {
    if (!url) { setLoading(false); return; }

    const entry = cache.get(url);
    const isFresh = entry && Date.now() - entry.timestamp < ttl;

    if (isFresh) {
      setData(entry.data as T);
      setLoading(false);
      return;
    }

    // Show cached data immediately if available (even if stale), then refetch
    if (entry) setData(entry.data as T);
    doFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, ttl]);

  return { data, loading, refetch: doFetch };
}

/** Manually invalidate a cache entry (call after POST/PUT/DELETE) */
export function invalidateCache(urlOrPattern: string | RegExp) {
  if (typeof urlOrPattern === "string") {
    cache.delete(urlOrPattern);
  } else {
    for (const key of cache.keys()) {
      if (urlOrPattern.test(key)) cache.delete(key);
    }
  }
}
