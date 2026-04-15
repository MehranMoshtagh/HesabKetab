"use client";

interface MonthlyTrendProps {
  data: { month: string; total: number }[];
}

export default function MonthlyTrend({ data }: MonthlyTrendProps) {
  if (data.length === 0) return null;

  const maxTotal = Math.max(...data.map((d) => d.total), 1);
  const chartHeight = 140;
  const chartWidth = 100;
  const barGap = 2;

  const barCount = data.length;
  const barWidth = barCount > 0 ? (chartWidth - barGap * (barCount - 1)) / barCount : 10;

  return (
    <div>
      <svg
        viewBox={`0 0 ${chartWidth + 10} ${chartHeight + 20}`}
        className="w-full h-40"
        preserveAspectRatio="xMidYMid meet"
      >
        {data.map((d, i) => {
          const barHeight = (d.total / maxTotal) * chartHeight;
          const x = 5 + i * (barWidth + barGap);
          const y = chartHeight - barHeight;

          const date = new Date(d.month + "-01");
          const label = date.toLocaleDateString("en-US", { month: "short" });

          return (
            <g key={d.month}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={2}
                fill="var(--color-primary)"
                opacity={0.7}
              />
              <title>{`${label}: $${d.total.toFixed(2)}`}</title>
              <text
                x={x + barWidth / 2}
                y={chartHeight + 12}
                textAnchor="middle"
                className="fill-[var(--color-text-tertiary)]"
                fontSize="4"
              >
                {label}
              </text>
            </g>
          );
        })}
        <line
          x1="5"
          y1={chartHeight}
          x2={chartWidth + 5}
          y2={chartHeight}
          stroke="var(--color-border)"
          strokeWidth="0.5"
        />
      </svg>

      <div className="flex justify-between text-xs text-[var(--color-text-tertiary)] mt-1 px-1">
        <span>${0}</span>
        <span>${maxTotal.toFixed(0)}</span>
      </div>
    </div>
  );
}
