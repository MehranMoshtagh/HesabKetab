"use client";

import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { X, Trash2 } from "lucide-react";

interface MemberData {
  userId: string;
  role: string;
  user: { id: string; name: string; email: string; avatar: string | null };
}

export default function GroupEditPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;

  const [name, setName] = useState("");
  const [type, setType] = useState("OTHER");
  const [simplifyDebts, setSimplifyDebts] = useState(true);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/groups/${groupId}`)
      .then((r) => r.json())
      .then((data) => {
        setName(data.name);
        setType(data.type);
        setSimplifyDebts(data.simplifyDebts);
        setMembers(data.members);
      })
      .finally(() => setLoading(false));
  }, [groupId]);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/groups/${groupId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, simplifyDebts }),
    });
    setSaving(false);
    router.push(`/${locale}/groups/${groupId}`);
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return;

    const res = await fetch(`/api/groups/${groupId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newMemberEmail }),
    });

    if (res.ok) {
      setNewMemberEmail("");
      // Refresh members
      const data = await fetch(`/api/groups/${groupId}`).then((r) => r.json());
      setMembers(data.members);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    const member = members.find((m) => m.userId === userId);
    const name = member?.user?.name ?? "this member";
    if (!confirm(
      `Remove ${name} from this group?\n\nTheir existing expenses in this group will remain, but they won't see new expenses or be included in future splits.`
    )) return;
    await fetch(`/api/groups/${groupId}/members/${userId}`, {
      method: "DELETE",
    });
    setMembers(members.filter((m) => m.userId !== userId));
  };

  const handleDeleteGroup = async () => {
    if (!confirm(
      "Delete this group?\n\nAll group expenses will be soft-deleted. Individual balances between members will remain. This action cannot be undone."
    )) return;
    await fetch(`/api/groups/${groupId}`, { method: "DELETE" });
    router.push(`/${locale}/dashboard`);
  };

  if (loading) {
    return <div className="text-center py-8 text-[var(--color-text-tertiary)]">{t("common.loading")}</div>;
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-semibold text-[var(--color-text)] tracking-tight mb-4">{t("group.settings")}</h1>

      <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-6 space-y-6">
        {/* Group name */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
            Group name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-[var(--color-border-strong)] rounded-xl px-3.5 py-2.5 text-sm bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all duration-200"
          />
        </div>

        {/* Group type */}
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

        {/* Members */}
        <div>
          <h3 className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
            {t("group.members")}
          </h3>
          <div className="space-y-2 mb-3">
            {members.map((m) => (
              <div key={m.userId} className="flex items-center justify-between py-1.5 px-1 rounded-lg hover:bg-[var(--color-hover)] transition-colors duration-150">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-xs font-semibold text-[var(--color-primary)]">
                    {m.user.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{m.user.name}</div>
                    <div className="text-xs text-[var(--color-text-tertiary)]">{m.user.email}</div>
                  </div>
                </div>
                {m.role !== "ADMIN" && (
                  <button
                    onClick={() => handleRemoveMember(m.userId)}
                    className="text-[var(--color-text-tertiary)] hover:text-[var(--color-negative)]"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-1">
            <input
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="Add by email"
              className="flex-1 border border-[var(--color-border-strong)] rounded-xl px-3.5 py-2.5 text-sm bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all duration-200"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddMember();
                }
              }}
            />
            <button
              onClick={handleAddMember}
              className="bg-[var(--color-primary)] text-white px-5 py-2 rounded-xl font-medium text-sm hover:bg-[var(--color-primary-hover)] transition-all duration-200"
            >
              {t("group.addPerson")}
            </button>
          </div>
        </div>

        {/* Simplify debts */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[var(--color-text)]">
            {t("group.simplifyDebts")}
          </label>
          <button
            onClick={() => setSimplifyDebts(!simplifyDebts)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              simplifyDebts ? "bg-[var(--color-primary)]" : "bg-[var(--color-border-strong)]"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-[var(--color-surface)] shadow transition-transform ${
                simplifyDebts ? "start-[22px]" : "start-0.5"
              }`}
            />
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-[var(--color-border)]">
          <button
            onClick={handleDeleteGroup}
            className="flex items-center gap-1 text-[var(--color-negative)] text-sm hover:underline transition-colors duration-150"
          >
            <Trash2 size={14} />
            {t("group.delete")}
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => router.back()}
              className="border border-[var(--color-border-strong)] text-[var(--color-text)] px-5 py-2 rounded-xl font-medium text-sm hover:bg-[var(--color-hover)] transition-all duration-200"
            >
              {t("expense.cancel")}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[var(--color-primary)] text-white px-5 py-2 rounded-xl font-medium text-sm hover:bg-[var(--color-primary-hover)] transition-all duration-200 disabled:opacity-50"
            >
              {saving ? t("common.loading") : t("settings.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
