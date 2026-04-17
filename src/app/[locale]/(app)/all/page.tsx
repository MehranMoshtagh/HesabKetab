"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, HandCoins, ChevronDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";
import ExpenseListItem from "@/components/expenses/ExpenseListItem";
import MonthHeader from "@/components/expenses/MonthHeader";

interface ExpenseItem {
  id: string;
  description: string;
  amount: string;
  currency: string;
  category: string;
  date: string;
  isPayment: boolean;
  createdBy: { id: string; name: string };
  payers: { userId: string; amount: string; user: { id: string; name: string } }[];
  shares: { userId: string; amount: string; user: { id: string; name: string } }[];
  group: { id: string; name: string } | null;
  _count?: { comments: number };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AllExpensesPage() {
  const t = useTranslations();
  const { openAddExpense, openSettleUp, groups, friends } = useAppStore();
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterGroup, setFilterGroup] = useState("");
  const [filterFriend, setFilterFriend] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [showFriendPicker, setShowFriendPicker] = useState(false);
  const [friendFilterSearch, setFriendFilterSearch] = useState("");
  const groupPickerRef = useRef<HTMLDivElement>(null);
  const friendPickerRef = useRef<HTMLDivElement>(null);

  // Close pickers on outside click
  useEffect(() => {
    if (!showGroupPicker && !showFriendPicker) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (showGroupPicker && groupPickerRef.current && !groupPickerRef.current.contains(target)) setShowGroupPicker(false);
      if (showFriendPicker && friendPickerRef.current && !friendPickerRef.current.contains(target)) setShowFriendPicker(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showGroupPicker, showFriendPicker]);

  const fetchExpenses = useCallback((page: number, gId?: string, fId?: string, days?: string) => {
    setLoading(true);
    let url = `/api/expenses?page=${page}&limit=50`;
    if (gId) url += `&groupId=${gId}`;
    if (fId) url += `&friendId=${fId}`;
    if (days) {
      const since = new Date();
      since.setDate(since.getDate() - parseInt(days));
      url += `&since=${since.toISOString().split("T")[0]}`;
    }
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setExpenses(data.expenses ?? []);
        setPagination(data.pagination ?? { page: 1, limit: 50, total: 0, totalPages: 0 });
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchExpenses(1, filterGroup || undefined, filterFriend || undefined, filterDate || undefined);
  }, [fetchExpenses, filterGroup, filterFriend, filterDate]);

  // Group by month
  const byMonth: Record<string, ExpenseItem[]> = {};
  for (const exp of expenses) {
    const d = new Date(exp.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(exp);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold text-[var(--color-text)] tracking-tight">
          {t("nav.allExpenses")}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => openAddExpense()}
            className="flex items-center gap-1 bg-[var(--color-primary)] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-all duration-200"
          >
            <Plus size={14} />
            {t("dashboard.addExpense")}
          </button>
          <button
            onClick={() => openSettleUp()}
            className="flex items-center gap-1 bg-[var(--color-primary)] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-all duration-200"
          >
            <HandCoins size={14} />
            {t("dashboard.settleUp")}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Group filter */}
        <div className="relative" ref={groupPickerRef}>
          <button
            onClick={() => { setShowGroupPicker(!showGroupPicker); setShowFriendPicker(false); }}
            className={cn(
              "flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border transition-all duration-150",
              filterGroup
                ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] border-[var(--color-primary)]"
                : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
            )}
          >
            {filterGroup ? groups.find((g) => g.id === filterGroup)?.name : "All groups"}
            <ChevronDown size={13} />
          </button>
          {showGroupPicker && (
            <div className="absolute top-full left-0 mt-1 z-20 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-elevated)] py-1 min-w-[180px] max-h-60 overflow-y-auto">
              <button
                onClick={() => { setFilterGroup(""); setShowGroupPicker(false); }}
                className={cn("w-full text-start px-3 py-2 text-sm hover:bg-[var(--color-hover)]", !filterGroup && "text-[var(--color-primary)] font-medium")}
              >All groups</button>
              {groups.map((g) => (
                <button key={g.id}
                  onClick={() => { setFilterGroup(g.id); setShowGroupPicker(false); }}
                  className={cn("w-full text-start px-3 py-2 text-sm hover:bg-[var(--color-hover)]", filterGroup === g.id && "text-[var(--color-primary)] font-medium")}
                >{g.name}</button>
              ))}
            </div>
          )}
        </div>

        {/* Friend filter */}
        <div className="relative" ref={friendPickerRef}>
          <button
            onClick={() => { setShowFriendPicker(!showFriendPicker); setShowGroupPicker(false); }}
            className={cn(
              "flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border transition-all duration-150",
              filterFriend
                ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] border-[var(--color-primary)]"
                : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
            )}
          >
            {filterFriend ? friends.find((f) => f.id === filterFriend)?.name : "All friends"}
            <ChevronDown size={13} />
          </button>
          {showFriendPicker && (
            <div className="absolute top-full left-0 mt-1 z-20 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-elevated)] py-1 min-w-[200px] w-56">
              <div className="px-2 py-1.5">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                  <input type="text" placeholder="Search..." value={friendFilterSearch}
                    onChange={(e) => setFriendFilterSearch(e.target.value)}
                    className="w-full pl-7 pr-2 py-1.5 text-xs bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]" />
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto">
                <button
                  onClick={() => { setFilterFriend(""); setShowFriendPicker(false); setFriendFilterSearch(""); }}
                  className={cn("w-full text-start px-3 py-2 text-sm hover:bg-[var(--color-hover)]", !filterFriend && "text-[var(--color-primary)] font-medium")}
                >All friends</button>
                {friends.filter((f) => f.name.toLowerCase().includes(friendFilterSearch.toLowerCase())).map((f) => (
                  <button key={f.id}
                    onClick={() => { setFilterFriend(f.id); setShowFriendPicker(false); setFriendFilterSearch(""); }}
                    className={cn("w-full text-start px-3 py-2 text-sm hover:bg-[var(--color-hover)]", filterFriend === f.id && "text-[var(--color-primary)] font-medium")}
                  >{f.name}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Date filter pills */}
        <div className="flex gap-1">
          {[
            { value: "", label: "All time" },
            { value: "30", label: "30 days" },
            { value: "90", label: "3 months" },
            { value: "365", label: "1 year" },
          ].map((d) => (
            <button
              key={d.value}
              onClick={() => setFilterDate(d.value)}
              className={cn(
                "text-xs px-3 py-2 rounded-xl border transition-all duration-150",
                filterDate === d.value
                  ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] border-[var(--color-primary)]"
                  : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
              )}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Clear */}
        {(filterGroup || filterFriend || filterDate) && (
          <button
            onClick={() => { setFilterGroup(""); setFilterFriend(""); setFilterDate(""); }}
            className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline px-1"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-6 animate-pulse h-16 bg-[var(--color-hover)]"
            />
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-8 text-center text-[var(--color-text-tertiary)] text-sm">
          {t("dashboard.noExpenses")}
        </div>
      ) : (
        <>
          {Object.entries(byMonth)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([month, monthExpenses]) => {
              const d = new Date(month + "-01");
              return (
                <div key={month} className="mb-4">
                  <MonthHeader monthKey={month} />
                  <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
                    {monthExpenses.map((exp) => (
                      <ExpenseListItem key={exp.id} expense={exp} />
                    ))}
                  </div>
                </div>
              );
            })}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => fetchExpenses(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="flex items-center gap-1 text-sm text-[var(--color-primary)] disabled:text-[var(--color-text-tertiary)]"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <span className="text-sm text-[var(--color-text-secondary)]">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchExpenses(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="flex items-center gap-1 text-sm text-[var(--color-primary)] disabled:text-[var(--color-text-tertiary)]"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
