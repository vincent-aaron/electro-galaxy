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
CREATE POLICY "Categories are viewable by everyone" ON categories FOR
SELECT USING (is_active = TRUE);
CREATE POLICY "Products are viewable by everyone" ON products FOR
SELECT USING (is_active = TRUE);
CREATE POLICY "Product images are viewable by everyone" ON product_images FOR
SELECT USING (TRUE);
-- Contact messages: anyone can insert, only admins can read
CREATE POLICY "Anyone can submit contact messages" ON contact_messages FOR
INSERT WITH CHECK (TRUE);
CREATE POLICY "Contact messages viewable by admins only" ON contact_messages FOR
SELECT USING (
    EXISTS (
      SELECT 1
      FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR
SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR
INSERT WITH CHECK (auth.uid() = id);
-- Addresses
CREATE POLICY "Users manage own addresses" ON addresses FOR ALL USING (auth.uid() = user_id);
-- Cart
CREATE POLICY "Users manage own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);
-- Orders
CREATE POLICY "Users view own orders" ON orders FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own orders" ON orders FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Order items (via order ownership)
CREATE POLICY "Users view own order items" ON order_items FOR
SELECT USING (
    EXISTS (
      SELECT 1
      FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );
-- Reviews
CREATE POLICY "Reviews are public" ON reviews FOR
SELECT USING (TRUE);
CREATE POLICY "Users manage own reviews" ON reviews FOR ALL USING (auth.uid() = user_id);
-- Wishlist
CREATE POLICY "Users manage own wishlist" ON wishlist_items FOR ALL USING (auth.uid() = user_id);
-- ============================================
-- TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO profiles (id, email, full_name)
VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
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
    'https://images.unsplash.com/photo-1556911223-e4b914bebe30?w=600',
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
    WHEN 'lg-microwave-oven-32l' THEN 'https://images.unsplash.com/photo-1585659722983-1b030096d9c1?w=600'
    WHEN 'hp-laserjet-pro-m404dn' THEN 'https://images.unsplash.com/photo-1612815154858-60aa3386f798?w=600'
    WHEN 'dell-ultrasharp-27-monitor' THEN 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600'
    WHEN 'google-nest-hub-max' THEN 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600'
    WHEN 'xiaomi-robot-vacuum-s10' THEN 'https://images.unsplash.com/photo-1558317374-0f875c829c8a?w=600'
    WHEN 'sony-bravia-55-4k-smart-tv' THEN 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600'
    WHEN 'jbl-flip-6-bluetooth-speaker' THEN 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600'
    WHEN 'philips-sonicare-diamondclean' THEN 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600'
    WHEN 'dyson-supersonic-hair-dryer' THEN 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600'
    WHEN 'instant-pot-duo-7in1' THEN 'https://images.unsplash.com/photo-1585515326630-5931f3f0a2a5?w=600'
    WHEN 'amazon-echo-dot-5th-gen' THEN 'https://images.unsplash.com/photo-1543512214-318801244a66?w=600'
  END,
  name,
  0,
  TRUE
FROM products;