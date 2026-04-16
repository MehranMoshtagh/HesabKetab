"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Users, X } from "lucide-react";

export default function CreateGroupPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState("OTHER");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberEmails, setMemberEmails] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const addMemberEmail = () => {
    const email = memberEmail.trim();
    if (email && !memberEmails.includes(email)) {
      setMemberEmails([...memberEmails, email]);
      setMemberEmail("");
    }
  };

  const removeMemberEmail = (email: string) => {
    setMemberEmails(memberEmails.filter((e) => e !== email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

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
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-[var(--color-negative-light)] text-[var(--color-negative)] text-sm rounded-xl p-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Group name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Trip to Paris"
              className="w-full border border-[var(--color-border-strong)] rounded-xl px-3.5 py-2.5 text-sm bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              {t("group.groupType")}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border border-[var(--color-border-strong)] rounded-xl px-3.5 py-2.5 text-sm bg-[var(--color-bg)]"
            >
              <option value="HOME">{t("group.types.HOME")}</option>
              <option value="TRIP">{t("group.types.TRIP")}</option>
              <option value="COUPLE">{t("group.types.COUPLE")}</option>
              <option value="OTHER">{t("group.types.OTHER")}</option>
            </select>
          </div>

          {/* Member emails */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              {t("group.members")}
            </label>
            <div className="flex gap-1 mb-2">
              <input
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="member@example.com"
                className="flex-1 border border-[var(--color-border-strong)] rounded-xl px-3.5 py-2.5 text-sm bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all duration-200"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addMemberEmail();
                  }
                }}
              />
              <button
                type="button"
                onClick={addMemberEmail}
                className="border border-[var(--color-border-strong)] text-[var(--color-text)] px-5 py-2 rounded-xl font-medium text-sm hover:bg-[var(--color-hover)] transition-all duration-200"
              >
                Add
              </button>
            </div>
            {memberEmails.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {memberEmails.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1 bg-[var(--color-primary-light)] text-[var(--color-primary)] text-xs px-2 py-1 rounded-full"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => removeMemberEmail(email)}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-all duration-200 disabled:opacity-50"
          >
            <Users size={16} />
            {loading ? t("common.loading") : t("group.create")}
          </button>
        </form>
      </div>
    </div>
  );
}
