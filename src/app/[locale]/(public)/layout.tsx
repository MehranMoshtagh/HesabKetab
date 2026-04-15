import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import LandingLanguageToggle from "@/components/landing/LandingLanguageToggle";

function PublicNav({ locale }: { locale: string }) {
  const appName = useTranslations("app");
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[rgba(255,255,255,0.72)] border-b border-[rgba(0,0,0,0.06)]">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[var(--color-primary)] rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-bold">H</span>
          </div>
          <span className="text-[var(--color-text)] text-[15px] font-semibold tracking-tight">
            {appName("name")}
          </span>
        </Link>
        <LandingLanguageToggle locale={locale} />
      </div>
    </nav>
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
    <div className="min-h-screen bg-[var(--color-bg)]">
      <PublicNav locale={locale} />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          <span>{locale === "fa" ? "بازگشت به خانه" : "Back to home"}</span>
        </Link>
        {children}
      </main>
    </div>
  );
}
