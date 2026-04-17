"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
  checks: {
    length: boolean;
    letter: boolean;
    number: boolean;
    special: boolean;
  };
}

function analyzePassword(pw: string): PasswordStrength {
  const checks = {
    length: pw.length >= 8,
    letter: /[a-zA-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^a-zA-Z0-9]/.test(pw),
  };
  const passedCount = Object.values(checks).filter(Boolean).length;
  const score = passedCount as 0 | 1 | 2 | 3 | 4;

  const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
  const colors = [
    "var(--color-negative)",
    "var(--color-negative)",
    "var(--color-warning)",
    "var(--color-primary)",
    "var(--color-positive)",
  ];

  return { score, label: labels[score], color: colors[score], checks };
}

export default function SignupPage() {
  const t = useTranslations("auth");
  const appName = useTranslations("app");
  const locale = useLocale();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const strength = analyzePassword(password);

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
    if (strength.score < 2) {
      setError(t("errors.passwordMin"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error === "emailInUse") {
          setError(t("errors.emailInUse"));
        } else {
          setError(t("errors.invalidEmail"));
        }
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("errors.invalidCredentials"));
        setLoading(false);
      } else {
        router.push(`/${locale}/dashboard`);
      }
    } catch {
      setError(t("errors.invalidEmail"));
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] p-8">
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-[var(--color-text)] tracking-tight">
            {appName("name")}
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm mt-1">
            {t("createAccount")}
          </p>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: `/${locale}/dashboard` })}
          className="w-full flex items-center justify-center gap-2.5 border border-[var(--color-border-strong)] rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-hover)] transition-all duration-200 mb-5"
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {t("google")}
        </button>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--color-border)]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[var(--color-surface)] px-3 text-[var(--color-text-tertiary)]">
              {t("orContinueWith")}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-[var(--color-negative-light)] text-[var(--color-negative)] text-sm rounded-xl p-3">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              {t("name")}
            </label>
            <div className="relative">
              <User size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
                className="w-full border border-[var(--color-border-strong)] rounded-xl ps-10 pe-3.5 py-2.5 text-sm bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all duration-200"
              />
            </div>
          </div>

          {/* Email */}
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
                placeholder="you@example.com"
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

          {/* Password with strength indicator */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              {t("password")}
            </label>
            <div className="relative">
              <Lock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                required
                minLength={8}
                placeholder="At least 8 characters"
                className="w-full border border-[var(--color-border-strong)] rounded-xl ps-10 pe-10 py-2.5 text-sm bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password strength */}
            {(passwordFocused || password) && (
              <div className="mt-2.5 space-y-2">
                {/* Strength bar */}
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex-1 h-1 rounded-full transition-colors duration-300"
                      style={{
                        backgroundColor: i < strength.score ? strength.color : "var(--color-border)",
                      }}
                    />
                  ))}
                </div>
                {/* Strength label */}
                {password && (
                  <p className="text-xs font-medium" style={{ color: strength.color }}>
                    {strength.label}
                  </p>
                )}
                {/* Requirement checklist */}
                <ul className="grid grid-cols-2 gap-1 text-[11px] text-[var(--color-text-tertiary)]">
                  <li className="flex items-center gap-1">
                    <Check
                      size={11}
                      className={strength.checks.length ? "text-[var(--color-positive)]" : "opacity-30"}
                    />
                    8+ characters
                  </li>
                  <li className="flex items-center gap-1">
                    <Check
                      size={11}
                      className={strength.checks.letter ? "text-[var(--color-positive)]" : "opacity-30"}
                    />
                    Letter (a–z)
                  </li>
                  <li className="flex items-center gap-1">
                    <Check
                      size={11}
                      className={strength.checks.number ? "text-[var(--color-positive)]" : "opacity-30"}
                    />
                    Number (0–9)
                  </li>
                  <li className="flex items-center gap-1">
                    <Check
                      size={11}
                      className={strength.checks.special ? "text-[var(--color-positive)]" : "opacity-30"}
                    />
                    Symbol (!@#$)
                  </li>
                </ul>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !isValidEmail(email) || strength.score < 2}
            className="w-full bg-[var(--color-primary)] text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "..." : t("signUp")}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--color-text-secondary)] mt-6">
          {t("alreadyHaveAccount")}{" "}
          <Link
            href="/login"
            className="text-[var(--color-primary)] font-medium hover:underline"
          >
            {t("logIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
