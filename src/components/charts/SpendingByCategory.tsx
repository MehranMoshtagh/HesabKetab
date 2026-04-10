"use client";

import { useTranslations } from "next-intl";
import { categories } from "@/lib/categories";

interface SpendingByCategoryProps {
  data: { category: string; total: number }[];
}

export default function SpendingByCategory({ data }: SpendingByCategoryProps) {
  const t = useTranslations();

  if (data.length === 0) return null;

  const maxTotal = Math.max(...data.map((d) => d.total));
  const grandTotal = data.reduce((s, d) => s + d.total, 0);

  const enriched = data.map((d) => {
    const parent = categories.find((c) =>
      c.subcategories.some((s) => s.id === d.category)
    );
    return {
      ...d,
      parentName: parent ? t(parent.nameKey) : t("categories.uncategorized"),
      color: parent?.color ?? "#86868B",
      icon: parent?.icon ?? "📄",
    };
  });

  const byParent = new Map<string, { name: string; color: string; icon: string; total: number }>();
  for (const item of enriched) {
    const existing = byParent.get(item.parentName);
    if (existing) {
      existing.total += item.total;
    } else {
      byParent.set(item.parentName, {
        name: item.parentName,
        color: item.color,
        icon: item.icon,
        total: item.total,
      });
    }
  }

  const sorted = [...byParent.values()].sort((a, b) => b.total - a.total);
  const maxParent = Math.max(...sorted.map((s) => s.total));

  return (
    <div className="space-y-3.5">
      {sorted.map((item) => {
        const pct = grandTotal > 0 ? (item.total / grandTotal) * 100 : 0;
        const barWidth = maxParent > 0 ? (item.total / maxParent) * 100 : 0;

        return (
          <div key={item.name}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{item.icon}</span>
                <span className="text-sm text-[var(--color-text)]">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--color-text)]">
                  ${item.total.toFixed(2)}
                </span>
                <span className="text-xs text-[var(--color-text-tertiary)]">{pct.toFixed(0)}%</span>
              </div>
            </div>
            <div className="h-2 bg-[rgba(0,0,0,0.04)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${barWidth}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
