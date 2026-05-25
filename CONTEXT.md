# mOS — Project Context

> Personal "super app" PWA — an all-in-one hub for daily life tools. Read this first before exploring the codebase.

---

## What It Is

**mOS** is a personal progressive web app that acts as a lightweight operating-system-style hub. It is built for a single user (Joe) and combines multiple life domains into one installable mobile-first experience.

Current modules:
- **Home (Hub)** — greeting and module cards that navigate to Finance and Health.
- **Finance Hub** — **Budget** (income/expense tracking, spending budget %, category breakdowns) and **Meals** (meal builder with proportional ingredient costing). Budget data in Supabase; meals in `localStorage`.
- **Health Hub** — **Stack** (supplement tracker with cost-per-serving) and **Mass** (daily weight log, 30-day trend chart, monthly average, BMI with saved height). Supplements in Supabase; mass in `localStorage`.

The app is password-gated via `VITE_APP_PASSWORD` and deployed to GitHub Pages at `/mOS/`.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 + TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 + central theme (`src/theme.ts`) via CSS custom properties |
| Icons | react-icons (Material Design set) |
| Backend / DB | Supabase (PostgreSQL) — finance entries + supplements tables |
| Local storage | `localStorage` / `sessionStorage` for meals, mass, theme, spending budget % |
| Hosting | GitHub Pages |

---

## Architecture & Key Decisions

**Routing:** Client-side view switching (no React Router). `App.tsx` holds:
- `view`: `home` | `finance` | `health`
- `financeSection`: `budget` | `meals` (when in Finance Hub)
- `healthSection`: `stack` | `mass` (when in Health Hub)

**Navigation:** The bottom nav is context-aware:
- On **Home**: Home | Finance | Health (main hubs)
- In **Finance Hub**: Home (back to main hub) | Budget | Meals
- In **Health Hub**: Home (back to main hub) | Stack | Mass

Module sub-sections are driven by the bottom nav — not in-page tabs.

**Page organization** (by domain under `src/pages/`):
```
pages/
  home/Hub.tsx
  finance/FinancePage.tsx, Budget.tsx, Meals.tsx
  health/HealthPage.tsx, Stack.tsx, Mass.tsx
```

**Data layer:**
- `src/lib/budget.ts` — finance entries (Supabase `entries` table)
- `src/lib/supplements.ts` — supplements (Supabase `supplements` table)
- `src/lib/meals.ts` — meals (`localStorage`)
- `src/lib/mass.ts` — body weight entries (`localStorage`)

**Theming:** All brand colors in `src/theme.ts`. Default is **dark** — deep charcoal-green (`#0C1412`) with emerald accent (`#10B981`). Subtle depth via card shadows, not neon glow. Light/dark toggle on Home; persisted under `mos:theme`.

**Layout:** Mobile-first with a fixed bottom nav. Responsive on larger screens without a separate desktop/mobile toggle.

**Security:** Simple client-side password gate (`PasswordGate.tsx`) — not true auth.

---

## Primary Brand Color

| Token | Dark (default) | Light |
|-------|----------------|-------|
| `--mos-bg` | `#0C1412` | `#E8F5F0` |
| `--mos-accent` | `#10B981` | `#059669` |
| `--mos-accent-card` | `#0D6B52` | `#047857` |

---

## Current State

### Built
- Password gate + session unlock
- Hub home with module cards
- Nested bottom nav per module
- Finance Hub: budget dashboard + meals
- Health Hub: supplement stack + mass tracker
- Light/dark theme toggle
- PWA manifest

### Not yet built / planned
- Additional super-app modules (tasks, notes, calendar, etc.)
- True authentication (currently password-only)
- Meals and mass synced to Supabase
- PWA manifest with `public/logo.png` as favicon and app icon

---

## Common Commands

```powershell
npm install
npm run dev
npm run build
npm run preview
```

**Environment:** Copy `.env.example` → `.env.local` for local dev.

**Deploy:** Push to `main` runs `.github/workflows/deploy.yml`. Repo secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_PASSWORD`.

Live URL: `https://jbj-code.github.io/mOS/`

---

## Gotchas

- **Base path:** Vite `base` is `/mOS/` — must match the GitHub repo name.
- **CSS variable prefix:** Theme tokens use `--mos-*`; utility classes use `mos-*`.
- **Finance cache:** `budget.ts` caches entries per month in memory (500-row cap per month).

---

*Last updated: May 2026.*
