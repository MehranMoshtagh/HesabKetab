import { useTranslations } from "next-intl";

interface EmptyStateProps {
  icon?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon = "📭", message, action }: EmptyStateProps) {
  const t = useTranslations("common");

  return (
    <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-[rgba(0,0,0,0.06)] p-10 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-sm text-[var(--color-text-tertiary)] mb-4">
        {message ?? t("noResults")}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="text-sm text-[var(--color-primary)] font-medium hover:opacity-70 transition-opacity"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
