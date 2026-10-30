-- Electro Galaxy E-Commerce Database Schema
-- Platform: Supabase (PostgreSQL)
-- Run this in Supabase SQL Editor after creating a project
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- ============================================
-- CATEGORIES
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE
  SET NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- ============================================
-- PRODUCTS
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE
  SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
    compare_at_price DECIMAL(12, 2) CHECK (compare_at_price >= 0),
    sku TEXT UNIQUE,
    stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
    brand TEXT,
    rating DECIMAL(3, 2) DEFAULT 0 CHECK (
      rating >= 0
      AND rating <= 5
    ),
    review_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    specs JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- ============================================
-- PRODUCT IMAGES
-- ============================================
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- ============================================
-- ADDRESSES
-- ============================================
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Home',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'Philippines',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- ============================================
-- CART ITEMS
-- ============================================
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id),
  UNIQUE(session_id, product_id)
);
-- ============================================
-- ORDERS
-- ============================================
CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM (
  'cod',
  'gcash',
  'maya',
  'credit_card',
  'bank_transfer'
);
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE
  SET NULL,
    status order_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    payment_method payment_method DEFAULT 'cod',
    subtotal DECIMAL(12, 2) NOT NULL,
    shipping_fee DECIMAL(12, 2) DEFAULT 0,
    discount DECIMAL(12, 2) DEFAULT 0,
    total DECIMAL(12, 2) NOT NULL,
    shipping_address JSONB NOT NULL,
    notes TEXT,
    tracking_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- ============================================
-- ORDER ITEMS
-- ============================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE
  SET NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- ============================================
-- REVIEWS
-- ============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (
    rating >= 1
    AND rating <= 5
  ),
  title TEXT,
  comment TEXT,
  reviewer_name TEXT,
  reviewer_email TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);
-- ============================================
-- WISHLIST
-- ============================================
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
-- ============================================
-- CONTACT MESSAGES
-- ============================================
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_featured ON products(is_featured)
WHERE is_featured = TRUE;
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_cart_user ON cart_items(user_id);
CREATE INDEX idx_cart_session ON cart_items(session_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_wishlist_user ON wishlist_items(user_id);
CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
-- Public read for catalog
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
-- ============================================
-- POLICIES, ADMIN ACCESS, CHECKOUT & REVIEW RULES
-- ============================================
-- Identical to supabase/admin-policies.sql (keep the two in sync).
-- ============================================================
-- Electro Galaxy — Row Level Security, admin access & checkout
-- ============================================================
-- Idempotent: safe to run on a fresh database (schema.sql already
-- includes this file's contents) and on an EXISTING database to
-- upgrade its policies. Run it in the Supabase SQL Editor.
--
-- What it sets up:
--   * public.is_admin()        — admin check used by every admin policy.
--                                SECURITY DEFINER, so policies on
--                                `profiles` don't recurse into themselves.
--   * Role guard trigger       — customers cannot promote themselves.
--   * public.place_order(...)  — the only way to create orders. Prices,
--                                totals and stock come from the database,
--                                never from the browser. Works for guests.
--   * Reviews                  — public read (without reviewer emails);
--                                inserts happen server-side after moderation.
-- ============================================================

-- ------------------------------------------------------------
-- Helper: is the current user an admin?
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ------------------------------------------------------------
-- Catalog (public read, admin write)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (is_active = TRUE);
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (is_active = TRUE);
DROP POLICY IF EXISTS "Product images are viewable by everyone" ON product_images;
CREATE POLICY "Product images are viewable by everyone" ON product_images
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins manage products" ON products;
CREATE POLICY "Admins manage products" ON products
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins manage categories" ON categories;
CREATE POLICY "Admins manage categories" ON categories
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins manage product images" ON product_images;
CREATE POLICY "Admins manage product images" ON product_images
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------
-- Profiles
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id AND role = 'customer');
DROP POLICY IF EXISTS "Admins view all profiles" ON profiles;
CREATE POLICY "Admins view all profiles" ON profiles
  FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins update all profiles" ON profiles;
CREATE POLICY "Admins update all profiles" ON profiles
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Only admins (or the SQL editor / service role) may change a role.
CREATE OR REPLACE FUNCTION public.guard_profile_role() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND current_user IN ('anon', 'authenticated')
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can change account roles';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS profiles_role_guard ON profiles;
CREATE TRIGGER profiles_role_guard
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_role();

-- ------------------------------------------------------------
-- Addresses, cart, wishlist (owner only)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Users manage own addresses" ON addresses;
CREATE POLICY "Users manage own addresses" ON addresses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins view all addresses" ON addresses;
CREATE POLICY "Admins view all addresses" ON addresses
  FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Users manage own cart" ON cart_items;
CREATE POLICY "Users manage own cart" ON cart_items
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage own wishlist" ON wishlist_items;
CREATE POLICY "Users manage own wishlist" ON wishlist_items
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------
-- Orders: read your own; create ONLY through place_order()
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Users create own orders" ON orders;
DROP POLICY IF EXISTS "Guests can create orders" ON orders;
DROP POLICY IF EXISTS "Users create own order items" ON order_items;
DROP POLICY IF EXISTS "Guests can add items to guest orders" ON order_items;

DROP POLICY IF EXISTS "Users view own orders" ON orders;
CREATE POLICY "Users view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users view own order items" ON order_items;
CREATE POLICY "Users view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "Admins view all orders" ON orders;
CREATE POLICY "Admins view all orders" ON orders
  FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins update all orders" ON orders;
CREATE POLICY "Admins update all orders" ON orders
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins view all order items" ON order_items;
CREATE POLICY "Admins view all order items" ON order_items
  FOR SELECT USING (public.is_admin());

-- Creates an order atomically. p_items: [{"product_id": "<uuid>", "quantity": 2}, ...]
-- Prices, product names/images, shipping and totals are read from the
-- database; stock is decremented in the same transaction. Errors raised with
-- RAISE EXCEPTION (SQLSTATE P0001) are safe to show to the shopper.
CREATE OR REPLACE FUNCTION public.place_order(
  p_items JSONB,
  p_shipping_address JSONB,
  p_payment_method payment_method DEFAULT 'cod',
  p_notes TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_order_id UUID := uuid_generate_v4();
  v_order_number TEXT;
  v_subtotal DECIMAL(12, 2) := 0;
  v_shipping DECIMAL(12, 2);
  v_item JSONB;
  v_qty INT;
  v_product RECORD;
BEGIN
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array'
     OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Your cart is empty.';
  END IF;
  IF jsonb_array_length(p_items) > 50 THEN
    RAISE EXCEPTION 'Too many items in one order.';
  END IF;
  IF p_shipping_address IS NULL OR jsonb_typeof(p_shipping_address) <> 'object' THEN
    RAISE EXCEPTION 'A shipping address is required.';
  END IF;

  v_order_number := 'EG-' || to_char(NOW(), 'YYMMDD') || '-'
    || upper(substr(replace(v_order_id::TEXT, '-', ''), 1, 8));

  INSERT INTO orders (id, order_number, user_id, subtotal, shipping_fee, total,
                      payment_method, shipping_address, notes)
  VALUES (v_order_id, v_order_number, auth.uid(), 0, 0, 0,
          p_payment_method, p_shipping_address, NULLIF(left(p_notes, 1000), ''));

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_qty := (v_item->>'quantity')::INT;
    IF v_qty IS NULL OR v_qty < 1 OR v_qty > 99 THEN
      RAISE EXCEPTION 'Each item quantity must be between 1 and 99.';
    END IF;

    UPDATE products
       SET stock_quantity = stock_quantity - v_qty
     WHERE id = (v_item->>'product_id')::UUID
       AND is_active = TRUE
       AND stock_quantity >= v_qty
    RETURNING id, name, price INTO v_product;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'An item in your cart is no longer available in that quantity.';
    END IF;

    INSERT INTO order_items (order_id, product_id, product_name, product_image,
                             quantity, unit_price, total_price)
    VALUES (
      v_order_id, v_product.id, v_product.name,
      (SELECT url FROM product_images WHERE product_id = v_product.id
        ORDER BY is_primary DESC, sort_order LIMIT 1),
      v_qty, v_product.price, v_product.price * v_qty
    );
    v_subtotal := v_subtotal + v_product.price * v_qty;
  END LOOP;

  v_shipping := CASE WHEN v_subtotal >= 5000 THEN 0 ELSE 199 END;
  UPDATE orders
     SET subtotal = v_subtotal, shipping_fee = v_shipping, total = v_subtotal + v_shipping
   WHERE id = v_order_id;

  RETURN jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number,
    'total', v_subtotal + v_shipping
  );
END;
$$;
REVOKE ALL ON FUNCTION public.place_order(JSONB, JSONB, payment_method, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(JSONB, JSONB, payment_method, TEXT)
  TO anon, authenticated;

-- ------------------------------------------------------------
-- Reviews: public read (no emails); writes go through the server
-- ------------------------------------------------------------
-- The /api/products/[slug]/reviews route moderates the text and then
-- inserts with the service-role key, so users can't skip moderation or
-- set is_verified / reviewer_name themselves via the public API.
DROP POLICY IF EXISTS "Users manage own reviews" ON reviews;
DROP POLICY IF EXISTS "Reviews are public" ON reviews;
CREATE POLICY "Reviews are public" ON reviews
  FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Users delete own reviews" ON reviews;
CREATE POLICY "Users delete own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins manage reviews" ON reviews;
CREATE POLICY "Admins manage reviews" ON reviews
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Hide reviewer_email from the public API.
REVOKE SELECT ON reviews FROM anon, authenticated;
GRANT SELECT (id, product_id, user_id, rating, title, comment, reviewer_name,
              is_verified, created_at)
  ON reviews TO anon, authenticated;

-- Keep products.rating / review_count in sync on insert, update and delete.
CREATE OR REPLACE FUNCTION public.refresh_product_rating() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  current_product_id UUID;
  avg_rating NUMERIC;
  review_total INT;
BEGIN
  current_product_id := COALESCE(NEW.product_id, OLD.product_id);

  SELECT AVG(rating)::NUMERIC(3, 2), COUNT(*)
    INTO avg_rating, review_total
    FROM reviews
   WHERE product_id = current_product_id;

  UPDATE products
     SET rating = COALESCE(avg_rating, 0),
         review_count = review_total
   WHERE id = current_product_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;
-- Older installs used these names (reviews-migration.sql); remove duplicates.
DROP TRIGGER IF EXISTS trg_reviews_rating_insert ON reviews;
DROP TRIGGER IF EXISTS trg_reviews_rating_delete ON reviews;
DROP TRIGGER IF EXISTS reviews_rating_after_insert ON reviews;
DROP TRIGGER IF EXISTS reviews_rating_after_update ON reviews;
DROP TRIGGER IF EXISTS reviews_rating_after_delete ON reviews;
CREATE TRIGGER reviews_rating_after_insert
  AFTER INSERT ON reviews FOR EACH ROW EXECUTE FUNCTION public.refresh_product_rating();
CREATE TRIGGER reviews_rating_after_update
  AFTER UPDATE OF rating ON reviews FOR EACH ROW EXECUTE FUNCTION public.refresh_product_rating();
CREATE TRIGGER reviews_rating_after_delete
  AFTER DELETE ON reviews FOR EACH ROW EXECUTE FUNCTION public.refresh_product_rating();

-- ------------------------------------------------------------
-- Contact messages: anyone can submit, only admins can read/manage
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON contact_messages;
CREATE POLICY "Anyone can submit contact messages" ON contact_messages
  FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Contact messages viewable by admins only" ON contact_messages;
CREATE POLICY "Contact messages viewable by admins only" ON contact_messages
  FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins update messages" ON contact_messages;
CREATE POLICY "Admins update messages" ON contact_messages
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins delete messages" ON contact_messages;
CREATE POLICY "Admins delete messages" ON contact_messages
  FOR DELETE USING (public.is_admin());

-- ------------------------------------------------------------
-- New-user trigger: pin search_path (SECURITY DEFINER best practice)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

-- ============================================================
-- How to make yourself an admin
-- ------------------------------------------------------------
-- 1. Sign up an account in the app (or use an existing one).
-- 2. In Supabase Dashboard -> Table Editor -> profiles, set your
--    profile's "role" column to 'admin' (the dashboard is allowed to
--    change roles; the app's public API is not).
-- 3. Sign out and sign back in, then visit /admin.
-- ============================================================
-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER products_updated_at BEFORE
UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER orders_updated_at BEFORE
UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER cart_items_updated_at BEFORE
UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- ============================================
-- STORAGE BUCKET (optional)
-- ============================================
-- Creates a public bucket for product images and user avatars.
-- Requires the `storage` schema to exist (default in Supabase).
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', TRUE) ON CONFLICT (id) DO NOTHING;
-- ============================================
-- SEED DATA
-- ============================================
INSERT INTO categories (name, slug, description, image_url, sort_order)
VALUES (
    'Kitchen Appliances',
    'kitchen-appliances',
    'Refrigerators, ovens, microwaves and more',
    'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600',
    1
  ),
  (
    'Office Appliances',
    'office-appliances',
    'Printers, monitors, and office equipment',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600',
    2
  ),
  (
    'Smart Appliances',
    'smart-appliances',
    'Smart home devices and IoT gadgets',
    'https://images.unsplash.com/photo-1558002038-1055907df827?w=600',
    3
  ),
  (
    'Entertainment',
    'entertainment',
    'TVs, speakers, and gaming consoles',
    'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600',
    4
  ),
  (
    'Personal Care',
    'personal-care',
    'Grooming and wellness devices',
    'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600',
    5
  );
INSERT INTO products (
    category_id,
    name,
    slug,
    description,
    short_description,
    price,
    compare_at_price,
    sku,
    stock_quantity,
    brand,
    rating,
    review_count,
    is_featured,
    specs
  )
VALUES (
    (
      SELECT id
      FROM categories
      WHERE slug = 'kitchen-appliances'
    ),
    'Samsung Smart Refrigerator 500L',
    'samsung-smart-refrigerator-500l',
    'Energy-efficient smart refrigerator with Wi-Fi connectivity, touch display, and flexible storage zones. Perfect for modern kitchens.',
    'Smart fridge with Wi-Fi & touch display',
    45999.00,
    52999.00,
    'EG-KIT-001',
    25,
    'Samsung',
    4.7,
    128,
    TRUE,
    '{"capacity": "500L", "energy_rating": "A++", "warranty": "2 years"}'
  ),
  (
    (
      SELECT id
      FROM categories
      WHERE slug = 'kitchen-appliances'
    ),
    'LG Microwave Oven 32L',
    'lg-microwave-oven-32l',
    'Compact yet powerful microwave with smart inverter technology and easy-clean interior.',
    'Smart inverter microwave oven',
    8999.00,
    10999.00,
    'EG-KIT-002',
    40,
    'LG',
    4.5,
    89,
    TRUE,
    '{"capacity": "32L", "power": "1000W", "warranty": "1 year"}'
  ),
  (
    (
      SELECT id
      FROM categories
      WHERE slug = 'office-appliances'
    ),
    'HP LaserJet Pro M404dn',
    'hp-laserjet-pro-m404dn',
    'Fast, reliable laser printer for small offices. Automatic duplex printing and network connectivity.',
    'Fast duplex laser printer',
    12499.00,
    14999.00,
    'EG-OFF-001',
    30,
    'HP',
    4.6,
    56,
    TRUE,
    '{"speed": "38 ppm", "connectivity": "Ethernet, USB", "warranty": "1 year"}'
  ),
  (
    (
      SELECT id
      FROM categories
      WHERE slug = 'office-appliances'
    ),
    'Dell UltraSharp 27" Monitor',
    'dell-ultrasharp-27-monitor',
    'QHD IPS monitor with 99% sRGB color accuracy. Ideal for designers and professionals.',
    '27" QHD IPS monitor',
    18999.00,
    21999.00,
    'EG-OFF-002',
    20,
    'Dell',
    4.8,
    203,
    TRUE,
    '{"resolution": "2560x1440", "panel": "IPS", "warranty": "3 years"}'
  ),
  (
    (
      SELECT id
      FROM categories
      WHERE slug = 'smart-appliances'
    ),
    'Google Nest Hub Max',
    'google-nest-hub-max',
    'Smart display with Google Assistant, video calling, and home control hub.',
    'Smart display with Assistant',
    12999.00,
    15999.00,
    'EG-SMT-001',
    35,
    'Google',
    4.4,
    167,
    TRUE,
    '{"display": "10\" HD", "camera": "6.5MP", "warranty": "1 year"}'
  ),
  (
    (
      SELECT id
      FROM categories
      WHERE slug = 'smart-appliances'
    ),
    'Xiaomi Robot Vacuum S10',
    'xiaomi-robot-vacuum-s10',
    'Intelligent robot vacuum with LiDAR navigation, mopping, and app control.',
    'LiDAR robot vacuum & mop',
    15999.00,
    18999.00,
    'EG-SMT-002',
    15,
    'Xiaomi',
    4.6,
    94,
    TRUE,
    '{"battery": "5200mAh", "suction": "4000Pa", "warranty": "1 year"}'
  ),
  (
    (
      SELECT id
      FROM categories
      WHERE slug = 'entertainment'
    ),
    'Sony Bravia 55" 4K Smart TV',
    'sony-bravia-55-4k-smart-tv',
    'Stunning 4K HDR display with Google TV built-in. Dolby Vision and Atmos support.',
    '55" 4K HDR Google TV',
    34999.00,
    42999.00,
    'EG-ENT-001',
    18,
    'Sony',
    4.7,
    312,
    TRUE,
    '{"size": "55\"", "resolution": "4K", "warranty": "2 years"}'
  ),
  (
    (
      SELECT id
      FROM categories
      WHERE slug = 'entertainment'
    ),
    'JBL Flip 6 Bluetooth Speaker',
    'jbl-flip-6-bluetooth-speaker',
    'Portable waterproof speaker with powerful bass and 12-hour battery life.',
    'Waterproof portable speaker',
    5999.00,
    7499.00,
    'EG-ENT-002',
    50,
    'JBL',
    4.5,
    445,
    FALSE,
    '{"battery": "12 hours", "waterproof": "IP67", "warranty": "1 year"}'
  ),
  (
    (
      SELECT id
      FROM categories
      WHERE slug = 'personal-care'
    ),
    'Philips Sonicare DiamondClean',
    'philips-sonicare-diamondclean',
    'Premium electric toothbrush with 5 brushing modes and UV sanitizer.',
    'Premium sonic toothbrush',
    7999.00,
    9999.00,
    'EG-PER-001',
    45,
    'Philips',
    4.6,
    178,
    FALSE,
    '{"modes": "5", "battery": "3 weeks", "warranty": "2 years"}'
  ),
  (
    (
      SELECT id
      FROM categories
      WHERE slug = 'personal-care'
    ),
    'Dyson Supersonic Hair Dryer',
    'dyson-supersonic-hair-dryer',
    'Intelligent heat control prevents extreme heat damage. Fast drying with balanced airflow.',
    'Intelligent heat control dryer',
    24999.00,
    28999.00,
    'EG-PER-002',
    12,
    'Dyson',
    4.8,
    267,
    TRUE,
    '{"speed_settings": "4", "heat_settings": "3", "warranty": "2 years"}'
  ),
  (
    (
      SELECT id
      FROM categories
      WHERE slug = 'kitchen-appliances'
    ),
    'Instant Pot Duo 7-in-1',
    'instant-pot-duo-7in1',
    'Multi-use programmable pressure cooker, slow cooker, rice cooker, and more.',
    '7-in-1 pressure cooker',
    6499.00,
    7999.00,
    'EG-KIT-003',
    60,
    'Instant Pot',
    4.7,
    892,
    TRUE,
    '{"capacity": "6Qt", "functions": "7", "warranty": "1 year"}'
  ),
  (
    (
      SELECT id
      FROM categories
      WHERE slug = 'smart-appliances'
    ),
    'Amazon Echo Dot 5th Gen',
    'amazon-echo-dot-5th-gen',
    'Compact smart speaker with Alexa. Improved audio and temperature sensor.',
    'Smart speaker with Alexa',
    3499.00,
    4499.00,
    'EG-SMT-003',
    80,
    'Amazon',
    4.3,
    1205,
    FALSE,
    '{"speaker": "1.73\"", "sensor": "Temperature", "warranty": "1 year"}'
  );
-- Product images
INSERT INTO product_images (
    product_id,
    url,
    alt_text,
    sort_order,
    is_primary
  )
SELECT id,
  CASE
    slug
    WHEN 'samsung-smart-refrigerator-500l' THEN 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600'
    WHEN 'lg-microwave-oven-32l' THEN 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600'
    WHEN 'hp-laserjet-pro-m404dn' THEN 'https://images.unsplash.com/photo-1650094980833-7373de26feb6?w=600'
    WHEN 'dell-ultrasharp-27-monitor' THEN 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600'
    WHEN 'google-nest-hub-max' THEN 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600'
    WHEN 'xiaomi-robot-vacuum-s10' THEN 'https://images.unsplash.com/photo-1603618090561-412154b4bd1b?w=600'
    WHEN 'sony-bravia-55-4k-smart-tv' THEN 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600'
    WHEN 'jbl-flip-6-bluetooth-speaker' THEN 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600'
    WHEN 'philips-sonicare-diamondclean' THEN 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600'
    WHEN 'dyson-supersonic-hair-dryer' THEN 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600'
    WHEN 'instant-pot-duo-7in1' THEN 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600'
    WHEN 'amazon-echo-dot-5th-gen' THEN 'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=600'
  END,
  name,
  0,
  TRUE
FROM products;