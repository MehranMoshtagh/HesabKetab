import { useTranslations } from "next-intl";
import { Check } from "lucide-react";

export default function FeaturesPage() {
  const t = useTranslations("pages");

  const features = Array.from({ length: 12 }, (_, i) => `feat${i + 1}` as const);

  return (
    <div>
      <h1 className="text-3xl font-bold text-[var(--color-text)] tracking-[-0.025em] mb-3">
        {t("featuresTitle")}
      </h1>
      <p className="text-lg text-[var(--color-text-secondary)] mb-10 leading-relaxed">
        {t("featuresIntro")}
      </p>
      <div className="space-y-4">
        {features.map((key) => (
          <div
            key={key}
            className="flex items-start gap-3 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] px-5 py-4"
          >
            <div className="w-6 h-6 bg-[var(--color-positive)]/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <Check size={14} className="text-[var(--color-positive)]" />
            </div>
            <p className="text-[15px] text-[var(--color-text)] leading-relaxed">
              {t(key)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
