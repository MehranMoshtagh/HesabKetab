import SessionProvider from "@/components/providers/SessionProvider";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

function BackToHome() {
  const t = useTranslations("auth");
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
    >
      <ArrowLeft size={16} />
      {t("backToHome")}
    </Link>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[var(--color-bg)] p-4">
        <div className="w-full max-w-sm mb-4">
          <BackToHome />
        </div>
        {children}
      </div>
    </SessionProvider>
  );
}
