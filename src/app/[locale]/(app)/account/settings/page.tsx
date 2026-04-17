"use client";

import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { currencies } from "@/lib/currencies";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/config";

function CustomSelect({
  value, onChange, options, label, searchable = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label: string;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setSearch(""); }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-text)] mb-1">{label}</label>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between border border-[var(--color-border-strong)] rounded-xl px-3.5 py-2.5 text-sm bg-[var(--color-bg)] text-[var(--color-text)] text-start hover:border-[var(--color-primary)] transition-colors"
        >
          <span className="truncate">{selected?.label ?? value}</span>
          <ChevronDown size={14} className={cn("text-[var(--color-text-tertiary)] transition-transform", open && "rotate-180")} />
        </button>
        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-elevated)] py-1 max-h-60 flex flex-col">
            {searchable && (
              <div className="px-2 py-1.5 border-b border-[var(--color-border)]">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                  <input
                    type="text" placeholder="Search..." value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-7 pr-2 py-1.5 text-xs bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
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
                  onClick={() => { onChange(o.value); setOpen(false); setSearch(""); }}
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
                <p className="px-3.5 py-2 text-sm text-[var(--color-text-tertiary)]">No results</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
        checked ? "bg-[var(--color-primary)]" : "bg-[var(--color-border-strong)]"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[var(--color-surface)] shadow-sm ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

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
          <div key={i} className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-6 animate-pulse h-40 bg-[var(--color-hover)]" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold text-[var(--color-text)] tracking-tight">{t("title")}</h1>

      {/* Profile Section */}
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-6 space-y-4">
        <h2 className="text-xs font-medium text-[var(--color-text-tertiary)]">
          {t("yourAccount")}
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-2xl font-semibold text-[var(--color-primary)]">
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
              className="w-full border border-[var(--color-border-strong)] rounded-xl px-3.5 py-2.5 text-sm bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all duration-200"
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
              className="w-full border border-[var(--color-border-strong)] rounded-xl px-3.5 py-2.5 text-sm bg-[var(--color-bg)] text-[var(--color-text-secondary)]"
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
              className="w-full border border-[var(--color-border-strong)] rounded-xl px-3.5 py-2.5 text-sm bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all duration-200"
            />
          </div>

          <CustomSelect
            label={t("defaultCurrency")}
            value={defaultCurrency}
            onChange={setDefaultCurrency}
            searchable
            options={currencies.map((c) => ({
              value: c.code,
              label: `${c.symbol} ${c.code} — ${locale === "fa" ? c.nameFa : c.name}`,
            }))}
          />

          <CustomSelect
            label={t("timezone")}
            value={timezone}
            onChange={setTimezone}
            searchable
            options={Intl.supportedValuesOf("timeZone").map((tz) => ({
              value: tz,
              label: tz.replace(/_/g, " "),
            }))}
          />

          <CustomSelect
            label={t("language")}
            value={language}
            onChange={setLanguage}
            options={[
              { value: "en", label: "English" },
              { value: "fa", label: "فارسی (Persian)" },
            ]}
          />
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-6">
        <h2 className="text-xs font-medium text-[var(--color-text-tertiary)] mb-4">
          {t("notifications")}
        </h2>

        {/* Header */}
        <div className="flex items-center justify-end gap-8 mb-2 pe-1">
          <span className="text-xs text-[var(--color-text-secondary)]">📧</span>
          <span className="text-xs text-[var(--color-text-secondary)]">📱</span>
        </div>

        {/* Group: Groups & Friends */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-[var(--color-text-tertiary)] mb-2">
            {t("notifGroupsFriends")}
          </h3>
          {notifKeys
            .filter((n) => n.section === "notifGroupsFriends")
            .map((n) => (
              <div
                key={n.key}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm text-[var(--color-text)]">{t(n.key)}</span>
                <div className="flex items-center gap-6">
                  <ToggleSwitch
                    checked={notifPrefs.email?.[n.key] ?? true}
                    onChange={() => toggleNotif("email", n.key)}
                  />
                  <ToggleSwitch
                    checked={notifPrefs.push?.[n.key] ?? true}
                    onChange={() => toggleNotif("push", n.key)}
                  />
                </div>
              </div>
            ))}
        </div>

        {/* Group: Expenses */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-[var(--color-text-tertiary)] mb-2">
            {t("notifExpenses")}
          </h3>
          {notifKeys
            .filter((n) => n.section === "notifExpenses")
            .map((n) => (
              <div
                key={n.key}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm text-[var(--color-text)]">{t(n.key)}</span>
                <div className="flex items-center gap-6">
                  <ToggleSwitch
                    checked={notifPrefs.email?.[n.key] ?? true}
                    onChange={() => toggleNotif("email", n.key)}
                  />
                  <ToggleSwitch
                    checked={notifPrefs.push?.[n.key] ?? true}
                    onChange={() => toggleNotif("push", n.key)}
                  />
                </div>
              </div>
            ))}
        </div>

        {/* Group: News */}
        <div>
          <h3 className="text-xs font-medium text-[var(--color-text-tertiary)] mb-2">
            {t("notifNews")}
          </h3>
          {notifKeys
            .filter((n) => n.section === "notifNews")
            .map((n) => (
              <div
                key={n.key}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm text-[var(--color-text)]">{t(n.key)}</span>
                <div className="flex items-center gap-6">
                  <ToggleSwitch
                    checked={notifPrefs.email?.[n.key] ?? true}
                    onChange={() => toggleNotif("email", n.key)}
                  />
                  <ToggleSwitch
                    checked={notifPrefs.push?.[n.key] ?? true}
                    onChange={() => toggleNotif("push", n.key)}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Export & Advanced */}
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-6 space-y-3">
        <div className="flex items-center gap-3">
          <a
            href="/api/export/json"
            download
            className="border border-[var(--color-border-strong)] px-4 py-2 rounded-xl text-sm font-medium hover:bg-[var(--color-hover)] transition-all duration-200 text-[var(--color-text)]"
          >
            {t("downloadBackup")}
          </a>
          <a
            href="/api/export/csv"
            download
            className="border border-[var(--color-border-strong)] px-4 py-2 rounded-xl text-sm font-medium hover:bg-[var(--color-hover)] transition-all duration-200 text-[var(--color-text)]"
          >
            Export CSV
          </a>
        </div>
        <div className="border-t border-[var(--color-border)] pt-3">
          <button className="border border-[var(--color-negative)] text-[var(--color-negative)] px-4 py-2 rounded-xl text-sm font-medium hover:bg-[var(--color-negative-light)] transition-all duration-200">
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
          {saving ? t("saving") : t("save")}
        </button>
      </div>
    </div>
  );
}
