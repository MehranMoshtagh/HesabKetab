"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AlertCircle, CheckCircle2, HelpCircle, LifeBuoy, Mail, User } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = "bug" | "account" | "feedback" | "other";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SupportPage() {
  const t = useTranslations("pages");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [category, setCategory] = useState<Category | "">("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const emailError =
    emailTouched && email && !isValidEmail(email) ? t("supportErrorInvalidEmail") : "";

  const reset = () => {
    setName("");
    setEmail("");
    setEmailTouched(false);
    setCategory("");
    setSubject("");
    setMessage("");
    setError("");
    setSent(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !category || !subject.trim() || !message.trim()) {
      setError(t("supportErrorMissing"));
      return;
    }
    if (!isValidEmail(email)) {
      setEmailTouched(true);
      setError(t("supportErrorInvalidEmail"));
      return;
    }
    if (message.trim().length < 20) {
      setError(t("supportErrorMessageShort"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, category, subject, message }),
      });
      if (!res.ok) {
        setError(t("supportError"));
        setLoading(false);
        return;
      }
      setSent(true);
      setLoading(false);
    } catch {
      setError(t("supportError"));
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div>
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-8 md:p-10 text-center">
          <div className="inline-flex w-14 h-14 rounded-full bg-[var(--color-positive-light)] text-[var(--color-positive)] items-center justify-center mb-5">
            <CheckCircle2 size={28} />
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[var(--color-text)] tracking-tight mb-2">
            {t("supportSuccess")}
          </h1>
          <p className="text-[15px] text-[var(--color-text-secondary)] max-w-md mx-auto mb-8">
            {t("supportSuccessDetail")}
          </p>
          <button
            onClick={reset}
            className="bg-[var(--color-primary)] text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[var(--color-primary-hover)] transition-all duration-200"
          >
            {t("supportSuccessAgain")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start gap-4 mb-8">
        <div className="shrink-0 w-10 h-10 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center">
          <LifeBuoy size={20} />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] tracking-[-0.025em] mb-3">
            {t("supportTitle")}
          </h1>
          <p className="text-[15px] text-[var(--color-text-secondary)]">
            {t("supportIntro")}
          </p>
        </div>
      </div>

      <Link
        href="/faq"
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:underline mb-8"
      >
        <HelpCircle size={15} />
        {t("supportCheckFaq")}
      </Link>

      <form
        onSubmit={handleSubmit}
        className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 md:p-8 space-y-5"
      >
        {error && (
          <div className="flex items-start gap-2 bg-[var(--color-negative-light)] text-[var(--color-negative)] text-sm rounded-xl p-3">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              {t("supportFormName")}
            </label>
            <div className="relative">
              <User size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={120}
                className="w-full border border-[var(--color-border-strong)] rounded-xl ps-10 pe-3.5 py-2.5 text-sm bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all duration-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              {t("supportFormEmail")}
            </label>
            <div className="relative">
              <Mail size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                required
                maxLength={200}
                className={cn(
                  "w-full border rounded-xl ps-10 pe-3.5 py-2.5 text-sm bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all duration-200",
                  emailError
                    ? "border-[var(--color-negative)] focus:border-[var(--color-negative)]"
                    : "border-[var(--color-border-strong)] focus:border-[var(--color-primary)]"
                )}
              />
            </div>
            {emailError && (
              <p className="flex items-center gap-1 text-xs text-[var(--color-negative)] mt-1.5">
                <AlertCircle size={12} />
                {emailError}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
            {t("supportFormCategory")}
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            required
            className="w-full border border-[var(--color-border-strong)] rounded-xl ps-3.5 pe-9 py-2.5 text-sm bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all duration-200"
          >
            <option value="" disabled>{t("supportFormCategoryPlaceholder")}</option>
            <option value="bug">{t("supportFormCategoryBug")}</option>
            <option value="account">{t("supportFormCategoryAccount")}</option>
            <option value="feedback">{t("supportFormCategoryFeedback")}</option>
            <option value="other">{t("supportFormCategoryOther")}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
            {t("supportFormSubject")}
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            maxLength={200}
            placeholder={t("supportFormSubjectPlaceholder")}
            className="w-full border border-[var(--color-border-strong)] rounded-xl px-3.5 py-2.5 text-sm bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
            {t("supportFormMessage")}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            minLength={20}
            maxLength={5000}
            rows={6}
            placeholder={t("supportFormMessagePlaceholder")}
            className="w-full border border-[var(--color-border-strong)] rounded-xl px-3.5 py-2.5 text-sm bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all duration-200 resize-y"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-[var(--color-primary)] text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-[var(--color-primary-hover)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t("supportFormSubmitting") : t("supportFormSubmit")}
        </button>
      </form>
    </div>
  );
}
