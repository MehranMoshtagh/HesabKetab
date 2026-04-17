"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Plus, HandCoins, Settings, ArrowRight } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { Link } from "@/i18n/routing";
import { useCachedFetch } from "@/hooks/useCachedFetch";
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
  const { openAddExpense, openSettleUp, groups } = useAppStore();

  // Instant: get group name from the store
  const groupFromStore = groups.find((g) => g.id === groupId);

  // Cached fetches — show cached data instantly on revisit, refresh in background
  const { data, loading: dataLoading } = useCachedFetch<GroupData>(`/api/groups/${groupId}`);
  const { data: balances } = useCachedFetch<GroupBalanceData>(`/api/balances/group/${groupId}`);
  const loading = dataLoading;

  // Show header instantly with store data while expenses load
  if (loading && !data) {
    const name = groupFromStore?.name ?? "...";
    return (
      <div className="space-y-4">
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)] font-semibold">
              {name[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[var(--color-text)]">{name}</h1>
              <p className="text-sm text-[var(--color-text-tertiary)]">{groupFromStore?.memberCount ?? "..."} {t("group.members").toLowerCase()}</p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-4 animate-pulse">
              <div className="h-4 bg-[var(--color-hover)] rounded w-2/3 mb-2" />
              <div className="h-3 bg-[var(--color-hover)] rounded w-1/3" />
            </div>
          ))}
        </div>
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
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-4 sm:p-6 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
            <div className="flex gap-2 items-center flex-wrap">
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
                <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
                  {expenses.map((exp) => (
                    <ExpenseListItem key={exp.id} expense={exp} />
                  ))}
                </div>
              </div>
            );
          })}

        {data.expenses.length === 0 && (
          <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-8 text-center text-[var(--color-text-tertiary)] text-sm">
            {t("dashboard.noExpenses")}
          </div>
        )}
      </div>

      {/* Right panel — group balances */}
      <div className="w-64 hidden lg:block space-y-4">
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-5">
          <h3 className="text-xs font-semibold text-[var(--color-text-tertiary)] mb-1">
            {t("group.groupBalances")}
          </h3>
          <p className="text-[10px] text-[var(--color-text-tertiary)] mb-3">
            {balances?.simplifyEnabled
              ? t("group.simplifyOn")
              : t("group.simplifyOff")}
          </p>

          {/* Per-member balances — capped at 6, aligned */}
          <div className="space-y-1.5 mb-4">
            {balances?.members.slice(0, 6).map((m) => (
              <div key={m.userId} className="flex items-center gap-2 py-1">
                <div className="w-6 h-6 rounded-full bg-[var(--color-hover)] flex items-center justify-center text-[10px] font-semibold text-[var(--color-text-secondary)] shrink-0">
                  {m.name[0]?.toUpperCase()}
                </div>
                <span className="text-xs text-[var(--color-text)] truncate flex-1">
                  {m.name}
                </span>
                <span
                  className={`text-xs font-semibold shrink-0 tabular-nums ${
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
            {(balances?.members.length ?? 0) > 6 && (
              <p className="text-[10px] text-[var(--color-text-tertiary)] px-1">
                +{(balances?.members.length ?? 0) - 6} more members
              </p>
            )}
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
