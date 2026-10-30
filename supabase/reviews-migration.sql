-- ============================================================
-- Electro Galaxy — Product Reviews (migration for existing DBs)
-- ============================================================
-- Run this in your Supabase SQL Editor if your database was created
-- BEFORE the "customer reviews" feature. Fresh installs already have
-- these columns via supabase/schema.sql.
--
-- These columns are denormalized (RLS-safe) so the public reviews list
-- can show the reviewer's name without exposing other users' profiles.

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS reviewer_name TEXT,
  ADD COLUMN IF NOT EXISTS reviewer_email TEXT;

-- ============================================================
-- Reviews updates: keep product.rating / product.review_count in sync
-- whenever a review is inserted in the app. (Optional but recommended.)
-- SECURITY DEFINER so the products UPDATE bypasses RLS (runs as table owner);
-- without this, regular users' review inserts would fail because they don't
-- have UPDATE permission on products.
-- ============================================================
CREATE OR REPLACE FUNCTION refresh_product_rating()
RETURNS TRIGGER AS $$
DECLARE
  current_product_id UUID;
  avg_rating NUMERIC;
  review_total INT;
BEGIN
  current_product_id := COALESCE(NEW.product_id, OLD.product_id);

  SELECT AVG(rating)::NUMERIC(3,2), COUNT(*)
  INTO avg_rating, review_total
  FROM reviews
  WHERE product_id = current_product_id;

  UPDATE products
  SET rating = COALESCE(avg_rating, 0),
      review_count = review_total
  WHERE id = current_product_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Same trigger names as schema.sql / admin-policies.sql, so running both
-- files never installs duplicate triggers.
DROP TRIGGER IF EXISTS trg_reviews_rating_insert ON reviews;
DROP TRIGGER IF EXISTS trg_reviews_rating_delete ON reviews;
DROP TRIGGER IF EXISTS reviews_rating_after_insert ON reviews;
DROP TRIGGER IF EXISTS reviews_rating_after_update ON reviews;
DROP TRIGGER IF EXISTS reviews_rating_after_delete ON reviews;
CREATE TRIGGER reviews_rating_after_insert
  AFTER INSERT ON reviews FOR EACH ROW EXECUTE FUNCTION refresh_product_rating();
CREATE TRIGGER reviews_rating_after_update
  AFTER UPDATE OF rating ON reviews FOR EACH ROW EXECUTE FUNCTION refresh_product_rating();
CREATE TRIGGER reviews_rating_after_delete
  AFTER DELETE ON reviews FOR EACH ROW EXECUTE FUNCTION refresh_product_rating();

-- Then run supabase/admin-policies.sql to apply the review access rules
-- (public read without emails, server-side inserts after moderation).
