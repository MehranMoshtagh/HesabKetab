"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Plus, HandCoins } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { avatarColor, getInitial } from "@/lib/utils";
import { useCachedFetch } from "@/hooks/useCachedFetch";
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
  _count?: { comments: number };
}

export default function FriendDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const friendId = params.id as string;
  const { openAddExpense, openSettleUp, friends, initData } = useAppStore();

  // Instant: get friend info + balance from the store (already loaded by /api/init)
  const friend = friends.find((f) => f.id === friendId);
  const balanceFromInit = (initData?.balances as { byPerson?: { userId: string; amount: number }[] })
    ?.byPerson?.find((p) => p.userId === friendId);
  const balance = balanceFromInit?.amount ?? 0;

  // Fetch expenses via cached hook — instant on revisit
  const { data: friendData, loading: loadingExpenses } = useCachedFetch<{ expenses: ExpenseItem[] }>(
    `/api/friends/${friendId}`
  );
  const expenses = friendData?.expenses ?? [];

  if (!friend) {
    return <div className="text-center py-8 text-[var(--color-text-tertiary)]">{t("common.error")}</div>;
  }

  // Group expenses by month
  const byMonth: Record<string, ExpenseItem[]> = {};
  for (const exp of expenses) {
    const d = new Date(exp.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(exp);
  }

  const balanceColor = balance > 0 ? "text-[var(--color-positive)]" : balance < 0 ? "text-[var(--color-negative)]" : "text-[var(--color-text-secondary)]";
  const balanceLabel =
    balance > 0
      ? `${friend.name} ${t("common.owes")} $${balance.toFixed(2)}`
      : balance < 0
      ? `${t("dashboard.youOwe")} $${Math.abs(balance).toFixed(2)}`
      : t("dashboard.settledUp");

  const color = avatarColor(friend.name);

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        {/* Header — renders INSTANTLY from store data */}
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-4 sm:p-6 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              {getInitial(friend.name)}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[var(--color-text)]">{friend.name}</h1>
              <p className="text-sm text-[var(--color-text-secondary)]">{friend.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => openAddExpense({ friendId })}
              className="flex items-center gap-1 bg-[var(--color-primary)] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-all duration-200"
            >
              <Plus size={14} />
              {t("dashboard.addExpense")}
            </button>
            <button
              onClick={() => openSettleUp({ friendId, friendName: friend.name })}
              className="flex items-center gap-1 border border-[var(--color-border-strong)] text-[var(--color-text)] px-5 py-2 rounded-xl text-sm font-medium hover:bg-[var(--color-hover)] transition-all duration-200"
            >
              <HandCoins size={14} />
              {t("dashboard.settleUp")}
            </button>
          </div>
        </div>

        {/* Expenses — loads separately but header is already visible */}
        {loadingExpenses ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-4 animate-pulse">
                <div className="h-4 bg-[var(--color-hover)] rounded w-2/3 mb-2" />
                <div className="h-3 bg-[var(--color-hover)] rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {Object.entries(byMonth)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([month, monthExpenses]) => (
                <div key={month} className="mb-4">
                  <MonthHeader monthKey={month} />
                  <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
                    {monthExpenses.map((exp) => (
                      <ExpenseListItem key={exp.id} expense={exp} />
                    ))}
                  </div>
                </div>
              ))}
            {expenses.length === 0 && (
              <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-8 text-center text-[var(--color-text-tertiary)] text-sm">
                {t("dashboard.noExpenses")}
              </div>
            )}
          </>
        )}
      </div>

      {/* Right sidebar */}
      <div className="w-64 hidden lg:block shrink-0">
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-5">
          <h3 className="text-xs font-semibold text-[var(--color-text-tertiary)] mb-3">
            {t("friend.yourBalance")}
          </h3>
          <p className={`text-lg font-bold ${balanceColor}`}>
            {balanceLabel}
          </p>
        </div>
      </div>
    </div>
  );
}
