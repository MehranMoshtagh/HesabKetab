"use client";

import { useLocale } from "next-intl";
import { formatMonthKey } from "@/lib/date-utils";

interface MonthHeaderProps {
  monthKey: string; // "YYYY-MM"
}

export default function MonthHeader({ monthKey }: MonthHeaderProps) {
  const locale = useLocale();
  return (
    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
      {formatMonthKey(monthKey, locale)}
    </h3>
  );
}
