"use client";

import { useTranslations } from "next-intl";
import { categories } from "@/lib/categories";

interface CategoryPickerProps {
  selected: string;
  onSelect: (categoryId: string) => void;
}

export default function CategoryPicker({ selected, onSelect }: CategoryPickerProps) {
  const t = useTranslations();

  return (
    <div className="border border-[var(--color-border)] rounded-2xl bg-white p-3.5 max-h-60 overflow-y-auto shadow-[var(--shadow-card)]">
      {categories.map((cat) => (
        <div key={cat.id} className="mb-2.5">
          <div className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase mb-1 flex items-center gap-1">
            <span>{cat.icon}</span>
            <span>{t(cat.nameKey)}</span>
          </div>
          <div className="grid grid-cols-2 gap-1 ps-4">
            {cat.subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => onSelect(sub.id)}
                className={`text-start px-2.5 py-1.5 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                  selected === sub.id
                    ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium"
                    : "text-[var(--color-text)] hover:bg-[var(--color-hover)]"
                }`}
              >
                <span className="me-1">{sub.icon}</span>
                {t(sub.nameKey)}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
