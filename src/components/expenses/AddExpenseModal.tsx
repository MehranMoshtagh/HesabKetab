"use client";

import { useTranslations } from "next-intl";
import { useAppStore } from "@/stores/app-store";
import { useSession } from "next-auth/react";
import { useState, useCallback } from "react";
import { X, Calendar, Image, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import CategoryPicker from "@/components/shared/CategoryPicker";
import CurrencyPicker from "@/components/shared/CurrencyPicker";
import SplitOptionsPanel from "./SplitOptionsPanel";
import { getCurrencySymbol } from "@/lib/currencies";

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
  const [showNotes, setShowNotes] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSplitPanel, setShowSplitPanel] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>(
    addExpenseContext.friendId ? [addExpenseContext.friendId] : []
  );

  const [payerId, setPayerId] = useState(session?.user?.id ?? "");

  const currentUserId = session?.user?.id ?? "";
  const currentUserName = session?.user?.name ?? "You";

  const allParticipants: Participant[] = [
    {
      userId: currentUserId,
      name: currentUserName,
      included: true,
      amount: 0,
      shareValue: 1,
    },
    ...selectedFriendIds.map((fid) => {
      const f = friends.find((fr) => fr.id === fid);
      return {
        userId: fid,
        name: f?.name ?? "Unknown",
        included: true,
        amount: 0,
        shareValue: 1,
      };
    }),
  ];

  const [participants, setParticipants] =
    useState<Participant[]>(allParticipants);

  const updateParticipants = useCallback(
    (friendIds: string[]) => {
      setSelectedFriendIds(friendIds);
      const newParticipants: Participant[] = [
        {
          userId: currentUserId,
          name: currentUserName,
          included: true,
          amount: 0,
          shareValue: 1,
        },
        ...friendIds.map((fid) => {
          const f = friends.find((fr) => fr.id === fid);
          return {
            userId: fid,
            name: f?.name ?? "Unknown",
            included: true,
            amount: 0,
            shareValue: 1,
          };
        }),
      ];
      setParticipants(newParticipants);
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
        ...p,
        amount: totalShares > 0 ? (p.shareValue / totalShares) * total : 0,
      }));
    }

    if (splitType === "PERCENTAGE") {
      return included.map((p) => ({
        ...p,
        amount: (p.shareValue / 100) * total,
      }));
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
          description,
          amount: total,
          currency,
          category,
          date,
          groupId,
          notes: notes || undefined,
          splitType,
          payers: [{ userId: payerId || currentUserId, amount: total }],
          shares: shares.map((s) => ({
            userId: s.userId,
            amount: Math.round(s.amount * 100) / 100,
            shareValue: s.shareValue,
          })),
          isRecurring,
          recurringInterval: isRecurring ? recurringInterval : null,
        }),
      });

      if (res.ok) {
        closeAddExpense();
        resetForm();
        window.location.reload();
      }
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setCategory("general");
    setNotes("");
    setShowNotes(false);
    setSplitType("EQUAL");
    setSelectedFriendIds([]);
    setIsRecurring(false);
  };

  if (!isAddExpenseOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-[var(--shadow-elevated)] border border-[rgba(0,0,0,0.06)] w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(0,0,0,0.06)]">
          <h2 className="font-semibold text-[var(--color-text)] tracking-tight">
            {t("expense.addExpense")}
          </h2>
          <button
            onClick={closeAddExpense}
            className="p-1 rounded-lg hover:bg-[rgba(0,0,0,0.04)] text-[var(--color-text-tertiary)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* With you and: */}
          <div>
            <label className="text-sm text-[var(--color-text-secondary)] mb-2 block">
              {t("expense.withYouAnd")}
            </label>
            <div className="flex flex-wrap gap-2">
              {friends.map((f) => (
                <button
                  key={f.id}
                  onClick={() => toggleFriend(f.id)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-sm border transition-all duration-200",
                    selectedFriendIds.includes(f.id)
                      ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                      : "bg-white text-[var(--color-text)] border-[rgba(0,0,0,0.12)] hover:border-[var(--color-primary)]"
                  )}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Description + Category */}
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setShowCategoryPicker(!showCategoryPicker)}
              className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl border border-[rgba(0,0,0,0.08)] hover:bg-[rgba(0,0,0,0.02)] transition-colors"
            >
              📄
            </button>
            <input
              type="text"
              placeholder={t("expense.description")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1 border border-[rgba(0,0,0,0.12)] rounded-xl px-3.5 py-2.5 text-sm bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all"
            />
          </div>

          {showCategoryPicker && (
            <CategoryPicker
              selected={category}
              onSelect={(cat) => {
                setCategory(cat);
                setShowCategoryPicker(false);
              }}
            />
          )}

          {/* Amount + Currency */}
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setShowCurrencyPicker(true)}
              className="px-3.5 py-2.5 border border-[rgba(0,0,0,0.12)] rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[rgba(0,0,0,0.02)] transition-colors"
            >
              {getCurrencySymbol(currency)}
            </button>
            <input
              type="number"
              placeholder={t("expense.amount")}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              className="flex-1 border border-[rgba(0,0,0,0.12)] rounded-xl px-3.5 py-2.5 text-2xl font-semibold text-center bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all"
            />
          </div>

          {/* Paid by / Split */}
          <div className="text-center text-sm text-[var(--color-text-secondary)]">
            {t("expense.paidBy")}{" "}
            <button
              onClick={() => {}}
              className="text-[var(--color-primary)] font-medium"
            >
              {payerId === currentUserId
                ? t("expense.you")
                : friends.find((f) => f.id === payerId)?.name}
            </button>{" "}
            {t("expense.split")}{" "}
            <button
              onClick={() => setShowSplitPanel(!showSplitPanel)}
              className="text-[var(--color-primary)] font-medium"
            >
              {t("expense.equally")}
            </button>
          </div>

          {showSplitPanel && (
            <SplitOptionsPanel
              participants={participants}
              setParticipants={setParticipants}
              splitType={splitType}
              setSplitType={setSplitType}
              totalAmount={parseFloat(amount) || 0}
              onClose={() => setShowSplitPanel(false)}
            />
          )}

          {/* Date */}
          <div className="flex items-center gap-2.5">
            <Calendar size={15} className="text-[var(--color-text-tertiary)]" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-[rgba(0,0,0,0.12)] rounded-xl px-3.5 py-2 text-sm bg-[var(--color-bg)]"
            />
          </div>

          {/* Group selector */}
          <select
            value={groupId ?? ""}
            onChange={(e) => setGroupId(e.target.value || null)}
            className="w-full border border-[rgba(0,0,0,0.12)] rounded-xl px-3.5 py-2.5 text-sm bg-[var(--color-bg)]"
          >
            <option value="">{t("expense.noGroup")}</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Notes toggle */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1.5 hover:text-[var(--color-primary)] transition-colors"
          >
            <Image size={14} />
            {t("expense.addImageNotes")}
          </button>

          {showNotes && (
            <textarea
              placeholder={t("expense.notes")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-[rgba(0,0,0,0.12)] rounded-xl px-3.5 py-2.5 text-sm h-20 bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all"
            />
          )}

          {/* Recurring */}
          <div className="flex items-center gap-2.5">
            <Repeat size={14} className="text-[var(--color-text-tertiary)]" />
            <label className="text-sm text-[var(--color-text-secondary)] flex items-center gap-2">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded"
              />
              {t("expense.repeat")}
            </label>
            {isRecurring && (
              <select
                value={recurringInterval ?? ""}
                onChange={(e) => setRecurringInterval(e.target.value)}
                className="border border-[rgba(0,0,0,0.12)] rounded-lg px-2.5 py-1.5 text-xs bg-[var(--color-bg)]"
              >
                <option value="WEEKLY">{t("common.weekly")}</option>
                <option value="BIWEEKLY">{t("common.biweekly")}</option>
                <option value="MONTHLY">{t("common.monthly")}</option>
                <option value="YEARLY">{t("common.yearly")}</option>
              </select>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2.5 px-5 py-4 border-t border-[rgba(0,0,0,0.06)]">
          <button
            onClick={closeAddExpense}
            className="px-5 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[rgba(0,0,0,0.04)] rounded-xl transition-colors"
          >
            {t("expense.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !description.trim() || !amount || selectedFriendIds.length === 0}
            className="px-5 py-2 text-sm bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-all duration-200"
          >
            {saving ? "..." : t("expense.save")}
          </button>
        </div>
      </div>

      {showCurrencyPicker && (
        <CurrencyPicker
          selected={currency}
          onSelect={(code) => setCurrency(code)}
          onClose={() => setShowCurrencyPicker(false)}
        />
      )}
    </div>
  );
}
