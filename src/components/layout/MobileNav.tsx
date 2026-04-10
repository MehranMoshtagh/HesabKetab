"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import {
  LayoutDashboard,
  Receipt,
  Plus,
  Users,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

export default function MobileNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { openAddExpense } = useAppStore();

  const items = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/all", label: t("allExpenses"), icon: Receipt },
    { href: "#add", label: "+", icon: Plus, isAction: true },
    { href: "/groups/new", label: t("groups"), icon: Users },
    { href: "/activity", label: t("recentActivity"), icon: Activity },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t z-50 lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {items.map((item) => {
          if (item.isAction) {
            return (
              <button
                key="add"
                onClick={() => openAddExpense()}
                className="flex flex-col items-center justify-center -mt-4"
              >
                <div className="w-12 h-12 rounded-full bg-[#ff652f] text-white flex items-center justify-center shadow-lg">
                  <Plus size={24} />
                </div>
              </button>
            );
          }

          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-2 py-1 min-w-0",
                isActive ? "text-[#5bc5a7]" : "text-gray-400"
              )}
            >
              <item.icon size={20} />
              <span className="text-[10px] truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
