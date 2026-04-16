import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import LandingLanguageToggle from "@/components/landing/LandingLanguageToggle";

function PublicNav({ locale }: { locale: string }) {
  const appName = useTranslations("app");
  const t = useTranslations("landing");
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--color-glass)] border-b border-[var(--color-border)]">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[var(--color-primary)] rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-bold">H</span>
          </div>
          <span className="text-[var(--color-text)] text-[15px] font-semibold tracking-tight">
            {appName("name")}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <LandingLanguageToggle locale={locale} />
          <Link
            href="/login"
            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] px-3.5 py-2 rounded-xl hover:bg-[var(--color-hover)] transition-all duration-200"
          >
            {t("logIn")}
          </Link>
          <Link
            href="/signup"
            className="bg-[var(--color-primary)] text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-[var(--color-primary-hover)] transition-all duration-200 shadow-[0_1px_3px_var(--color-primary-shadow)]"
          >
            {t("getStarted")}
          </Link>
        </div>
      </div>
    </nav>
  );
}

function PublicFooter({ locale }: { locale: string }) {
  const appName = useTranslations("app");
  const t = useTranslations("landing");
  return (
    <footer className="border-t border-[var(--color-border)] py-12 px-6">
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
              <li><Link href="/about" className="hover:text-[var(--color-primary)] transition-colors">{t("faqTitle")}</Link></li>
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
  );
}

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <PublicNav locale={locale} />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16">
        {children}
      </main>
      <PublicFooter locale={locale} />
    </div>
  );
}
