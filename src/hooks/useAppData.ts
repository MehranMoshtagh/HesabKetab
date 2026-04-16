"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/stores/app-store";

/**
 * Single fetch that loads ALL app data (friends, groups, balances, charts)
 * from /api/init. One cold start instead of four.
 */
export function useAppData() {
  const { data: session } = useSession();
  const { setFriends, setGroups, setInitData } = useAppStore();
  const fetched = useRef(false);

  useEffect(() => {
    if (!session?.user || fetched.current) return;
    fetched.current = true;

    fetch("/api/init")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        if (Array.isArray(data.friends)) setFriends(data.friends);
        if (Array.isArray(data.groups)) setGroups(data.groups);
        if (data.balances || data.charts) {
          setInitData({ balances: data.balances, charts: data.charts });
        }
      })
      .catch(() => {});
  }, [session?.user, setFriends, setGroups, setInitData]);
}
