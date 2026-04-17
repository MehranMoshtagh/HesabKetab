"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import {
  LayoutDashboard,
  Receipt,
  Users,
  Activity,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  // 4 primary destinations — no redundant FAB (Add expense is on Dashboard)
  const items = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/all", label: t("allExpenses"), icon: Receipt },
    { href: "/activity", label: t("recentActivity"), icon: Activity },
    { href: "/account/settings", label: t("settings"), icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 backdrop-blur-xl bg-[var(--color-glass)] border-t border-[var(--color-border)] z-40 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-2 py-1 flex-1 min-w-0 transition-colors duration-200",
                isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-tertiary)]"
              )}
            >
              <item.icon size={20} />
              <span className="text-[10px] truncate max-w-full">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
