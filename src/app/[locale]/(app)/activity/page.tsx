"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/routing";
import { RotateCcw } from "lucide-react";
import { useCachedFetch, invalidateCache } from "@/hooks/useCachedFetch";

interface ActivityItem {
  id: string;
  userId: string;
  type: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  user: { id: string; name: string; avatar: string | null };
  expense: {
    id: string;
    description: string;
    amount: string;
    currency: string;
    isPayment: boolean;
    deletedAt: string | null;
  } | null;
  group: { id: string; name: string } | null;
}

const typeIcons: Record<string, string> = {
  EXPENSE_ADDED: "📝",
  EXPENSE_EDITED: "✏️",
  EXPENSE_DELETED: "🗑️",
  EXPENSE_RESTORED: "♻️",
  PAYMENT_ADDED: "💰",
  PAYMENT_DELETED: "🗑️",
  COMMENT_ADDED: "💬",
  FRIEND_ADDED: "👤",
  GROUP_CREATED: "👥",
  GROUP_EDITED: "⚙️",
  GROUP_MEMBER_ADDED: "➕",
  GROUP_MEMBER_REMOVED: "➖",
};

export default function ActivityPage() {
  const t = useTranslations();
  const { data: session } = useSession();
  const ACTIVITY_URL = "/api/activity?limit=50";

  const { data: activityData, loading, refetch } = useCachedFetch<ActivityItem[]>(ACTIVITY_URL);
  const activities = Array.isArray(activityData) ? activityData : [];
  // Keep unused setter for local updates after restore
  const [, setActivitiesLocal] = useState<ActivityItem[]>([]);

  const handleRestore = async (expenseId: string) => {
    await fetch(`/api/expenses/${expenseId}/restore`, { method: "POST" });
    // Invalidate cache and refetch
    invalidateCache(ACTIVITY_URL);
    refetch();
    setActivitiesLocal([]);
  };

  const formatActivity = (act: ActivityItem): string => {
    const isMe = act.userId === session?.user?.id;
    const name = isMe ? "You" : act.user.name;
    const meta = act.metadata as Record<string, string>;

    switch (act.type) {
      case "EXPENSE_ADDED":
        return `${name} added "${meta.description ?? act.expense?.description ?? ""}".`;
      case "EXPENSE_EDITED":
        return `${name} edited "${act.expense?.description ?? ""}".`;
      case "EXPENSE_DELETED":
        return `${name} deleted "${meta.description ?? ""}".`;
      case "EXPENSE_RESTORED":
        return `${name} restored "${meta.description ?? ""}".`;
      case "PAYMENT_ADDED": {
        const payerN = meta.payerName ?? name;
        const payeeN = meta.payeeName ?? "";
        const amt = meta.amount ? Number(meta.amount) : (act.expense ? Number(act.expense.amount) : 0);
        return payeeN ? `${payerN} paid ${payeeN} $${amt.toFixed(2)}.` : `${payerN} recorded a $${amt.toFixed(2)} payment.`;
      }
      case "COMMENT_ADDED":
        return `${name} commented on "${meta.expenseDescription ?? ""}".`;
      case "FRIEND_ADDED":
        return `${name} added ${meta.friendName ?? ""} as a friend.`;
      case "GROUP_CREATED":
        return `${name} created group "${meta.groupName ?? ""}".`;
      case "GROUP_EDITED":
        return `${name} edited group settings.`;
      case "GROUP_MEMBER_ADDED":
        return `${name} added ${meta.addedUserName ?? ""} to the group.`;
      case "GROUP_MEMBER_REMOVED":
        return `${name} removed ${meta.removedUserName ?? ""} from the group.`;
      default:
        return `${name} performed an action.`;
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-[var(--color-text)] tracking-tight mb-4">{t("activity.title")}</h1>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-3 animate-pulse h-14 bg-[var(--color-hover)]"
            />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-8 text-center text-[var(--color-text-tertiary)] text-sm">
          No recent activity.
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
          {activities.map((act) => (
            <div
              key={act.id}
              className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--color-hover)] transition-all duration-200 cursor-default"
            >
              {/* Icon */}
              <div className="text-lg mt-0.5 shrink-0">
                {typeIcons[act.type] ?? "📋"}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--color-text)]">{formatActivity(act)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[var(--color-text-tertiary)]">
                    {formatDate(act.createdAt)}
                  </span>
                  {act.group && (
                    <Link
                      href={`/groups/${act.group.id}`}
                      className="text-xs text-[var(--color-primary)] hover:underline"
                    >
                      {act.group.name}
                    </Link>
                  )}
                </div>
              </div>

              {/* Restore button for deleted expenses */}
              {act.type === "EXPENSE_DELETED" &&
                act.expense &&
                act.expense.deletedAt && (
                  <button
                    onClick={() => handleRestore(act.expense!.id)}
                    className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline shrink-0"
                  >
                    <RotateCcw size={12} />
                    {t("expense.undeleteExpense")}
                  </button>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
