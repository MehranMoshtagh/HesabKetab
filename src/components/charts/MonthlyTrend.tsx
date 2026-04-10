"use client";

interface MonthlyTrendProps {
  data: { month: string; total: number }[];
}

export default function MonthlyTrend({ data }: MonthlyTrendProps) {
  if (data.length === 0) return null;

  const maxTotal = Math.max(...data.map((d) => d.total), 1);
  const chartHeight = 140;
  const chartWidth = 100; // percentage-based, will scale
  const barGap = 2;

  const barCount = data.length;
  const barWidth = barCount > 0 ? (chartWidth - barGap * (barCount - 1)) / barCount : 10;

  return (
    <div>
      {/* SVG Bar chart */}
      <svg
        viewBox={`0 0 ${chartWidth + 10} ${chartHeight + 20}`}
        className="w-full h-40"
        preserveAspectRatio="xMidYMid meet"
      >
        {data.map((d, i) => {
          const barHeight = (d.total / maxTotal) * chartHeight;
          const x = 5 + i * (barWidth + barGap);
          const y = chartHeight - barHeight;

          // Month label
          const date = new Date(d.month + "-01");
          const label = date.toLocaleDateString("en-US", { month: "short" });

          return (
            <g key={d.month}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={1.5}
                fill="#5bc5a7"
                opacity={0.8}
              />
              {/* Amount label on hover area */}
              <title>{`${label}: $${d.total.toFixed(2)}`}</title>
              {/* Month label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 12}
                textAnchor="middle"
                className="fill-gray-400"
                fontSize="4"
              >
                {label}
              </text>
            </g>
          );
        })}
        {/* Baseline */}
        <line
          x1="5"
          y1={chartHeight}
          x2={chartWidth + 5}
          y2={chartHeight}
          stroke="#e5e7eb"
          strokeWidth="0.5"
        />
      </svg>

      {/* Legend */}
      <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
        <span>${0}</span>
        <span>${maxTotal.toFixed(0)}</span>
      </div>
    </div>
  );
}
