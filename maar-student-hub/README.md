# MAAR Student Hub

Everything a student needs. One place.

This repo contains the working foundation of MAAR Student Hub: full database schema,
authentication, onboarding, app shell, and dashboard — all wired to Supabase, no mock data.
See **ARCHITECTURE.md** for the full plan, module-by-module build order, and design rationale.

## Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com).
2. **Run the schema**: open the SQL editor in your Supabase project and run the contents of
   `supabase/schema.sql`. This creates every table, index, trigger and RLS policy.
3. **Enable Google auth** (optional): in Supabase → Authentication → Providers → Google, add
   your OAuth client ID/secret. Email/password auth works with no extra setup.
4. **Copy environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from Supabase → Project Settings → API.
5. **Create the storage bucket** for the File Manager module (Storage → New bucket →
   `student-files`, **private**), then apply the storage policies commented at the bottom of
   `supabase/schema.sql`.
6. **Install and run**:
   ```bash
   npm install
   npm run dev
   ```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — typecheck + production build
- `npm run preview` — preview the production build locally

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Supabase (Postgres, Auth, Storage, RLS) ·
React Router · Zustand

---

© 2026 MAAR Student Hub. All Rights Reserved.
