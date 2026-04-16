"use client";

import { useTranslations } from "next-intl";
import { useAppStore } from "@/stores/app-store";
import { useSession } from "next-auth/react";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  X,
  ChevronDown,
  ChevronRight,
  Calendar,
  Users,
  Repeat,
  StickyNote,
  FolderOpen,
} from "lucide-react";
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

/* ---------- helpers ---------- */

function getInitial(name: string) {
  return name.charAt(0).toUpperCase();
}

function formatDateNice(iso: string) {
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

/* ============================= */
/*        AddExpenseModal        */
/* ============================= */
export default function AddExpenseModal() {
  const t = useTranslations();
  const { data: session } = useSession();
  const { isAddExpenseOpen, closeAddExpense, friends, groups, addExpenseContext } =
    useAppStore();

  /* ---- form state (unchanged business logic) ---- */
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

  /* UI-only state */
  const [moreOpen, setMoreOpen] = useState(false);
  const [showPayerMenu, setShowPayerMenu] = useState(false);

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

  /* ---- derived helpers ---- */
  const isValid =
    description.trim().length > 0 &&
    !!amount &&
    parseFloat(amount) > 0 &&
    selectedFriendIds.length > 0;

  const categoryInfo = useMemo(() => findSubcategory(category), [category]);
  const categoryIcon = categoryInfo?.subcategory.icon ?? "📄";

  const payerName =
    payerId === currentUserId
      ? t("expense.you")
      : friends.find((f) => f.id === payerId)?.name ?? "?";

  const splitLabel = (() => {
    switch (splitType) {
      case "EQUAL":
        return t("expense.equally");
      case "EXACT":
        return "exact amounts";
      case "PERCENTAGE":
        return "by %";
      case "SHARES":
        return "by shares";
      case "ADJUSTMENT":
        return "with adjustments";
      default:
        return t("expense.equally");
    }
  })();

  /* close payer menu on outside click */
  const payerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showPayerMenu) return;
    const handler = (e: MouseEvent) => {
      if (payerRef.current && !payerRef.current.contains(e.target as Node)) {
        setShowPayerMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPayerMenu]);

  /* hidden native date input ref */
  const dateInputRef = useRef<HTMLInputElement>(null);

  if (!isAddExpenseOpen) return null;

  /* ============================= */
  /*           RENDER              */
  /* ============================= */
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div
        className={cn(
          "bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl",
          "shadow-[var(--shadow-elevated)] border border-[var(--color-border)]",
          "max-h-[92vh] flex flex-col",
          "transition-transform duration-300 ease-out"
        )}
      >
        {/* ========== HEADER ========== */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-border)] shrink-0">
          <button
            onClick={closeAddExpense}
            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors py-1"
          >
            {t("expense.cancel")}
          </button>
          <h2 className="font-semibold text-[15px] text-[var(--color-text)] tracking-tight">
            {t("expense.addExpense")}
          </h2>
          <button
            onClick={closeAddExpense}
            className="p-1.5 rounded-full hover:bg-[var(--color-hover)] text-[var(--color-text-tertiary)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ========== SCROLLABLE BODY ========== */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* -------- Section 1: People -------- */}
          <div className="px-5 pt-4 pb-3">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Users size={13} className="text-[var(--color-text-tertiary)]" />
              <span className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                {t("expense.withYouAnd")}
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
              {friends.length === 0 && (
                <span className="text-sm text-[var(--color-text-tertiary)] italic py-2">
                  No friends added yet
                </span>
              )}
              {friends.map((f) => {
                const selected = selectedFriendIds.includes(f.id);
                return (
                  <button
                    key={f.id}
                    onClick={() => toggleFriend(f.id)}
                    className={cn(
                      "flex items-center gap-2 shrink-0 pl-1 pr-3.5 py-1.5 rounded-full text-sm",
                      "border transition-all duration-200 cursor-pointer",
                      "hover:shadow-sm active:scale-[0.97]",
                      selected
                        ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-[0_1px_4px_var(--color-primary-shadow)]"
                        : "bg-white text-[var(--color-text)] border-[var(--color-border-strong)] hover:border-[var(--color-primary)]"
                    )}
                  >
                    {/* Avatar circle */}
                    <span
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
                        "transition-colors duration-200",
                        selected
                          ? "bg-white/25 text-white"
                          : "bg-[var(--color-bg)] text-[var(--color-text-secondary)]"
                      )}
                    >
                      {getInitial(f.name)}
                    </span>
                    <span className="font-medium">{f.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mx-5 border-b border-[var(--color-border)]" />

          {/* -------- Section 2: Amount + Description -------- */}
          <div className="px-5 pt-5 pb-4">
            {/* Amount hero */}
            <div className="flex items-center justify-center gap-1 mb-5">
              <button
                onClick={() => setShowCurrencyPicker(true)}
                className={cn(
                  "text-3xl font-light text-[var(--color-text-tertiary)]",
                  "hover:text-[var(--color-primary)] transition-colors cursor-pointer",
                  "pr-1"
                )}
                title="Change currency"
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
                  "text-4xl font-semibold text-center text-[var(--color-text)]",
                  "bg-transparent border-none outline-none",
                  "w-48 placeholder:text-[var(--color-text-tertiary)]/40",
                  "caret-[var(--color-primary)]",
                  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                )}
              />
            </div>
            {/* Underline accent */}
            <div className="mx-auto w-32 h-[2px] rounded-full bg-[var(--color-border-strong)] mb-5 transition-colors"
              style={{
                backgroundColor: amount ? "var(--color-primary)" : undefined,
                opacity: amount ? 0.4 : 1,
              }}
            />

            {/* Description row */}
            <div className="flex items-center gap-2.5">
              {/* Category pill */}
              <button
                onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm",
                  "border border-[var(--color-border-strong)] bg-white",
                  "hover:bg-[var(--color-hover)] hover:border-[var(--color-primary)]",
                  "transition-all duration-200 cursor-pointer",
                  "active:scale-[0.97]"
                )}
              >
                <span className="text-base leading-none">{categoryIcon}</span>
                <ChevronDown size={12} className="text-[var(--color-text-tertiary)]" />
              </button>

              {/* Description input */}
              <input
                type="text"
                placeholder={t("expense.description") || "What's this for?"}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={cn(
                  "flex-1 text-[15px] text-[var(--color-text)]",
                  "bg-[var(--color-bg)] rounded-xl px-3.5 py-2.5",
                  "border border-transparent",
                  "focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20",
                  "placeholder:text-[var(--color-text-tertiary)]",
                  "transition-all duration-200"
                )}
              />
            </div>

            {/* Category picker dropdown */}
            {showCategoryPicker && (
              <div className="mt-2.5">
                <CategoryPicker
                  selected={category}
                  onSelect={(cat) => {
                    setCategory(cat);
                    setShowCategoryPicker(false);
                  }}
                />
              </div>
            )}
          </div>

          <div className="mx-5 border-b border-[var(--color-border)]" />

          {/* -------- Section 3: Split sentence -------- */}
          <div className="px-5 py-3.5">
            <div className="flex items-center justify-center gap-1 text-sm text-[var(--color-text-secondary)] flex-wrap">
              <span>{t("expense.paidBy")}</span>

              {/* Payer dropdown trigger */}
              <div className="relative" ref={payerRef}>
                <button
                  onClick={() => setShowPayerMenu(!showPayerMenu)}
                  className={cn(
                    "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg",
                    "font-medium text-[var(--color-primary)]",
                    "hover:bg-[var(--color-primary-light)] transition-colors duration-150",
                    "cursor-pointer"
                  )}
                >
                  {payerName}
                  <ChevronDown size={13} />
                </button>

                {/* Payer dropdown menu */}
                {showPayerMenu && (
                  <div
                    className={cn(
                      "absolute top-full left-1/2 -translate-x-1/2 mt-1 z-10",
                      "bg-white rounded-xl border border-[var(--color-border)]",
                      "shadow-[var(--shadow-elevated)] py-1 min-w-[140px]",
                      "animate-in fade-in slide-in-from-top-1 duration-150"
                    )}
                  >
                    <button
                      onClick={() => {
                        setPayerId(currentUserId);
                        setShowPayerMenu(false);
                      }}
                      className={cn(
                        "w-full text-start px-3.5 py-2 text-sm transition-colors",
                        "hover:bg-[var(--color-hover)]",
                        payerId === currentUserId && "text-[var(--color-primary)] font-medium"
                      )}
                    >
                      {t("expense.you")}
                    </button>
                    {selectedFriendIds.map((fid) => {
                      const f = friends.find((fr) => fr.id === fid);
                      return (
                        <button
                          key={fid}
                          onClick={() => {
                            setPayerId(fid);
                            setShowPayerMenu(false);
                          }}
                          className={cn(
                            "w-full text-start px-3.5 py-2 text-sm transition-colors",
                            "hover:bg-[var(--color-hover)]",
                            payerId === fid && "text-[var(--color-primary)] font-medium"
                          )}
                        >
                          {f?.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <span>{t("expense.split")}</span>

              {/* Split dropdown trigger */}
              <button
                onClick={() => setShowSplitPanel(!showSplitPanel)}
                className={cn(
                  "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg",
                  "font-medium text-[var(--color-primary)]",
                  "hover:bg-[var(--color-primary-light)] transition-colors duration-150",
                  "cursor-pointer"
                )}
              >
                {splitLabel}
                <ChevronDown size={13} />
              </button>
            </div>

            {/* Split panel */}
            {showSplitPanel && (
              <div className="mt-3">
                <SplitOptionsPanel
                  participants={participants}
                  setParticipants={setParticipants}
                  splitType={splitType}
                  setSplitType={setSplitType}
                  totalAmount={parseFloat(amount) || 0}
                  onClose={() => setShowSplitPanel(false)}
                />
              </div>
            )}
          </div>

          <div className="mx-5 border-b border-[var(--color-border)]" />

          {/* -------- Section 4: More options (collapsible) -------- */}
          <div className="px-5 py-2">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={cn(
                "w-full flex items-center justify-between py-2.5",
                "text-sm text-[var(--color-text-secondary)]",
                "hover:text-[var(--color-text)] transition-colors duration-150",
                "cursor-pointer select-none"
              )}
            >
              <span className="font-medium">More options</span>
              <ChevronRight
                size={16}
                className={cn(
                  "transition-transform duration-200",
                  moreOpen && "rotate-90"
                )}
              />
            </button>

            <div
              className={cn(
                "grid transition-all duration-250 ease-out",
                moreOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <div className="space-y-3 pb-3">
                  {/* Date picker */}
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-2.5 rounded-xl",
                      "bg-[var(--color-bg)] cursor-pointer",
                      "hover:bg-[var(--color-hover)] transition-colors"
                    )}
                    onClick={() => dateInputRef.current?.showPicker?.()}
                  >
                    <Calendar size={16} className="text-[var(--color-text-tertiary)] shrink-0" />
                    <span className="text-sm text-[var(--color-text)] flex-1">
                      {formatDateNice(date)}
                    </span>
                    <input
                      ref={dateInputRef}
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="sr-only"
                      tabIndex={-1}
                    />
                    <ChevronDown size={14} className="text-[var(--color-text-tertiary)]" />
                  </div>

                  {/* Group selector */}
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-2.5 rounded-xl",
                      "bg-[var(--color-bg)]"
                    )}
                  >
                    <FolderOpen size={16} className="text-[var(--color-text-tertiary)] shrink-0" />
                    <select
                      value={groupId ?? ""}
                      onChange={(e) => setGroupId(e.target.value || null)}
                      className={cn(
                        "flex-1 text-sm bg-transparent border-none outline-none",
                        "text-[var(--color-text)] cursor-pointer",
                        "appearance-none"
                      )}
                    >
                      <option value="">{t("expense.noGroup")}</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="text-[var(--color-text-tertiary)]" />
                  </div>

                  {/* Notes toggle + field */}
                  <div>
                    <button
                      onClick={() => setShowNotes(!showNotes)}
                      className={cn(
                        "flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl",
                        "bg-[var(--color-bg)]",
                        "hover:bg-[var(--color-hover)] transition-colors",
                        "cursor-pointer"
                      )}
                    >
                      <StickyNote size={16} className="text-[var(--color-text-tertiary)] shrink-0" />
                      <span className="text-sm text-[var(--color-text)] flex-1 text-start">
                        {t("expense.addImageNotes")}
                      </span>
                      <ChevronRight
                        size={14}
                        className={cn(
                          "text-[var(--color-text-tertiary)] transition-transform duration-150",
                          showNotes && "rotate-90"
                        )}
                      />
                    </button>
                    {showNotes && (
                      <textarea
                        placeholder={t("expense.notes")}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className={cn(
                          "w-full mt-2 px-3.5 py-2.5 text-sm rounded-xl",
                          "bg-[var(--color-bg)] border border-[var(--color-border-strong)]",
                          "text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)]",
                          "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20",
                          "focus:border-[var(--color-primary)]",
                          "transition-all duration-200 resize-none"
                        )}
                      />
                    )}
                  </div>

                  {/* Recurring toggle */}
                  <div className="space-y-2">
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-2.5 rounded-xl",
                        "bg-[var(--color-bg)]"
                      )}
                    >
                      <Repeat size={16} className="text-[var(--color-text-tertiary)] shrink-0" />
                      <span className="text-sm text-[var(--color-text)] flex-1">
                        {t("expense.repeat")}
                      </span>
                      {/* Toggle switch */}
                      <button
                        role="switch"
                        aria-checked={isRecurring}
                        onClick={() => setIsRecurring(!isRecurring)}
                        className={cn(
                          "relative w-[42px] h-[26px] rounded-full transition-colors duration-200 cursor-pointer shrink-0",
                          isRecurring
                            ? "bg-[var(--color-primary)]"
                            : "bg-[var(--color-border-strong)]"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-[3px] left-[3px] w-5 h-5 rounded-full bg-white",
                            "shadow-[0_1px_3px_rgba(0,0,0,0.15)]",
                            "transition-transform duration-200 ease-out",
                            isRecurring && "translate-x-[16px]"
                          )}
                        />
                      </button>
                    </div>

                    {/* Interval selector (when recurring on) */}
                    {isRecurring && (
                      <div className="flex gap-2 px-3.5">
                        {(
                          [
                            { value: "WEEKLY", label: t("common.weekly") },
                            { value: "BIWEEKLY", label: t("common.biweekly") },
                            { value: "MONTHLY", label: t("common.monthly") },
                            { value: "YEARLY", label: t("common.yearly") },
                          ] as const
                        ).map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setRecurringInterval(opt.value)}
                            className={cn(
                              "flex-1 py-1.5 rounded-lg text-xs font-medium text-center",
                              "transition-all duration-200 cursor-pointer",
                              recurringInterval === opt.value
                                ? "bg-[var(--color-primary)] text-white shadow-sm"
                                : "bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] border border-[var(--color-border)]"
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== FOOTER ========== */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[var(--color-border)] shrink-0 bg-white sm:rounded-b-2xl">
          <button
            onClick={closeAddExpense}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-xl",
              "text-[var(--color-text-secondary)]",
              "hover:bg-[var(--color-hover)] transition-colors duration-150"
            )}
          >
            {t("expense.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !isValid}
            className={cn(
              "px-6 py-2.5 text-sm font-semibold rounded-xl",
              "bg-[var(--color-primary)] text-white",
              "hover:bg-[var(--color-primary-hover)]",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "active:scale-[0.98]",
              "shadow-[0_1px_3px_var(--color-primary-shadow)]",
              "transition-all duration-200"
            )}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t("expense.save")}
              </span>
            ) : (
              t("expense.save")
            )}
          </button>
        </div>
      </div>

      {/* Currency picker overlay */}
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
