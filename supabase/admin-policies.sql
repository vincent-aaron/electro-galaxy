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
