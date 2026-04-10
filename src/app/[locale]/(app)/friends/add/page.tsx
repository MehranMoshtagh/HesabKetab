"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { UserPlus } from "lucide-react";

export default function AddFriendPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to add friend");
        setLoading(false);
        return;
      }

      const friend = await res.json();
      router.push(`/${locale}/friends/${friend.id}`);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-semibold text-[var(--color-text)] tracking-tight mb-4">{t("friend.addFriend")}</h1>

      <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-[rgba(0,0,0,0.06)] p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-[#FF3B30]/8 text-[var(--color-negative)] text-sm rounded-xl p-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              {t("auth.email")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="friend@example.com"
              className="w-full border border-[rgba(0,0,0,0.12)] rounded-xl px-3.5 py-2.5 text-sm bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-all duration-200 disabled:opacity-50"
          >
            <UserPlus size={16} />
            {loading ? "..." : t("friend.addFriend")}
          </button>
        </form>
      </div>
    </div>
  );
}
