import { useTranslations } from "next-intl";

export default function PrivacyPage() {
  const t = useTranslations("pages");

  const sections = [
    { title: "privacyCollectTitle", body: "privacyCollect" },
    { title: "privacyUseTitle", body: "privacyUse" },
    { title: "privacyStorageTitle", body: "privacyStorage" },
    { title: "privacyRightsTitle", body: "privacyRights" },
    { title: "privacyCookiesTitle", body: "privacyCookies" },
    { title: "privacyContactTitle", body: "privacyContact" },
  ] as const;

  return (
    <div>
      <h1 className="text-3xl font-bold text-[var(--color-text)] tracking-[-0.025em] mb-2">
        {t("privacyTitle")}
      </h1>
      <p className="text-sm text-[var(--color-text-tertiary)] mb-8">
        {t("privacyEffective")}
      </p>
      <p className="text-[15px] text-[var(--color-text-secondary)] leading-relaxed mb-10">
        {t("privacyIntro")}
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
