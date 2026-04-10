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
    <div className="border rounded-lg bg-white p-3 max-h-60 overflow-y-auto">
      {categories.map((cat) => (
        <div key={cat.id} className="mb-2">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-1">
            <span>{cat.icon}</span>
            <span>{t(cat.nameKey)}</span>
          </div>
          <div className="grid grid-cols-2 gap-1 ps-4">
            {cat.subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => onSelect(sub.id)}
                className={`text-start px-2 py-1 rounded text-sm hover:bg-gray-100 transition-colors ${
                  selected === sub.id ? "bg-[#5bc5a7]/10 text-[#5bc5a7] font-medium" : "text-[#333]"
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
