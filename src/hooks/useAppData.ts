"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/stores/app-store";

/** Fetches friends and groups on mount and populates the store. Deduplicates. */
export function useAppData() {
  const { data: session } = useSession();
  const { setFriends, setGroups, friends, groups } = useAppStore();
  const fetched = useRef(false);

  useEffect(() => {
    if (!session?.user || fetched.current) return;
    fetched.current = true;

    // Fire both requests in parallel
    Promise.all([
      fetch("/api/friends").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/groups").then((r) => (r.ok ? r.json() : [])),
    ]).then(([friendsData, groupsData]) => {
      if (Array.isArray(friendsData)) setFriends(friendsData);
      if (Array.isArray(groupsData)) setGroups(groupsData);
    }).catch(() => {});
  }, [session?.user, setFriends, setGroups]);
}
