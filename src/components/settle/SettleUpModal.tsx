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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-[#5bc5a7] text-white rounded-t-lg">
          <h2 className="font-semibold">{t("settle.title")}</h2>
          <button onClick={closeSettleUp}>
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Payment direction */}
          <div className="flex items-center justify-center gap-4">
            {/* Payer */}
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#5bc5a7]/20 flex items-center justify-center text-lg font-bold text-[#5bc5a7] mx-auto mb-1">
                {payerName[0]?.toUpperCase()}
              </div>
              <select
                value={payerId}
                onChange={(e) => setPayerId(e.target.value)}
                className="text-sm border rounded px-2 py-1 max-w-[120px]"
              >
                <option value={currentUserId}>{currentUserName}</option>
                {friends.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <ArrowRight size={24} className="text-[#5bc5a7]" />

            {/* Payee */}
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#ff652f]/20 flex items-center justify-center text-lg font-bold text-[#ff652f] mx-auto mb-1">
                {payeeName[0]?.toUpperCase()}
              </div>
              <select
                value={payeeId}
                onChange={(e) => setPayeeId(e.target.value)}
                className="text-sm border rounded px-2 py-1 max-w-[120px]"
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
            <span className="text-lg font-medium text-gray-500">{currency}</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="border rounded px-3 py-2 text-3xl font-bold text-center w-48 focus:outline-none focus:ring-2 focus:ring-[#5bc5a7]"
            />
          </div>

          {/* Date */}
          <div>
            <label className="text-sm text-gray-500 block mb-1">{t("settle.date")}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded px-3 py-1.5 text-sm"
            />
          </div>

          {/* Group */}
          <div>
            <select
              value={groupId ?? ""}
              onChange={(e) => setGroupId(e.target.value || null)}
              className="w-full border rounded px-3 py-1.5 text-sm"
            >
              <option value="">{t("expense.noGroup")}</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <textarea
            placeholder={t("expense.notes")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm h-16 focus:outline-none focus:ring-2 focus:ring-[#5bc5a7]"
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t">
          <button
            onClick={closeSettleUp}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            {t("expense.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !payeeId || !amount || parseFloat(amount) <= 0}
            className="px-4 py-2 text-sm bg-[#5bc5a7] text-white rounded font-medium hover:bg-[#4ab393] disabled:opacity-50"
          >
            {saving ? "..." : t("expense.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
