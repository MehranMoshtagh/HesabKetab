"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, HandCoins, Settings, ArrowRight } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { Link } from "@/i18n/routing";
import ExpenseListItem from "@/components/expenses/ExpenseListItem";
import MonthHeader from "@/components/expenses/MonthHeader";

interface GroupData {
  id: string;
  name: string;
  type: string;
  simplifyDebts: boolean;
  members: {
    userId: string;
    role: string;
    user: { id: string; name: string; email: string; avatar: string | null };
  }[];
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
  _count?: { comments: number };
}

interface GroupBalanceData {
  members: { userId: string; name: string; avatar: string | null; balance: number }[];
  simplified: { from: string; fromName: string; to: string; toName: string; amount: number }[];
  simplifyEnabled: boolean;
}

export default function GroupDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const groupId = params.id as string;
  const { openAddExpense, openSettleUp } = useAppStore();
  const [data, setData] = useState<GroupData | null>(null);
  const [balances, setBalances] = useState<GroupBalanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/groups/${groupId}`).then((r) => r.json()),
      fetch(`/api/balances/group/${groupId}`).then((r) => r.json()),
    ])
      .then(([groupData, balanceData]) => {
        setData(groupData);
        setBalances(balanceData);
      })
      .finally(() => setLoading(false));
  }, [groupId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-6 animate-pulse h-20 bg-[var(--color-hover)]" />
        <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-6 animate-pulse h-60 bg-[var(--color-hover)]" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-8 text-[var(--color-text-tertiary)]">{t("common.error")}</div>;
  }

  const byMonth: Record<string, ExpenseItem[]> = {};
  for (const exp of data.expenses) {
    const d = new Date(exp.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(exp);
  }

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-6 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[var(--color-primary-light)] flex items-center justify-center text-lg">
                👥
              </div>
              <div>
                <h1 className="text-lg font-semibold text-[var(--color-text)]">{data.name}</h1>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {data.members.length}{" "}
                  {data.members.length === 1 ? "member" : "members"}
                </p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => openAddExpense({ groupId })}
                className="flex items-center gap-1 bg-[var(--color-primary)] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-all duration-200"
              >
                <Plus size={14} />
                {t("dashboard.addExpense")}
              </button>
              <button
                onClick={() => openSettleUp({ groupId })}
                className="flex items-center gap-1 bg-[var(--color-primary)] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-all duration-200"
              >
                <HandCoins size={14} />
                {t("dashboard.settleUp")}
              </button>
              <Link
                href={`/groups/${groupId}/edit`}
                className="p-1.5 rounded-lg hover:bg-[var(--color-hover)] transition-all duration-200"
              >
                <Settings size={16} className="text-[var(--color-text-tertiary)]" />
              </Link>
            </div>
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

      {/* Right panel — group balances */}
      <div className="w-64 hidden lg:block space-y-4">
        <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-6">
          <h3 className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
            {t("group.groupBalances")}
          </h3>
          <p className="text-xs text-[var(--color-text-tertiary)] mb-3">
            {balances?.simplifyEnabled
              ? t("group.simplifyOn")
              : t("group.simplifyOff")}
          </p>

          {/* Per-member balances */}
          <div className="space-y-2 mb-4">
            {balances?.members.map((m) => (
              <div key={m.userId} className="flex items-center justify-between rounded-lg px-1 py-1 hover:bg-[var(--color-hover)] transition-colors duration-150">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-hover)] flex items-center justify-center text-xs font-semibold">
                    {m.name[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-[var(--color-text)] truncate max-w-[100px]">
                    {m.name}
                  </span>
                </div>
                <span
                  className={`text-sm font-medium ${
                    m.balance > 0
                      ? "text-[var(--color-positive)]"
                      : m.balance < 0
                      ? "text-[var(--color-negative)]"
                      : "text-[var(--color-text-tertiary)]"
                  }`}
                >
                  {m.balance > 0
                    ? `+$${m.balance.toFixed(2)}`
                    : m.balance < 0
                    ? `-$${Math.abs(m.balance).toFixed(2)}`
                    : "$0.00"}
                </span>
              </div>
            ))}
          </div>

          {/* Simplified debts */}
          {balances?.simplified && balances.simplified.length > 0 && (
            <div className="border-t border-[var(--color-border)] pt-3">
              <h4 className="text-xs font-medium text-[var(--color-text-tertiary)] mb-2">
                {t("group.viewDetails")}
              </h4>
              <div className="space-y-2">
                {balances.simplified.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1 text-xs text-[var(--color-text)]"
                  >
                    <span className="font-medium text-[var(--color-negative)]">
                      {d.fromName}
                    </span>
                    <ArrowRight size={10} className="text-[var(--color-text-tertiary)]" />
                    <span className="font-medium text-[var(--color-positive)]">
                      {d.toName}
                    </span>
                    <span className="ms-auto font-semibold">
                      ${d.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
