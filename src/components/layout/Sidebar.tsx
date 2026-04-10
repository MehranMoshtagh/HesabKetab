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
    <aside className="w-60 bg-white border-e border-[#eee] min-h-[calc(100vh-3.5rem)] p-4 hidden lg:block">
      {/* Main nav */}
      <nav className="space-y-1 mb-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded text-sm",
              pathname === item.href
                ? "bg-[#5bc5a7]/10 text-[#5bc5a7] font-medium"
                : "text-[#333] hover:bg-gray-100"
            )}
          >
            <item.icon size={16} />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Groups */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {t("nav.groups")}
          </h3>
          <Link href="/groups/new" className="text-[#5bc5a7] hover:underline text-xs">
            <Plus size={14} />
          </Link>
        </div>
        {filteredGroups.map((group) => (
          <Link
            key={group.id}
            href={`/groups/${group.id}`}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded text-sm",
              pathname === `/groups/${group.id}`
                ? "bg-[#5bc5a7]/10 text-[#5bc5a7]"
                : "text-[#333] hover:bg-gray-100"
            )}
          >
            <Users size={14} />
            <span className="truncate">{group.name}</span>
          </Link>
        ))}
      </div>

      {/* Friends */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {t("nav.friends")}
          </h3>
          <Link href="/friends/add" className="text-[#5bc5a7] hover:underline text-xs">
            <Plus size={14} />
          </Link>
        </div>
        {filteredFriends.map((friend) => (
          <Link
            key={friend.id}
            href={`/friends/${friend.id}`}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded text-sm",
              pathname === `/friends/${friend.id}`
                ? "bg-[#5bc5a7]/10 text-[#5bc5a7]"
                : "text-[#333] hover:bg-gray-100"
            )}
          >
            <span className="truncate">{friend.name}</span>
          </Link>
        ))}
      </div>

      {/* Invite */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          {t("nav.inviteFriends")}
        </h3>
        <div className="flex gap-1">
          <input
            type="email"
            placeholder="Email"
            className="flex-1 text-xs border rounded px-2 py-1 text-[#333]"
          />
          <button className="text-xs bg-[#5bc5a7] text-white px-2 py-1 rounded">
            <UserPlus size={14} />
          </button>
        </div>
      </div>

      {/* Filter */}
      <div>
        <div className="relative">
          <Search size={14} className="absolute start-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("nav.filterByName")}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full text-xs border rounded ps-7 pe-2 py-1.5 text-[#333]"
          />
        </div>
      </div>
    </aside>
  );
}
