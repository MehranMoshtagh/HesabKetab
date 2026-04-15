import { useTranslations } from "next-intl";

export default function TermsPage() {
  const t = useTranslations("pages");

  const sections = [
    { title: "termsServiceTitle", body: "termsService" },
    { title: "termsAccountTitle", body: "termsAccount" },
    { title: "termsContentTitle", body: "termsContent" },
    { title: "termsAvailabilityTitle", body: "termsAvailability" },
    { title: "termsLiabilityTitle", body: "termsLiability" },
    { title: "termsChangesTitle", body: "termsChanges" },
    { title: "termsContactTitle", body: "termsContact" },
  ] as const;

  return (
    <div>
      <h1 className="text-3xl font-bold text-[var(--color-text)] tracking-[-0.025em] mb-2">
        {t("termsTitle")}
      </h1>
      <p className="text-sm text-[var(--color-text-tertiary)] mb-8">
        {t("termsEffective")}
      </p>
      <p className="text-[15px] text-[var(--color-text-secondary)] leading-relaxed mb-10">
        {t("termsIntro")}
      </p>
      <div className="space-y-8">
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">
              {t(s.title)}
            </h2>
            <p className="text-[15px] text-[var(--color-text-secondary)] leading-relaxed">
              {t(s.body)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
