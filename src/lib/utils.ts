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

/** Get first initial from a name */
export function getInitial(name: string): string {
  return name?.charAt(0)?.toUpperCase() ?? "?";
}

/** Deterministic avatar color from a name */
const AVATAR_PALETTE = [
  "#0071E3", "#34C759", "#FF9500", "#AF52DE",
  "#FF3B30", "#5AC8FA", "#FF2D55", "#5856D6",
  "#FFCC00", "#30B0C7", "#FF6482", "#64D2FF",
];

export function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
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
