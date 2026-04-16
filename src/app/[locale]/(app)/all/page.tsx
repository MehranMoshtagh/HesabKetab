"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback } from "react";
import { Plus, HandCoins, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
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
  const { openAddExpense, openSettleUp } = useAppStore();
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback((page: number) => {
    setLoading(true);
    fetch(`/api/expenses?page=${page}&limit=50`)
      .then((r) => r.json())
      .then((data) => {
        setExpenses(data.expenses ?? []);
        setPagination(data.pagination ?? { page: 1, limit: 50, total: 0, totalPages: 0 });
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchExpenses(1);
  }, [fetchExpenses]);

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
      <div className="flex items-center justify-between mb-4">
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
                      <div key={exp.id} className="relative">
                        <ExpenseListItem expense={exp} />
                        {exp.group && (
                          <span className="absolute top-1 end-1 text-[10px] bg-[var(--color-hover)] text-[var(--color-text-secondary)] px-1.5 py-0.5 rounded">
                            {exp.group.name}
                          </span>
                        )}
                      </div>
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
