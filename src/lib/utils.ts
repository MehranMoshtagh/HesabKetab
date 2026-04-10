import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Convert Latin digits (0-9) to Persian digits (۰-۹) */
export function toPersianDigits(str: string | number): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(str).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

/** Format a monetary amount with proper locale handling */
export function formatMoney(
  amount: number,
  currency: string = "USD",
  locale: string = "en"
): string {
  const formatted = new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  return formatted;
}
