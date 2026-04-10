"use client";

import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
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

export default function ExpenseDetail({ expenseId, onDelete }: ExpenseDetailProps) {
  const t = useTranslations();
  const { data: session } = useSession();
  const [expense, setExpense] = useState<FullExpense | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetch(`/api/expenses/${expenseId}`)
      .then((r) => r.json())
      .then(setExpense)
      .finally(() => setLoading(false));
  }, [expenseId]);

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
    return <div className="p-4 animate-pulse h-32 bg-gray-50" />;
  }

  if (!expense) return null;

  const cat = findSubcategory(expense.category);
  const createdDate = new Date(expense.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-gray-50 border-t px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{cat?.subcategory.icon ?? "📄"}</span>
          <div>
            <h3 className="text-base font-bold text-[#333]">
              {expense.description}
            </h3>
            <p className="text-lg font-bold text-[#333]">
              ${parseFloat(expense.amount).toFixed(2)}
              <span className="text-xs text-gray-400 ms-1">
                {expense.currency}
              </span>
            </p>
            <p className="text-xs text-gray-400">
              {t("expense.detail.addedBy", {
                name: expense.createdBy.name,
                date: createdDate,
              })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            title={t("expense.deleteExpense")}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Who paid / Who owes */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            {t("expense.detail.whoPaid")}
          </h4>
          <div className="space-y-1.5">
            {expense.payers.map((p) => (
              <div key={p.userId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#5bc5a7]/20 flex items-center justify-center text-[10px] font-bold text-[#5bc5a7]">
                    {p.user.name[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-[#333]">{p.user.name}</span>
                </div>
                <span className="text-sm font-medium text-[#333]">
                  ${parseFloat(p.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            {t("expense.detail.whoOwes")}
          </h4>
          <div className="space-y-1.5">
            {expense.shares.map((s) => (
              <div key={s.userId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#ff652f]/15 flex items-center justify-center text-[10px] font-bold text-[#ff652f]">
                    {s.user.name[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-[#333]">{s.user.name}</span>
                </div>
                <span className="text-sm font-medium text-[#ff652f]">
                  ${parseFloat(s.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      {expense.notes && (
        <div className="bg-white rounded p-3 text-sm text-gray-600 border">
          {expense.notes}
        </div>
      )}

      {/* Comments */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
          {t("expense.detail.notesAndComments")}
        </h4>

        {expense.comments.length > 0 && (
          <div className="space-y-2 mb-3">
            {expense.comments.map((c) => (
              <div key={c.id} className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {c.user.name[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#333]">
                      {c.user.name}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-[#333]">{c.content}</p>
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
            className="flex-1 border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5bc5a7]"
            onKeyDown={(e) => {
              if (e.key === "Enter") handlePostComment();
            }}
          />
          <button
            onClick={handlePostComment}
            disabled={posting || !newComment.trim()}
            className="px-3 py-1.5 bg-[#5bc5a7] text-white rounded text-sm font-medium hover:bg-[#4ab393] disabled:opacity-50"
          >
            {t("expense.detail.post")}
          </button>
        </div>
      </div>
    </div>
  );
}
