"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/stores/app-store";

/** Fetches friends and groups on mount and populates the store. */
export function useAppData() {
  const { data: session } = useSession();
  const { setFriends, setGroups } = useAppStore();

  useEffect(() => {
    if (!session?.user) return;

    fetch("/api/friends")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setFriends(data);
      })
      .catch(() => {});

    fetch("/api/groups")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setGroups(data);
      })
      .catch(() => {});
  }, [session?.user, setFriends, setGroups]);
}
