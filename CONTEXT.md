# mOS — Project Context

> Personal "super app" PWA — an all-in-one hub for daily life tools. Read this first before exploring the codebase.

---

## What It Is

**mOS** is a personal progressive web app that acts as a lightweight operating-system-style hub. It is built for a single user (Joe) and combines multiple life domains into one installable mobile/desktop experience. The vision is a super app: one home screen that links out to focused mini-apps (finance, meals, supplements, and more over time).

Currently live modules:
- **Home / Finance** — monthly budget dashboard with income/expense tracking, spending budget (% of income), category breakdowns, and recent activity. Data stored in Supabase.
- **Meals** — meal builder with ingredient costs; stored locally in `localStorage`.
- **Stack (Supplements)** — supplement tracker with cost-per-serving and monthly cost; stored in Supabase.

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
| Local storage | `localStorage` / `sessionStorage` for meals, theme, view mode, spending budget % |
| Hosting | GitHub Pages |

---

## Architecture & Key Decisions

**Routing:** Client-side view switching (no React Router). `App.tsx` holds a `view` state (`home` \| `meal` \| `supplements`) and renders the matching page component.

**Data layer:**
- `src/lib/budget.ts` — finance entries (Supabase `entries` table). Includes in-memory cache invalidated on writes.
- `src/lib/supplements.ts` — supplements (Supabase `supplements` table).
- `src/lib/meals.ts` — meals (local `localStorage` only).

**Database:** Schema in `supabase/schema.sql`. Delete old tables in Supabase Table Editor, then run the schema in SQL Editor. RLS disabled (personal single-user app). Entries are fetched one month at a time.

**Theming:** All brand colors in `src/theme.ts`. Default is **dark** — deep forest green (`#050A09`) with emerald accent (`#34D399`). Light mode uses the same green family on a soft mint background. Toggle on Home; persisted in `localStorage` under `mos:theme`.

**Layout:** Mobile-first with a bottom nav bar. Desktop mode adds a sidebar nav (toggle via header icon on Home). View mode persisted in `localStorage`.

**Security:** Simple client-side password gate (`PasswordGate.tsx`) — not true auth. Supabase anon key is public by design; RLS policies on Supabase side are the real boundary.

---

## Primary Brand Color

| Token | Dark (default) | Light |
|-------|----------------|-------|
| `--mos-bg` | `#050A09` | `#EFF6F2` |
| `--mos-accent` | `#34D399` | `#047857` |
| `--mos-accent-card` | `#0F5C47` | `#065F46` |

Dark mode is the primary look — emerald green on deep forest green.

---

## Current State

### Built
- Password gate + session unlock
- Home dashboard: month picker, net budget card, income/spend cards, adjustable spending budget %, quick actions, recent activity (transactions + category views)
- Add income / add expense modals with categorized entries
- Meals page: create/delete meals with ingredient pricing (local only)
- Supplements page: create/delete supplements with cost calculations (Supabase)
- Light/dark theme toggle
- Mobile ↔ desktop layout toggle
- PWA manifest

### Not yet built / planned
- Additional super-app modules (tasks, notes, fitness, etc.)
- True authentication (currently password-only)
- Meals synced to Supabase
- Pagination on finance entry lists (currently loads all entries)
- App icon asset in repo (`public/icons/mos-icon.jpg` — referenced but not committed)

---

## Common Commands

```powershell
# Apply database schema (copy supabase/schema.sql into Supabase SQL Editor, or use CLI)
# Supabase dashboard → SQL → New query → paste schema.sql → Run

# Install dependencies
npm install

# Dev server (http://localhost:5173)
npm run dev

# Type-check + production build
npm run build

# Preview production build locally
npm run preview
```

**Environment:** Copy `.env.example` → `.env.local` for local dev. Never commit real values.

**Deploy (same as LOGD):** Settings → Pages → **GitHub Actions**. Push to `main` runs `.github/workflows/deploy.yml` — builds the app and publishes to Pages. No `gh-pages` branch needed.

Repo secrets required (**Settings → Secrets → Actions**): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_PASSWORD`.

Live URL: `https://jbj-code.github.io/mOS/`

Password / `.env.local` changes only need a dev server restart — not a redeploy.

---

## Environment variables

Read from `.env.local` (local dev) via `import.meta.env`. Nothing is hardcoded in source.

| Variable | Used in |
|----------|---------|
| `VITE_SUPABASE_URL` | `src/supabaseClient.ts` |
| `VITE_SUPABASE_ANON_KEY` | `src/supabaseClient.ts` |
| `VITE_APP_PASSWORD` | `src/components/PasswordGate.tsx` — lock screen skipped when unset |

Vite only exposes vars prefixed with `VITE_`. Supabase values: dashboard → **Project Settings → API**.

---

## Gotchas

- **Base path:** Vite `base` is `/mOS/` — must match the GitHub repo name for project Pages (`username.github.io/mOS/`). Update bookmarks or installed PWA shortcuts if you renamed the repo.
- **CSS variable prefix:** Theme tokens use `--mos-*` and utility classes use `mos-*` (e.g. `mos-clickable-card`).
- **No secrets in git:** Use `.env.local` locally. Never commit credentials.
- **Finance cache:** `budget.ts` caches entries per month in memory. Each query is date-bounded with a 500-row cap per month.

---

*Last updated: May 2026.*
