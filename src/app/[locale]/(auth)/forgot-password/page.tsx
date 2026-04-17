"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useState } from "react";
import { Mail, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const appName = useTranslations("app");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [sent, setSent] = useState(false);

  const handleEmailBlur = () => {
    setEmailTouched(true);
    if (email && !isValidEmail(email)) {
      setEmailError(t("errors.invalidEmail"));
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);
    if (!isValidEmail(email)) {
      setEmailError(t("errors.invalidEmail"));
      return;
    }
    setSent(true);
  };

  return (
    <div className="w-full max-w-sm">
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-8">
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-[var(--color-text)] tracking-tight">
            {appName("name")}
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm mt-1">
            {t("resetPassword")}
          </p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="bg-[var(--color-positive-light)] text-[var(--color-positive)] text-sm rounded-xl p-4 mb-5">
              {t("emailSent")}
            </div>
            <Link
              href="/login"
              className="text-[var(--color-primary)] font-medium hover:underline text-sm"
            >
              {t("logIn")}
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-[var(--color-text-secondary)] mb-5">
              {t("resetDescription")}
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                  {t("email")}
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (emailTouched) setEmailError(""); }}
                    onBlur={handleEmailBlur}
                    required
                    placeholder={t("emailPlaceholder")}
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

              <button
                type="submit"
                className="w-full bg-[var(--color-primary)] text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-all duration-200"
              >
                {t("sendResetLink")}
              </button>
            </form>

            <p className="text-center text-sm text-[var(--color-text-secondary)] mt-6">
              <Link
                href="/login"
                className="text-[var(--color-primary)] font-medium hover:underline"
              >
                {t("logIn")}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
