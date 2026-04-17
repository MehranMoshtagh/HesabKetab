"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import {
  LayoutDashboard,
  Activity,
  Receipt,
  Users,
  Plus,
  Search,
  Mail,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const { friends, groups } = useAppStore();
  const [filter, setFilter] = useState("");

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  const navItems = [
    { href: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/activity", label: t("nav.recentActivity"), icon: Activity },
    { href: "/all", label: t("nav.allExpenses"), icon: Receipt },
  ];

  const lowerFilter = filter.toLowerCase();
  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(lowerFilter)
  );
  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(lowerFilter)
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 lg:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      {/* Drawer */}
      <aside
        className={cn(
          "fixed top-0 start-0 bottom-0 w-[85%] max-w-sm bg-[var(--color-surface)] z-50 transition-transform duration-300 ease-out lg:hidden flex flex-col",
          open ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <span className="text-base font-semibold text-[var(--color-text)] tracking-tight">
            {t("app.name")}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--color-hover)] text-[var(--color-text-tertiary)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto py-3 px-3">
          {/* Main nav */}
          <nav className="space-y-1 mb-5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                  pathname === item.href
                    ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]"
                )}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Filter input */}
          <div className="px-1 mb-4">
            <div className="relative">
              <Search
                size={14}
                className="absolute start-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none"
              />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder={t("nav.filterByName")}
                className="w-full ps-8 pe-3 py-2 text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>

          {/* Groups */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5 px-3">
              <h3 className="text-xs font-semibold text-[var(--color-text-tertiary)]">
                {t("nav.groups")}
              </h3>
              <Link
                href="/groups/new"
                className="text-[var(--color-primary)] hover:opacity-70 transition-opacity"
              >
                <Plus size={14} />
              </Link>
            </div>
            <div className="space-y-0.5 max-h-[240px] overflow-y-auto">
              {filteredGroups.length === 0 && filter && (
                <p className="px-3 py-2 text-xs text-[var(--color-text-tertiary)]">
                  {t("common.noResults")}
                </p>
              )}
              {filteredGroups.slice(0, filter ? 20 : 10).map((g) => (
                <Link
                  key={g.id}
                  href={`/groups/${g.id}`}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-200",
                    pathname === `/groups/${g.id}`
                      ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]"
                  )}
                >
                  <Users size={15} className="shrink-0 text-[var(--color-text-tertiary)]" />
                  <span className="truncate">{g.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Friends */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5 px-3">
              <h3 className="text-xs font-semibold text-[var(--color-text-tertiary)]">
                {t("nav.friends")}
              </h3>
              <Link
                href="/friends/add"
                className="text-[var(--color-primary)] hover:opacity-70 transition-opacity"
              >
                <Plus size={14} />
              </Link>
            </div>
            <div className="space-y-0.5 max-h-[280px] overflow-y-auto">
              {filteredFriends.length === 0 && filter && (
                <p className="px-3 py-2 text-xs text-[var(--color-text-tertiary)]">
                  {t("common.noResults")}
                </p>
              )}
              {filteredFriends.slice(0, filter ? 20 : 10).map((f) => (
                <Link
                  key={f.id}
                  href={`/friends/${f.id}`}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm cursor-pointer transition-all duration-200",
                    pathname === `/friends/${f.id}`
                      ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]"
                  )}
                >
                  <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] text-xs font-semibold">
                    {f.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="truncate">{f.name}</span>
                </Link>
              ))}
              {!filter && filteredFriends.length > 10 && (
                <p className="px-3 py-1.5 text-xs text-[var(--color-text-tertiary)]">
                  +{filteredFriends.length - 10} more — use search above
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer — Add friend */}
        <div className="px-1 py-2 border-t border-[var(--color-border)]">
          <Link
            href="/friends/add"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)] transition-all duration-200"
          >
            <Mail size={16} className="text-[var(--color-text-tertiary)]" />
            <span>{t("friend.addFriend")}</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
