import jalaali from "jalaali-js";
import { toPersianDigits } from "./utils";

const persianMonths = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const persianMonthsShort = [
  "فرو",
  "ارد",
  "خرد",
  "تیر",
  "مرد",
  "شهر",
  "مهر",
  "آبا",
  "آذر",
  "دی",
  "بهم",
  "اسف",
];

/**
 * Format a date for display based on locale.
 * - English: "March 2026", "Mar 15", etc.
 * - Persian: Jalali date with Persian digits
 */
export function formatDate(
  date: Date | string,
  locale: string,
  format: "full" | "monthYear" | "monthDay" | "short" = "full"
): string {
  const d = typeof date === "string" ? new Date(date) : date;

  if (locale === "fa") {
    const { jy, jm, jd } = jalaali.toJalaali(
      d.getFullYear(),
      d.getMonth() + 1,
      d.getDate()
    );

    switch (format) {
      case "monthYear":
        return `${persianMonths[jm - 1]} ${toPersianDigits(jy)}`;
      case "monthDay":
        return `${toPersianDigits(jd)} ${persianMonthsShort[jm - 1]}`;
      case "short":
        return toPersianDigits(`${jy}/${jm}/${jd}`);
      case "full":
      default:
        return `${toPersianDigits(jd)} ${persianMonths[jm - 1]} ${toPersianDigits(jy)}`;
    }
  }

  // English
  switch (format) {
    case "monthYear":
      return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    case "monthDay":
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    case "short":
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    case "full":
    default:
      return d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
  }
}

/**
 * Get the short month abbreviation for a date.
 */
export function getMonthAbbr(date: Date | string, locale: string): string {
  const d = typeof date === "string" ? new Date(date) : date;

  if (locale === "fa") {
    const { jm } = jalaali.toJalaali(
      d.getFullYear(),
      d.getMonth() + 1,
      d.getDate()
    );
    return persianMonthsShort[jm - 1];
  }

  return d.toLocaleDateString("en-US", { month: "short" });
}

/**
 * Get the day number, with Persian digits if locale is fa.
 */
export function getDayNumber(date: Date | string, locale: string): string {
  const d = typeof date === "string" ? new Date(date) : date;

  if (locale === "fa") {
    const { jd } = jalaali.toJalaali(
      d.getFullYear(),
      d.getMonth() + 1,
      d.getDate()
    );
    return toPersianDigits(jd);
  }

  return String(d.getDate());
}

/**
 * Format a month key (YYYY-MM) to display label.
 */
export function formatMonthKey(monthKey: string, locale: string): string {
  const d = new Date(monthKey + "-01");
  return formatDate(d, locale, "monthYear");
}
