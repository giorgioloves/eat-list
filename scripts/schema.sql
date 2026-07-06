-- eat-list Neon schema
-- No auth, no RLS, no list/user tables — single personal list.
-- Run this in Neon SQL editor BEFORE importing backup.sql.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── restaurants ────────────────────────────────────────────────
CREATE TABLE restaurants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  cuisine       TEXT,
  address       TEXT,
  suburb        TEXT,
  city          TEXT,
  state         TEXT,
  notes         TEXT,
  status        TEXT NOT NULL DEFAULT 'want_to_try'
                  CHECK (status IN ('want_to_try', 'visited')),
  visit_count   INTEGER NOT NULL DEFAULT 0,
  first_visit_date TEXT,
  last_visit_date  TEXT,
  would_go_again TEXT CHECK (would_go_again IN ('definitely', 'maybe', 'no')),
  tier          TEXT CHECK (tier IN ('S','A','B','C','D','E','F')),
  rating        NUMERIC(3,1) CHECK (rating >= 1 AND rating <= 5),
  price_level   TEXT CHECK (price_level IN ('$','$$','$$$','$$$$')),
  website       TEXT,
  instagram     TEXT,
  tags          TEXT[] NOT NULL DEFAULT '{}',
  latitude      DOUBLE PRECISION,
  longitude     DOUBLE PRECISION,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_restaurants_status  ON restaurants(status);
CREATE INDEX idx_restaurants_tier    ON restaurants(tier);
CREATE INDEX idx_restaurants_created ON restaurants(created_at DESC);

-- ── restaurant_visits ──────────────────────────────────────────
CREATE TABLE restaurant_visits (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  visited_at    TEXT,
  notes         TEXT,
  rating        NUMERIC(3,1) CHECK (rating >= 1 AND rating <= 5),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_visits_restaurant ON restaurant_visits(restaurant_id);

-- ── restaurant_notes ───────────────────────────────────────────
CREATE TABLE restaurant_notes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_restaurant ON restaurant_notes(restaurant_id);

-- ── updated_at trigger ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
