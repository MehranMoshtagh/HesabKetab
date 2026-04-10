"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type SplitType = "EQUAL" | "EXACT" | "PERCENTAGE" | "SHARES" | "ADJUSTMENT";

interface Participant {
  userId: string;
  name: string;
  included: boolean;
  amount: number;
  shareValue: number;
}

interface SplitOptionsPanelProps {
  participants: Participant[];
  setParticipants: (p: Participant[]) => void;
  splitType: SplitType;
  setSplitType: (t: SplitType) => void;
  totalAmount: number;
  onClose: () => void;
}

const tabs: { type: SplitType; label: string; icon: string }[] = [
  { type: "EQUAL", label: "equal", icon: "=" },
  { type: "EXACT", label: "exact", icon: "1.23" },
  { type: "PERCENTAGE", label: "percentage", icon: "%" },
  { type: "SHARES", label: "shares", icon: "≡" },
  { type: "ADJUSTMENT", label: "adjustment", icon: "+/−" },
];

export default function SplitOptionsPanel({
  participants,
  setParticipants,
  splitType,
  setSplitType,
  totalAmount,
  onClose,
}: SplitOptionsPanelProps) {
  const t = useTranslations("expense.splitOptions");

  const includedCount = participants.filter((p) => p.included).length;
  const equalShare = includedCount > 0 ? totalAmount / includedCount : 0;

  const updateParticipant = (index: number, updates: Partial<Participant>) => {
    const next = [...participants];
    next[index] = { ...next[index], ...updates };
    setParticipants(next);
  };

  const getTotalAssigned = () => {
    if (splitType === "EXACT" || splitType === "ADJUSTMENT") {
      return participants
        .filter((p) => p.included)
        .reduce((s, p) => s + p.amount, 0);
    }
    if (splitType === "PERCENTAGE") {
      return participants
        .filter((p) => p.included)
        .reduce((s, p) => s + p.shareValue, 0);
    }
    return totalAmount;
  };

  const remaining = totalAmount - getTotalAssigned();

  return (
    <div className="border border-[rgba(0,0,0,0.06)] rounded-2xl p-4 bg-[var(--color-bg)] space-y-3">
      <div className="text-sm font-medium text-[var(--color-text)]">{t("title")}</div>

      {/* Split type tabs */}
      <div className="flex gap-1 border-b border-[rgba(0,0,0,0.06)] pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setSplitType(tab.type)}
            className={cn(
              "flex-1 text-center py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
              splitType === tab.type
                ? "bg-[var(--color-primary)] text-white"
                : "bg-white text-[var(--color-text-secondary)] hover:bg-[rgba(0,0,0,0.03)]"
            )}
          >
            <div className="text-base">{tab.icon}</div>
          </button>
        ))}
      </div>

      {/* Participants list */}
      <div className="space-y-2">
        {participants.map((p, i) => (
          <div key={p.userId} className="flex items-center gap-2.5">
            {splitType === "EQUAL" && (
              <input
                type="checkbox"
                checked={p.included}
                onChange={(e) =>
                  updateParticipant(i, { included: e.target.checked })
                }
                className="rounded"
              />
            )}

            <span className="text-sm flex-1 truncate text-[var(--color-text)]">{p.name}</span>

            {splitType === "EQUAL" && (
              <span className="text-sm text-[var(--color-text-secondary)]">
                ${p.included ? equalShare.toFixed(2) : "0.00"}
              </span>
            )}

            {splitType === "EXACT" && (
              <input
                type="number"
                value={p.amount || ""}
                onChange={(e) =>
                  updateParticipant(i, {
                    amount: parseFloat(e.target.value) || 0,
                    included: true,
                  })
                }
                placeholder="0.00"
                step="0.01"
                className="w-24 border border-[rgba(0,0,0,0.12)] rounded-lg px-2.5 py-1.5 text-sm text-end bg-white"
              />
            )}

            {splitType === "PERCENTAGE" && (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={p.shareValue || ""}
                  onChange={(e) =>
                    updateParticipant(i, {
                      shareValue: parseFloat(e.target.value) || 0,
                      included: true,
                    })
                  }
                  placeholder="0"
                  min="0"
                  max="100"
                  className="w-16 border border-[rgba(0,0,0,0.12)] rounded-lg px-2.5 py-1.5 text-sm text-end bg-white"
                />
                <span className="text-sm text-[var(--color-text-tertiary)]">%</span>
              </div>
            )}

            {splitType === "SHARES" && (
              <input
                type="number"
                value={p.shareValue || ""}
                onChange={(e) =>
                  updateParticipant(i, {
                    shareValue: parseFloat(e.target.value) || 0,
                    included: true,
                  })
                }
                placeholder="1"
                min="0"
                className="w-16 border border-[rgba(0,0,0,0.12)] rounded-lg px-2.5 py-1.5 text-sm text-end bg-white"
              />
            )}

            {splitType === "ADJUSTMENT" && (
              <input
                type="number"
                value={p.amount || ""}
                onChange={(e) =>
                  updateParticipant(i, {
                    amount: parseFloat(e.target.value) || 0,
                    included: true,
                  })
                }
                placeholder="0.00"
                step="0.01"
                className="w-24 border border-[rgba(0,0,0,0.12)] rounded-lg px-2.5 py-1.5 text-sm text-end bg-white"
              />
            )}
          </div>
        ))}
      </div>

      {(splitType === "EXACT" || splitType === "ADJUSTMENT") && (
        <div
          className={cn(
            "text-xs text-end",
            Math.abs(remaining) < 0.01 ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"
          )}
        >
          {Math.abs(remaining) < 0.01
            ? "✓ Fully allocated"
            : `$${remaining.toFixed(2)} remaining`}
        </div>
      )}

      {splitType === "PERCENTAGE" && (
        <div
          className={cn(
            "text-xs text-end",
            Math.abs(getTotalAssigned() - 100) < 0.01
              ? "text-[var(--color-positive)]"
              : "text-[var(--color-negative)]"
          )}
        >
          {Math.abs(getTotalAssigned() - 100) < 0.01
            ? "✓ 100%"
            : `${getTotalAssigned().toFixed(1)}% of 100%`}
        </div>
      )}

      <button
        onClick={onClose}
        className="w-full text-center text-sm text-[var(--color-primary)] font-medium py-1.5 hover:opacity-70 transition-opacity"
      >
        Done
      </button>
    </div>
  );
}
