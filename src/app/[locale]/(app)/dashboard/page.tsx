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
      {/* Balance Summary Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="grid grid-cols-3 divide-x rtl:divide-x-reverse text-center">
          <div>
            <p className="text-xs text-gray-500 mb-1">{t("totalBalance")}</p>
            <p
              className={`text-lg font-bold ${
                (balances?.netBalance ?? 0) >= 0
                  ? "text-[#5bc5a7]"
                  : "text-[#ff652f]"
              }`}
            >
              {loading ? "..." : fmt(balances?.netBalance ?? 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">{t("youOwe")}</p>
            <p className="text-lg font-bold text-[#ff652f]">
              {loading ? "..." : fmt(balances?.totalOwing ?? 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">{t("youAreOwed")}</p>
            <p className="text-lg font-bold text-[#5bc5a7]">
              {loading ? "..." : fmt(balances?.totalOwed ?? 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons + View Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-3">
          <button
            onClick={() => openAddExpense()}
            className="flex items-center gap-2 bg-[#ff652f] text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#e5551f] transition-colors"
          >
            <Plus size={16} />
            {t("addExpense")}
          </button>
          <button
            onClick={() => openSettleUp()}
            className="flex items-center gap-2 bg-[#5bc5a7] text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#4ab393] transition-colors"
          >
            <HandCoins size={16} />
            {t("settleUp")}
          </button>
        </div>
        <div className="flex gap-1 bg-white rounded-lg shadow-sm p-1">
          <button
            onClick={() => setView("list")}
            className={`p-1.5 rounded ${view === "list" ? "bg-[#5bc5a7] text-white" : "text-gray-400 hover:text-gray-600"}`}
            title={t("viewAsList")}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setView("chart")}
            className={`p-1.5 rounded ${view === "chart" ? "bg-[#5bc5a7] text-white" : "text-gray-400 hover:text-gray-600"}`}
            title={t("viewAsChart")}
          >
            <PieChart size={16} />
          </button>
        </div>
      </div>

      {/* Chart View */}
      {view === "chart" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Balance
            </h3>
            <BalancePieChart
              owed={balances?.totalOwed ?? 0}
              owing={balances?.totalOwing ?? 0}
            />
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Monthly Spending
            </h3>
            <MonthlyTrend data={chartData?.monthly ?? []} />
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 md:col-span-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Spending by Category
            </h3>
            <SpendingByCategory data={chartData?.byCategory ?? []} />
          </div>
        </div>
      )}

      {/* Two-column balance view (list mode) */}
      {view === "list" && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* YOU OWE */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {t("youOweSection")}
          </h2>
          {youOwe.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              {t("settledUp")}
            </p>
          ) : (
            <div className="space-y-3">
              {youOwe.map((person) => (
                <Link
                  key={person.userId}
                  href={`/friends/${person.userId}`}
                  className="flex items-center justify-between hover:bg-gray-50 p-2 rounded transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-[#ff652f]/15 flex items-center justify-center text-sm font-bold text-[#ff652f]">
                      {person.name[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-[#333]">
                      {person.name}
                    </span>
                  </div>
                  <div className="text-end">
                    <div className="text-xs text-[#ff652f]">{t("youOwe")}</div>
                    <div className="text-sm font-bold text-[#ff652f]">
                      {fmt(person.amount)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* YOU ARE OWED */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {t("youAreOwedSection")}
          </h2>
          {youAreOwed.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              {t("settledUp")}
            </p>
          ) : (
            <div className="space-y-3">
              {youAreOwed.map((person) => (
                <Link
                  key={person.userId}
                  href={`/friends/${person.userId}`}
                  className="flex items-center justify-between hover:bg-gray-50 p-2 rounded transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-[#5bc5a7]/15 flex items-center justify-center text-sm font-bold text-[#5bc5a7]">
                      {person.name[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-[#333]">
                      {person.name}
                    </span>
                  </div>
                  <div className="text-end">
                    <div className="text-xs text-[#5bc5a7]">
                      {t("youAreOwed")}
                    </div>
                    <div className="text-sm font-bold text-[#5bc5a7]">
                      {fmt(person.amount)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>}
    </div>
  );
}
