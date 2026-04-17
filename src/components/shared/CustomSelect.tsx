"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (v: string) => void;
  options: CustomSelectOption[];
  label?: string;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyLabel?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  label,
  placeholder,
  searchable = false,
  searchPlaceholder = "Search...",
  emptyLabel = "No results",
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const displayLabel = selected?.label ?? (placeholder ?? value);
  const isPlaceholder = !selected && !!placeholder;

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between gap-2 border border-[var(--color-border-strong)] rounded-xl px-3.5 py-2.5 text-sm bg-[var(--color-bg)] text-start hover:border-[var(--color-primary)] transition-colors"
        >
          <span
            className={cn(
              "truncate",
              isPlaceholder ? "text-[var(--color-text-tertiary)]" : "text-[var(--color-text)]"
            )}
          >
            {displayLabel}
          </span>
          <ChevronDown
            size={14}
            className={cn(
              "shrink-0 text-[var(--color-text-tertiary)] transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
        {open && (
          <div className="absolute top-full start-0 end-0 mt-1 z-30 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-elevated)] py-1 max-h-60 flex flex-col">
            {searchable && (
              <div className="px-2 py-1.5 border-b border-[var(--color-border)]">
                <div className="relative">
                  <Search
                    size={13}
                    className="absolute start-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
                  />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full ps-7 pe-2 py-1.5 text-xs bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                    autoFocus
                  />
                </div>
              </div>
            )}
            <div className="overflow-y-auto flex-1">
              {filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3.5 py-2 text-sm text-start hover:bg-[var(--color-hover)] transition-colors",
                    value === o.value && "text-[var(--color-primary)] font-medium"
                  )}
                >
                  {value === o.value && <Check size={14} className="shrink-0" />}
                  <span className="truncate">{o.label}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-3.5 py-2 text-sm text-[var(--color-text-tertiary)]">
                  {emptyLabel}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
