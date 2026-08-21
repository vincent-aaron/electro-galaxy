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
---

## 📄 License

© Electro Galaxy. All rights reserved.
