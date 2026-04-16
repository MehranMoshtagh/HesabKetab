import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";

export default function PricingPage() {
  const t = useTranslations("pages");
  const lt = useTranslations("landing");

  return (
    <div>
      <h1 className="text-3xl font-bold text-[var(--color-text)] tracking-[-0.025em] mb-3">
        {t("pricingTitle")}
      </h1>
      <p className="text-lg text-[var(--color-text-secondary)] mb-10 leading-relaxed">
        {t("pricingIntro")}
      </p>

      <div className="bg-[var(--color-surface)] rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-[var(--shadow-card)] p-8 mb-8">
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-4xl font-bold text-[var(--color-text)]">$0</span>
          <span className="text-[var(--color-text-tertiary)]">/ forever</span>
        </div>
        <span className="inline-block bg-[var(--color-positive)]/10 text-[var(--color-positive)] text-sm font-medium px-3 py-1 rounded-full mb-6">
          {t("pricingFree")}
        </span>
        <p className="text-[15px] text-[var(--color-text-secondary)] leading-relaxed mb-6">
          {t("pricingFreeDesc")}
        </p>
        <p className="text-sm text-[var(--color-text-tertiary)] leading-relaxed">
          {t("pricingFuture")}
        </p>
      </div>

      <Link
        href="/signup"
        className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white text-base font-medium px-6 py-3 rounded-full hover:bg-[var(--color-primary-hover)] transition-all duration-200 shadow-[0_4px_12px_rgba(0,113,227,0.3)]"
      >
        {lt("getStarted")}
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
