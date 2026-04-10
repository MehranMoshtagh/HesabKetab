export interface Currency {
  code: string;
  name: string;
  nameFa: string;
  symbol: string;
}

export const currencies: Currency[] = [
  { code: "USD", name: "US Dollar", nameFa: "دلار آمریکا", symbol: "$" },
  { code: "EUR", name: "Euro", nameFa: "یورو", symbol: "€" },
  { code: "GBP", name: "British Pound", nameFa: "پوند بریتانیا", symbol: "£" },
  { code: "IRR", name: "Iranian Rial", nameFa: "ریال ایران", symbol: "﷼" },
  { code: "IRT", name: "Iranian Toman", nameFa: "تومان ایران", symbol: "ت" },
  { code: "AED", name: "UAE Dirham", nameFa: "درهم امارات", symbol: "د.إ" },
  { code: "TRY", name: "Turkish Lira", nameFa: "لیر ترکیه", symbol: "₺" },
  { code: "CAD", name: "Canadian Dollar", nameFa: "دلار کانادا", symbol: "CA$" },
  { code: "AUD", name: "Australian Dollar", nameFa: "دلار استرالیا", symbol: "A$" },
  { code: "JPY", name: "Japanese Yen", nameFa: "ین ژاپن", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", nameFa: "یوان چین", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", nameFa: "روپیه هند", symbol: "₹" },
  { code: "KRW", name: "South Korean Won", nameFa: "وون کره جنوبی", symbol: "₩" },
  { code: "BRL", name: "Brazilian Real", nameFa: "رئال برزیل", symbol: "R$" },
  { code: "CHF", name: "Swiss Franc", nameFa: "فرانک سوئیس", symbol: "CHF" },
  { code: "SEK", name: "Swedish Krona", nameFa: "کرون سوئد", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", nameFa: "کرون نروژ", symbol: "kr" },
  { code: "MXN", name: "Mexican Peso", nameFa: "پزو مکزیک", symbol: "MX$" },
  { code: "SGD", name: "Singapore Dollar", nameFa: "دلار سنگاپور", symbol: "S$" },
  { code: "HKD", name: "Hong Kong Dollar", nameFa: "دلار هنگ‌کنگ", symbol: "HK$" },
  { code: "RUB", name: "Russian Ruble", nameFa: "روبل روسیه", symbol: "₽" },
  { code: "ZAR", name: "South African Rand", nameFa: "رند آفریقای جنوبی", symbol: "R" },
  { code: "THB", name: "Thai Baht", nameFa: "بات تایلند", symbol: "฿" },
  { code: "MYR", name: "Malaysian Ringgit", nameFa: "رینگیت مالزی", symbol: "RM" },
  { code: "PHP", name: "Philippine Peso", nameFa: "پزو فیلیپین", symbol: "₱" },
  { code: "SAR", name: "Saudi Riyal", nameFa: "ریال عربستان", symbol: "﷼" },
  { code: "QAR", name: "Qatari Riyal", nameFa: "ریال قطر", symbol: "﷼" },
  { code: "KWD", name: "Kuwaiti Dinar", nameFa: "دینار کویت", symbol: "د.ك" },
  { code: "PKR", name: "Pakistani Rupee", nameFa: "روپیه پاکستان", symbol: "₨" },
  { code: "AFN", name: "Afghan Afghani", nameFa: "افغانی افغانستان", symbol: "؋" },
];

export function findCurrency(code: string): Currency | undefined {
  return currencies.find((c) => c.code === code);
}

export function getCurrencySymbol(code: string): string {
  return findCurrency(code)?.symbol ?? code;
}
