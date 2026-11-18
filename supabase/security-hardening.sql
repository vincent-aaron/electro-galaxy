-- ============================================================
-- Electro Galaxy: security hardening
-- ============================================================
-- Paste this whole file into Supabase Dashboard -> SQL Editor -> Run.
--
-- Safe to run more than once. It changes permissions, policies and functions
-- only. It never deletes or rewrites products, orders, users or messages. The
-- only rows it can remove are expired counters in its own api_rate_limits table.
-- Everything runs in one transaction: if any step fails, nothing is applied.
-- ============================================================
BEGIN;

-- ------------------------------------------------------------
-- 1. Admin check used by the policies below
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ------------------------------------------------------------
-- 2. Row level security on, and old policies replaced
-- ------------------------------------------------------------
-- Older, looser policies may exist under other names, so every policy on these
-- tables is removed and the exact set below is created in the same transaction.
DO $$
DECLARE
  t TEXT;
  p RECORD;
BEGIN
  FOREACH t IN ARRAY ARRAY['profiles', 'categories', 'products', 'product_images', 'addresses',
                           'cart_items', 'orders', 'order_items', 'reviews', 'wishlist_items',
                           'contact_messages']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, t);
    END LOOP;
  END LOOP;
END;
$$;

-- Catalog: public read, admin write
CREATE POLICY "Categories are viewable by everyone" ON public.categories
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Products are viewable by everyone" ON public.products
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Product images are viewable by everyone" ON public.product_images
  FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage categories" ON public.categories
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins manage products" ON public.products
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins manage product images" ON public.product_images
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Profiles: your own row only; admins can see all
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_admin());

-- Addresses, cart and wishlist: owner only
CREATE POLICY "Users manage own addresses" ON public.addresses
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all addresses" ON public.addresses
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Users manage own cart" ON public.cart_items
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own wishlist" ON public.wishlist_items
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Orders: read your own; only the server can create them
CREATE POLICY "Users view own orders" ON public.orders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all orders" ON public.orders
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins update all orders" ON public.orders
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Users view own order items" ON public.order_items
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid())
  );
CREATE POLICY "Admins view all order items" ON public.order_items
  FOR SELECT TO authenticated USING (public.is_admin());

-- Reviews: public read (without emails); created by the server after moderation
CREATE POLICY "Reviews are public" ON public.reviews
  FOR SELECT USING (TRUE);
CREATE POLICY "Users delete own reviews" ON public.reviews
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins delete reviews" ON public.reviews
  FOR DELETE TO authenticated USING (public.is_admin());

-- Contact messages: admins only. New messages arrive through /api/contact.
CREATE POLICY "Admins read messages" ON public.contact_messages
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins update messages" ON public.contact_messages
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete messages" ON public.contact_messages
  FOR DELETE TO authenticated USING (public.is_admin());

-- ------------------------------------------------------------
-- 3. Table and column permissions
-- ------------------------------------------------------------
-- Anonymous visitors can read the catalog and public review columns, nothing else.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON
  public.profiles, public.categories, public.products, public.product_images, public.addresses,
  public.cart_items, public.orders, public.order_items, public.reviews, public.wishlist_items,
  public.contact_messages
  FROM anon;
REVOKE SELECT ON public.profiles, public.addresses, public.cart_items, public.orders,
  public.order_items, public.wishlist_items, public.contact_messages FROM anon;

-- Signed-in users can only edit harmless profile fields. Roles and emails are
-- changed by the server (service role) after an admin check.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, phone, avatar_url) ON public.profiles TO authenticated;

-- Orders are written by the server. Admins may still update status and tracking.
REVOKE INSERT, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.orders FROM authenticated;
REVOKE UPDATE ON public.orders FROM authenticated;
GRANT UPDATE (status, payment_status, tracking_number, notes) ON public.orders TO authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.order_items FROM authenticated;

-- Reviewer emails are never public.
REVOKE SELECT, INSERT, UPDATE, TRUNCATE, REFERENCES, TRIGGER ON public.reviews FROM anon, authenticated;
GRANT SELECT (id, product_id, user_id, rating, title, comment, reviewer_name, is_verified, created_at)
  ON public.reviews TO anon, authenticated;

-- Contact messages can only be created by the server.
REVOKE INSERT, TRUNCATE, REFERENCES, TRIGGER ON public.contact_messages FROM authenticated;

-- Length limits for anything that reaches the table by another route.
-- NOT VALID leaves existing rows untouched.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contact_messages_length_limits') THEN
    ALTER TABLE public.contact_messages ADD CONSTRAINT contact_messages_length_limits CHECK (
      char_length(name) <= 100 AND char_length(email) <= 200
      AND char_length(COALESCE(subject, '')) <= 200 AND char_length(message) <= 5000
    ) NOT VALID;
  END IF;
END;
$$;

-- ------------------------------------------------------------
-- 4. Protected profile columns (second layer behind the grants above)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_profile_role() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  IF current_user IN ('anon', 'authenticated') AND (
       NEW.id IS DISTINCT FROM OLD.id
       OR NEW.role IS DISTINCT FROM OLD.role
       OR NEW.email IS DISTINCT FROM OLD.email
       OR NEW.created_at IS DISTINCT FROM OLD.created_at
     ) THEN
    RAISE EXCEPTION 'These account details cannot be changed here.' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS profiles_role_guard ON public.profiles;
CREATE TRIGGER profiles_role_guard
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_role();

-- ------------------------------------------------------------
-- 5. New accounts always start as customers
-- ------------------------------------------------------------
-- The pinned search_path matters: the auth service does not have "public" on its
-- path, and without it creating an account fails with a database error.
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.email, ''), left(NEW.raw_user_meta_data->>'full_name', 100), 'customer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------
-- 6. Checkout: prices, totals and stock come from the database
-- ------------------------------------------------------------
-- Called only by /api/orders with the service role, after the server has
-- identified the signed-in user. p_user_id is NULL for guest checkout.
CREATE OR REPLACE FUNCTION public.place_order_for_user(
  p_user_id UUID,
  p_items JSONB,
  p_shipping_address JSONB,
  p_payment_method public.payment_method DEFAULT 'cod',
  p_notes TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_order_id UUID := gen_random_uuid();
  v_order_number TEXT;
  v_subtotal NUMERIC(12, 2) := 0;
  v_shipping NUMERIC(12, 2);
  v_item JSONB;
  v_qty INT;
  v_product RECORD;
BEGIN
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
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

  INSERT INTO public.orders (id, order_number, user_id, subtotal, shipping_fee, total,
                             payment_method, shipping_address, notes)
  VALUES (v_order_id, v_order_number, p_user_id, 0, 0, 0,
          p_payment_method, p_shipping_address, NULLIF(left(p_notes, 1000), ''));

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_qty := (v_item->>'quantity')::INT;
    IF v_qty IS NULL OR v_qty < 1 OR v_qty > 99 THEN
      RAISE EXCEPTION 'Each item quantity must be between 1 and 99.';
    END IF;

    UPDATE public.products
       SET stock_quantity = stock_quantity - v_qty
     WHERE id = (v_item->>'product_id')::UUID
       AND is_active = TRUE
       AND stock_quantity >= v_qty
    RETURNING id, name, price INTO v_product;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'An item in your cart is no longer available in that quantity.';
    END IF;

    INSERT INTO public.order_items (order_id, product_id, product_name, product_image,
                                    quantity, unit_price, total_price)
    VALUES (
      v_order_id, v_product.id, v_product.name,
      (SELECT url FROM public.product_images WHERE product_id = v_product.id
        ORDER BY is_primary DESC, sort_order LIMIT 1),
      v_qty, v_product.price, v_product.price * v_qty
    );
    v_subtotal := v_subtotal + v_product.price * v_qty;
  END LOOP;

  v_shipping := CASE WHEN v_subtotal >= 5000 THEN 0 ELSE 199 END;
  UPDATE public.orders
     SET subtotal = v_subtotal, shipping_fee = v_shipping, total = v_subtotal + v_shipping
   WHERE id = v_order_id;

  RETURN jsonb_build_object('id', v_order_id, 'order_number', v_order_number,
                            'total', v_subtotal + v_shipping);
END;
$$;

-- ------------------------------------------------------------
-- 7. Rate limits shared by every server instance
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  key TEXT PRIMARY KEY,
  count INT NOT NULL DEFAULT 0,
  reset_at TIMESTAMPTZ NOT NULL
);
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.api_rate_limits FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_rate_limits TO service_role;

-- Returns TRUE while the caller is within the limit. Keys are hashed by the server.
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key TEXT,
  p_limit INT,
  p_window_seconds INT
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_count INT;
BEGIN
  INSERT INTO public.api_rate_limits AS r (key, count, reset_at)
  VALUES (p_key, 1, NOW() + make_interval(secs => p_window_seconds))
  ON CONFLICT (key) DO UPDATE
    SET count = CASE WHEN r.reset_at <= NOW() THEN 1 ELSE r.count + 1 END,
        reset_at = CASE WHEN r.reset_at <= NOW()
                        THEN NOW() + make_interval(secs => p_window_seconds)
                        ELSE r.reset_at END
  RETURNING count INTO v_count;

  -- Occasionally clear expired counters so the table stays small.
  IF random() < 0.01 THEN
    DELETE FROM public.api_rate_limits WHERE reset_at < NOW() - INTERVAL '1 day';
  END IF;

  RETURN v_count <= p_limit;
END;
$$;

-- ------------------------------------------------------------
-- 8. Function permissions
-- ------------------------------------------------------------
-- Pins search_path on every SECURITY DEFINER function, then closes direct RPC
-- access to everything except is_admin(), which the policies above must call.
-- Functions that belong to extensions are left alone.
DO $$
DECLARE
  f RECORD;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS sig, p.prosecdef, p.proconfig
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.prokind = 'f'
       AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e')
  LOOP
    IF f.prosecdef AND NOT EXISTS (
         SELECT 1 FROM unnest(COALESCE(f.proconfig, ARRAY[]::TEXT[])) c WHERE c LIKE 'search_path=%'
       ) THEN
      EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', f.sig);
    END IF;
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', f.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f.sig);
  END LOOP;
END;
$$;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- ------------------------------------------------------------
-- 9. Storage: files stay viewable by URL, but nobody can list or write them
-- ------------------------------------------------------------
-- Public buckets serve files by direct URL without any SELECT policy. Removing
-- the policies stops listing and uploads. Admin uploads are not used by the app.
DO $$
DECLARE
  p RECORD;
BEGIN
  FOR p IN
    SELECT policyname FROM pg_policies
     WHERE schemaname = 'storage' AND tablename = 'objects'
       AND (COALESCE(qual, '') || COALESCE(with_check, '')) ~ '(product-images|avatars)'
  LOOP
    EXECUTE format('DROP POLICY %I ON storage.objects', p.policyname);
  END LOOP;

  UPDATE storage.buckets
     SET file_size_limit = 5242880,
         allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
   WHERE id IN ('product-images', 'avatars');
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'Storage policies could not be changed from this role. Review them in Dashboard -> Storage -> Policies.';
END;
$$;

COMMIT;

-- Ask the API to pick up the new functions straight away.
NOTIFY pgrst, 'reload schema';
