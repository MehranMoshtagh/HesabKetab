import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Receipt,
  Users,
  HandCoins,
  FolderOpen,
  Mail,
  Globe,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import LandingLanguageToggle from "@/components/landing/LandingLanguageToggle";
import ThemeToggle from "@/components/shared/ThemeToggle";

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

  const features = [
    { icon: Receipt, titleKey: "feature1Title" as const, descKey: "feature1Desc" as const },
    { icon: Users, titleKey: "feature2Title" as const, descKey: "feature2Desc" as const },
    { icon: HandCoins, titleKey: "feature3Title" as const, descKey: "feature3Desc" as const },
    { icon: FolderOpen, titleKey: "feature4Title" as const, descKey: "feature4Desc" as const },
    { icon: Mail, titleKey: "feature5Title" as const, descKey: "feature5Desc" as const },
    { icon: Globe, titleKey: "feature6Title" as const, descKey: "feature6Desc" as const },
  ];

  const steps = [
    { num: "1", titleKey: "step1Title" as const, descKey: "step1Desc" as const },
    { num: "2", titleKey: "step2Title" as const, descKey: "step2Desc" as const },
    { num: "3", titleKey: "step3Title" as const, descKey: "step3Desc" as const },
  ];

  const faqs = [
    { qKey: "faq1Q" as const, aKey: "faq1A" as const },
    { qKey: "faq2Q" as const, aKey: "faq2A" as const },
    { qKey: "faq3Q" as const, aKey: "faq3A" as const },
  ];

  const mockItems = [
    { nameKey: "mock1Name" as const, catKey: "mock1Cat" as const, amount: "-$18.50", color: "text-[var(--color-negative)]" },
    { nameKey: "mock2Name" as const, catKey: "mock2Cat" as const, amount: "+$24.00", color: "text-[var(--color-positive)]" },
    { nameKey: "mock3Name" as const, catKey: "mock3Cat" as const, amount: "-$24.00", color: "text-[var(--color-negative)]" },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--color-glass)] border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 shrink-0 min-w-0">
            <div className="w-8 h-8 bg-[var(--color-primary)] rounded-xl flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">H</span>
            </div>
            <span className="text-[var(--color-text)] text-[15px] font-semibold tracking-tight truncate">
              {appName("name")}
            </span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <ThemeToggle />
            <LandingLanguageToggle locale={locale} />
            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] px-3.5 py-2 rounded-xl hover:bg-[var(--color-hover)] transition-all duration-200"
            >
              {t("logIn")}
            </Link>
            <Link
              href="/signup"
              className="bg-[var(--color-primary)] text-white text-xs sm:text-sm font-medium px-3 sm:px-5 py-1.5 sm:py-2 rounded-full hover:bg-[var(--color-primary-hover)] transition-all duration-200 shadow-[0_1px_3px_var(--color-primary-shadow)] whitespace-nowrap"
            >
              {t("getStarted")}
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="pt-12 sm:pt-24 pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-[3.5rem] font-bold text-[var(--color-text)] mb-4 sm:mb-6 leading-[1.1] tracking-[-0.03em]">
            {t("hero")}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[var(--color-text-secondary)] mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-sm sm:max-w-none mx-auto">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white text-base sm:text-lg font-medium px-6 sm:px-8 py-3 sm:py-3.5 rounded-full hover:bg-[var(--color-primary-hover)] transition-all duration-200 shadow-[0_4px_12px_var(--color-primary-shadow)]"
            >
              {t("getStarted")}
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 text-[var(--color-text)] text-base sm:text-lg font-medium px-6 sm:px-8 py-3 sm:py-3.5 rounded-full border border-[var(--color-border-strong)] hover:bg-[var(--color-surface)] hover:shadow-[var(--shadow-card)] transition-all duration-200"
            >
              {t("logIn")}
            </Link>
          </div>
          <p className="mt-6 text-sm text-[var(--color-text-tertiary)]">
            {t("trustedBy")}
          </p>
        </div>
      </section>

      {/* ─── App Preview Mock ─── */}
      <section className="pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[var(--color-surface)] rounded-3xl shadow-[var(--shadow-elevated)] border border-[var(--color-border)] overflow-hidden">
            {/* Mock title bar — clean, no URL */}
            <div className="h-11 bg-[var(--color-bg)] border-b border-[var(--color-border)] flex items-center px-5 gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
              <div className="w-3 h-3 rounded-full bg-[#28C840]" />
              <div className="flex-1 text-center">
                <span className="text-xs font-medium text-[var(--color-text-tertiary)]">
                  {t("mockBrand")}
                </span>
              </div>
            </div>
            {/* Mock dashboard content — fully localized */}
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-[var(--color-bg)] rounded-2xl p-4 text-center">
                  <p className="text-[10px] text-[var(--color-text-tertiary)] mb-1 uppercase tracking-wide">{t("mockBalance")}</p>
                  <p className="text-xl font-bold text-[var(--color-text)]">$0.00</p>
                </div>
                <div className="bg-[var(--color-bg)] rounded-2xl p-4 text-center">
                  <p className="text-[10px] text-[var(--color-text-tertiary)] mb-1 uppercase tracking-wide">{t("mockOwe")}</p>
                  <p className="text-xl font-bold text-[var(--color-negative)]">$42.50</p>
                </div>
                <div className="bg-[var(--color-bg)] rounded-2xl p-4 text-center">
                  <p className="text-[10px] text-[var(--color-text-tertiary)] mb-1 uppercase tracking-wide">{t("mockOwed")}</p>
                  <p className="text-xl font-bold text-[var(--color-positive)]">$42.50</p>
                </div>
              </div>
              <div className="space-y-3">
                {mockItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-[var(--color-bg)] rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text)]">{t(item.nameKey)}</p>
                      <p className="text-xs text-[var(--color-text-tertiary)]">{t(item.catKey)}</p>
                    </div>
                    <span className={`text-sm font-semibold ${item.color}`}>{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 bg-[var(--color-surface)] border-y border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] tracking-[-0.025em] mb-4">
              {t("feature1Title").split(" ")[0]}{" "}
              <span className="text-[var(--color-primary)]">
                {t("feature1Title").split(" ").slice(1).join(" ")}
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="group p-6 rounded-2xl border border-[var(--color-border)] hover:shadow-[var(--shadow-elevated)] hover:border-transparent transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-[var(--color-primary)]/8 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all duration-300">
                    <Icon className="text-[var(--color-primary)] group-hover:text-white transition-colors duration-300" size={22} />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2 tracking-[-0.015em]">
                    {t(f.titleKey)}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {t(f.descKey)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] tracking-[-0.025em] mb-3">
              {t("howTitle")}
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)]">
              {t("howSubtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center mx-auto mb-5 text-2xl font-bold shadow-[0_4px_12px_var(--color-primary-shadow)]">
                  {s.num}
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                  {t(s.titleKey)}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {t(s.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner — always dark regardless of theme ─── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto bg-[#1D1D1F] rounded-3xl p-8 sm:p-12 md:p-16 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-[-0.025em] mb-4">
            {t("ctaTitle")}
          </h2>
          <p className="text-base sm:text-lg text-white/60 mb-8 max-w-xl mx-auto">
            {t("ctaSubtitle")}
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-[#1D1D1F] text-base sm:text-lg font-medium px-6 sm:px-8 py-3 sm:py-3.5 rounded-full hover:bg-gray-100 transition-all duration-200"
          >
            {t("ctaButton")}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 bg-[var(--color-surface)] border-t border-[var(--color-border)] scroll-mt-14">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] tracking-[-0.025em] mb-12 text-center">
            {t("faqTitle")}
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border)] overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-[var(--color-text)] font-medium text-base list-none">
                  {t(faq.qKey)}
                  <ChevronDown
                    size={18}
                    className="text-[var(--color-text-tertiary)] shrink-0 transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <div className="px-6 pb-5 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {t(faq.aKey)}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[var(--color-border)] py-10 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">H</span>
                </div>
                <span className="text-[var(--color-text)] text-base font-semibold tracking-tight">
                  {appName("name")}
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {t("footerTagline")}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--color-text-tertiary)] mb-3">
                {t("footerProduct")}
              </p>
              <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                <li><Link href="/features" className="hover:text-[var(--color-primary)] transition-colors">{t("footerFeatures")}</Link></li>
                <li><Link href="/pricing" className="hover:text-[var(--color-primary)] transition-colors">{t("footerPricing")}</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--color-text-tertiary)] mb-3">
                {t("footerSupport")}
              </p>
              <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                <li><a href="#faq" className="hover:text-[var(--color-primary)] transition-colors">{t("faqTitle")}</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--color-text-tertiary)] mb-3">
                {t("footerCompany")}
              </p>
              <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                <li><Link href="/about" className="hover:text-[var(--color-primary)] transition-colors">{t("footerAbout")}</Link></li>
                <li><Link href="/privacy" className="hover:text-[var(--color-primary)] transition-colors">{t("footerPrivacy")}</Link></li>
                <li><Link href="/terms" className="hover:text-[var(--color-primary)] transition-colors">{t("footerTerms")}</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-[var(--color-border)] text-center text-xs text-[var(--color-text-tertiary)]">
            &copy; {new Date().getFullYear()} {appName("name")} &mdash; {t("free")}
          </div>
        </div>
      </footer>
    </div>
  );
}
