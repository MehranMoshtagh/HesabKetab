"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Users, X, Search, Check, Home, Plane, Heart, MoreHorizontal } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";

const groupTypes = [
  { value: "HOME", icon: Home, label: "Home" },
  { value: "TRIP", icon: Plane, label: "Trip" },
  { value: "COUPLE", icon: Heart, label: "Couple" },
  { value: "OTHER", icon: MoreHorizontal, label: "Other" },
] as const;

export default function CreateGroupPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { friends } = useAppStore();

  const [name, setName] = useState("");
  const [type, setType] = useState("OTHER");
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [friendSearch, setFriendSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleFriend = (id: string) => {
    setSelectedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const filteredFriends = friendSearch.trim()
    ? friends.filter((f) =>
        f.name.toLowerCase().includes(friendSearch.toLowerCase()) &&
        !selectedFriendIds.includes(f.id)
      )
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    // Get emails for selected friends
    const memberEmails = selectedFriendIds
      .map((id) => friends.find((f) => f.id === id)?.email)
      .filter(Boolean) as string[];

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, memberEmails }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create group");
        setLoading(false);
        return;
      }

      const group = await res.json();
      router.push(`/${locale}/groups/${group.id}`);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-semibold text-[var(--color-text)] tracking-tight mb-4">{t("group.create")}</h1>

      <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-[var(--color-negative-light)] text-[var(--color-negative)] text-sm rounded-xl p-3">
              {error}
            </div>
          )}

          {/* Group name */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              Group name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Trip to Paris"
              className="w-full border border-[var(--color-border-strong)] rounded-xl px-3.5 py-2.5 text-sm bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all duration-200"
            />
          </div>

          {/* Group type — styled pill selector */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              {t("group.groupType")}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {groupTypes.map((gt) => {
                const Icon = gt.icon;
                const selected = type === gt.value;
                return (
                  <button
                    key={gt.value}
                    type="button"
                    onClick={() => setType(gt.value)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all duration-150",
                      selected
                        ? "bg-[var(--color-primary)] text-white border-transparent shadow-sm"
                        : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
                    )}
                  >
                    <Icon size={18} />
                    {t(`group.types.${gt.value}`)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Members — search existing friends */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              {t("group.members")}
            </label>

            {/* Selected members */}
            {selectedFriendIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedFriendIds.map((id) => {
                  const f = friends.find((fr) => fr.id === id);
                  if (!f) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 bg-[var(--color-primary-light)] text-[var(--color-primary)] text-xs font-medium px-2.5 py-1 rounded-full"
                    >
                      {f.name}
                      <button type="button" onClick={() => toggleFriend(id)} className="hover:opacity-70">
                        <X size={12} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Search friends */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
              <input
                type="text"
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
                placeholder="Search friends to add..."
                className="w-full pl-8 pr-3 py-2.5 text-sm border border-[var(--color-border-strong)] rounded-xl bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all duration-200"
              />
            </div>

            {/* Search results */}
            {friendSearch && (
              <div className="mt-2 border border-[var(--color-border)] rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                {filteredFriends.length === 0 ? (
                  <p className="px-3 py-2.5 text-sm text-[var(--color-text-tertiary)]">
                    No friends found
                  </p>
                ) : (
                  filteredFriends.slice(0, 10).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => { toggleFriend(f.id); setFriendSearch(""); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-hover)] transition-colors text-left"
                    >
                      <span className="w-6 h-6 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] text-[10px] font-semibold flex items-center justify-center">
                        {f.name.charAt(0).toUpperCase()}
                      </span>
                      {f.name}
                      <span className="ml-auto text-xs text-[var(--color-text-tertiary)]">{f.email}</span>
                    </button>
                  ))
                )}
              </div>
            )}

            <p className="mt-1.5 text-xs text-[var(--color-text-tertiary)]">
              You&apos;ll be added as admin automatically
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition-all duration-200 disabled:opacity-50"
          >
            <Users size={16} />
            {loading ? t("common.loading") : selectedFriendIds.length > 0
              ? `${t("group.create")} with ${selectedFriendIds.length} member${selectedFriendIds.length > 1 ? "s" : ""}`
              : t("group.create")
            }
          </button>
        </form>
      </div>
    </div>
  );
}
