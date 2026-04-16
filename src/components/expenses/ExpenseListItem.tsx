"use client";

import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { findSubcategory } from "@/lib/categories";
import { getMonthAbbr, getDayNumber } from "@/lib/date-utils";
import { getCurrencySymbol } from "@/lib/currencies";
import { MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import ExpenseDetail from "./ExpenseDetail";

interface ExpenseListItemProps {
  expense: {
    id: string;
    description: string;
    amount: string;
    currency: string;
    category: string;
    date: string;
    isPayment: boolean;
    createdBy: { id: string; name: string };
    payers: { userId: string; amount: string; user: { id: string; name: string } }[];
    shares: { userId: string; amount: string; user: { id: string; name: string } }[];
    group?: { id: string; name: string } | null;
    _count?: { comments: number };
  };
  onDeleted?: () => void;
}

export default function ExpenseListItem({ expense, onDeleted }: ExpenseListItemProps) {
  const { data: session } = useSession();
  const locale = useLocale();
  const userId = session?.user?.id;
  const [expanded, setExpanded] = useState(false);

  const d = new Date(expense.date);
  const monthAbbr = getMonthAbbr(d, locale);
  const day = getDayNumber(d, locale);

  const cat = findSubcategory(expense.category);
  const icon = cat?.subcategory.icon ?? "📄";

  const userPaid = expense.payers.find((p) => p.userId === userId);
  const userShare = expense.shares.find((s) => s.userId === userId);

  let rightLabel = "";
  let rightAmount = "";
  let rightColor = "text-[var(--color-text-secondary)]";

  const sym = getCurrencySymbol(expense.currency);

  if (expense.isPayment) {
    const payer = expense.payers[0];
    const payee = expense.shares[0];
    rightLabel = `${payer?.user.name} → ${payee?.user.name}`;
    rightAmount = `${sym}${parseFloat(expense.amount).toFixed(2)}`;
    rightColor = "text-[var(--color-positive)]";
  } else if (userPaid && parseFloat(userPaid.amount) > 0) {
    const lentAmount =
      parseFloat(userPaid.amount) - parseFloat(userShare?.amount ?? "0");
    if (lentAmount > 0) {
      rightLabel = "you lent";
      rightAmount = `${sym}${lentAmount.toFixed(2)}`;
      rightColor = "text-[var(--color-positive)]";
    } else {
      rightLabel = "you borrowed";
      rightAmount = `${sym}${Math.abs(lentAmount).toFixed(2)}`;
      rightColor = "text-[var(--color-negative)]";
    }
  } else if (userShare) {
    rightLabel = "you borrowed";
    rightAmount = `${sym}${parseFloat(userShare.amount).toFixed(2)}`;
    rightColor = "text-[var(--color-negative)]";
  }

  return (
    <div>
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-hover)] transition-all duration-200 cursor-pointer rounded-xl"
      >
        {/* Date */}
        <div className="text-center w-10 shrink-0">
          <div className="text-[10px] text-[var(--color-text-tertiary)] uppercase">{monthAbbr}</div>
          <div className="text-lg font-semibold text-[var(--color-text)]">{day}</div>
        </div>

        {/* Category icon */}
        <div className="text-xl w-8 shrink-0">
          {expense.isPayment ? "💰" : icon}
        </div>

        {/* Description */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-[var(--color-text)] truncate">
            {expense.description}
          </div>
          {userPaid && !expense.isPayment && (
            <div className="text-xs text-[var(--color-text-tertiary)]">
              you paid {sym}{parseFloat(userPaid.amount).toFixed(2)}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="text-end shrink-0 max-w-[140px]">
          {expense.group && (
            <div className="text-[10px] text-[var(--color-text-tertiary)] truncate">{expense.group.name}</div>
          )}
          <div className={`text-[11px] ${rightColor}`}>{rightLabel}</div>
          <div className={`text-sm font-semibold ${rightColor}`}>{rightAmount}</div>
        </div>

        {(expense._count?.comments ?? 0) > 0 && (
          <MessageCircle size={13} className="text-[var(--color-text-tertiary)] shrink-0" />
        )}

        <div className="shrink-0 text-[var(--color-text-tertiary)]">
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </div>
      </div>

      {expanded && (
        <ExpenseDetail
          expenseId={expense.id}
          onDelete={() => {
            setExpanded(false);
            onDeleted?.();
          }}
        />
      )}
    </div>
  );
}
