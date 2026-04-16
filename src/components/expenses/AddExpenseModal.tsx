"use client";

import { useTranslations } from "next-intl";
import { useAppStore } from "@/stores/app-store";
import { useSession } from "next-auth/react";
import { useState, useCallback, useRef, useEffect } from "react";
import { X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import CategoryPicker from "@/components/shared/CategoryPicker";
import CurrencyPicker from "@/components/shared/CurrencyPicker";
import SplitOptionsPanel from "./SplitOptionsPanel";
import { getCurrencySymbol } from "@/lib/currencies";
import { findSubcategory } from "@/lib/categories";

type SplitType = "EQUAL" | "EXACT" | "PERCENTAGE" | "SHARES" | "ADJUSTMENT";

interface Participant {
  userId: string;
  name: string;
  included: boolean;
  amount: number;
  shareValue: number;
}

export default function AddExpenseModal() {
  const t = useTranslations();
  const { data: session } = useSession();
  const { isAddExpenseOpen, closeAddExpense, friends, groups, addExpenseContext } =
    useAppStore();

  // Form state
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [category, setCategory] = useState("general");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [groupId, setGroupId] = useState<string | null>(
    addExpenseContext.groupId ?? null
  );
  const [splitType, setSplitType] = useState<SplitType>("EQUAL");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSplitPanel, setShowSplitPanel] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPayerMenu, setShowPayerMenu] = useState(false);

  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>(
    addExpenseContext.friendId ? [addExpenseContext.friendId] : []
  );
  const [payerId, setPayerId] = useState(session?.user?.id ?? "");

  const currentUserId = session?.user?.id ?? "";
  const currentUserName = session?.user?.name ?? "You";

  const allParticipants: Participant[] = [
    { userId: currentUserId, name: currentUserName, included: true, amount: 0, shareValue: 1 },
    ...selectedFriendIds.map((fid) => {
      const f = friends.find((fr) => fr.id === fid);
      return { userId: fid, name: f?.name ?? "Unknown", included: true, amount: 0, shareValue: 1 };
    }),
  ];

  const [participants, setParticipants] = useState<Participant[]>(allParticipants);

  const updateParticipants = useCallback(
    (friendIds: string[]) => {
      setSelectedFriendIds(friendIds);
      setParticipants([
        { userId: currentUserId, name: currentUserName, included: true, amount: 0, shareValue: 1 },
        ...friendIds.map((fid) => {
          const f = friends.find((fr) => fr.id === fid);
          return { userId: fid, name: f?.name ?? "Unknown", included: true, amount: 0, shareValue: 1 };
        }),
      ]);
    },
    [currentUserId, currentUserName, friends]
  );

  const toggleFriend = (friendId: string) => {
    const next = selectedFriendIds.includes(friendId)
      ? selectedFriendIds.filter((id) => id !== friendId)
      : [...selectedFriendIds, friendId];
    updateParticipants(next);
  };

  const computeShares = () => {
    const total = parseFloat(amount) || 0;
    const included = participants.filter((p) => p.included);
    if (splitType === "EQUAL") {
      const share = total / (included.length || 1);
      return included.map((p) => ({ ...p, amount: share }));
    }
    if (splitType === "SHARES") {
      const totalShares = included.reduce((s, p) => s + p.shareValue, 0);
      return included.map((p) => ({
        ...p, amount: totalShares > 0 ? (p.shareValue / totalShares) * total : 0,
      }));
    }
    if (splitType === "PERCENTAGE") {
      return included.map((p) => ({ ...p, amount: (p.shareValue / 100) * total }));
    }
    return included;
  };

  const handleSave = async () => {
    if (!description.trim() || !amount || parseFloat(amount) <= 0) return;
    if (selectedFriendIds.length === 0) return;
    setSaving(true);
    const total = parseFloat(amount);
    const shares = computeShares();
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description, amount: total, currency, category, date, groupId,
          notes: notes || undefined, splitType,
          payers: [{ userId: payerId || currentUserId, amount: total }],
          shares: shares.map((s) => ({
            userId: s.userId, amount: Math.round(s.amount * 100) / 100, shareValue: s.shareValue,
          })),
          isRecurring, recurringInterval: isRecurring ? recurringInterval : null,
        }),
      });
      if (res.ok) { closeAddExpense(); resetForm(); window.location.reload(); }
    } finally { setSaving(false); }
  };

  const resetForm = () => {
    setDescription(""); setAmount(""); setCategory("general"); setNotes("");
    setShowNotes(false); setSplitType("EQUAL"); setSelectedFriendIds([]);
    setIsRecurring(false);
  };

  // Derived
  const isValid = description.trim().length > 0 && !!amount && parseFloat(amount) > 0 && selectedFriendIds.length > 0;
  const catInfo = findSubcategory(category);
  const catIcon = catInfo?.subcategory.icon ?? "📄";
  const payerName = payerId === currentUserId ? t("expense.you") : friends.find((f) => f.id === payerId)?.name ?? "?";

  // Close payer menu on outside click
  const payerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showPayerMenu) return;
    const h = (e: MouseEvent) => {
      if (payerRef.current && !payerRef.current.contains(e.target as Node)) setShowPayerMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showPayerMenu]);

  const descRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isAddExpenseOpen) setTimeout(() => descRef.current?.focus(), 100);
  }, [isAddExpenseOpen]);

  if (!isAddExpenseOpen) return null;

  const perPerson = selectedFriendIds.length > 0
    ? (parseFloat(amount) || 0) / (selectedFriendIds.length + 1)
    : 0;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
      onClick={(e) => { if (e.target === e.currentTarget) closeAddExpense(); }}
    >
      <div className="bg-white w-full sm:max-w-[440px] sm:rounded-2xl rounded-t-2xl shadow-[var(--shadow-elevated)] max-h-[90vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <button onClick={closeAddExpense} className="text-sm text-[var(--color-primary)] font-medium py-1 px-1">
            {t("expense.cancel")}
          </button>
          <h2 className="font-semibold text-[15px] text-[var(--color-text)]">
            {t("expense.addExpense")}
          </h2>
          <button
            onClick={handleSave}
            disabled={saving || !isValid}
            className="text-sm text-[var(--color-primary)] font-semibold py-1 px-1 disabled:opacity-30 disabled:cursor-default"
          >
            {saving ? "..." : t("expense.save")}
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* 1. Description — first, because you think "what" before "how much" */}
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                className="w-10 h-10 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center text-xl hover:border-[var(--color-primary)] transition-colors shrink-0"
              >
                {catIcon}
              </button>
              <input
                ref={descRef}
                type="text"
                placeholder="What's this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex-1 text-base text-[var(--color-text)] bg-transparent border-none outline-none placeholder:text-[var(--color-text-tertiary)]"
              />
            </div>
            {showCategoryPicker && (
              <div className="mt-3">
                <CategoryPicker selected={category} onSelect={(c) => { setCategory(c); setShowCategoryPicker(false); }} />
              </div>
            )}
          </div>

          {/* 2. Amount — big and clear */}
          <div className="px-4 pb-4">
            <div className="bg-[var(--color-bg)] rounded-2xl px-4 py-5 flex items-center justify-center gap-2">
              <button
                onClick={() => setShowCurrencyPicker(true)}
                className="text-2xl text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)] transition-colors font-light"
              >
                {getCurrencySymbol(currency)}
              </button>
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
          </div>

          {/* 3. People — who's splitting */}
          <div className="px-4 pb-3">
            <p className="text-xs font-medium text-[var(--color-text-tertiary)] mb-2">
              {t("expense.withYouAnd")}
            </p>
            <div className="flex flex-wrap gap-2">
              {friends.map((f) => {
                const selected = selectedFriendIds.includes(f.id);
                return (
                  <button
                    key={f.id}
                    onClick={() => toggleFriend(f.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all duration-150",
                      selected
                        ? "bg-[var(--color-primary)] text-white border-transparent"
                        : "bg-white text-[var(--color-text)] border-[var(--color-border-strong)] hover:border-[var(--color-primary)]"
                    )}
                  >
                    {selected && <Check size={14} />}
                    {f.name}
                  </button>
                );
              })}
              {friends.length === 0 && (
                <p className="text-sm text-[var(--color-text-tertiary)] italic">No friends added yet</p>
              )}
            </div>
          </div>

          {/* 4. Split line — Paid by / split */}
          <div className="px-4 py-3 border-t border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
                <span>{t("expense.paidBy")}</span>
                <div className="relative" ref={payerRef}>
                  <button
                    onClick={() => setShowPayerMenu(!showPayerMenu)}
                    className="inline-flex items-center gap-0.5 font-medium text-[var(--color-primary)] px-1.5 py-0.5 rounded-md hover:bg-[var(--color-primary-light)] transition-colors"
                  >
                    {payerName} <ChevronDown size={13} />
                  </button>
                  {showPayerMenu && (
                    <div className="absolute top-full left-0 mt-1 z-10 bg-white rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-elevated)] py-1 min-w-[140px]">
                      <button
                        onClick={() => { setPayerId(currentUserId); setShowPayerMenu(false); }}
                        className={cn("w-full text-start px-3 py-2 text-sm hover:bg-[var(--color-hover)]", payerId === currentUserId && "text-[var(--color-primary)] font-medium")}
                      >{t("expense.you")}</button>
                      {selectedFriendIds.map((fid) => {
                        const f = friends.find((fr) => fr.id === fid);
                        return (
                          <button key={fid}
                            onClick={() => { setPayerId(fid); setShowPayerMenu(false); }}
                            className={cn("w-full text-start px-3 py-2 text-sm hover:bg-[var(--color-hover)]", payerId === fid && "text-[var(--color-primary)] font-medium")}
                          >{f?.name}</button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <span>{t("expense.split")}</span>
                <button
                  onClick={() => setShowSplitPanel(!showSplitPanel)}
                  className="inline-flex items-center gap-0.5 font-medium text-[var(--color-primary)] px-1.5 py-0.5 rounded-md hover:bg-[var(--color-primary-light)] transition-colors"
                >
                  {t("expense.equally")} <ChevronDown size={13} />
                </button>
              </div>
              {perPerson > 0 && (
                <span className="text-xs text-[var(--color-text-tertiary)]">
                  ${perPerson.toFixed(2)}/person
                </span>
              )}
            </div>

            {showSplitPanel && (
              <div className="mt-3">
                <SplitOptionsPanel
                  participants={participants} setParticipants={setParticipants}
                  splitType={splitType} setSplitType={setSplitType}
                  totalAmount={parseFloat(amount) || 0} onClose={() => setShowSplitPanel(false)}
                />
              </div>
            )}
          </div>

          {/* 5. Group + Date — visible, not hidden */}
          <div className="px-4 py-3 border-t border-[var(--color-border)] space-y-2">
            <div className="flex gap-2">
              <select
                value={groupId ?? ""}
                onChange={(e) => setGroupId(e.target.value || null)}
                className="flex-1 text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-[var(--color-text)] appearance-none cursor-pointer"
              >
                <option value="">{t("expense.noGroup")}</option>
                {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-[var(--color-text)]"
              />
            </div>

            {/* Notes (always visible as a small link) */}
            {!showNotes ? (
              <button
                onClick={() => setShowNotes(true)}
                className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)] transition-colors"
              >
                + Add notes
              </button>
            ) : (
              <textarea
                placeholder={t("expense.notes")}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
              />
            )}
          </div>
        </div>

        {/* ── Footer — big save button ── */}
        <div className="px-4 py-3 border-t border-[var(--color-border)] bg-white sm:rounded-b-2xl">
          <button
            onClick={handleSave}
            disabled={saving || !isValid}
            className={cn(
              "w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200",
              "bg-[var(--color-primary)] text-white",
              "hover:bg-[var(--color-primary-hover)]",
              "disabled:opacity-30 disabled:cursor-not-allowed",
              "active:scale-[0.98]"
            )}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : selectedFriendIds.length > 0 && amount ? (
              `${t("expense.save")} — ${getCurrencySymbol(currency)}${parseFloat(amount).toFixed(2)} split ${selectedFriendIds.length + 1} ways`
            ) : (
              t("expense.save")
            )}
          </button>
        </div>
      </div>

      {showCurrencyPicker && (
        <CurrencyPicker selected={currency} onSelect={(code) => setCurrency(code)} onClose={() => setShowCurrencyPicker(false)} />
      )}
    </div>
  );
}
