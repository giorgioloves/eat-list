-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- SHARED LISTS
-- ============================================================
CREATE TABLE shared_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  invite_code TEXT UNIQUE NOT NULL DEFAULT UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', ''), 1, 8)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- SHARED LIST MEMBERS
-- ============================================================
CREATE TABLE shared_list_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES shared_lists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (list_id, user_id)
);

-- ============================================================
-- INVITATIONS
-- ============================================================
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES shared_lists(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (list_id, invited_email)
);

-- ============================================================
-- RESTAURANTS
-- ============================================================
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES shared_lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cuisine TEXT,
  address TEXT,
  suburb TEXT,
  city TEXT,
  website TEXT,
  phone TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'want_to_try' CHECK (status IN ('want_to_try', 'booked', 'visited', 'favourite', 'never_again')),
  visit_count INTEGER NOT NULL DEFAULT 0,
  first_visit_date DATE,
  last_visit_date DATE,
  would_go_again TEXT CHECK (would_go_again IN ('definitely', 'maybe', 'no')),
  tier TEXT CHECK (tier IN ('S', 'A', 'B', 'C', 'D', 'E', 'F')),
  rating NUMERIC(3,1) CHECK (rating >= 1 AND rating <= 10),
  tags TEXT[] DEFAULT '{}',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- RESTAURANT VISITS
-- ============================================================
CREATE TABLE restaurant_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  visited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  visited_at DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  rating NUMERIC(3,1) CHECK (rating >= 1 AND rating <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_shared_list_members_user_id ON shared_list_members(user_id);
CREATE INDEX idx_shared_list_members_list_id ON shared_list_members(list_id);
CREATE INDEX idx_restaurants_list_id ON restaurants(list_id);
CREATE INDEX idx_restaurants_status ON restaurants(status);
CREATE INDEX idx_restaurants_tier ON restaurants(tier);
CREATE INDEX idx_restaurant_visits_restaurant_id ON restaurant_visits(restaurant_id);
CREATE INDEX idx_invitations_email ON invitations(invited_email);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shared_lists_updated_at
  BEFORE UPDATE ON shared_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Shared Lists
ALTER TABLE shared_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their shared lists"
  ON shared_lists FOR SELECT
  USING (
    id IN (
      SELECT list_id FROM shared_list_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create shared lists"
  ON shared_lists FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Owners can update their shared lists"
  ON shared_lists FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Owners can delete their shared lists"
  ON shared_lists FOR DELETE
  USING (created_by = auth.uid());

-- Shared List Members
ALTER TABLE shared_list_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view list members"
  ON shared_list_members FOR SELECT
  USING (
    list_id IN (
      SELECT list_id FROM shared_list_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can add members"
  ON shared_list_members FOR INSERT
  WITH CHECK (
    list_id IN (
      SELECT id FROM shared_lists WHERE created_by = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Owners can remove members"
  ON shared_list_members FOR DELETE
  USING (
    list_id IN (
      SELECT id FROM shared_lists WHERE created_by = auth.uid()
    )
    OR user_id = auth.uid()
  );

-- Invitations
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view invitations for their lists"
  ON invitations FOR SELECT
  USING (
    list_id IN (
      SELECT list_id FROM shared_list_members WHERE user_id = auth.uid()
    )
    OR invited_email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Members can create invitations"
  ON invitations FOR INSERT
  WITH CHECK (
    list_id IN (
      SELECT list_id FROM shared_list_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Invited user or list owner can update invitation"
  ON invitations FOR UPDATE
  USING (
    invited_email = (SELECT email FROM profiles WHERE id = auth.uid())
    OR list_id IN (SELECT id FROM shared_lists WHERE created_by = auth.uid())
  );

-- Restaurants
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "List members can view restaurants"
  ON restaurants FOR SELECT
  USING (
    list_id IN (
      SELECT list_id FROM shared_list_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "List members can add restaurants"
  ON restaurants FOR INSERT
  WITH CHECK (
    list_id IN (
      SELECT list_id FROM shared_list_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "List members can update restaurants"
  ON restaurants FOR UPDATE
  USING (
    list_id IN (
      SELECT list_id FROM shared_list_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "List members can delete restaurants"
  ON restaurants FOR DELETE
  USING (
    list_id IN (
      SELECT list_id FROM shared_list_members WHERE user_id = auth.uid()
    )
  );

-- Restaurant Visits
ALTER TABLE restaurant_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "List members can view visits"
  ON restaurant_visits FOR SELECT
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants
      WHERE list_id IN (
        SELECT list_id FROM shared_list_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "List members can add visits"
  ON restaurant_visits FOR INSERT
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM restaurants
      WHERE list_id IN (
        SELECT list_id FROM shared_list_members WHERE user_id = auth.uid()
      )
    )
  );
