"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, HandCoins } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import ExpenseListItem from "@/components/expenses/ExpenseListItem";
import MonthHeader from "@/components/expenses/MonthHeader";
import { ExpenseListSkeleton } from "@/components/ui/Skeleton";

interface FriendData {
  friend: { id: string; name: string; email: string; avatar: string | null };
  expenses: ExpenseItem[];
}

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
  _count: { comments: number };
}

export default function FriendDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const friendId = params.id as string;
  const { openAddExpense, openSettleUp } = useAppStore();
  const [data, setData] = useState<FriendData | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/friends/${friendId}`).then((r) => r.json()),
      fetch(`/api/balances/friend/${friendId}`).then((r) => r.json()),
    ])
      .then(([friendData, balanceData]) => {
        setData(friendData);
        setBalance(balanceData.balance ?? 0);
      })
      .finally(() => setLoading(false));
  }, [friendId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-6 animate-pulse h-20 bg-[var(--color-hover)]" />
        <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-6 animate-pulse h-40 bg-[var(--color-hover)]" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-8 text-[var(--color-text-tertiary)]">{t("common.error")}</div>;
  }

  // Group expenses by month
  const byMonth: Record<string, ExpenseItem[]> = {};
  for (const exp of data.expenses) {
    const d = new Date(exp.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(exp);
  }

  const balanceColor = balance > 0 ? "text-[var(--color-positive)]" : balance < 0 ? "text-[var(--color-negative)]" : "text-[var(--color-text-secondary)]";
  const balanceLabel =
    balance > 0
      ? `${data.friend.name} ${t("common.owes")} $${balance.toFixed(2)}`
      : balance < 0
      ? `${t("dashboard.youOwe")} $${Math.abs(balance).toFixed(2)}`
      : t("dashboard.settledUp");

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-6 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-lg font-semibold text-[var(--color-primary)]">
              {data.friend.name[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[var(--color-text)]">{data.friend.name}</h1>
              <p className="text-sm text-[var(--color-text-secondary)]">{data.friend.email}</p>
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
              onClick={() =>
                openSettleUp({ friendId, friendName: data.friend.name })
              }
              className="flex items-center gap-1 bg-[var(--color-primary)] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-all duration-200"
            >
              <HandCoins size={14} />
              {t("dashboard.settleUp")}
            </button>
          </div>
        </div>

        {/* Expenses by month */}
        {Object.entries(byMonth)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([month, expenses]) => {
            const d = new Date(month + "-01");
            return (
              <div key={month} className="mb-4">
                <MonthHeader monthKey={month} />
                <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
                  {expenses.map((exp) => (
                    <ExpenseListItem key={exp.id} expense={exp} />
                  ))}
                </div>
              </div>
            );
          })}

        {data.expenses.length === 0 && (
          <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-8 text-center text-[var(--color-text-tertiary)] text-sm">
            {t("dashboard.noExpenses")}
          </div>
        )}
      </div>

      {/* Right panel */}
      <div className="w-64 hidden lg:block">
        <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-6">
          <h3 className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
            {t("friend.yourBalance")}
          </h3>
          <p className={`text-lg font-semibold ${balanceColor}`}>{balanceLabel}</p>
        </div>
      </div>
    </div>
  );
}
