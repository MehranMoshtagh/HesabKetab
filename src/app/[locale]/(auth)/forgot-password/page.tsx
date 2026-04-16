"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const appName = useTranslations("app");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="w-full max-w-sm">
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[rgba(0,0,0,0.06)] p-8">
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
            <div className="bg-[#34C759]/8 text-[var(--color-positive)] text-sm rounded-xl p-4 mb-5">
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
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-[rgba(0,0,0,0.12)] rounded-xl px-3.5 py-2.5 text-sm bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all duration-200"
                />
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
