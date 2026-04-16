"use client";

import { useTranslations } from "next-intl";

interface MonthlyTrendProps {
  data: { month: string; total: number }[];
}

const CHART_HEIGHT = 192; // px (h-48)

export default function MonthlyTrend({ data }: MonthlyTrendProps) {
  const t = useTranslations("dashboard");

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <div className="w-12 h-12 rounded-full bg-[var(--color-hover)] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="10" width="3" height="8" rx="1" fill="#86868B" opacity="0.4" />
            <rect x="7" y="6" width="3" height="12" rx="1" fill="#86868B" opacity="0.4" />
            <rect x="12" y="8" width="3" height="10" rx="1" fill="#86868B" opacity="0.4" />
          </svg>
        </div>
        <p className="text-sm text-[var(--color-text-tertiary)]">{t("noExpenses")}</p>
      </div>
    );
  }

  const maxTotal = Math.max(...data.map((d) => d.total), 1);
  const hasAnySpending = data.some((d) => d.total > 0);

  if (!hasAnySpending) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <p className="text-sm text-[var(--color-text-tertiary)]">{t("noExpenses")}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Bars — using fixed pixel heights instead of % (% doesn't work in flex) */}
      <div className="flex items-end gap-1" style={{ height: CHART_HEIGHT }}>
        {data.map((d) => {
          const date = new Date(d.month + "-15"); // mid-month to avoid timezone edge cases
          const label = date.toLocaleDateString("en-US", { month: "short" });
          const barHeight = d.total > 0
            ? Math.max((d.total / maxTotal) * (CHART_HEIGHT - 20), 4) // min 4px for visible non-zero
            : 0;

          return (
            <div key={d.month} className="flex-1 flex flex-col items-center justify-end min-w-0 h-full">
              {/* Amount label on hover */}
              {d.total > 0 && barHeight > 20 && (
                <span className="text-[9px] font-medium text-[var(--color-text-tertiary)] mb-1">
                  ${d.total >= 1000 ? `${(d.total / 1000).toFixed(1)}k` : d.total.toFixed(0)}
                </span>
              )}
              {/* Bar */}
              <div
                className="w-full rounded-t-md cursor-default"
                style={{
                  height: barHeight,
                  backgroundColor: d.total > 0 ? "var(--color-primary)" : "transparent",
                  opacity: d.total > 0 ? 0.7 : 0,
                  transition: "height 0.5s ease-out, opacity 0.3s",
                }}
                title={`${label}: $${d.total.toFixed(2)}`}
                onMouseEnter={(e) => { if (d.total > 0) (e.target as HTMLElement).style.opacity = "1"; }}
                onMouseLeave={(e) => { if (d.total > 0) (e.target as HTMLElement).style.opacity = "0.7"; }}
              />
              {/* Month label */}
              <span className="text-[10px] font-medium text-[var(--color-text-tertiary)] mt-1.5 truncate w-full text-center">
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Scale */}
      <div className="flex justify-between text-[10px] text-[var(--color-text-tertiary)] mt-2 px-0.5">
        <span>$0</span>
        <span>${maxTotal >= 1000 ? `${(maxTotal / 1000).toFixed(1)}k` : maxTotal.toFixed(0)}</span>
      </div>
    </div>
  );
}
