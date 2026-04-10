import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users, Receipt, HandCoins } from "lucide-react";
import LandingLanguageToggle from "@/components/landing/LandingLanguageToggle";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (session?.user) {
    redirect(`/${locale}/dashboard`);
  }

  return <Landing locale={locale} />;
}

function Landing({ locale }: { locale: string }) {
  const t = useTranslations("landing");
  const appName = useTranslations("app");

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[rgba(255,255,255,0.72)] border-b border-[rgba(0,0,0,0.06)]">
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
          <span className="text-[var(--color-text)] text-base font-semibold tracking-tight">
            {appName("name")}
          </span>
          <div className="flex items-center gap-4">
            <LandingLanguageToggle locale={locale} />
            <Link
              href="/login"
              className="text-sm text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors"
            >
              {t("logIn")}
            </Link>
            <Link
              href="/signup"
              className="bg-[var(--color-primary)] text-white text-sm font-medium px-5 py-1.5 rounded-full hover:bg-[var(--color-primary-hover)] transition-all duration-200"
            >
              {t("getStarted")}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-[3.25rem] font-bold text-[var(--color-text)] mb-5 leading-tight tracking-[-0.025em]">
            {t("hero")}
          </h1>
          <p className="text-lg md:text-xl text-[var(--color-text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
          <Link
            href="/signup"
            className="inline-block bg-[var(--color-primary)] text-white text-lg font-medium px-8 py-3.5 rounded-full hover:bg-[var(--color-primary-hover)] transition-all duration-200 shadow-[0_4px_12px_rgba(0,113,227,0.3)]"
          >
            {t("getStarted")}
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-8 text-center border border-[rgba(0,0,0,0.06)] shadow-[var(--shadow-card)]">
            <div className="w-14 h-14 bg-[var(--color-primary)]/8 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Receipt className="text-[var(--color-primary)]" size={26} />
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2 tracking-[-0.015em]">
              {t("feature1Title")}
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {t("feature1Desc")}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 text-center border border-[rgba(0,0,0,0.06)] shadow-[var(--shadow-card)]">
            <div className="w-14 h-14 bg-[var(--color-primary)]/8 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Users className="text-[var(--color-primary)]" size={26} />
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2 tracking-[-0.015em]">
              {t("feature2Title")}
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {t("feature2Desc")}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 text-center border border-[rgba(0,0,0,0.06)] shadow-[var(--shadow-card)]">
            <div className="w-14 h-14 bg-[var(--color-primary)]/8 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <HandCoins className="text-[var(--color-primary)]" size={26} />
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2 tracking-[-0.015em]">
              {t("feature3Title")}
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {t("feature3Desc")}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-[var(--color-text-tertiary)] py-10 border-t border-[rgba(0,0,0,0.06)]">
        {appName("name")} &mdash; {t("free")}
      </footer>
    </div>
  );
}
