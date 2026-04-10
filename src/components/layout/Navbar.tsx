"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { Bell, ChevronDown, Globe, LogOut, Settings, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import type { Locale } from "@/i18n/config";

export default function Navbar() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleLocale = () => {
    const next = locale === "en" ? "fa" : "en";
    router.replace(pathname, { locale: next as Locale });
  };

  return (
    <nav className="bg-[#5bc5a7] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="text-xl font-bold tracking-tight">
          {t("app.name")}
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <button
            onClick={toggleLocale}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/20 text-sm"
            title={t("nav.language")}
          >
            <Globe size={16} />
            <span>{locale === "en" ? "فا" : "EN"}</span>
          </button>

          {/* Notifications */}
          <button className="relative p-1 rounded hover:bg-white/20">
            <Bell size={20} />
          </button>

          {/* User menu */}
          {session?.user ? (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/20"
              >
                <div className="w-7 h-7 rounded-full bg-white/30 flex items-center justify-center text-sm font-medium">
                  {session.user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <ChevronDown size={14} />
              </button>

              {menuOpen && (
                <div className="absolute end-0 mt-1 w-48 bg-white rounded-md shadow-lg text-[#333] py-1 z-50">
                  <Link
                    href="/account/settings"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Settings size={14} />
                    {t("nav.settings")}
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
                    className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    <LogOut size={14} />
                    {t("nav.logOut")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1 rounded text-sm hover:bg-white/20"
              >
                {t("auth.logIn")}
              </Link>
              <Link
                href="/signup"
                className="px-3 py-1 rounded bg-white text-[#5bc5a7] text-sm font-medium"
              >
                {t("auth.signUp")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
