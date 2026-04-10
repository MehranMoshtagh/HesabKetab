"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/routing";
import { RotateCcw } from "lucide-react";

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
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activity?limit=50")
      .then((r) => r.json())
      .then((data) => setActivities(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const handleRestore = async (expenseId: string) => {
    await fetch(`/api/expenses/${expenseId}/restore`, { method: "POST" });
    // Refresh
    const data = await fetch("/api/activity?limit=50").then((r) => r.json());
    setActivities(Array.isArray(data) ? data : []);
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
      case "PAYMENT_ADDED":
        return `${meta.payerName} paid ${meta.payeeName} $${Number(meta.amount).toFixed(2)}.`;
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
      <h1 className="text-xl font-bold text-[#333] mb-4">{t("activity.title")}</h1>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm p-3 animate-pulse h-14"
            />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-400 text-sm">
          No recent activity.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm divide-y">
          {activities.map((act) => (
            <div
              key={act.id}
              className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              {/* Icon */}
              <div className="text-lg mt-0.5 shrink-0">
                {typeIcons[act.type] ?? "📋"}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#333]">{formatActivity(act)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">
                    {formatDate(act.createdAt)}
                  </span>
                  {act.group && (
                    <Link
                      href={`/groups/${act.group.id}`}
                      className="text-xs text-[#5bc5a7] hover:underline"
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
                    className="flex items-center gap-1 text-xs text-[#5bc5a7] hover:underline shrink-0"
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
