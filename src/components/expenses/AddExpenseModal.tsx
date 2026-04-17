"use client";

import { useTranslations } from "next-intl";
import { useAppStore } from "@/stores/app-store";
import { useSession } from "next-auth/react";
import { useState, useCallback, useRef, useEffect } from "react";
import { X, ChevronDown, Check, Search } from "lucide-react";
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
  const [groupId, setGroupId] = useState<string | null>(null);
  const [splitType, setSplitType] = useState<SplitType>("EQUAL");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSplitPanel, setShowSplitPanel] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPayerMenu, setShowPayerMenu] = useState(false);
  const [friendSearch, setFriendSearch] = useState("");

  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [payerId, setPayerId] = useState(session?.user?.id ?? "");

  const currentUserId = session?.user?.id ?? "";
  const currentUserName = session?.user?.name ?? "You";

  // Refs for click-outside
  const payerRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLInputElement>(null);

  // ── Reset form completely ──
  const resetForm = useCallback(() => {
    setDescription(""); setAmount(""); setCategory("general"); setNotes("");
    setSplitType("EQUAL"); setSelectedFriendIds([]); setFriendSearch("");
    setGroupId(null); setShowCategoryPicker(false); setShowSplitPanel(false);
    setShowPayerMenu(false); setShowCurrencyPicker(false);
    setPayerId(session?.user?.id ?? "");
    setDate(new Date().toISOString().split("T")[0]);
  }, [session?.user?.id]);

  // ── Initialize from context when modal opens ──
  useEffect(() => {
    if (isAddExpenseOpen) {
      resetForm();
      if (addExpenseContext.friendId) setSelectedFriendIds([addExpenseContext.friendId]);
      if (addExpenseContext.groupId) setGroupId(addExpenseContext.groupId);
      setTimeout(() => descRef.current?.focus(), 150);
    }
  }, [isAddExpenseOpen, addExpenseContext, resetForm]);

  // ── Close modal and reset ──
  const handleClose = () => {
    closeAddExpense();
    resetForm();
  };

  // ── Click-outside handlers ──
  useEffect(() => {
    if (!showPayerMenu && !showCategoryPicker && !showSplitPanel) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (showPayerMenu && payerRef.current && !payerRef.current.contains(target)) {
        setShowPayerMenu(false);
      }
      if (showCategoryPicker && categoryRef.current && !categoryRef.current.contains(target)) {
        setShowCategoryPicker(false);
      }
      if (showSplitPanel && splitRef.current && !splitRef.current.contains(target)) {
        setShowSplitPanel(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPayerMenu, showCategoryPicker, showSplitPanel]);

  // ── Participants ──
  const [participants, setParticipants] = useState<Participant[]>([]);

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

  // ── Compute shares ──
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

  // ── Save ──
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
        }),
      });
      if (res.ok) { handleClose(); window.location.reload(); }
    } finally { setSaving(false); }
  };

  // ── Derived ──
  const isValid = description.trim().length > 0 && !!amount && parseFloat(amount) > 0 && selectedFriendIds.length > 0;
  const catInfo = findSubcategory(category);
  const catIcon = catInfo?.subcategory.icon ?? "📄";
  const payerName = payerId === currentUserId ? t("expense.you") : friends.find((f) => f.id === payerId)?.name ?? "?";
  const perPerson = selectedFriendIds.length > 0 ? (parseFloat(amount) || 0) / (selectedFriendIds.length + 1) : 0;

  // Filter friends by search
  const filteredFriends = friendSearch.trim()
    ? friends.filter((f) => f.name.toLowerCase().includes(friendSearch.toLowerCase()))
    : friends;

  if (!isAddExpenseOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-[var(--color-surface)] w-full sm:max-w-[440px] sm:rounded-2xl rounded-t-2xl shadow-[var(--shadow-elevated)] max-h-[90vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <button onClick={handleClose} className="text-sm text-[var(--color-primary)] font-medium py-1 px-1">
            {t("expense.cancel")}
          </button>
          <h2 className="font-semibold text-[15px] text-[var(--color-text)]">{t("expense.addExpense")}</h2>
          <button
            onClick={handleSave}
            disabled={saving || !isValid}
            className="text-sm text-[var(--color-primary)] font-semibold py-1 px-1 disabled:opacity-30"
          >
            {saving ? "..." : t("expense.save")}
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* 1. Description + Category */}
          <div className="px-4 pt-4 pb-3" ref={categoryRef}>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => { setShowCategoryPicker(!showCategoryPicker); setShowSplitPanel(false); }}
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
                onFocus={() => { setShowCategoryPicker(false); setShowSplitPanel(false); }}
                className="flex-1 text-base text-[var(--color-text)] bg-transparent border-none outline-none placeholder:text-[var(--color-text-tertiary)]"
              />
            </div>
            {showCategoryPicker && (
              <div className="mt-3">
                <CategoryPicker selected={category} onSelect={(c) => { setCategory(c); setShowCategoryPicker(false); }} />
              </div>
            )}
          </div>

          {/* 2. Amount — clear bg card with clickable currency */}
          <div className="px-4 pb-4">
            <div className="bg-[var(--color-bg)] rounded-2xl px-4 py-5 flex items-center justify-center gap-1">
              <button
                onClick={() => setShowCurrencyPicker(true)}
                className="flex items-center gap-0.5 text-2xl text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)] transition-colors font-light border border-[var(--color-border)] rounded-lg px-2 py-0.5"
                title="Change currency"
              >
                {getCurrencySymbol(currency)}
                <ChevronDown size={14} className="text-[var(--color-text-tertiary)]" />
              </button>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onFocus={() => { setShowCategoryPicker(false); setShowSplitPanel(false); }}
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

          {/* 3. People — top 3 + selected + search */}
          <div className="px-4 pb-3">
            <p className="text-xs font-medium text-[var(--color-text-tertiary)] mb-2">
              {t("expense.withYouAnd")}
            </p>

            {/* Selected friends (always shown) */}
            {selectedFriendIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedFriendIds.map((fid) => {
                  const f = friends.find((fr) => fr.id === fid);
                  if (!f) return null;
                  return (
                    <button key={fid} onClick={() => toggleFriend(fid)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-[var(--color-primary)] text-white border border-transparent transition-all duration-150"
                    >
                      <Check size={14} /> {f.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Top 3 unselected friends (quick picks) */}
            {(() => {
              const unselected = friends.filter((f) => !selectedFriendIds.includes(f.id));
              const topFriends = friendSearch ? [] : unselected.slice(0, 3);
              return topFriends.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {topFriends.map((f) => (
                    <button key={f.id} onClick={() => toggleFriend(f.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border-strong)] hover:border-[var(--color-primary)] transition-all duration-150"
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              );
            })()}

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
              <input
                type="text"
                placeholder="Search friends..."
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
                onFocus={() => { setShowCategoryPicker(false); setShowSplitPanel(false); }}
                className="w-full ps-8 pe-3 py-2 text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            {/* Search results */}
            {friendSearch && (
              <div className="mt-2 flex flex-wrap gap-2">
                {filteredFriends.filter((f) => !selectedFriendIds.includes(f.id)).map((f) => (
                  <button key={f.id} onClick={() => { toggleFriend(f.id); setFriendSearch(""); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border-strong)] hover:border-[var(--color-primary)] transition-all duration-150"
                  >
                    {f.name}
                  </button>
                ))}
                {filteredFriends.filter((f) => !selectedFriendIds.includes(f.id)).length === 0 && (
                  <p className="text-sm text-[var(--color-text-tertiary)] italic py-1">
                    No friends matching &quot;{friendSearch}&quot;
                  </p>
                )}
              </div>
            )}

            {friends.length === 0 && (
              <p className="text-sm text-[var(--color-text-tertiary)] italic mt-2">No friends added yet</p>
            )}
          </div>

          {/* 4. Split line — only show when friends are selected */}
          {selectedFriendIds.length > 0 && (
            <div className="px-4 py-3 border-t border-[var(--color-border)]" ref={splitRef}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] flex-wrap">
                  <span>{t("expense.paidBy")}</span>
                  <div className="relative" ref={payerRef}>
                    <button
                      onClick={() => { setShowPayerMenu(!showPayerMenu); setShowCategoryPicker(false); setShowSplitPanel(false); }}
                      className="inline-flex items-center gap-0.5 font-medium text-[var(--color-primary)] px-1.5 py-0.5 rounded-md hover:bg-[var(--color-primary-light)] transition-colors"
                    >
                      {payerName} <ChevronDown size={13} />
                    </button>
                    {showPayerMenu && (
                      <div className="absolute top-full start-0 mt-1 z-10 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-elevated)] py-1 min-w-[140px]">
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
                    onClick={() => { setShowSplitPanel(!showSplitPanel); setShowCategoryPicker(false); setShowPayerMenu(false); }}
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
                    totalAmount={parseFloat(amount) || 0}
                  />
                </div>
              )}
            </div>
          )}

          {/* 5. Group + Date + Notes — always visible */}
          <div className="px-4 py-3 border-t border-[var(--color-border)] space-y-2.5">
            <div className="flex gap-2">
              <select
                value={groupId ?? ""}
                onChange={(e) => setGroupId(e.target.value || null)}
                onFocus={() => { setShowCategoryPicker(false); setShowSplitPanel(false); }}
                className="flex-1 text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-[var(--color-text)] cursor-pointer appearance-none bg-[length:16px] bg-no-repeat bg-[position:right_12px_center] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2386868B%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]"
              >
                <option value="">{t("expense.noGroup")}</option>
                {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onFocus={() => { setShowCategoryPicker(false); setShowSplitPanel(false); }}
                className="text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-[var(--color-text)]"
              />
            </div>

            {/* Notes — always visible as a single-line textarea */}
            <textarea
              placeholder={t("expense.notes") || "Add a note..."}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onFocus={() => { setShowCategoryPicker(false); setShowSplitPanel(false); }}
              rows={1}
              className="w-full text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
            />
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] sm:rounded-b-2xl">
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
