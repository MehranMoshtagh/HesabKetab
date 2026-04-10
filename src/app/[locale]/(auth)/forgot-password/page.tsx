"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: implement password reset API
    setSent(true);
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#5bc5a7]">HesabKetab</h1>
          <p className="text-gray-500 mt-1">{t("resetPassword")}</p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-4 mb-4">
              {t("emailSent")}
            </div>
            <Link href="/login" className="text-[#5bc5a7] font-medium hover:underline text-sm">
              {t("logIn")}
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{t("resetDescription")}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1">
                  {t("email")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5bc5a7] focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#5bc5a7] text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-[#4ab393] transition-colors"
              >
                {t("sendResetLink")}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-4">
              <Link href="/login" className="text-[#5bc5a7] font-medium hover:underline">
                {t("logIn")}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
