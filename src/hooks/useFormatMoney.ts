"use client";

import { useLocale } from "next-intl";
import { getCurrencySymbol } from "@/lib/currencies";
import { toPersianDigits } from "@/lib/utils";

/**
 * Returns a locale-aware money formatter.
 * In Persian locale, digits are converted to Persian numerals.
 */
export function useFormatMoney() {
  const locale = useLocale();

  return (amount: number, currency: string = "USD") => {
    const symbol = getCurrencySymbol(currency);
    const absAmount = Math.abs(amount).toFixed(2);

    if (locale === "fa") {
      return `${toPersianDigits(absAmount)} ${symbol}`;
    }

    return `${symbol}${absAmount}`;
  };
}
