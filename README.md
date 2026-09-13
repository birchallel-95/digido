# DigiDo

A swipe-based digital capability development platform for educators and
education support staff — schools, colleges, universities and training
providers alike — built around the principle: **"Build your digital
capability, one practical improvement at a time."** ("Digital Capability
Passport" is the name of the in-app CPD record feature — see `/passport` —
not the app itself, which is called DigiDo.)

## Quick start

```bash
npm install
npx prisma db push      # creates dev.db (SQLite)
npx prisma db seed      # seeds framework, skills, PedTech facts, demo users
npm run dev
```

Open http://localhost:3000.

### Demo accounts (password: `Password123!` for all)

| Email | Role | Notes |
|---|---|---|
| `birchallel@gmail.com` | Staff | "Lived-in" account with 6-day momentum streak, mixed progress across 4 of 6 areas, evidence, and earned milestones — the best account to explore the product with. |
| `new.starter@example.ac.uk` | Staff | Fresh account, not yet onboarded — shows the onboarding flow. |
| `admin@example.ac.uk` | Admin | Skill management, PedTech facts, CSV import, settings, aggregated analytics. |

## Tech stack & key decisions

- **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4.**
- **Database: SQLite via Prisma 5**, not Postgres as originally specified.
  This is the one deliberate deviation from the brief — SQLite needs no
  server to stand up, which matters a lot for a local prototype/demo. Moving
  to Postgres later is a one-line change: set `provider = "postgresql"` in
  `prisma/schema.prisma` and point `DATABASE_URL` at a real instance. Nothing
  else in the codebase is SQLite-specific.
- **No native DB enums** — SQLite/Prisma doesn't support them, so status/role/
  category fields are `String` columns validated against `as const` tuples in
  `src/lib/constants.ts`. Switching to Postgres could reintroduce real enums
  if desired, but isn't required to.
- **Auth: NextAuth.js v5 (beta)**, JWT sessions, Credentials (email/password)
  provider live now, Google provider wired up and auto-enabled the moment
  `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` are set in `.env` — see "Enabling
  Google sign-in" below.
- **Framer Motion** for the swipe deck's drag gestures and card transitions;
  wrapped in `MotionConfig reducedMotion="user"` so every animation in the
  app automatically respects the OS-level reduced-motion setting.
- **Custom SVG radar chart** (`RadarChart.tsx`) rather than a chart library,
  so the accessible `<table>` fallback (via a native `<details>` disclosure)
  could be built as a first-class alternative rather than bolted on.
- **CSV import via PapaParse**, client-side parse → preview → validate →
  confirm → server action. XLSX import was called out as "ideally" in the
  brief but not implemented — CSV (the required format) is fully built.
- **Every skill carries a `howToSteps` array** — concrete, numbered
  instructions ("how do I actually do this?"), shown on the swipe card, in
  My Development, and on the dashboard's Today's Digital Step — not just the
  outcome/benefit copy. Admins edit it as one step per line in the skill form;
  CSV import accepts an optional "How To" column (steps separated by a line
  break or `|`).
- **Colour system is a warm yellow/gold, not the initial teal.** Solid brand
  backgrounds (buttons, badges, progress fills) always pair with dark ink
  foreground content, never white — a vibrant yellow with white text or icons
  fails contrast. Actual brand-coloured *text* (links, active nav labels,
  icons on a pale background) uses the separate, darker `--color-brand-text`
  token instead of the raw brand yellow, which is too light to read reliably
  as text. See the tokens and comments at the top of `globals.css`.
- **Every skill has a `platform`** — `GOOGLE`, `MICROSOFT`, or `BOTH`
  (suite-agnostic; shown to everyone). New staff pick a platform during
  onboarding (changeable later in Profile), and `src/lib/platform.ts`'s
  `platformWhere()` filters every skill query — progression math, the swipe
  deck, and recommendations — so a Microsoft-based institution never sees
  "open Google Forms" and vice versa. The seed data mirrors every platform-specific skill
  as a genuine pair (same outcome, real tool-specific steps) rather than
  reusing one description for both, so progress percentages stay comparable
  between platforms. Admins set/import `platform` per skill in the skill form
  and CSV import (optional "Platform" column, defaults to Both).
- **Admin "Staff accounts" page** (`/admin/users`) answers "who has an
  account and where are they in onboarding" — name, email, role, platform,
  sign-up/last-login dates, onboarding status, with promote/demote and
  remove-account actions. It deliberately never joins to a user's skill
  statuses or evidence — that boundary (account metadata vs. capability
  self-assessment) is enforced by `adminUsers.ts` only ever selecting account
  columns, never `UserSkillStatus`/`Evidence`.

## Where things live

```
prisma/schema.prisma       Data model (see brief §27–39 mapped 1:1)
prisma/seed.ts             Framework + 123 skills (Google/Microsoft/Both) + facts + milestones + demo users
src/lib/
  progression.ts           Per-area, per-level progress + stage-lock logic
  momentum.ts               Digital Momentum: streaks, weekly goal, activity log
  recommendations.ts        "Today's Digital Step" — rules-based, priority-ordered
  milestones.ts             Milestone-earning checks
  platform.ts              Google/Microsoft/Both skill filtering
  skillActions.ts            The one mutation path for skill status changes
  adminActions.ts / adminAnalytics.ts / adminUsers.ts   Admin CRUD, aggregate analytics, account list
src/components/
  discover/SwipeDeck.tsx     Swipe/button/keyboard skill assessment
  dashboard/RadarChart.tsx   Accessible radar chart + table alternative
  areas/JourneyPath.tsx      Per-level skill journey visualisation
src/app/(app)/…             Authenticated app shell (sidebar + bottom nav)
src/app/(auth)/…            Login/register
src/app/onboarding/         5-screen first-run flow
```

## What's fully built (MVP list, brief §52)

Landing page · registration & login · Google-OAuth-ready auth · onboarding
(including a Google/Microsoft/Both platform choice) · dashboard (momentum,
radar+table, Today's Digital Step, journeys, nearly there, weekly summary,
recent achievements, PedTech fact of the day) · six capability areas × three
levels, database-driven, each skill with numbered "how to do this" steps ·
swipe/button/keyboard assessment with undo · To Develop / In Progress lists ·
Achievements + Capability Passport · independent per-area progression &
stage locking (admin-configurable threshold) · Digital Momentum with
meaningful-day tracking and a configurable weekly goal · rules-based
recommendation engine · capability journey visualisation · development
milestones · private activity timeline · optional evidence/reflections ·
admin dashboard with aggregate-only, privacy-respecting analytics · staff
account administration (who's signed up, onboarding status, role, remove/
promote) · skill CRUD (add/edit/deactivate/reorder/move between areas,
levels or platforms) · PedTech fact management · CSV import (upload →
preview → validate → confirm) · seed/demo data · responsive mobile (bottom
nav, single-column, swipe-first) and desktop (sidebar, expanded dashboard)
layouts.

## Known simplifications (documented, not hidden)

- **PDF export of the Capability Passport** is a "Coming soon" button —
  the brief explicitly says not to build this in the MVP; the data model
  (`Evidence`, `Badge`, `UserMilestone`, etc.) is already shaped to support it.
- **Weekly-goal exclusions** (weekends, closure days, part-time patterns —
  brief §13) aren't implemented; the weekly target is a plain "N days" count.
- **Admin analytics recompute progress per staff member on every page load**
  (`src/lib/adminAnalytics.ts`) rather than reading a precomputed aggregate
  table. Fine at demo/small-institution scale; flagged in a code comment as the
  thing to change first if this ever needs to serve hundreds of staff.
- **XLSX import** isn't built, only CSV (which was the required format).
- Skill **images/video** fields exist end-to-end in the schema and admin form
  but no skill in the seed data uses them (no real assets to hand).
- **The seed script's own re-run logic matches skills by title**, not by a
  stable key — renaming a skill inside `prisma/seed.ts` and re-running the
  seed creates a new row rather than renaming the old one (harmless, but
  leaves an orphaned stale row on a dev database). This only affects editing
  the seed source itself; the actual admin UI always edits skills by their
  database ID, so renaming a skill from `/admin/skills` is always safe.

## Enabling Google sign-in

Add to `.env`:

```
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
```

The "Continue with Google" button on `/login` and `/register` appears
automatically once both are set — no code changes needed.
