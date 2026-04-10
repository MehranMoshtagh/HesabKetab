import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users, Receipt, HandCoins } from "lucide-react";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  // If already logged in, go to dashboard
  if (session?.user) {
    redirect(`/${locale}/dashboard`);
  }

  return <Landing locale={locale} />;
}

function Landing({ locale }: { locale: string }) {
  const t = useTranslations("landing");
  const appName = useTranslations("app");

  return (
    <div className="min-h-screen bg-[#eeeeee]">
      {/* Navbar */}
      <nav className="bg-[#5bc5a7] text-white">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">
            {appName("name")}
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium hover:text-white/80 transition-colors"
            >
              {t("logIn")}
            </Link>
            <Link
              href="/signup"
              className="bg-white text-[#5bc5a7] text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-white/90 transition-colors"
            >
              {t("getStarted")}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-[#5bc5a7] text-white pb-16 pt-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {t("hero")}
          </h1>
          <p className="text-lg md:text-xl text-white/85 mb-8 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
          <Link
            href="/signup"
            className="inline-block bg-[#ff652f] text-white text-lg font-semibold px-8 py-3 rounded-lg hover:bg-[#e5551f] transition-colors shadow-lg"
          >
            {t("getStarted")}
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-14 h-14 bg-[#5bc5a7]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="text-[#5bc5a7]" size={28} />
            </div>
            <h3 className="text-lg font-bold text-[#333] mb-2">
              {t("feature1Title")}
            </h3>
            <p className="text-sm text-gray-500">{t("feature1Desc")}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-14 h-14 bg-[#5bc5a7]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-[#5bc5a7]" size={28} />
            </div>
            <h3 className="text-lg font-bold text-[#333] mb-2">
              {t("feature2Title")}
            </h3>
            <p className="text-sm text-gray-500">{t("feature2Desc")}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-14 h-14 bg-[#5bc5a7]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <HandCoins className="text-[#5bc5a7]" size={28} />
            </div>
            <h3 className="text-lg font-bold text-[#333] mb-2">
              {t("feature3Title")}
            </h3>
            <p className="text-sm text-gray-500">{t("feature3Desc")}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-400 py-8">
        {appName("name")} &mdash; {t("free")}
      </footer>
    </div>
  );
}
