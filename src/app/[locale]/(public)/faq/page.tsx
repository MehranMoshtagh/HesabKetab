"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ChevronDown, LifeBuoy } from "lucide-react";

const FAQ_KEYS = [
  { qKey: "faq1Q", aKey: "faq1A" },
  { qKey: "faq2Q", aKey: "faq2A" },
  { qKey: "faq3Q", aKey: "faq3A" },
  { qKey: "faq4Q", aKey: "faq4A" },
  { qKey: "faq5Q", aKey: "faq5A" },
  { qKey: "faq6Q", aKey: "faq6A" },
  { qKey: "faq7Q", aKey: "faq7A" },
  { qKey: "faq8Q", aKey: "faq8A" },
  { qKey: "faq9Q", aKey: "faq9A" },
  { qKey: "faq10Q", aKey: "faq10A" },
] as const;

export default function FaqPage() {
  const t = useTranslations("landing");
  const tSupport = useTranslations("pages");

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] tracking-[-0.025em] mb-3">
        {t("faqTitle")}
      </h1>
      <p className="text-[15px] text-[var(--color-text-secondary)] mb-10">
        {t("faqSubtitle")}
      </p>

      <div className="space-y-3">
        {FAQ_KEYS.map((faq, i) => (
          <details
            key={i}
            className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden"
          >
            <summary className="flex items-center justify-between gap-4 cursor-pointer px-5 sm:px-6 py-4 sm:py-5 text-[var(--color-text)] font-medium text-[15px] list-none">
              <span>{t(faq.qKey)}</span>
              <ChevronDown
                size={18}
                className="shrink-0 text-[var(--color-text-tertiary)] transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <div className="px-5 sm:px-6 pb-5 text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {t(faq.aKey)}
            </div>
          </details>
        ))}
      </div>

      <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 rounded-2xl bg-[var(--color-primary-light)] border border-[var(--color-primary)]/20">
        <div className="shrink-0 w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center">
          <LifeBuoy size={20} />
        </div>
        <div className="flex-1">
          <p className="text-[15px] font-medium text-[var(--color-text)] mb-1">
            {tSupport("supportTitle")}
          </p>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {tSupport("supportIntro")}
          </p>
        </div>
        <Link
          href="/support"
          className="shrink-0 bg-[var(--color-primary)] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[var(--color-primary-hover)] transition-all duration-200"
        >
          {tSupport("supportTitle")}
        </Link>
      </div>
    </div>
  );
}
