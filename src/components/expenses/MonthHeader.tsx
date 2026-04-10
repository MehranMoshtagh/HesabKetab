"use client";

import { useLocale } from "next-intl";
import { formatMonthKey } from "@/lib/date-utils";

interface MonthHeaderProps {
  monthKey: string;
}

export default function MonthHeader({ monthKey }: MonthHeaderProps) {
  const locale = useLocale();
  return (
    <h3 className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2.5 px-1">
      {formatMonthKey(monthKey, locale)}
    </h3>
  );
}
