import { useTranslations } from "next-intl";

export default function AboutPage() {
  const t = useTranslations("pages");

  return (
    <div>
      <h1 className="text-3xl font-bold text-[var(--color-text)] tracking-[-0.025em] mb-8">
        {t("aboutTitle")}
      </h1>
      <div className="space-y-5 text-[15px] text-[var(--color-text-secondary)] leading-relaxed">
        <p>{t("aboutP1")}</p>
        <p>{t("aboutP2")}</p>
        <p>{t("aboutP3")}</p>
      </div>
    </div>
  );
}
