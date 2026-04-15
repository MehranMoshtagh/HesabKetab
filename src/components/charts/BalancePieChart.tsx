"use client";

import { useTranslations } from "next-intl";

interface BalancePieChartProps {
  owed: number;
  owing: number;
}

export default function BalancePieChart({ owed, owing }: BalancePieChartProps) {
  const t = useTranslations("dashboard");
  const total = owed + owing;

  if (total === 0) {
    return (
      <div className="text-center py-6">
        <svg viewBox="0 0 100 100" className="w-32 h-32 mx-auto">
          <circle cx="50" cy="50" r="40" className="fill-[var(--color-hover)]" />
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-[var(--color-text-tertiary)]"
            fontSize="8"
          >
            {t("settledUp")}
          </text>
        </svg>
      </div>
    );
  }

  const owedPct = total > 0 ? owed / total : 0;
  const owedAngle = owedPct * 360;

  const describeArc = (
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number
  ) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} L ${cx} ${cy} Z`;
  };

  const polarToCartesian = (
    cx: number,
    cy: number,
    r: number,
    angleInDegrees: number
  ) => {
    const rad = ((angleInDegrees - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  return (
    <div className="text-center">
      <svg viewBox="0 0 120 120" className="w-40 h-40 mx-auto">
        {owing > 0 && (
          <path
            d={
              owed === 0
                ? describeArc(60, 60, 45, 0, 359.99)
                : describeArc(60, 60, 45, owedAngle, 360)
            }
            fill="var(--color-negative)"
            opacity={0.75}
          />
        )}
        {owed > 0 && (
          <path
            d={
              owing === 0
                ? describeArc(60, 60, 45, 0, 359.99)
                : describeArc(60, 60, 45, 0, owedAngle)
            }
            fill="var(--color-positive)"
            opacity={0.75}
          />
        )}
        <circle cx="60" cy="60" r="28" fill="white" />
        <text
          x="60"
          y="57"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-[var(--color-text)]"
          fontSize="7"
          fontWeight="600"
        >
          ${Math.abs(owed - owing).toFixed(2)}
        </text>
        <text
          x="60"
          y="67"
          textAnchor="middle"
          dominantBaseline="middle"
          className={owed >= owing ? "fill-[var(--color-positive)]" : "fill-[var(--color-negative)]"}
          fontSize="5"
        >
          {owed >= owing ? "net owed" : "net owing"}
        </text>
      </svg>

      <div className="flex justify-center gap-6 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[var(--color-positive)]" />
          <span className="text-xs text-[var(--color-text-secondary)]">
            {t("youAreOwed")}: ${owed.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[var(--color-negative)]" />
          <span className="text-xs text-[var(--color-text-secondary)]">
            {t("youOwe")}: ${owing.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
