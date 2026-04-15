"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { Bell, ChevronDown, Globe, LogOut, Settings } from "lucide-react";
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
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--color-glass)] border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="text-base font-semibold text-[var(--color-text)] tracking-tight"
        >
          {t("app.name")}
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={toggleLocale}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[var(--color-hover)] text-sm text-[var(--color-text-secondary)] transition-all duration-200"
            title={t("nav.language")}
          >
            <Globe size={15} />
            <span className="text-xs">{locale === "en" ? "فا" : "EN"}</span>
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-[var(--color-hover)] text-[var(--color-text-secondary)] transition-all duration-200">
            <Bell size={18} />
          </button>

          {/* User menu */}
          {session?.user && (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-[var(--color-hover)] transition-all duration-200"
              >
                <div className="w-7 h-7 rounded-full bg-[var(--color-primary)]/12 flex items-center justify-center text-xs font-semibold text-[var(--color-primary)]">
                  {session.user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <ChevronDown size={12} className="text-[var(--color-text-tertiary)]" />
              </button>

              {menuOpen && (
                <div className="absolute end-0 mt-2 w-48 bg-white rounded-xl shadow-[var(--shadow-elevated)] border border-[var(--color-border)] py-1 z-50">
                  <Link
                    href="/account/settings"
                    className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[var(--color-hover)] text-sm text-[var(--color-text)] transition-colors duration-150"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Settings size={15} className="text-[var(--color-text-secondary)]" />
                    {t("nav.settings")}
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-[var(--color-hover)] text-sm text-[var(--color-text)] transition-colors duration-150"
                  >
                    <LogOut size={15} className="text-[var(--color-text-secondary)]" />
                    {t("nav.logOut")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
