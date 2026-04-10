"use client";

import { useTranslations } from "next-intl";
import { Plus, HandCoins, List, PieChart } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import BalancePieChart from "@/components/charts/BalancePieChart";
import SpendingByCategory from "@/components/charts/SpendingByCategory";
import MonthlyTrend from "@/components/charts/MonthlyTrend";

interface BalanceData {
  totalOwed: number;
  totalOwing: number;
  netBalance: number;
  byPerson: {
    userId: string;
    name: string;
    avatar: string | null;
    amount: number;
  }[];
}

interface ChartData {
  byCategory: { category: string; total: number }[];
  monthly: { month: string; total: number }[];
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const { openAddExpense, openSettleUp } = useAppStore();
  const [balances, setBalances] = useState<BalanceData | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [view, setView] = useState<"list" | "chart">("list");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/balances").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/charts").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([bal, charts]) => {
        if (bal?.byPerson) setBalances(bal);
        if (charts?.byCategory) setChartData(charts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const youOwe = balances?.byPerson?.filter((p) => p.amount < 0) ?? [];
  const youAreOwed = balances?.byPerson?.filter((p) => p.amount > 0) ?? [];

  const fmt = (n: number) => `$${Math.abs(n).toFixed(2)}`;

  return (
    <div>
      {/* Balance Summary */}
      <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-[rgba(0,0,0,0.06)] p-6 mb-5">
        <div className="grid grid-cols-3 divide-x rtl:divide-x-reverse text-center">
          <div>
            <p className="text-xs text-[var(--color-text-tertiary)] mb-1.5">{t("totalBalance")}</p>
            <p
              className={`text-xl font-semibold tracking-[-0.02em] ${
                (balances?.netBalance ?? 0) >= 0
                  ? "text-[var(--color-positive)]"
                  : "text-[var(--color-negative)]"
              }`}
            >
              {loading ? "..." : fmt(balances?.netBalance ?? 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-tertiary)] mb-1.5">{t("youOwe")}</p>
            <p className="text-xl font-semibold text-[var(--color-negative)] tracking-[-0.02em]">
              {loading ? "..." : fmt(balances?.totalOwing ?? 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-tertiary)] mb-1.5">{t("youAreOwed")}</p>
            <p className="text-xl font-semibold text-[var(--color-positive)] tracking-[-0.02em]">
              {loading ? "..." : fmt(balances?.totalOwed ?? 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Actions + View Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2.5">
          <button
            onClick={() => openAddExpense()}
            className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-[var(--color-primary-hover)] transition-all duration-200"
          >
            <Plus size={16} />
            {t("addExpense")}
          </button>
          <button
            onClick={() => openSettleUp()}
            className="flex items-center gap-2 border border-[rgba(0,0,0,0.12)] text-[var(--color-text)] px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-[rgba(0,0,0,0.03)] transition-all duration-200"
          >
            <HandCoins size={16} />
            {t("settleUp")}
          </button>
        </div>
        <div className="flex bg-white rounded-xl shadow-[var(--shadow-card)] border border-[rgba(0,0,0,0.06)] p-1">
          <button
            onClick={() => setView("list")}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              view === "list"
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text)]"
            }`}
            title={t("viewAsList")}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setView("chart")}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              view === "chart"
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text)]"
            }`}
            title={t("viewAsChart")}
          >
            <PieChart size={16} />
          </button>
        </div>
      </div>

      {/* Chart View */}
      {view === "chart" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-[rgba(0,0,0,0.06)] p-6">
            <h3 className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-4">
              Balance
            </h3>
            <BalancePieChart
              owed={balances?.totalOwed ?? 0}
              owing={balances?.totalOwing ?? 0}
            />
          </div>
          <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-[rgba(0,0,0,0.06)] p-6">
            <h3 className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-4">
              Monthly Spending
            </h3>
            <MonthlyTrend data={chartData?.monthly ?? []} />
          </div>
          <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-[rgba(0,0,0,0.06)] p-6 md:col-span-2">
            <h3 className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-4">
              Spending by Category
            </h3>
            <SpendingByCategory data={chartData?.byCategory ?? []} />
          </div>
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* YOU OWE */}
          <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-[rgba(0,0,0,0.06)] p-6">
            <h2 className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-4">
              {t("youOweSection")}
            </h2>
            {youOwe.length === 0 ? (
              <p className="text-sm text-[var(--color-text-tertiary)] text-center py-10">
                {t("settledUp")}
              </p>
            ) : (
              <div className="space-y-1">
                {youOwe.map((person) => (
                  <Link
                    key={person.userId}
                    href={`/friends/${person.userId}`}
                    className="flex items-center justify-between hover:bg-[rgba(0,0,0,0.02)] p-2.5 rounded-xl transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--color-negative)]/10 flex items-center justify-center text-sm font-semibold text-[var(--color-negative)]">
                        {person.name[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-[var(--color-text)]">
                        {person.name}
                      </span>
                    </div>
                    <div className="text-end">
                      <div className="text-[11px] text-[var(--color-negative)]">{t("youOwe")}</div>
                      <div className="text-sm font-semibold text-[var(--color-negative)]">
                        {fmt(person.amount)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* YOU ARE OWED */}
          <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-[rgba(0,0,0,0.06)] p-6">
            <h2 className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-4">
              {t("youAreOwedSection")}
            </h2>
            {youAreOwed.length === 0 ? (
              <p className="text-sm text-[var(--color-text-tertiary)] text-center py-10">
                {t("settledUp")}
              </p>
            ) : (
              <div className="space-y-1">
                {youAreOwed.map((person) => (
                  <Link
                    key={person.userId}
                    href={`/friends/${person.userId}`}
                    className="flex items-center justify-between hover:bg-[rgba(0,0,0,0.02)] p-2.5 rounded-xl transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--color-positive)]/10 flex items-center justify-center text-sm font-semibold text-[var(--color-positive)]">
                        {person.name[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-[var(--color-text)]">
                        {person.name}
                      </span>
                    </div>
                    <div className="text-end">
                      <div className="text-[11px] text-[var(--color-positive)]">
                        {t("youAreOwed")}
                      </div>
                      <div className="text-sm font-semibold text-[var(--color-positive)]">
                        {fmt(person.amount)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
