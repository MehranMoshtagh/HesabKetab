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
    await fetch(`/api/groups/${groupId}/members/${userId}`, {
      method: "DELETE",
    });
    setMembers(members.filter((m) => m.userId !== userId));
  };

  const handleDeleteGroup = async () => {
    if (!confirm("Are you sure you want to delete this group?")) return;
    await fetch(`/api/groups/${groupId}`, { method: "DELETE" });
    router.push(`/${locale}/dashboard`);
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-400">{t("common.loading")}</div>;
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-[#333] mb-4">{t("group.settings")}</h1>

      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {/* Group name */}
        <div>
          <label className="block text-sm font-medium text-[#333] mb-1">
            Group name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5bc5a7]"
          />
        </div>

        {/* Group type */}
        <div>
          <label className="block text-sm font-medium text-[#333] mb-1">
            {t("group.groupType")}
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="HOME">{t("group.types.HOME")}</option>
            <option value="TRIP">{t("group.types.TRIP")}</option>
            <option value="COUPLE">{t("group.types.COUPLE")}</option>
            <option value="OTHER">{t("group.types.OTHER")}</option>
          </select>
        </div>

        {/* Members */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {t("group.members")}
          </h3>
          <div className="space-y-2 mb-3">
            {members.map((m) => (
              <div key={m.userId} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#5bc5a7]/20 flex items-center justify-center text-xs font-bold text-[#5bc5a7]">
                    {m.user.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{m.user.name}</div>
                    <div className="text-xs text-gray-400">{m.user.email}</div>
                  </div>
                </div>
                {m.role !== "ADMIN" && (
                  <button
                    onClick={() => handleRemoveMember(m.userId)}
                    className="text-gray-400 hover:text-red-500"
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
              className="flex-1 border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5bc5a7]"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddMember();
                }
              }}
            />
            <button
              onClick={handleAddMember}
              className="px-3 py-1.5 bg-[#5bc5a7] text-white rounded text-sm"
            >
              {t("group.addPerson")}
            </button>
          </div>
        </div>

        {/* Simplify debts */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[#333]">
            {t("group.simplifyDebts")}
          </label>
          <button
            onClick={() => setSimplifyDebts(!simplifyDebts)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              simplifyDebts ? "bg-[#5bc5a7]" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                simplifyDebts ? "start-[22px]" : "start-0.5"
              }`}
            />
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <button
            onClick={handleDeleteGroup}
            className="flex items-center gap-1 text-red-500 text-sm hover:underline"
          >
            <Trash2 size={14} />
            {t("group.delete")}
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              {t("expense.cancel")}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm bg-[#5bc5a7] text-white rounded font-medium hover:bg-[#4ab393] disabled:opacity-50"
            >
              {saving ? "..." : t("settings.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
