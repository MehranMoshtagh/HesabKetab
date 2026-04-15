"use client";

import { useTranslations } from "next-intl";
import { useAppStore } from "@/stores/app-store";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { X, ArrowRight } from "lucide-react";

export default function SettleUpModal() {
  const t = useTranslations();
  const { data: session } = useSession();
  const { isSettleUpOpen, closeSettleUp, friends, groups, settleUpContext } =
    useAppStore();

  const currentUserId = session?.user?.id ?? "";
  const currentUserName = session?.user?.name ?? "You";

  const [payerId, setPayerId] = useState(currentUserId);
  const [payeeId, setPayeeId] = useState(settleUpContext.friendId ?? "");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [groupId, setGroupId] = useState<string | null>(
    settleUpContext.groupId ?? null
  );
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!payeeId || !amount || parseFloat(amount) <= 0) return;

    setSaving(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payerId,
          payeeId,
          amount: parseFloat(amount),
          currency,
          groupId,
          date,
          notes: notes || undefined,
        }),
      });

      if (res.ok) {
        closeSettleUp();
        setAmount("");
        setNotes("");
        window.location.reload();
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isSettleUpOpen) return null;

  const payerName =
    payerId === currentUserId
      ? currentUserName
      : friends.find((f) => f.id === payerId)?.name ?? "?";
  const payeeName =
    payeeId === currentUserId
      ? currentUserName
      : friends.find((f) => f.id === payeeId)?.name ?? "Select";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-[var(--shadow-elevated)] border border-[var(--color-border)] w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="font-semibold text-[var(--color-text)] tracking-tight">
            {t("settle.title")}
          </h2>
          <button
            onClick={closeSettleUp}
            className="p-1 rounded-lg hover:bg-[var(--color-hover)] text-[var(--color-text-tertiary)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Payment direction */}
          <div className="flex items-center justify-center gap-5">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-lg font-semibold text-[var(--color-primary)] mx-auto mb-2">
                {payerName[0]?.toUpperCase()}
              </div>
              <select
                value={payerId}
                onChange={(e) => setPayerId(e.target.value)}
                className="text-sm border border-[var(--color-border-strong)] rounded-xl px-2.5 py-1.5 max-w-[120px] bg-[var(--color-bg)]"
              >
                <option value={currentUserId}>{currentUserName}</option>
                {friends.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <ArrowRight size={22} className="text-[var(--color-text-tertiary)]" />

            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--color-positive)]/10 flex items-center justify-center text-lg font-semibold text-[var(--color-positive)] mx-auto mb-2">
                {payeeName[0]?.toUpperCase()}
              </div>
              <select
                value={payeeId}
                onChange={(e) => setPayeeId(e.target.value)}
                className="text-sm border border-[var(--color-border-strong)] rounded-xl px-2.5 py-1.5 max-w-[120px] bg-[var(--color-bg)]"
              >
                <option value="">--</option>
                {friends
                  .filter((f) => f.id !== payerId)
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                {payerId !== currentUserId && (
                  <option value={currentUserId}>{currentUserName}</option>
                )}
              </select>
            </div>
          </div>

          {/* Amount */}
          <div className="flex gap-2 items-center justify-center">
            <span className="text-lg font-medium text-[var(--color-text-tertiary)]">{currency}</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="border border-[var(--color-border-strong)] rounded-xl px-3.5 py-2.5 text-3xl font-semibold text-center w-48 bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all"
            />
          </div>

          {/* Date */}
          <div>
            <label className="text-sm text-[var(--color-text-secondary)] block mb-1.5">{t("settle.date")}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-[var(--color-border-strong)] rounded-xl px-3.5 py-2.5 text-sm bg-[var(--color-bg)]"
            />
          </div>

          {/* Group */}
          <select
            value={groupId ?? ""}
            onChange={(e) => setGroupId(e.target.value || null)}
            className="w-full border border-[var(--color-border-strong)] rounded-xl px-3.5 py-2.5 text-sm bg-[var(--color-bg)]"
          >
            <option value="">{t("expense.noGroup")}</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Notes */}
          <textarea
            placeholder={t("expense.notes")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-[var(--color-border-strong)] rounded-xl px-3.5 py-2.5 text-sm h-16 bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all"
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2.5 px-5 py-4 border-t border-[var(--color-border)]">
          <button
            onClick={closeSettleUp}
            className="px-5 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] rounded-xl transition-colors"
          >
            {t("expense.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !payeeId || !amount || parseFloat(amount) <= 0}
            className="px-5 py-2 text-sm bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-all duration-200"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t("expense.save")}
              </span>
            ) : t("expense.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
