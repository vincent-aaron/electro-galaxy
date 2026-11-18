# Electro Galaxy

Electro Galaxy is a full-stack portfolio demo of an electronics store, designed and built as a **solo project** by Vincent Aaron Vicente.

> **Demo only.** Products and prices are sample data. No real payments, orders or deliveries are processed, and checkout never asks for card details.

## Features

**Storefront**

- Product catalog with categories, featured items, deals, search, filters and sorting
- Product pages with image galleries, specifications, ratings and related products
- Responsive layout for phones and desktops

**Shopping**

- Persistent cart and wishlist (Zustand and `localStorage`)
- Simulated checkout for guests and signed-in users
- Order totals, prices and stock are calculated in the database by `place_order`, so the browser cannot change them
- Order requests containing a card number are rejected by the server

**Accounts**

- Sign up, sign in, sign out and password recovery with Supabase Auth
- Order history and saved addresses

**Reviews and AI**

- Signed-in users can rate and review products, one review per product
- Reviews pass an offline word filter and Google Gemini moderation before publishing
- Galaxy Assistant, a floating chat widget powered by Google Gemini through a server-side route

**Admin panel (`/admin`)**

- Sales overview and low-stock alerts
- Manage products, categories, orders, customers and contact messages
- Every admin API route checks the signed-in user's role, and row level security enforces it again in the database

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 (App Router) |
| UI | React 19, TypeScript |
| Styling | Tailwind CSS 3 |
| State | Zustand |
| Backend | Supabase (PostgreSQL, Auth, row level security) |
| AI | Google Gemini API |
| Icons | lucide-react |
| Hosting | Vercel |

## Getting Started

**Requirements:** Node.js 20 or newer and npm.

```bash
npm install
cp .env.example .env
npm run dev
```

Open <http://localhost:3000>. Without Supabase values the app runs on built-in demo data, and sign-in is simulated in the browser.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run db:seed` | Load the sample catalog into Supabase |

## Environment Variables

| Variable | Required | Exposed to browser | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | For live data | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For live data | Yes | Supabase anon key, restricted by row level security |
| `SUPABASE_SERVICE_ROLE_KEY` | For reviews and seeding | **No** | Publishes moderated reviews and seeds the catalog |
| `GEMINI_API_KEY` | For the AI assistant | **No** | Galaxy Assistant and review moderation |
| `NEXT_PUBLIC_SITE_URL` | No | Yes | Public site address. On Vercel it falls back to the production domain |

Never add a `NEXT_PUBLIC_` prefix to `SUPABASE_SERVICE_ROLE_KEY` or `GEMINI_API_KEY`.

## Database Setup

1. Create a [Supabase](https://supabase.com) project.
2. Run `supabase/schema.sql` in the Supabase SQL Editor.
3. Add the Supabase values to `.env`, then run `npm run db:seed`.

**Upgrading an existing database:** run `supabase/reviews-migration.sql` if the `reviews` table has no `reviewer_name` column, then run `supabase/admin-policies.sql`. The policies file is safe to run more than once.

**Creating an admin:** sign up in the app, set your row's `role` to `admin` in the `profiles` table using the Supabase Table Editor, then sign out and back in.

## Deploy to Vercel

1. Push the repository to GitHub and import it at [vercel.com/new](https://vercel.com/new). The Next.js settings are detected automatically.
2. Under **Settings > Environment Variables**, add the variables listed above.
3. Deploy.
4. In Supabase, open **Authentication > URL Configuration**. Set **Site URL** to your Vercel address and add `https://your-domain.vercel.app/auth/reset-password` to **Redirect URLs**.
5. Open `https://your-domain.vercel.app/api/health`. A working setup returns `"database": "reachable"`.

### Keeping the free Supabase project awake

Free Supabase projects pause after a period of inactivity. `vercel.json` schedules a daily Vercel cron job that calls `/api/health`, which reads one row from the database. Cron jobs run on production deployments only.

## API Overview

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health check and daily database keep-alive |
| `GET` | `/api/products` | List products |
| `GET`, `POST` | `/api/products/[slug]/reviews` | Read reviews or submit a moderated review |
| `GET`, `POST` | `/api/orders` | Read your orders or place a demo order |
| `GET`, `POST`, `DELETE` | `/api/addresses` | Manage saved addresses |
| `POST` | `/api/contact` | Send a contact message |
| `POST` | `/api/auth/forgot-password` | Request a password recovery email |
| `POST` | `/api/assistant` | Chat with Galaxy Assistant |
| Various | `/api/admin/*` | Admin operations (admin role required) |

## License

© Vincent Aaron Vicente. All rights reserved. Product and brand names belong to their respective owners.
