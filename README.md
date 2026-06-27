# HesabKetab — حساب‌کتاب

> Splitting expenses shouldn't be complicated.

**HesabKetab** is a production, fully bilingual (English 🇬🇧 / Persian 🇮🇷) expense-splitting web app — think Splitwise, but with first-class right-to-left (RTL) support and the Jalaali (Persian) calendar. Track shared costs across groups and friends, split bills in five different ways, settle up, and keep everyone on the same page.

🔗 **Live app:** [hesabketab.vercel.app](https://hesabketab.vercel.app)

---

## ✨ Features

**Expenses & splitting**
- Add, edit, and soft-delete expenses (with restore from the activity feed)
- Five split modes: **Equal**, **Exact** amounts, **Percentage**, **Shares**, and **Adjustment**
- Multiple payers per expense and multi-currency support
- Expense categories and per-expense comments
- Recurring-expense fields exist in the data model (`WEEKLY`/`BIWEEKLY`/`MONTHLY`/`YEARLY`) — note: there is no automated recurrence engine yet, so these are not driven on a schedule

**Groups & friends**
- Groups with types (**Home**, **Trip**, **Couple**, **Other**), cover photos, and member roles (**Admin** / **Member**)
- Per-group "simplify debts" to minimize the number of payments needed to settle
- Friends list with email invitations (sent via Resend)

**Balances & settling up**
- Dashboard showing total balance, **you owe**, and **you are owed**
- Per-friend and per-group balance breakdowns
- Settle-up / payment recording

**Insights & data**
- Charts: balance pie chart, monthly spending trend, spending by category
- Export your data to **CSV** or **JSON**
- Activity feed and in-app notifications

**Experience**
- Full English/Persian localization with automatic RTL layout for Persian
- Jalaali (Shamsi) calendar formatting for Persian users
- Light / dark theme toggle (persisted)
- Responsive design with a dedicated mobile drawer and bottom navigation
- Snappy navigation via a persisted Zustand store and stale-while-revalidate caching

**Accounts**
- Sign in with **Google** or **email + password** (bcrypt-hashed)
- Profile settings: name, default currency, timezone, language, and notification preferences
- Email notification preferences are stored; a "push" channel preference is persisted in the schema but push delivery is not yet wired up
- A forgot-password page exists as a UI placeholder; the reset flow is not yet implemented server-side

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org) 16 (App Router, Turbopack) |
| UI | [React](https://react.dev) 19, [Tailwind CSS](https://tailwindcss.com) 4 |
| Language | [TypeScript](https://www.typescriptlang.org) 6 |
| Auth | [Auth.js / NextAuth](https://authjs.dev) v5 (+ Prisma adapter) |
| Database | PostgreSQL ([Neon](https://neon.tech)) |
| ORM | [Prisma](https://www.prisma.io) 6 |
| i18n | [next-intl](https://next-intl.dev) 4 |
| State | [Zustand](https://zustand-demo.pmnd.rs) 5 (persisted) |
| Validation | [Zod](https://zod.dev) 4 |
| Email | [Resend](https://resend.com) |
| Dates | [jalaali-js](https://github.com/jalaali/jalaali-js) (Persian calendar) |
| Icons | [lucide-react](https://lucide.dev) |
| Hosting | [Vercel](https://vercel.com) (Node 24.x) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18.18+** (the project deploys on Node 24.x)
- **npm** (or your preferred package manager)
- A **PostgreSQL** database — [Neon](https://neon.tech) has a free tier and is what production uses
- A **Google OAuth** client (for Google sign-in) and a **Resend** API key (for emails)

### 1. Clone the repository

```bash
git clone https://github.com/MehranMoshtagh/HesabKetab.git
cd HesabKetab
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your values (see the [Environment Variables](#-environment-variables) table below):

```bash
cp .env.example .env
```

### 4. Set up the database

```bash
npm run db:generate   # generate the Prisma client
npm run db:push       # create the tables in your database from the schema
```

Optionally seed starter data (see warning below):

```bash
npm run db:seed
```

> ⚠️ **`db:seed` is destructive.** The seed script **deletes every row in all tables** before inserting demo data — never run it against a database with data you want to keep. It uses [`tsx`](https://github.com/privatenumber/tsx); if it isn't already available, install it with `npm i -D tsx`.
>
> After seeding, you can log in with these demo accounts (password `password123` for all):
> - `alice@example.com`, `bob@example.com` (English)
> - `sara@example.com`, `ali@example.com` (Persian)

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|:---:|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string used by the Prisma datasource (e.g. your Neon pooled connection string). |
| `AUTH_SECRET` | ✅ | NextAuth v5 secret for signing/encrypting tokens. Generate with `openssl rand -base64 32`. |
| `AUTH_GOOGLE_ID` | ✅ | Google OAuth client ID for the Google sign-in provider. |
| `AUTH_GOOGLE_SECRET` | ✅ | Google OAuth client secret. |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public base URL of the app (e.g. `http://localhost:3000` locally). |
| `RESEND_API_KEY` | ✅ | API key for [Resend](https://resend.com) email delivery (friend invites, support tickets). |
| `RESEND_FROM_EMAIL` | ⬜ | "From" address for outbound email. Falls back to `HesabKetab <onboarding@resend.dev>`. |
| `SUPPORT_EMAIL` | ⬜ | Destination address for support-ticket emails. Falls back to the project owner's address. |
| `AUTH_TRUST_HOST` | ⬜ | Set to `true` when self-hosting behind a proxy so NextAuth trusts the host header. Not required on Vercel. |

> All secrets live only in your local `.env` (gitignored) and in the Vercel dashboard — they are never committed. See [`ROTATION_LOG.md`](./ROTATION_LOG.md) for the project's secret-rotation history.

---

## 📜 Available Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | `prisma generate && next build` — generate the client, then build for production |
| `npm run start` | Start the production server (after `build`) |
| `npm run lint` | Run `next lint` |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:push` | Push the Prisma schema to the database (schema-driven, no migration files) |
| `npm run db:migrate` | Create and apply a dev migration (`prisma migrate dev`) |
| `npm run db:seed` | Seed demo data via `tsx prisma/seed.ts` (**destructive** — see above) |
| `npm run db:studio` | Open Prisma Studio to browse the database |

---

## 🗂 Project Structure

```
HesabKetab/
├── prisma/
│   ├── schema.prisma         # Data model (PostgreSQL)
│   └── seed.ts               # Demo data seeder (destructive)
├── messages/
│   ├── en.json               # English translations
│   └── fa.json               # Persian translations
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── (app)/        # Authenticated app: dashboard, all, activity,
│   │   │   │                 #   friends, groups, account/settings
│   │   │   ├── (auth)/       # login, signup, forgot-password
│   │   │   ├── (public)/     # features, pricing, about, privacy, terms, faq, support
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx      # Landing page
│   │   └── api/              # ~24 route handlers (expenses, groups, friends,
│   │                         #   balances, payments, charts, export, support, …)
│   ├── components/           # charts, expenses, settle, layout, shared, ui, providers, landing
│   ├── lib/                  # prisma, auth, balances, balance-service,
│   │                         #   simplify-debts, categories, currencies, date-utils, email
│   ├── i18n/                 # next-intl config, routing, request
│   ├── stores/               # Zustand app store (persisted)
│   ├── hooks/                # useAppData, useCachedFetch, useFormatMoney
│   ├── types/                # next-auth + jalaali-js type augmentations
│   └── middleware.ts         # Locale routing + geo redirect (IR → /fa)
├── next.config.ts            # next-intl plugin + serverActions bodySizeLimit (2mb)
└── vercel.json               # Region (cdg1) + API function maxDuration (10s)
```

---

## 🔐 Authentication

Auth is handled by **NextAuth (Auth.js) v5** with the **Prisma adapter** and a **JWT** session strategy:

- **Google OAuth** (`allowDangerousEmailAccountLinking` enabled so the same email links across providers).
- **Credentials** (email + password) — passwords are hashed with **bcrypt** and verified on sign-in; registration is handled by `POST /api/auth/signup`.
- On OAuth user creation, an `events.createUser` hook maps the provider `image` to the app's `avatar` field and falls back to the email local-part when a name is missing.
- Custom sign-in page at `/login`.

---

## 🗄 Database

The schema (`prisma/schema.prisma`) targets **PostgreSQL** and is managed with Prisma. Monetary values use `Decimal(10,2)` for exact precision (important for a money app).

**Core models:** `User`, `Group`, `GroupMember`, `Friendship`, `Expense`, `ExpensePayer`, `ExpenseShare`, `Comment`, `Activity`, `Notification`, plus the NextAuth models `Account`, `Session`, and `VerificationToken`.

**Key enums:** `Language`, `GroupType`, `GroupRole`, `SplitType`, `RecurringInterval`, `ActivityType`.

The project uses a **schema-driven** workflow (`prisma db push`) rather than committed migration files. Run `npm run db:studio` to inspect data locally.

---

## 🌍 Internationalization

- Locales: **English (`en`, default, LTR)** and **Persian (`fa`, RTL)**, routed under `/[locale]` via **next-intl**.
- Translation catalogs live in `messages/en.json` and `messages/fa.json`.
- Layout direction switches automatically (LTR/RTL) based on locale.
- Persian users get **Jalaali calendar** date formatting (via `jalaali-js`).
- `middleware.ts` redirects first-time visitors from Iran (`x-vercel-ip-country === "IR"`) to the `/fa` locale.

---

## ☁️ Deployment

The app is deployed on **Vercel** with **continuous deployment from GitHub**:

- **Every push to the `master` branch automatically triggers a production build and deploy** to [hesabketab.vercel.app](https://hesabketab.vercel.app). Pull-request branches get preview deployments.
- Build command: `prisma generate && next build` (from `package.json`), bundled with Turbopack on Node 24.x.
- `vercel.json` pins the deployment region to **`cdg1` (Paris/EU)** and sets a **10-second `maxDuration`** for API route functions.
- Environment variables are configured in the Vercel dashboard (stored as Sensitive, Production-scoped).

---

## 🧪 Testing & CI

There is currently **no automated test suite and no CI pipeline** (no `.github/workflows`). Quality gates rely on Vercel's build step and `next lint`. This is intentional for the project's current stage.

---

## 📄 License

ISC (as declared in `package.json`).
