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
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  groups?: { id: string; name: string }[];
  friends?: { id: string; name: string }[];
}

export default function Sidebar({ groups = [], friends = [] }: SidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const [filter, setFilter] = useState("");

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
    <aside className="w-60 hidden lg:flex flex-col overflow-y-auto pt-4 pb-4 px-3 shrink-0">
      {/* ── Main nav ── */}
      <nav className="space-y-1 mb-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onMouseEnter={() => {
              // Prefetch data for each main nav target
              if (item.href === "/all") fetch("/api/expenses?page=1&limit=50").catch(() => {});
              if (item.href === "/activity") fetch("/api/activity?limit=50").catch(() => {});
            }}
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

      {/* ── Filter input ── */}
      <div className="px-1 mb-4">
        <div className="relative">
          <Search
            size={14}
            className="absolute start-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none"
          />
          <input
            type="text"
            placeholder={t("nav.filterByName")}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full text-[13px] border border-[var(--color-border)] rounded-xl ps-8 pe-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-shadow"
          />
        </div>
      </div>

      {/* ── Groups ── */}
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
          {filteredGroups.slice(0, filter ? 20 : 10).map((group) => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              onMouseEnter={() => {
                // Prefetch API data on hover — by the time user clicks, response is cached
                fetch(`/api/groups/${group.id}`).catch(() => {});
                fetch(`/api/balances/group/${group.id}`).catch(() => {});
              }}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-200",
                pathname === `/groups/${group.id}`
                  ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]"
              )}
            >
              <Users
                size={15}
                className="shrink-0 text-[var(--color-text-tertiary)]"
              />
              <span className="truncate">{group.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Friends ── */}
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
          {filteredFriends.slice(0, filter ? 20 : 10).map((friend) => (
            <Link
              key={friend.id}
              href={`/friends/${friend.id}`}
              onMouseEnter={() => {
                fetch(`/api/friends/${friend.id}`).catch(() => {});
              }}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm cursor-pointer transition-all duration-200",
                pathname === `/friends/${friend.id}`
                  ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]"
              )}
            >
              <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] text-xs font-semibold">
                {friend.name.charAt(0).toUpperCase()}
              </span>
              <span className="truncate">{friend.name}</span>
            </Link>
          ))}
          {!filter && filteredFriends.length > 10 && (
            <p className="px-3 py-1.5 text-xs text-[var(--color-text-tertiary)]">
              +{filteredFriends.length - 10} more — use search above
            </p>
          )}
        </div>
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Invite a friend ── */}
      <div className="px-1 pt-2 border-t border-[var(--color-border)]">
        <Link
          href="/friends/add"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)] transition-all duration-200"
        >
          <Mail size={16} className="text-[var(--color-text-tertiary)]" />
          <span>{t("friend.addFriend")}</span>
        </Link>
      </div>
    </aside>
  );
}
