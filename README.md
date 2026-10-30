# ⚡ Electro Galaxy

**Electro Galaxy** is a modern, full-featured e-commerce platform for premium electronics and smart appliances, built for the Philippine market. It combines a sleek "galaxy" themed UI with a production-ready **Supabase** backend and a seamless **mock-data fallback** for development and demos.

---

## ✨ Features

### Storefront

- Product catalog with categories, featured items, and flash deals
- Product detail pages with image galleries, specs, ratings, and related products
- Search & filtering - search by keyword, filter by category, sort by price/rating/name
- Responsive, mobile-first design with a mobile menu and filter drawer

### Shopping

- Persistent cart stored in `localStorage` via Zustand
- Free shipping on orders over ₱5,000 with automatic calculation
- Full checkout flow with shipping form and payment methods (COD, GCash, Maya, Credit/Debit Card)
- Secure order placement: the browser sends only product IDs and quantities; prices, totals, stock and the order number are calculated in the database (`place_order`), so they can't be tampered with
- Guest checkout and signed-in checkout, with stock decremented atomically

### Account

- Authentication - login/register via Supabase (with a mock fallback for development); sessions are refreshed by `src/middleware.ts` and **Sign Out** ends the Supabase session
- Password recovery - a privacy-safe recovery email endpoint with recovery and new-password screens
- Order history - view previous orders with status, items, and totals
- Wishlist - save products with a persistent Zustand store
- Address book - add, view, and delete saved shipping addresses

### Reviews & Ratings

- **Customer reviews** - signed-in users can rate (1-5 stars) and comment on any product
- **AI moderation** - every review is scanned by **Google Gemini** for profanity, hate speech, and offensive content before it's published. A whole-word offline denylist always runs too, and if the AI can't give a clear verdict the review is held back (fail-closed)
- Reviews are saved server-side with the service-role key **after** moderation, so the public API can't be used to skip it; reviewer emails are never exposed publicly
- One review per user per product, live average rating, and a "recent first" review list

### Content & Support

- About, Services, and Contact pages
- Privacy Policy, Terms of Service & Returns/Refunds pages
- Custom 404 page
- Contact form that stores messages in the database

### AI Assistant

- **Galaxy Assistant** - a floating AI chat widget (bottom-right) that helps users find products and understand discounts, payment methods, shipping, returns, and order tracking
- Powered by **Google Gemini** (free tier) with a store-specific system prompt
- Quick-reply chips and instant answers without leaving the page

---

### Admin Panel

- **Full admin dashboard** at `/admin` with sales stats, low-stock alerts, and recent orders
- **Product management** - add, edit, delete, search, and toggle featured/active status
- **Category management** - create, rename, reorder, and hide/show categories
- **Order management** - view every order (guest + registered), update status, payment status, tracking number, and notes
- **Customer management** - browse accounts and promote/demote admins
- **Contact inbox** - read, mark-as-read, and delete contact form submissions
- Access is **role-based** (RLS-protected) - only accounts with `role: "admin"` can manage anything

---

## 🛠 Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | Next.js 15 (App Router) |
| **UI** | React 19, TypeScript |
| **Styling** | Tailwind CSS 3.4 (custom "galaxy" theme) |
| **State** | Zustand (cart & wishlist persistence) |
| **Backend** | Supabase (PostgreSQL) |
| **Icons** | lucide-react |
| **Fonts** | Poppins (via next/font) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** and npm
- (Optional) A [Supabase](https://supabase.com) project for production data

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | No* | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No* | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | For reviews & seeding | Server-only service role key. Used by `npm run db:seed` and to publish moderated reviews. Never prefix with `NEXT_PUBLIC_` |
| `GEMINI_API_KEY` | No | Server-only Google Gemini key for the AI assistant |

> *If the Supabase variables are not set, the app automatically falls back to **mock data** so you can run it without a backend.
> The AI assistant requires `GEMINI_API_KEY` (free key at https://aistudio.google.com/apikey). It is used only by the server-side `/api/assistant` route and is never sent to the browser. If it is not set, the assistant shows a connection note.

For password recovery, add `http://localhost:3000/auth/reset-password` (and your production URL) to the **Redirect URLs** list in your Supabase Auth settings.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Run `npm run lint` to lint the project.

Build & production start:

```bash
npm run build
npm run start
```

---

## 🗄 Database (Supabase)

### Schema

Run the complete schema in `supabase/schema.sql` from your Supabase SQL Editor. It creates:

| Table | Purpose |
| --- | --- |
| `categories` | Product categories |
| `products` | Product catalog with pricing, stock & images |
| `profiles` | User profiles (linked to auth users) |
| `addresses` | Saved shipping addresses |
| `orders` | Order headers with status & payment info |
| `order_items` | Line items for each order |
| `reviews` | Product reviews & ratings |
| `wishlist_items` | Saved products per user |
| `contact_messages` | Contact form submissions |

### Security (RLS)

Row Level Security is enabled on all tables. The policies live in `supabase/admin-policies.sql` (also included in `schema.sql`):

- Catalog tables are **publicly readable** (only active items); only admins can write them
- Users only **access their own** profiles, addresses, orders, and wishlist
- Users **cannot change their own role** (a trigger blocks it); only admins or the Supabase dashboard can
- Orders can only be created through the `place_order()` database function, which reads prices and stock from the catalog
- Reviews are public (without reviewer emails); authors can delete their own; new reviews are inserted by the server after moderation
- Contact messages are **writable by anyone** but **readable only by admins**
- Admin checks use a `SECURITY DEFINER` helper, `public.is_admin()`, so policies never recurse into `profiles`

### Triggers

- Auto-create a `profile` when a new auth user signs up
- Auto-update `updated_at` timestamps
- Keep `products.rating` / `review_count` in sync when reviews are added, edited, or removed

### Storage Buckets

- `product-images` (public) - product photos
- `avatars` (public) - user profile pictures

---

### Upgrading an existing database

If your database was created from an older version of `schema.sql`, run these once in the SQL editor:

1. `supabase/reviews-migration.sql` (only if your `reviews` table has no `reviewer_name` column)
2. `supabase/admin-policies.sql` - replaces the old policies (fixes admin access, blocks self-promotion to admin, and installs `place_order`)
3. `npm run db:seed` - refreshes product images that were replaced

---

## 🌱 Seeding the Database

After running `supabase/schema.sql`, seed the data:

```bash
npm run db:seed
```

This script upserts **5 categories** and **12 products**. It reads `.env` automatically and requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. It exits with an error if any write fails. Re-run it any time to refresh product data and images.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/products` | List products (`category`, `search`, `featured`, `limit` filters) |
| `GET` | `/api/products/[slug]/reviews` | List reviews + live rating for a product |
| `POST` | `/api/products/[slug]/reviews` | Submit a review (auth required, AI-moderated) |
| `GET` | `/api/orders` | List current user's orders |
| `POST` | `/api/orders` | Place an order (`items: [{ product_id, quantity }]`, shipping address, payment method); totals are calculated server-side |
| `GET` | `/api/addresses` | List current user's addresses |
| `POST` | `/api/addresses` | Add a new address |
| `DELETE` | `/api/addresses?id=` | Delete an address |
| `POST` | `/api/contact` | Submit a contact message |
| `POST` | `/api/auth/forgot-password` | Send a recovery email without revealing account existence |
| `POST` | `/api/assistant` | Galaxy Assistant chat proxy (Google Gemini, server-side key) |

### Admin API Endpoints (all require an `admin` role)

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/admin/session` | Check if the signed-in user is an admin |
| `GET` | `/api/admin/overview` | Dashboard stats, low-stock, recent orders |
| `GET`/`POST` | `/api/admin/products` | List / create products |
| `PUT`/`DELETE` | `/api/admin/products/[id]` | Update / delete a product |
| `GET`/`POST` | `/api/admin/categories` | List / create categories |
| `PUT`/`DELETE` | `/api/admin/categories/[id]` | Update / delete a category |
| `GET` | `/api/admin/orders` | List all orders (guest + registered) |
| `PATCH` | `/api/admin/orders/[id]` | Update order status, payment status, tracking, notes |
| `GET` | `/api/admin/customers` | List all customer profiles |
| `PATCH` | `/api/admin/customers/[id]` | Promote / demote admin role |
| `GET` | `/api/admin/messages` | List contact messages |
| `PATCH`/`DELETE` | `/api/admin/messages/[id]` | Mark read / delete a message |

### SEO

| Route | Description |
| --- | --- |
| `/robots.txt` | Generated by `src/app/robots.ts` (blocks `/account`, `/api`, `/checkout`, `/auth`, `/admin`) |
| `/sitemap.xml` | Generated by `src/app/sitemap.ts` for all public pages |

---

## 🛡 Admin Panel Setup

The admin panel is **RLS-protected** - only users whose `profiles.role` is `admin` can access it.

1. **Install the policies** - run `supabase/schema.sql` in your Supabase SQL editor. For an existing database, run `supabase/admin-policies.sql` (the same policies, safe to run more than once).
2. **Make yourself an admin** - create an account in the app, then open **Supabase Dashboard → Table Editor → `profiles`** and set your profile's `role` column to `admin`.
3. **Sign out and back in**, then visit `/admin` (there is also an **Admin** link in the header).

That's it - you can now add products, manage categories, update orders, promote other admins, and reply to the contact inbox from the panel.

> Guests and regular customers cannot see or modify admin data. Server routes re-check the role on every request.

---

## 🗄 Backup & Restore

See **[backup.md](backup.md)** for how to back up your source code, environment variables, and Supabase database - plus a disaster-recovery checklist.

---

## ☁️ Deployment

### Recommended free stack (no credit card required)

| Layer | Service | Free tier |
| --- | --- | --- |
| Hosting | **Vercel** (Hobby plan) | Free for personal projects, custom domains |
| Database/Auth | **Supabase** (Free plan) | 500 MB database, 50k monthly active users |
| AI Assistant | **Google AI Studio** (Gemini) | Generous free request quota |

### Deploy to Vercel

1. Push this repository to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add your environment variables (from `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-side only - needed for reviews)
   - `GEMINI_API_KEY` (server-side only - never prefix with `NEXT_PUBLIC_`)
   - `NEXT_PUBLIC_SITE_URL` (optional; used by robots.txt / sitemap.xml)
4. Deploy. Each push to `main` redeploys automatically.

> ⚠️ Before going live, run `supabase/schema.sql` (new database) or `supabase/admin-policies.sql` (existing database) in your Supabase SQL editor. It installs the RLS policies and the `place_order` function that checkout depends on.

### Other platforms

Build with `npm run build` and start with `npm run start`, and set your Supabase + Gemini env vars in the hosting environment.

---

## 📋 License

© Electro Galaxy. All rights reserved.
