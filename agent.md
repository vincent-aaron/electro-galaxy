# Electro Galaxy Agent

## Purpose

This file defines the current project context and how an AI agent should support development for `Electro Galaxy`.

The agent should use the existing Next.js App Router architecture and keep documentation in sync as the project grows.

## Project scope

- Build a premium electronics storefront
- Support product browsing, search, categories, and featured deals
- Maintain cart persistence and checkout experience
- Use Supabase for production data with mock-data fallback for development

## Key responsibilities

- Update `README.md` continuously with architecture changes and new workflows
- Add or improve project documentation when new pages, features, or APIs are introduced
- Preserve existing style conventions: Tailwind utility classes, galaxy-themed design tokens, and mobile-first layout
- Maintain clean separation between server data loaders and client state
- Keep feature pages aligned with current structure

## Important files and folders

- `src/app/` — primary page routes and app layout
- `src/app/api/` — API route handlers (products, orders, addresses, contact)
- `src/components/` — shared UI and page components
- `src/components/ai/AIAssistant.tsx` — floating AI chat widget (Galaxy Assistant)
- `src/lib/data/` — product loaders and fallback mock data
- `src/lib/supabase/` — Supabase connection helpers
- `src/store/cart-store.ts` — persisted cart state
- `src/store/wishlist-store.ts` — persisted wishlist state
- `src/types/database.ts` — schema interfaces used across the app
- `supabase/schema.sql` — complete database schema (tables, RLS, triggers, seed)
- `scripts/seed.ts` — automated database seed script (`npm run db:seed`)
- `.env.example` — template for environment variables
- `backup.md` — backup/restore guide
- `tailwind.config.ts` — custom theme and animation tokens
- `next.config.ts` — remote image configuration

## Environment setup

- Copy `.env.example` to `.env` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- If these are absent, the app falls back to mock data in `src/lib/data/mock-data.ts`.
- For seeding, also set `SUPABASE_SERVICE_ROLE_KEY` and run `npm run db:seed`.
- For the AI assistant, set `GEMINI_API_KEY` (free key from https://aistudio.google.com/apikey). This server-only variable must never use a `NEXT_PUBLIC_` prefix.

## When the project changes

- Add new top-level or route folders to `README.md` structure section
- Register new API endpoints and service responsibilities in `README.md`
- Note new environment variables and setup steps in `README.md`
- Keep the `agent.md` context updated when project architecture shifts or a new data source is added

## Agent workflow

1. Read existing route and component layout before making changes
2. Prefer server-side data fetching in App Router pages when the data is needed for initial render
3. Use client-side state only for UI interactions and persisted UI state such as the cart
4. Create documentation updates alongside code changes
5. Keep responses short and reference filenames clearly

## Current conventions

- Page components live under `src/app/`
- Shared UI lives under `src/components/`
- Data access helpers live under `src/lib/`
- Types are centralized in `src/types/database.ts`
- Cart state uses `zustand` with local persistence
- Wishlist state uses `zustand` with local persistence
- Supabase client is created in `src/lib/supabase/server.ts` and uses `cookies()` for SSR auth

## Notes

- The README should remain the canonical onboarding document.
- The agent must not duplicate major architecture details across separate docs without version updates.
