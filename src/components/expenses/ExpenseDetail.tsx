"use client";

import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { findSubcategory } from "@/lib/categories";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string; avatar: string | null };
}

interface ExpenseDetailProps {
  expenseId: string;
  onDelete?: () => void;
  onEdit?: () => void;
  // Pre-loaded data from parent (avoids cold-start refetch)
  preloaded?: FullExpense;
  commentCount?: number;
}

interface FullExpense {
  id: string;
  description: string;
  amount: string;
  currency: string;
  category: string;
  date: string;
  splitType: string;
  notes: string | null;
  isPayment: boolean;
  createdAt: string;
  createdBy: { id: string; name: string };
  payers: { userId: string; amount: string; user: { id: string; name: string; avatar: string | null } }[];
  shares: { userId: string; amount: string; user: { id: string; name: string; avatar: string | null } }[];
  group: { id: string; name: string } | null;
  comments: Comment[];
}

export default function ExpenseDetail({ expenseId, onDelete, preloaded, commentCount = 0 }: ExpenseDetailProps) {
  const t = useTranslations();
  const { data: session } = useSession();
  const [expense, setExpense] = useState<FullExpense | null>(
    preloaded ? { ...preloaded, comments: preloaded.comments ?? [] } : null
  );
  const [loading, setLoading] = useState(!preloaded);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    // If we have preloaded data and no comments to fetch, skip the API call entirely
    if (preloaded && commentCount === 0) {
      return;
    }
    // Otherwise fetch (either no preload, or comments exist)
    fetch(`/api/expenses/${expenseId}`)
      .then((r) => r.json())
      .then((data) => {
        if (preloaded) {
          setExpense((prev) => prev ? { ...prev, comments: data.comments ?? [] } : data);
        } else {
          setExpense(data);
        }
      })
      .finally(() => setLoading(false));
  }, [expenseId, preloaded, commentCount]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setPosting(true);
    const res = await fetch(`/api/expenses/${expenseId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment }),
    });
    if (res.ok) {
      const comment = await res.json();
      setExpense((prev) =>
        prev ? { ...prev, comments: [...prev.comments, comment] } : prev
      );
      setNewComment("");
    }
    setPosting(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this expense?")) return;
    const res = await fetch(`/api/expenses/${expenseId}`, { method: "DELETE" });
    if (res.ok && onDelete) onDelete();
  };

  if (loading) {
    return <div className="p-5 animate-pulse h-32 bg-[var(--color-bg)] rounded-xl" />;
  }

  if (!expense) return null;

  const cat = findSubcategory(expense.category);
  const createdDate = new Date(expense.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-[var(--color-bg)] border-t border-[var(--color-border)] px-5 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{cat?.subcategory.icon ?? "📄"}</span>
          <div>
            <h3 className="text-base font-semibold text-[var(--color-text)]">
              {expense.description}
            </h3>
            <p className="text-lg font-semibold text-[var(--color-text)]">
              ${parseFloat(expense.amount).toFixed(2)}
              <span className="text-xs text-[var(--color-text-tertiary)] ms-1">
                {expense.currency}
              </span>
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              {t("expense.detail.addedBy", {
                name: expense.createdBy.name,
                date: createdDate,
              })}
            </p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="p-2 rounded-xl hover:bg-[var(--color-negative)]/8 text-[var(--color-text-tertiary)] hover:text-[var(--color-negative)] transition-all duration-200"
          title={t("expense.deleteExpense")}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Who paid / Who owes */}
      <div className="grid grid-cols-2 gap-5">
        <div>
          <h4 className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2.5">
            {t("expense.detail.whoPaid")}
          </h4>
          <div className="space-y-2">
            {expense.payers.map((p) => (
              <div key={p.userId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-positive)]/12 flex items-center justify-center text-[10px] font-semibold text-[var(--color-positive)]">
                    {p.user.name[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-[var(--color-text)]">{p.user.name}</span>
                </div>
                <span className="text-sm font-medium text-[var(--color-text)]">
                  ${parseFloat(p.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2.5">
            {t("expense.detail.whoOwes")}
          </h4>
          <div className="space-y-2">
            {expense.shares.map((s) => (
              <div key={s.userId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-negative)]/10 flex items-center justify-center text-[10px] font-semibold text-[var(--color-negative)]">
                    {s.user.name[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-[var(--color-text)]">{s.user.name}</span>
                </div>
                <span className="text-sm font-medium text-[var(--color-negative)]">
                  ${parseFloat(s.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      {expense.notes && (
        <div className="bg-[var(--color-surface)] rounded-xl p-3.5 text-sm text-[var(--color-text-secondary)] border border-[var(--color-border)]">
          {expense.notes}
        </div>
      )}

      {/* Comments */}
      <div>
        <h4 className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2.5">
          {t("expense.detail.notesAndComments")}
        </h4>

        {expense.comments.length > 0 && (
          <div className="space-y-2.5 mb-3">
            {expense.comments.map((c) => (
              <div key={c.id} className="flex gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[var(--color-border)] flex items-center justify-center text-[10px] font-semibold text-[var(--color-text-secondary)] shrink-0 mt-0.5">
                  {c.user.name[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[var(--color-text)]">
                      {c.user.name}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-tertiary)]">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-text)]">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t("expense.detail.addComment")}
            className="flex-1 border border-[var(--color-border-strong)] rounded-xl px-3.5 py-2 text-sm bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all"
            onKeyDown={(e) => {
              if (e.key === "Enter") handlePostComment();
            }}
          />
          <button
            onClick={handlePostComment}
            disabled={posting || !newComment.trim()}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl text-sm font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-all duration-200"
          >
            {t("expense.detail.post")}
          </button>
        </div>
      </div>
    </div>
  );
}
