import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, localeDirection, type Locale } from "@/i18n/config";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "HesabKetab — حساب‌کتاب",
  description: "Split expenses with friends — تقسیم هزینه‌ها با دوستان",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = localeDirection[locale as Locale];
  const isFa = locale === "fa";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        {isFa && (
          <link
            href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100..900&display=swap"
            rel="stylesheet"
          />
        )}
        {/* Prevent theme flash — apply stored theme before paint */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var t = localStorage.getItem('theme');
            if (t === 'dark' || t === 'light') {
              document.documentElement.setAttribute('data-theme', t);
            }
          } catch(e) {}
        ` }} />
      </head>
      <body
        className={`min-h-screen bg-[var(--color-bg)] antialiased ${isFa ? "font-[Vazirmatn]" : ""}`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
