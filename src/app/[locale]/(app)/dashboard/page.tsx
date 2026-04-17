"use client";

import { useTranslations } from "next-intl";
import { Plus, HandCoins, List, PieChart, ChevronRight, CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { avatarColor } from "@/lib/utils";
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
  const { openAddExpense, openSettleUp, initData } = useAppStore();
  const [balances, setBalances] = useState<BalanceData | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [view, setView] = useState<"list" | "chart">("list");
  const [loading, setLoading] = useState(true);

  // Use data from the single /api/init call (via useAppData in AppShell)
  useEffect(() => {
    if (initData) {
      if (initData.balances) setBalances(initData.balances as BalanceData);
      if (initData.charts) setChartData(initData.charts as ChartData);
      setLoading(false);
    }
  }, [initData]);

  const youOwe = balances?.byPerson?.filter((p) => p.amount < 0) ?? [];
  const youAreOwed = balances?.byPerson?.filter((p) => p.amount > 0) ?? [];

  const fmt = (n: number) => `$${Math.abs(n).toFixed(2)}`;

  return (
    <div className="space-y-5">
      {/* ── Balance Summary ── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-3 sm:p-5 text-center">
          <p className="text-[10px] sm:text-xs text-[var(--color-text-secondary)] mb-1 truncate">{t("totalBalance")}</p>
          <p className={`text-lg sm:text-2xl font-bold tracking-[-0.03em] ${
            (balances?.netBalance ?? 0) >= 0 ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"
          }`}>
            {loading ? "..." : fmt(balances?.netBalance ?? 0)}
          </p>
        </div>
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-3 sm:p-5 text-center">
          <p className="text-[10px] sm:text-xs text-[var(--color-negative)] mb-1 truncate">{t("youOwe")}</p>
          <p className="text-lg sm:text-2xl font-bold text-[var(--color-negative)] tracking-[-0.03em]">
            {loading ? "..." : fmt(balances?.totalOwing ?? 0)}
          </p>
        </div>
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-3 sm:p-5 text-center">
          <p className="text-[10px] sm:text-xs text-[var(--color-positive)] mb-1 truncate">{t("youAreOwed")}</p>
          <p className="text-lg sm:text-2xl font-bold text-[var(--color-positive)] tracking-[-0.03em]">
            {loading ? "..." : fmt(balances?.totalOwed ?? 0)}
          </p>
        </div>
      </div>

      {/* ── Actions + Segmented Toggle ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="flex gap-2">
          {/* Add expense — filled primary */}
          <button
            onClick={() => openAddExpense()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white px-4 sm:px-5 py-2.5 rounded-xl font-medium text-sm shadow-[var(--shadow-button)] hover:bg-[var(--color-primary-hover)] active:scale-[0.97] transition-all duration-200 whitespace-nowrap"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span className="hidden xs:inline sm:inline">{t("addExpense")}</span>
            <span className="xs:hidden sm:hidden">Add</span>
          </button>

          {/* Settle up — outlined */}
          <button
            onClick={() => openSettleUp()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border-strong)] text-[var(--color-text)] px-4 sm:px-5 py-2.5 rounded-xl font-medium text-sm shadow-[var(--shadow-button)] hover:bg-[var(--color-hover)] active:scale-[0.97] transition-all duration-200 whitespace-nowrap"
          >
            <HandCoins size={16} />
            {t("settleUp")}
          </button>
        </div>

        {/* Segmented control — full-width on mobile */}
        <div className="relative flex bg-[var(--color-bg)] rounded-xl p-1 border border-[var(--color-border)] w-full sm:w-auto">
          {/* Sliding pill */}
          <div
            className="absolute top-1 bottom-1 rounded-[10px] bg-[var(--color-surface)] shadow-[var(--shadow-card)] transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
            style={{
              left: view === "list" ? "4px" : "50%",
              right: view === "chart" ? "4px" : "50%",
            }}
          />
          <button
            onClick={() => setView("list")}
            className={`relative z-10 flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-[10px] text-sm font-medium transition-colors duration-200 ${
              view === "list"
                ? "text-[var(--color-text)]"
                : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
            }`}
          >
            <List size={14} />
            {t("viewAsList")}
          </button>
          <button
            onClick={() => setView("chart")}
            className={`relative z-10 flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-[10px] text-sm font-medium transition-colors duration-200 ${
              view === "chart"
                ? "text-[var(--color-text)]"
                : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
            }`}
          >
            <PieChart size={14} />
            {t("viewAsChart")}
          </button>
        </div>
      </div>

      {/* ── Chart View — stacked for larger charts ── */}
      {view === "chart" && (
        <div className="space-y-5">
          <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-6">
            <h3 className="text-base font-semibold text-[var(--color-text)] mb-5">
              {t("chartBalance")}
            </h3>
            <BalancePieChart
              owed={balances?.totalOwed ?? 0}
              owing={balances?.totalOwing ?? 0}
            />
          </div>
          <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-6">
            <h3 className="text-base font-semibold text-[var(--color-text)] mb-5">
              {t("chartMonthly")}
            </h3>
            <MonthlyTrend data={chartData?.monthly ?? []} />
          </div>
          <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-6">
            <h3 className="text-base font-semibold text-[var(--color-text)] mb-5">
              {t("chartCategory")}
            </h3>
            <SpendingByCategory data={chartData?.byCategory ?? []} />
          </div>
        </div>
      )}

      {/* ── List View ── */}
      {view === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* You owe */}
          <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-5">
            <h2 className="text-base font-semibold text-[var(--color-text)] mb-3 px-1">
              {t("youOweSection")}
            </h2>

            {youOwe.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <CheckCircle2
                  size={32}
                  className="text-[var(--color-positive)]"
                  strokeWidth={1.5}
                />
                <p className="text-sm font-medium text-[var(--color-positive)]">
                  {t("settledUp")}
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {youOwe.map((person) => {
                  const color = avatarColor(person.name);
                  return (
                    <Link
                      key={person.userId}
                      href={`/friends/${person.userId}`}
                      className="flex items-center justify-between cursor-pointer hover:bg-[var(--color-hover)] transition-all duration-200 rounded-xl px-3 py-2.5 group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
                          style={{ backgroundColor: color }}
                        >
                          {person.name[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-[var(--color-text)]">
                          {person.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-[var(--color-negative)]">
                          {fmt(person.amount)}
                        </span>
                        <ChevronRight
                          size={16}
                          className="text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)] transition-colors"
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* You are owed */}
          <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-5">
            <h2 className="text-base font-semibold text-[var(--color-text)] mb-3 px-1">
              {t("youAreOwedSection")}
            </h2>

            {youAreOwed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <CheckCircle2
                  size={32}
                  className="text-[var(--color-positive)]"
                  strokeWidth={1.5}
                />
                <p className="text-sm font-medium text-[var(--color-positive)]">
                  {t("settledUp")}
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {youAreOwed.map((person) => {
                  const color = avatarColor(person.name);
                  return (
                    <Link
                      key={person.userId}
                      href={`/friends/${person.userId}`}
                      className="flex items-center justify-between cursor-pointer hover:bg-[var(--color-hover)] transition-all duration-200 rounded-xl px-3 py-2.5 group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
                          style={{ backgroundColor: color }}
                        >
                          {person.name[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-[var(--color-text)]">
                          {person.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-[var(--color-positive)]">
                          {fmt(person.amount)}
                        </span>
                        <ChevronRight
                          size={16}
                          className="text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)] transition-colors"
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
