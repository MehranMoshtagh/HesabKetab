"use client";

import { Globe } from "lucide-react";
import { useRouter, usePathname } from "@/i18n/routing";
import type { Locale } from "@/i18n/config";

export default function LandingLanguageToggle({ locale }: { locale: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const next = locale === "en" ? "fa" : "en";
    router.replace(pathname, { locale: next as Locale });
  };

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
    >
      <Globe size={15} />
      <span className="hidden sm:inline">{locale === "en" ? "فارسی" : "English"}</span>
    </button>
  );
}
