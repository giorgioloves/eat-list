ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS price_level TEXT CHECK (price_level IN ('$', '$$', '$$$', '$$$$'));
