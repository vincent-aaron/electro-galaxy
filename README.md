# ⚡ Electro Galaxy

**Electro Galaxy** is a modern, full-featured e-commerce platform for premium electronics and smart appliances, built for the Philippine market. It combines a sleek "galaxy" themed UI with a production-ready Supabase backend and a seamless mock-data fallback for development.

> This README is maintained continuously as the project evolves. Update it whenever features, architecture, or workflows change.

---

## ✨ Features

### Storefront

- **Product catalog** with categories, featured items, and flash deals
- **Product detail pages** with image galleries, specs, ratings, and related products
- **Search & filtering** — search by keyword, filter by category, sort by price/rating/name
- **Responsive design** — mobile-first layout with mobile menu and filter drawer

### Shopping

- **Persistent cart** stored in `localStorage` via Zustand
- **Free shipping** on orders over ₱5,000 with automatic calculation
- **Checkout flow** with shipping form and payment methods (COD, GCash, Maya, Credit/Debit Card)
- **Order placement** via API with order number generation

### Account

- **Authentication** — login/register via Supabase (with mock fallback)
- **Password recovery** — a privacy-safe recovery email endpoint with recovery and new-password screens
- **Order history** — view previous orders with status, items, and totals
- **Wishlist** — save products with a persistent Zustand store
- **Address book** — add, view, and delete saved shipping addresses

### Content & Support

- **About**, **Services**, **Contact** pages
- **Privacy Policy** & **Returns/Refunds** pages
- **Custom 404 page**
- **Contact form** that stores messages in the database

### AI Assistant

- **Galaxy Assistant** — floating AI chat widget (bottom-right) that helps users find products, understand discounts, payment methods, shipping, returns, and order tracking
- Powered by **Google Gemini** (free tier) with a store-specific system prompt
- Quick-reply chips and instant answers without leaving the page

### Dashboard

- **Animated account dashboard** with a Stripe-style aurora gradient background and floating particles

---

## 🛠 Tech Stack

| Layer         | Technology                               |
| ------------- | ---------------------------------------- |
| **Framework** | Next.js 15 (App Router)                  |
| **UI**        | React 19, TypeScript                     |
| **Styling**   | Tailwind CSS 3.4 (custom "galaxy" theme) |
| **State**     | Zustand (cart & wishlist persistence)    |
| **Backend**   | Supabase (PostgreSQL)                    |
| **Icons**     | lucide-react                             |
| **Fonts**     | Poppins (via next/font)                  |

---

## 📁 Repository Structure

```
src/
├── app/
│   ├── page.tsx                 # Homepage
│   ├── layout.tsx               # Root layout (Header + Footer)
│   ├── about/                   # About page
│   ├── account/                 # User dashboard
│   │   ├── orders/              # Order history
│   │   ├── wishlist/            # Saved products
│   │   └── addresses/           # Address book
│   ├── api/
│   │   ├── addresses/           # Address CRUD
│   │   ├── contact/             # Contact form submission
│   │   ├── orders/              # Order create + list
│   │   └── products/            # Product listing
│   ├── auth/                    # Login, register & password recovery screens
│   ├── cart/                    # Shopping cart
│   ├── checkout/                # Checkout flow
│   ├── policies/                # Privacy & returns
│   ├── products/                # Catalog + detail
│   ├── services/                # Services page
│   ├── contact/                 # Contact page
│   └── not-found.tsx            # Custom 404
├── components/
│   ├── layout/                  # Header, Footer
│   ├── products/                # ProductCard, CategoryCard
│   ├── ai/                      # Galaxy Assistant (AI chat widget)
│   └── ui/                      # Breadcrumbs, Toast
├── lib/
│   ├── data/                    # Product loaders + mock data
│   ├── supabase/                # Supabase clients
│   └── utils.ts                 # Helpers (formatting, pricing)
├── store/
│   ├── cart-store.ts            # Persistent cart
│   └── wishlist-store.ts        # Persistent wishlist
└── types/
    └── database.ts              # Shared TypeScript types

supabase/
└── schema.sql                   # Complete database schema

scripts/
└── seed.ts                      # Database seed script

legacy/                          # Original static HTML version
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- (Optional) A Supabase project for production data

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your Supabase values:

```bash
cp .env.example .env
```

| Variable                        | Required | Description                      |
| ------------------------------- | -------- | -------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | No\*     | Your Supabase project URL        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No\*     | Supabase anon/public key         |
| `SUPABASE_SERVICE_ROLE_KEY`     | No       | Service role key (for seeding)   |
| `GEMINI_API_KEY`                | No       | Server-only Google Gemini key (AI assistant) |

> \*If these are not set, the app automatically falls back to **mock data** so you can run it without a backend.
> The AI assistant requires `GEMINI_API_KEY` (get one free at https://aistudio.google.com/apikey). It is used only by the server-side `/api/assistant` route and is never sent to browsers. If it is not set, the assistant shows a connection note.

For password recovery, add `http://localhost:3000/auth/reset-password` and the matching production URL to the **Redirect URLs** list in Supabase Auth settings. Supabase sends the recovery email; the app never stores or sends passwords itself.

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📜 Available Scripts

| Script            | Description                                      |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Start dev server with hot reload                 |
| `npm run build`   | Create a production build                        |
| `npm run start`   | Start the production server                      |
| `npm run lint`    | Run ESLint                                       |
| `npm run db:seed` | Seed Supabase with categories, products & images |

---

## 🗄 Database (Supabase)

The project uses **Supabase**, a PostgreSQL-based backend-as-a-service. The full schema lives in [`supabase/schema.sql`](supabase/schema.sql).

### Tables

| Table              | Purpose                                        |
| ------------------ | ---------------------------------------------- |
| `profiles`         | Extends `auth.users` with user details & roles |
| `categories`       | Product categories (with parent support)       |
| `products`         | Product catalog with specs, pricing & stock    |
| `product_images`   | Product image gallery                          |
| `addresses`        | Saved shipping addresses                       |
| `cart_items`       | Server-side cart (user or session based)       |
| `orders`           | Order headers with status & payment info       |
| `order_items`      | Line items for each order                      |
| `reviews`          | Product reviews & ratings                      |
| `wishlist_items`   | Saved products per user                        |
| `contact_messages` | Contact form submissions                       |

### Security (RLS)

Row Level Security is enabled on all tables. Policies ensure:

- Catalog tables are **publicly readable** (only active items)
- Users can only **access their own** profiles, addresses, carts, orders, wishlist
- Reviews are public but only editable by the author
- Contact messages are **writable by anyone** but **readable only by admins**

### Triggers

- Auto-create a `profile` when a new auth user signs up
- Auto-update `updated_at` timestamps

### Storage Buckets

- `product-images` (public) — product photos
- `avatars` (public) — user profile pictures

---

## 🌱 Seeding the Database

After running `supabase/schema.sql` in your Supabase SQL editor, seed the data:

```bash
npm run db:seed
```

This script upserts **5 categories** and **12 products** with images. It requires `NEXT_PUBLIC_SUPABASE_URL` and either `SUPABASE_SERVICE_ROLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

## 🔌 API Endpoints

| Method   | Endpoint             | Description                                                        |
| -------- | -------------------- | ------------------------------------------------------------------ |
| `GET`    | `/api/products`      | List products (filters: `category`, `search`, `featured`, `limit`) |
| `GET`    | `/api/orders`        | List current user's orders                                         |
| `POST`   | `/api/orders`        | Create a new order                                                 |
| `GET`    | `/api/addresses`     | List current user's addresses                                      |
| `POST`   | `/api/addresses`     | Add a new address                                                  |
| `DELETE` | `/api/addresses?id=` | Delete an address                                                  |
| `POST`   | `/api/contact`       | Submit a contact message                                           |
| `POST`   | `/api/auth/forgot-password` | Send a Supabase password recovery email without revealing account existence |

---

## 🧠 Mock Data Fallback

When Supabase environment variables are **not configured**, the app gracefully falls back to the static data in `src/lib/data/mock-data.ts`. This lets you develop and demo the storefront without a backend.

The fallback is triggered automatically in:

- `src/lib/supabase/client.ts` (returns `null`)
- `src/lib/supabase/server.ts` (returns `null`)
- `src/lib/data/products.ts` (uses mock data when client is `null`)

---

## ☁️ Deployment

### Vercel

1. Push the repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add your environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`).
4. Deploy.

### Other platforms

Build with `npm run build` and start with `npm run start`. Ensure your Supabase + Gemini env vars are set in the hosting environment.

---

## 🛟 Backup & Restore

See **[backup.md](backup.md)** for a complete guide on backing up your source code and Supabase database.

---

## 📝 Notes for Future Updates

- Keep this README in sync with major feature changes.
- Add migration notes when the Supabase schema or fallback behavior changes.
- Track new pages, API routes, and state stores in the structure section above.

---

## ✅ Current TODOs

- Improve order API error handling and response validation.
- Add auth gating that redirects unauthenticated users on account pages.
- Add tests and expanded linting guidance.
- Add a product review submission UI.
- Integrate a real payment gateway (GCash, Maya) for production.

---

## 📄 License

© Electro Galaxy. All rights reserved.
