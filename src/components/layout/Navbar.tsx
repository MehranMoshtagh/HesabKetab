"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { Bell, ChevronDown, Globe, LogOut, Settings, Sun, Moon, Menu } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import type { Locale } from "@/i18n/config";
import MobileDrawer from "./MobileDrawer";

function useTheme() {
  const [theme, setThemeState] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    if (stored) {
      setThemeState(stored);
      document.documentElement.classList.toggle("dark", stored === "dark");
    }
  }, []);

  const setTheme = (t: "light" | "dark" | "system") => {
    setThemeState(t);
    if (t === "system") {
      localStorage.removeItem("theme");
      document.documentElement.classList.remove("dark");
      document.documentElement.removeAttribute("data-theme");
    } else {
      localStorage.setItem("theme", t);
      document.documentElement.classList.toggle("dark", t === "dark");
      document.documentElement.setAttribute("data-theme", t);
    }
  };

  const isDark = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return { theme, setTheme, isDark };
}

export default function Navbar() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isDark, setTheme } = useTheme();

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

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--color-glass)] border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden p-2 -ms-1 rounded-lg hover:bg-[var(--color-hover)] text-[var(--color-text-secondary)] transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <Link
            href="/dashboard"
            className="text-base font-semibold text-[var(--color-text)] tracking-tight"
          >
            {t("app.name")}
          </Link>
        </div>

        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-[var(--color-hover)] text-[var(--color-text-secondary)] transition-all duration-200"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

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
                <div className="w-7 h-7 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-xs font-semibold text-[var(--color-primary)]">
                  {session.user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <ChevronDown size={12} className="text-[var(--color-text-tertiary)]" />
              </button>

              {menuOpen && (
                <div className="absolute end-0 mt-2 w-48 bg-[var(--color-surface)] rounded-xl shadow-[var(--shadow-elevated)] border border-[var(--color-border)] py-1 z-50">
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
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </nav>
  );
}
