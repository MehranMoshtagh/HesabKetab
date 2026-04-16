"use client";

import { useTranslations } from "next-intl";
import { Plus, HandCoins, List, PieChart, ChevronRight, CheckCircle2 } from "lucide-react";
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

/* Deterministic avatar color from name */
function avatarColor(name: string): string {
  const palette = [
    "#0071E3", "#34C759", "#FF9500", "#AF52DE",
    "#FF2D55", "#5AC8FA", "#FF3B30", "#007AFF",
    "#5856D6", "#30B0C7", "#A2845E", "#64D2FF",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
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
    <div className="space-y-5">
      {/* ── Balance Summary Card ── */}
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-6">
        <div className="flex items-center justify-between">
          {/* Total balance */}
          <div className="flex-1 text-center">
            <p className="text-xs text-[var(--color-text-secondary)] mb-1">
              {t("totalBalance")}
            </p>
            <p
              className={`text-3xl font-bold tracking-[-0.03em] ${
                (balances?.netBalance ?? 0) >= 0
                  ? "text-[var(--color-positive)]"
                  : "text-[var(--color-negative)]"
              }`}
            >
              {loading ? "..." : fmt(balances?.netBalance ?? 0)}
            </p>
          </div>

          {/* Divider */}
          <div className="w-px h-12 bg-[var(--color-border)] mx-5 shrink-0" />

          {/* You owe pill */}
          <div className="flex-1 flex justify-center">
            <div className="inline-flex flex-col items-center bg-[var(--color-negative-light)] rounded-xl px-5 py-2.5">
              <p className="text-[11px] text-[var(--color-negative)] mb-0.5">
                {t("youOwe")}
              </p>
              <p className="text-lg font-semibold text-[var(--color-negative)] tracking-[-0.02em]">
                {loading ? "..." : fmt(balances?.totalOwing ?? 0)}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-12 bg-[var(--color-border)] mx-5 shrink-0" />

          {/* You are owed pill */}
          <div className="flex-1 flex justify-center">
            <div className="inline-flex flex-col items-center bg-[var(--color-positive-light)] rounded-xl px-5 py-2.5">
              <p className="text-[11px] text-[var(--color-positive)] mb-0.5">
                {t("youAreOwed")}
              </p>
              <p className="text-lg font-semibold text-[var(--color-positive)] tracking-[-0.02em]">
                {loading ? "..." : fmt(balances?.totalOwed ?? 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Actions + Segmented Toggle ── */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2.5">
          {/* Add expense — filled primary */}
          <button
            onClick={() => openAddExpense()}
            className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-[var(--shadow-button)] hover:bg-[var(--color-primary-hover)] active:scale-[0.97] transition-all duration-200"
          >
            <Plus size={16} strokeWidth={2.5} />
            {t("addExpense")}
          </button>

          {/* Settle up — outlined */}
          <button
            onClick={() => openSettleUp()}
            className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border-strong)] text-[var(--color-text)] px-5 py-2.5 rounded-xl font-medium text-sm shadow-[var(--shadow-button)] hover:bg-[var(--color-hover)] active:scale-[0.97] transition-all duration-200"
          >
            <HandCoins size={16} />
            {t("settleUp")}
          </button>
        </div>

        {/* Segmented control */}
        <div className="relative flex bg-[var(--color-bg)] rounded-xl p-1 border border-[var(--color-border)]">
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
            className={`relative z-10 flex items-center gap-1.5 px-4 py-1.5 rounded-[10px] text-sm font-medium transition-colors duration-200 ${
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
            className={`relative z-10 flex items-center gap-1.5 px-4 py-1.5 rounded-[10px] text-sm font-medium transition-colors duration-200 ${
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

      {/* ── Chart View ── */}
      {view === "chart" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-6">
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">
              Balance
            </h3>
            <BalancePieChart
              owed={balances?.totalOwed ?? 0}
              owing={balances?.totalOwing ?? 0}
            />
          </div>
          <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-6">
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">
              Monthly spending
            </h3>
            <MonthlyTrend data={chartData?.monthly ?? []} />
          </div>
          <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-6 md:col-span-2">
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">
              Spending by category
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
