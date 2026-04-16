"use client";

import { useTranslations } from "next-intl";

interface BalancePieChartProps {
  owed: number;
  owing: number;
}

/**
 * Clean donut chart with two colored arcs (owed vs owing).
 * Uses stroke-dasharray on <circle> elements for simplicity
 * instead of complex SVG path math.
 */
export default function BalancePieChart({ owed, owing }: BalancePieChartProps) {
  const t = useTranslations("dashboard");
  const total = owed + owing;
  const net = Math.abs(owed - owing);

  /* ── Donut geometry ── */
  const cx = 60;
  const cy = 60;
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 12;

  /* ── Zero / settled state ── */
  if (total === 0) {
    return (
      <div className="flex flex-col items-center py-6 gap-3">
        <svg viewBox="0 0 120 120" className="w-36 h-36">
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#E5E5EA"
            strokeWidth={strokeWidth}
            opacity={0.5}
          />
        </svg>
        <p className="text-sm font-medium text-[var(--color-positive)]">
          {t("settledUp")}
        </p>
      </div>
    );
  }

  const owedFraction = owed / total;
  const owingFraction = owing / total;

  /* Dash lengths for each arc */
  const owedDash = owedFraction * circumference;
  const owingDash = owingFraction * circumference;

  return (
    <div className="flex flex-col items-center">
      {/* Donut */}
      <div className="relative w-52 h-52">
        <svg viewBox="0 0 120 120" className="w-full h-full">
          {/* Background track */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#E5E5EA"
            strokeWidth={strokeWidth}
            opacity={0.25}
          />

          {/* Owing arc (red) — drawn first so green overlaps at start */}
          {owing > 0 && (
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="#FF3B30"
              strokeWidth={strokeWidth}
              strokeDasharray={`${owingDash} ${circumference - owingDash}`}
              strokeDashoffset={-owedDash}
              strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition: "stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease" }}
            />
          )}

          {/* Owed arc (green) — starts at 12 o'clock */}
          {owed > 0 && (
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="#34C759"
              strokeWidth={strokeWidth}
              strokeDasharray={`${owedDash} ${circumference - owedDash}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition: "stroke-dasharray 0.6s ease" }}
            />
          )}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold tracking-tight text-[var(--color-text)]">
            ${net.toFixed(2)}
          </span>
          <span
            className={`text-[11px] font-medium ${
              owed >= owing
                ? "text-[var(--color-positive)]"
                : "text-[var(--color-negative)]"
            }`}
          >
            {owed >= owing ? t("youAreOwed") : t("youOwe")}
          </span>
        </div>
      </div>

      {/* Legend pills */}
      <div className="flex items-center gap-4 mt-4">
        <div className="flex items-center gap-1.5 bg-[var(--color-positive-light)] rounded-full px-3 py-1">
          <div className="w-2 h-2 rounded-full bg-[var(--color-positive)]" />
          <span className="text-xs font-medium text-[var(--color-positive)]">
            ${owed.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-[var(--color-negative-light)] rounded-full px-3 py-1">
          <div className="w-2 h-2 rounded-full bg-[var(--color-negative)]" />
          <span className="text-xs font-medium text-[var(--color-negative)]">
            ${owing.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
