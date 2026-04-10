"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import {
  LayoutDashboard,
  Activity,
  Receipt,
  Users,
  UserPlus,
  Plus,
  Search,
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

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(filter.toLowerCase())
  );
  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <aside className="w-60 min-h-[calc(100vh-3rem)] p-4 hidden lg:block border-e border-[rgba(0,0,0,0.06)] bg-white/50">
      {/* Main nav */}
      <nav className="space-y-0.5 mb-8">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-200",
              pathname === item.href
                ? "bg-[var(--color-primary)]/8 text-[var(--color-primary)] font-medium"
                : "text-[var(--color-text)] hover:bg-[rgba(0,0,0,0.03)]"
            )}
          >
            <item.icon size={17} />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Groups */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2 px-3">
          <h3 className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
            {t("nav.groups")}
          </h3>
          <Link href="/groups/new" className="text-[var(--color-primary)] hover:opacity-70 transition-opacity">
            <Plus size={14} />
          </Link>
        </div>
        {filteredGroups.map((group) => (
          <Link
            key={group.id}
            href={`/groups/${group.id}`}
            className={cn(
              "flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-sm transition-all duration-200",
              pathname === `/groups/${group.id}`
                ? "bg-[var(--color-primary)]/8 text-[var(--color-primary)]"
                : "text-[var(--color-text)] hover:bg-[rgba(0,0,0,0.03)]"
            )}
          >
            <Users size={14} className="text-[var(--color-text-tertiary)]" />
            <span className="truncate">{group.name}</span>
          </Link>
        ))}
      </div>

      {/* Friends */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2 px-3">
          <h3 className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
            {t("nav.friends")}
          </h3>
          <Link href="/friends/add" className="text-[var(--color-primary)] hover:opacity-70 transition-opacity">
            <Plus size={14} />
          </Link>
        </div>
        {filteredFriends.map((friend) => (
          <Link
            key={friend.id}
            href={`/friends/${friend.id}`}
            className={cn(
              "flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-sm transition-all duration-200",
              pathname === `/friends/${friend.id}`
                ? "bg-[var(--color-primary)]/8 text-[var(--color-primary)]"
                : "text-[var(--color-text)] hover:bg-[rgba(0,0,0,0.03)]"
            )}
          >
            <span className="truncate">{friend.name}</span>
          </Link>
        ))}
      </div>

      {/* Invite */}
      <div className="mb-8 px-3">
        <h3 className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
          {t("nav.inviteFriends")}
        </h3>
        <div className="flex gap-1.5">
          <input
            type="email"
            placeholder="Email"
            className="flex-1 text-xs border border-[rgba(0,0,0,0.08)] rounded-lg px-2.5 py-1.5 bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
          />
          <button className="text-xs bg-[var(--color-primary)] text-white px-2.5 py-1.5 rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors">
            <UserPlus size={13} />
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="px-3">
        <div className="relative">
          <Search size={13} className="absolute start-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
          <input
            type="text"
            placeholder={t("nav.filterByName")}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full text-xs border border-[rgba(0,0,0,0.08)] rounded-lg ps-7 pe-2.5 py-1.5 bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
          />
        </div>
      </div>
    </aside>
  );
}
