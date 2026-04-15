"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { currencies } from "@/lib/currencies";
import { X, Search } from "lucide-react";

interface CurrencyPickerProps {
  selected: string;
  onSelect: (code: string) => void;
  onClose: () => void;
}

export default function CurrencyPicker({
  selected,
  onSelect,
  onClose,
}: CurrencyPickerProps) {
  const locale = useLocale();
  const [search, setSearch] = useState("");

  const filtered = currencies.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.nameFa.includes(q) ||
      c.symbol.includes(q)
    );
  });

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-[var(--shadow-elevated)] border border-[var(--color-border)] w-full max-w-sm max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h3 className="font-semibold text-[var(--color-text)] tracking-tight">Currency</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--color-hover)] text-[var(--color-text-tertiary)] transition-colors duration-150">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-[var(--color-border)]">
          <div className="relative">
            <Search
              size={14}
              className="absolute start-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search currencies..."
              autoFocus
              className="w-full ps-8 pe-3 py-2 border border-[var(--color-border-strong)] rounded-xl text-sm bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c.code}
              onClick={() => {
                onSelect(c.code);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-start hover:bg-[var(--color-hover)] transition-colors duration-150 cursor-pointer ${
                c.code === selected ? "bg-[var(--color-primary-light)]" : ""
              }`}
            >
              <span className="text-base font-medium w-8 text-center">
                {c.symbol}
              </span>
              <div className="flex-1">
                <div className="text-sm font-medium text-[var(--color-text)]">
                  {c.code}
                </div>
                <div className="text-xs text-[var(--color-text-tertiary)]">
                  {locale === "fa" ? c.nameFa : c.name}
                </div>
              </div>
              {c.code === selected && (
                <span className="text-[var(--color-primary)] text-sm">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
