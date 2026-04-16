"use client";

import { useTranslations } from "next-intl";

interface MonthlyTrendProps {
  data: { month: string; total: number }[];
}

export default function MonthlyTrend({ data }: MonthlyTrendProps) {
  const t = useTranslations("dashboard");

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <div className="w-12 h-12 rounded-full bg-[var(--color-hover)] flex items-center justify-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="2" y="10" width="3" height="8" rx="1" fill="#86868B" opacity="0.4" />
            <rect x="7" y="6" width="3" height="12" rx="1" fill="#86868B" opacity="0.4" />
            <rect x="12" y="8" width="3" height="10" rx="1" fill="#86868B" opacity="0.4" />
            <rect x="17" y="4" width="1" height="14" rx="0.5" fill="#86868B" opacity="0.2" />
          </svg>
        </div>
        <p className="text-sm text-[var(--color-text-tertiary)]">
          {t("noExpenses")}
        </p>
      </div>
    );
  }

  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="space-y-3">
      {/* Bar chart */}
      <div className="flex items-end gap-1.5 h-48">
        {data.map((d) => {
          const date = new Date(d.month + "-01");
          const label = date.toLocaleDateString("en-US", { month: "short" });
          const heightPct = (d.total / maxTotal) * 100;

          return (
            <div
              key={d.month}
              className="flex-1 flex flex-col items-center gap-1 min-w-0"
            >
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full rounded-t-md transition-all duration-300 ease-out"
                  style={{
                    height: `${Math.max(heightPct, 2)}%`,
                    backgroundColor: "var(--color-primary)",
                    opacity: 0.65,
                  }}
                  title={`${label}: $${d.total.toFixed(2)}`}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.opacity = "1";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.opacity = "0.65";
                  }}
                />
              </div>
              <span className="text-[10px] font-medium text-[var(--color-text-tertiary)] truncate w-full text-center">
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-[10px] text-[var(--color-text-tertiary)] px-0.5">
        <span>$0</span>
        <span>${maxTotal.toFixed(0)}</span>
      </div>
    </div>
  );
}
