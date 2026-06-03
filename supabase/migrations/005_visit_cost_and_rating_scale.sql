-- 1. Add cost column to restaurant_visits
ALTER TABLE restaurant_visits ADD COLUMN IF NOT EXISTS cost NUMERIC(8,2);

-- 2. Tighten rating scale to 1–5 on both tables
--    (drop old 1–10 constraints, add 1–5)
ALTER TABLE restaurant_visits DROP CONSTRAINT IF EXISTS restaurant_visits_rating_check;
ALTER TABLE restaurant_visits
  ADD CONSTRAINT restaurant_visits_rating_check CHECK (rating >= 1 AND rating <= 5);

ALTER TABLE restaurants DROP CONSTRAINT IF EXISTS restaurants_rating_check;
ALTER TABLE restaurants
  ADD CONSTRAINT restaurants_rating_check CHECK (rating >= 1 AND rating <= 5);

-- 3. Zero out any existing ratings outside the new range (fresh install safety)
UPDATE restaurant_visits SET rating = NULL WHERE rating > 5;
UPDATE restaurants        SET rating = NULL WHERE rating > 5;
