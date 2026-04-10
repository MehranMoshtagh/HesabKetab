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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-[#333]">Currency</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2 border-b">
          <div className="relative">
            <Search
              size={14}
              className="absolute start-2 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search currencies..."
              autoFocus
              className="w-full ps-7 pe-3 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#5bc5a7]"
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
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-start hover:bg-gray-50 transition-colors ${
                c.code === selected ? "bg-[#5bc5a7]/10" : ""
              }`}
            >
              <span className="text-base font-medium w-8 text-center">
                {c.symbol}
              </span>
              <div className="flex-1">
                <div className="text-sm font-medium text-[#333]">
                  {c.code}
                </div>
                <div className="text-xs text-gray-400">
                  {locale === "fa" ? c.nameFa : c.name}
                </div>
              </div>
              {c.code === selected && (
                <span className="text-[#5bc5a7] text-sm">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
