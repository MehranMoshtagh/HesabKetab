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
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-sm text-gray-400 mb-4">
        {message ?? t("noResults")}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="text-sm text-[#5bc5a7] font-medium hover:underline"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
