"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/stores/app-store";

const CACHE_TTL_MS = 30_000; // 30 seconds — data is "fresh enough" for this window

/**
 * Loads app data with stale-while-revalidate pattern:
 * - Shows cached data from localStorage IMMEDIATELY (no wait)
 * - Refetches in background if cache is older than 30s
 * - If cache is fresh, skips the fetch entirely
 */
export function useAppData() {
  const { data: session } = useSession();
  const { setFriends, setGroups, setInitData, setLastFetchedAt, lastFetchedAt } = useAppStore();
  const fetched = useRef(false);

  useEffect(() => {
    if (!session?.user || fetched.current) return;
    fetched.current = true;

    // Skip fetch if cache is still fresh (less than 30s old)
    const now = Date.now();
    if (lastFetchedAt && now - lastFetchedAt < CACHE_TTL_MS) {
      return;
    }

    // Fetch fresh data (cached data already shown from store)
    fetch("/api/init")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        if (Array.isArray(data.friends)) setFriends(data.friends);
        if (Array.isArray(data.groups)) setGroups(data.groups);
        if (data.balances || data.charts) {
          setInitData({ balances: data.balances, charts: data.charts });
        }
        setLastFetchedAt(Date.now());
      })
      .catch(() => {});
  }, [session?.user, setFriends, setGroups, setInitData, setLastFetchedAt, lastFetchedAt]);
}
