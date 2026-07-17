# MAAR Student Hub — Architecture & Build Plan

*"Everything a student needs. One place."*

This document is the design work that had to happen before any code was written: what MAAR
is (and isn't), how the data is modelled, how the codebase is organised, and the order in
which the remaining modules will be built out to the same standard as the modules already
shipped in this phase.

---

## 1. Positioning — what MAAR is, versus what it borrows

| Platform | What it does well | What it's missing | What MAAR takes |
|---|---|---|---|
| Notion | Flexible notes, databases | No timetable, no student-specific structure, steep setup cost | Rich structured notes, but pre-modelled for subjects/folders — zero setup |
| Google Classroom | Simple assignment flow | No personal planning, no focus tools, no cross-subject view | Homework/assignment tracking merged into one personal planner |
| Microsoft OneNote | Free-form capture | No deadlines, no study system around the notes | Notes wired directly into homework, subjects and revision sessions |
| Google Calendar | Reliable recurring events | Not student-shaped (no exam/homework/revision types, no conflict logic for lessons+work+revision) | A calendar with student-specific event types and conflict detection |
| Todoist | Clean task UX | No study-specific fields (subject, revision linkage) | Task model extended with subject, estimated duration, priority tied to deadlines |
| Quizlet / Anki | Flashcards, spaced repetition | Siloed from the student's own notes and syllabus | Flashcards generated from the student's own notes/files, same account |
| Khan Academy / Coursera | Structured official content | Not personal — doesn't know the student's timetable or workload | Official resources organised by curriculum, surfaced alongside personal work |
| Moodle / Blackboard | Institutional structure | Built for institutions, not individual students; heavy, dated UX | The organisational rigor, none of the institutional overhead |

The common failure mode across all of them: a student still needs 4–6 tools to actually run
their term. MAAR's job is to be the one place those tools' best ideas live together, wired
to the same account, the same subjects, and the same calendar.

**Feature filter applied throughout:** every feature must save time, reduce stress, improve
organisation, or improve academic outcomes — directly, not hypothetically. Gamification is
deliberately minimal (a streak counter and quiet milestones), because leaderboards and badges
demonstrably add stress for the "always behind" student MAAR is designed for.

---

## 2. Technology stack and why

- **React + TypeScript + Vite** — fast dev loop, full type safety end-to-end from the database
  types through to component props.
- **Tailwind CSS v4** (CSS-first `@theme` config) — the design tokens (palette, radii, shadows,
  fonts) live in `src/styles/index.css` as CSS variables, so theming/dark mode is free.
- **Supabase** — Postgres + Auth + Storage + Row Level Security in one managed service:
  - **Auth**: email/password and Google OAuth, both converging on one `profiles` row via a
    database trigger (`handle_new_user`), so there is no client-side race that could create
    duplicate accounts.
  - **Postgres**: the schema in `supabase/schema.sql` is the actual source of truth — every
    table, foreign key, index and RLS policy needed for every module in the brief already
    exists, even for modules not yet built in the UI.
  - **RLS**: every user-owned table has a single `for all using (auth.uid() = user_id)` policy.
    A student's data is invisible to every other student and to the anon key by construction,
    not by application-layer discipline.
  - **Storage**: a private `student-files` bucket, path-scoped per user
    (`{user_id}/{file_id}/...`), with storage policies mirroring the table-level RLS pattern.

No browser localStorage or Google Drive is used for persistent data — only Supabase, as
specified. (React state / memory is used for transient UI state, which is normal and
unrelated to persistence.)

---

## 3. Codebase structure

```
maar-student-hub/
├─ supabase/
│  └─ schema.sql          # full DB schema: tables, indexes, triggers, RLS — the source of truth
├─ src/
│  ├─ components/
│  │  ├─ ui/               # Button, Input, Card — the design-system primitives
│  │  ├─ layout/            # Sidebar, Topbar, AppShell
│  │  └─ shared/            # Logo, ModuleRoadmap
│  ├─ features/             # one folder per product module (feature-based, not type-based)
│  │  ├─ auth/               # login, signup, forgot/reset password, OAuth callback
│  │  ├─ onboarding/         # multi-step setup wizard
│  │  ├─ dashboard/          # today view — built this phase
│  │  ├─ timetable/          # calendar — schema ready, UI next phase
│  │  ├─ notes/               "
│  │  ├─ homework/            "
│  │  ├─ planner/              "
│  │  ├─ focus/                "
│  │  ├─ flashcards/           "
│  │  ├─ grades/                "
│  │  ├─ tools/                  "
│  │  ├─ assistant/          # source-based study assistant — schema + provider abstraction ready
│  │  ├─ files/                "
│  │  ├─ achievements/         "
│  │  └─ settings/             "
│  ├─ lib/supabase/         # typed Supabase client singleton
│  ├─ stores/                # zustand: auth/session/profile store
│  ├─ routes/                 # router + auth/onboarding route guards
│  └─ types/                 # hand-written DB types (swap for `supabase gen types` once live)
```

Each `features/<module>` folder is self-contained: its own API calls, hooks, and components.
Nothing is dumped into one giant file, and no route renders a fake "finished" screen for a
module that hasn't been built — unbuilt modules render an explicit, honest roadmap card
(`ModuleRoadmap`) instead of empty chrome pretending to be a feature.

---

## 4. What is fully built in this phase (not a mockup — real, wired to Supabase)

1. **Database schema** — every table, index, trigger and RLS policy for all 14 modules.
2. **Authentication** — email/password with verification, Google OAuth, forgot/reset password,
   session persistence, auto profile creation with no duplicate-account race.
3. **Onboarding** — the full 5-step wizard from the brief (about you → education system →
   subjects → study preferences → learning style), writing to `profiles` and `subjects`.
4. **Route protection** — signed-out users can't reach the app; signed-in-but-not-onboarded
   users are routed to onboarding before anything else; onboarded users skip both.
5. **App shell** — sidebar with every module, topbar with account menu and sign-out, responsive
   layout, dark mode via `prefers-color-scheme`, visible focus states, reduced-motion support.
6. **Dashboard** — today's timetable, today's homework, upcoming deadlines, recent notes, and
   study streak, all live-queried from Supabase (not sample data).
7. **Design system** — the navy/emerald/amber/violet token system from the brief, a bespoke
   MAAR wordmark (geometric "peak" mark, not a stock icon), Button/Input/Card primitives every
   future module reuses.

## 5. Build order for the remaining modules

Each ships fully functional — no placeholders — before the next starts:

1. **Timetable & Calendar** — day/week/month views, recurrence, conflict detection, ICS import.
2. **Notes** — rich text editor (likely TipTap, since `content_json` is shaped for a
   ProseMirror-style document), folders, tags, search, autosave, version history.
3. **Homework** — full CRUD, filtering, subject/priority views.
4. **Study Planner** — goals, revision scheduling, progress charts.
5. **Focus Room** — Pomodoro timer built on wall-clock timestamps (`started_at` +
   `paused_total_seconds`, recomputed on load) so it survives refresh/minimise/background tabs.
6. **Flashcards** — deck/card CRUD and self-test mode now; SM-2 scheduling later using the
   `ease_factor` / `interval_days` / `due_at` fields already in the schema.
7. **Grade Tracker** — weighted averages, target vs. predicted vs. achieved, trend graphs.
8. **Study Tools** — calculators, converters, timers (all client-side, no schema needed).
9. **Source-Based Study Assistant** — retrieval over `document_chunks`, provider-agnostic call
   layer (`src/lib/ai/`) so the AI vendor is a config change, not a rewrite; answers are grounded
   in the student's own files or curated `official_resources`, with an explicit "not found in
   your materials" path instead of ever inventing an answer.
10. **File Manager** — Storage-backed uploads with the folder/subject model already in place.
11. **Achievements** — streaks and milestones, deliberately quiet (no leaderboards).
12. **Settings** — theme, accessibility, notifications, privacy, all backed by `user_settings`.

---

## 6. Security notes

- RLS is the actual enforcement boundary — a leaked anon key still cannot read another
  student's rows, because every policy is keyed on `auth.uid()`.
- The Supabase `service_role` key is never used client-side and does not appear anywhere in
  this codebase.
- Auth callback and reset-password flows rely on Supabase's own PKCE/token exchange
  (`detectSessionInUrl: true`); no tokens are handled or stored manually.
- All future rich-text/markdown rendering must sanitise before rendering (covered when the
  Notes editor is built) to prevent stored XSS.
