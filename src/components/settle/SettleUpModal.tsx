"use client";

import { useTranslations } from "next-intl";
import { useAppStore } from "@/stores/app-store";
import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { ArrowRight, ChevronDown, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { avatarColor, getInitial } from "@/lib/utils";

export default function SettleUpModal() {
  const t = useTranslations();
  const { data: session } = useSession();
  const { isSettleUpOpen, closeSettleUp, friends, settleUpContext } = useAppStore();

  const currentUserId = session?.user?.id ?? "";
  const currentUserName = session?.user?.name ?? "You";

  const [payerId, setPayerId] = useState(currentUserId);
  const [payeeId, setPayeeId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPayerPicker, setShowPayerPicker] = useState(false);
  const [showPayeePicker, setShowPayeePicker] = useState(false);
  const [payerSearch, setPayerSearch] = useState("");
  const [payeeSearch, setPayeeSearch] = useState("");

  const resetForm = useCallback(() => {
    setPayerId(currentUserId);
    setPayeeId("");
    setAmount("");
    setNotes("");
    setDate(new Date().toISOString().split("T")[0]);
    setShowPayerPicker(false);
    setShowPayeePicker(false);
  }, [currentUserId]);

  useEffect(() => {
    if (isSettleUpOpen) {
      resetForm();
      if (settleUpContext.friendId) setPayeeId(settleUpContext.friendId);
    }
  }, [isSettleUpOpen, settleUpContext, resetForm]);

  const handleClose = () => {
    closeSettleUp();
    resetForm();
  };

  const handleSave = async () => {
    if (!payeeId || !amount || parseFloat(amount) <= 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payerId, payeeId, amount: parseFloat(amount), currency: "USD", date,
          notes: notes || undefined,
        }),
      });
      if (res.ok) { handleClose(); window.location.reload(); }
    } finally { setSaving(false); }
  };

  if (!isSettleUpOpen) return null;

  const payerName = payerId === currentUserId ? currentUserName : friends.find((f) => f.id === payerId)?.name ?? "?";
  const payeeName = payeeId ? (payeeId === currentUserId ? currentUserName : friends.find((f) => f.id === payeeId)?.name ?? "?") : null;

  const allPeople = [
    { id: currentUserId, name: currentUserName },
    ...friends.map((f) => ({ id: f.id, name: f.name })),
  ];

  const isValid = !!payeeId && payeeId !== payerId && !!amount && parseFloat(amount) > 0;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-[var(--color-surface)] w-full sm:max-w-[400px] sm:rounded-2xl rounded-t-2xl shadow-[var(--shadow-elevated)] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <button onClick={handleClose} className="text-sm text-[var(--color-primary)] font-medium py-1 px-1">
            {t("expense.cancel")}
          </button>
          <h2 className="font-semibold text-[15px] text-[var(--color-text)]">{t("settle.title")}</h2>
          <button onClick={handleSave} disabled={saving || !isValid}
            className="text-sm text-[var(--color-primary)] font-semibold py-1 px-1 disabled:opacity-30"
          >
            {saving ? "..." : t("expense.save")}
          </button>
        </div>

        <div className="p-5 space-y-5">

          {/* Payer → Payee visual */}
          <div className="flex items-center justify-center gap-4">
            {/* Payer */}
            <div className="relative">
              <button
                onClick={() => { setShowPayerPicker(!showPayerPicker); setShowPayeePicker(false); }}
                className="flex flex-col items-center gap-2 group"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold text-white shadow-md group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: avatarColor(payerName) }}
                >
                  {getInitial(payerName)}
                </div>
                <span className="text-sm font-medium text-[var(--color-text)] flex items-center gap-0.5">
                  {payerName} <ChevronDown size={12} />
                </span>
              </button>
              {showPayerPicker && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-10 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-elevated)] py-1 min-w-[200px] w-56">
                  <div className="px-2 py-1.5">
                    <div className="relative">
                      <Search size={13} className="absolute start-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                      <input type="text" placeholder="Search..." value={payerSearch} onChange={(e) => setPayerSearch(e.target.value)}
                        className="w-full ps-7 pe-2 py-1.5 text-xs bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]" />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {allPeople.filter((p) => p.id !== payeeId && p.name.toLowerCase().includes(payerSearch.toLowerCase())).map((p) => (
                      <button key={p.id}
                        onClick={() => { setPayerId(p.id); setShowPayerPicker(false); setPayerSearch(""); }}
                        className={cn("w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--color-hover)]",
                          payerId === p.id && "text-[var(--color-primary)] font-medium"
                        )}
                      >
                        {payerId === p.id && <Check size={14} />}
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-1">
              <ArrowRight size={20} className="text-[var(--color-text-tertiary)]" />
              <span className="text-[10px] text-[var(--color-text-tertiary)]">paid</span>
            </div>

            {/* Payee */}
            <div className="relative">
              <button
                onClick={() => { setShowPayeePicker(!showPayeePicker); setShowPayerPicker(false); }}
                className="flex flex-col items-center gap-2 group"
              >
                <div
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold shadow-md group-hover:scale-105 transition-transform",
                    payeeName ? "text-white" : "bg-[var(--color-bg)] border-2 border-dashed border-[var(--color-border-strong)] text-[var(--color-text-tertiary)]"
                  )}
                  style={payeeName ? { backgroundColor: avatarColor(payeeName) } : undefined}
                >
                  {payeeName ? getInitial(payeeName) : "?"}
                </div>
                <span className="text-sm font-medium text-[var(--color-text)] flex items-center gap-0.5">
                  {payeeName ?? "Select"} <ChevronDown size={12} />
                </span>
              </button>
              {showPayeePicker && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-10 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-elevated)] py-1 min-w-[200px] w-56">
                  <div className="px-2 py-1.5">
                    <div className="relative">
                      <Search size={13} className="absolute start-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                      <input type="text" placeholder="Search..." value={payeeSearch} onChange={(e) => setPayeeSearch(e.target.value)}
                        className="w-full ps-7 pe-2 py-1.5 text-xs bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]" />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {allPeople.filter((p) => p.id !== payerId && p.name.toLowerCase().includes(payeeSearch.toLowerCase())).map((p) => (
                      <button key={p.id}
                        onClick={() => { setPayeeId(p.id); setShowPayeePicker(false); setPayeeSearch(""); }}
                        className={cn("w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--color-hover)]",
                          payeeId === p.id && "text-[var(--color-primary)] font-medium"
                        )}
                      >
                        {payeeId === p.id && <Check size={14} />}
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Amount — large centered */}
          <div className="bg-[var(--color-bg)] rounded-2xl px-4 py-5 flex items-center justify-center gap-2">
            <span className="text-2xl text-[var(--color-text-tertiary)] font-light">$</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              className={cn(
                "text-4xl font-bold text-[var(--color-text)] text-center",
                "bg-transparent border-none outline-none w-40",
                "placeholder:text-[var(--color-text-tertiary)]/30",
                "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              )}
            />
          </div>

          {/* Date + Notes */}
          <div className="space-y-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-[var(--color-text)]"
            />
            <textarea
              placeholder={t("expense.notes") || "Add a note..."}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={1}
              className="w-full text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] sm:rounded-b-2xl">
          <button
            onClick={handleSave}
            disabled={saving || !isValid}
            className={cn(
              "w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200",
              "bg-[var(--color-positive)] text-white",
              "hover:opacity-90",
              "disabled:opacity-30 disabled:cursor-not-allowed",
              "active:scale-[0.98]"
            )}
          >
            {saving ? "Saving..." : isValid ? `Record $${parseFloat(amount).toFixed(2)} payment` : t("settle.title")}
          </button>
        </div>
      </div>
    </div>
  );
}
