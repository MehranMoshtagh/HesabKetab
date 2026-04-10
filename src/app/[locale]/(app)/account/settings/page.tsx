"use client";

import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { currencies } from "@/lib/currencies";
import type { Locale } from "@/i18n/config";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  defaultCurrency: string;
  timezone: string;
  language: string;
  notificationPreferences: {
    email: Record<string, boolean>;
    push: Record<string, boolean>;
  };
}

const notifKeys = [
  { key: "addedToGroup", section: "notifGroupsFriends" },
  { key: "addedAsFriend", section: "notifGroupsFriends" },
  { key: "expenseAdded", section: "notifExpenses" },
  { key: "expenseEdited", section: "notifExpenses" },
  { key: "commentAdded", section: "notifExpenses" },
  { key: "paymentReceived", section: "notifExpenses" },
  { key: "monthlySummary", section: "notifNews" },
] as const;

export default function AccountSettingsPage() {
  const t = useTranslations("settings");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("UTC");
  const [language, setLanguage] = useState<string>(locale);
  const [notifPrefs, setNotifPrefs] = useState<{
    email: Record<string, boolean>;
    push: Record<string, boolean>;
  }>({ email: {}, push: {} });

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((data: UserProfile) => {
        setProfile(data);
        setName(data.name);
        setPhone(data.phone ?? "");
        setDefaultCurrency(data.defaultCurrency);
        setTimezone(data.timezone);
        setLanguage(data.language);
        if (data.notificationPreferences) {
          setNotifPrefs(data.notificationPreferences);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/users/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone: phone || null,
        defaultCurrency,
        timezone,
        language,
        notificationPreferences: notifPrefs,
      }),
    });
    setSaving(false);

    // If language changed, redirect to new locale
    if (language !== locale) {
      router.replace("/account/settings", { locale: language as Locale });
    }
  };

  const toggleNotif = (
    channel: "email" | "push",
    key: string
  ) => {
    setNotifPrefs((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [key]: !prev[channel][key],
      },
    }));
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-[rgba(0,0,0,0.06)] p-6 animate-pulse h-40 bg-[rgba(0,0,0,0.04)]" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold text-[var(--color-text)] tracking-tight">{t("title")}</h1>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-[rgba(0,0,0,0.06)] p-6 space-y-4">
        <h2 className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
          {t("yourAccount")}
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/8 flex items-center justify-center text-2xl font-semibold text-[var(--color-primary)]">
            {name[0]?.toUpperCase() ?? "U"}
          </div>
          <button className="text-sm text-[var(--color-primary)] hover:underline">
            {t("avatar")}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              {t("name")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-[rgba(0,0,0,0.12)] rounded-xl px-3.5 py-2.5 text-sm bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              {t("email")}
            </label>
            <input
              type="email"
              value={profile?.email ?? ""}
              disabled
              className="w-full border border-[rgba(0,0,0,0.12)] rounded-xl px-3.5 py-2.5 text-sm bg-[var(--color-bg)] text-[var(--color-text-secondary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              {t("phone")}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-[rgba(0,0,0,0.12)] rounded-xl px-3.5 py-2.5 text-sm bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              {t("defaultCurrency")}
            </label>
            <select
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value)}
              className="w-full border border-[rgba(0,0,0,0.12)] rounded-xl px-3.5 py-2.5 text-sm bg-[var(--color-bg)]"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code} — {locale === "fa" ? c.nameFa : c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              {t("timezone")}
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full border border-[rgba(0,0,0,0.12)] rounded-xl px-3.5 py-2.5 text-sm bg-[var(--color-bg)]"
            >
              {Intl.supportedValuesOf("timeZone").map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              {t("language")}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full border border-[rgba(0,0,0,0.12)] rounded-xl px-3.5 py-2.5 text-sm bg-[var(--color-bg)]"
            >
              <option value="en">English</option>
              <option value="fa">فارسی</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-[rgba(0,0,0,0.06)] p-6">
        <h2 className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-4">
          {t("notifications")}
        </h2>

        {/* Header */}
        <div className="flex items-center justify-end gap-8 mb-2 pe-1">
          <span className="text-xs text-[var(--color-text-secondary)]">📧</span>
          <span className="text-xs text-[var(--color-text-secondary)]">📱</span>
        </div>

        {/* Group: Groups & Friends */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase mb-2">
            {t("notifGroupsFriends")}
          </h3>
          {notifKeys
            .filter((n) => n.section === "notifGroupsFriends")
            .map((n) => (
              <div
                key={n.key}
                className="flex items-center justify-between py-1.5"
              >
                <span className="text-sm text-[var(--color-text)]">{t(n.key)}</span>
                <div className="flex items-center gap-6">
                  <input
                    type="checkbox"
                    checked={notifPrefs.email?.[n.key] ?? true}
                    onChange={() => toggleNotif("email", n.key)}
                    className="rounded"
                  />
                  <input
                    type="checkbox"
                    checked={notifPrefs.push?.[n.key] ?? true}
                    onChange={() => toggleNotif("push", n.key)}
                    className="rounded"
                  />
                </div>
              </div>
            ))}
        </div>

        {/* Group: Expenses */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase mb-2">
            {t("notifExpenses")}
          </h3>
          {notifKeys
            .filter((n) => n.section === "notifExpenses")
            .map((n) => (
              <div
                key={n.key}
                className="flex items-center justify-between py-1.5"
              >
                <span className="text-sm text-[var(--color-text)]">{t(n.key)}</span>
                <div className="flex items-center gap-6">
                  <input
                    type="checkbox"
                    checked={notifPrefs.email?.[n.key] ?? true}
                    onChange={() => toggleNotif("email", n.key)}
                    className="rounded"
                  />
                  <input
                    type="checkbox"
                    checked={notifPrefs.push?.[n.key] ?? true}
                    onChange={() => toggleNotif("push", n.key)}
                    className="rounded"
                  />
                </div>
              </div>
            ))}
        </div>

        {/* Group: News */}
        <div>
          <h3 className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase mb-2">
            {t("notifNews")}
          </h3>
          {notifKeys
            .filter((n) => n.section === "notifNews")
            .map((n) => (
              <div
                key={n.key}
                className="flex items-center justify-between py-1.5"
              >
                <span className="text-sm text-[var(--color-text)]">{t(n.key)}</span>
                <div className="flex items-center gap-6">
                  <input
                    type="checkbox"
                    checked={notifPrefs.email?.[n.key] ?? true}
                    onChange={() => toggleNotif("email", n.key)}
                    className="rounded"
                  />
                  <input
                    type="checkbox"
                    checked={notifPrefs.push?.[n.key] ?? true}
                    onChange={() => toggleNotif("push", n.key)}
                    className="rounded"
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Export & Advanced */}
      <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-[rgba(0,0,0,0.06)] p-6 space-y-3">
        <div className="flex items-center gap-3">
          <a
            href="/api/export/json"
            download
            className="text-sm text-[var(--color-primary)] hover:underline"
          >
            {t("downloadBackup")}
          </a>
          <span className="text-[var(--color-text-tertiary)]">|</span>
          <a
            href="/api/export/csv"
            download
            className="text-sm text-[var(--color-primary)] hover:underline"
          >
            Export CSV
          </a>
        </div>
        <div className="border-t border-[rgba(0,0,0,0.06)] pt-3">
          <button className="text-sm text-red-500 hover:underline">
            {t("deleteAccount")}
          </button>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-[var(--color-primary-hover)] transition-all duration-200 disabled:opacity-50"
        >
          {saving ? "..." : t("save")}
        </button>
      </div>
    </div>
  );
}
