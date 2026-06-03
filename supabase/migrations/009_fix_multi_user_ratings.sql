-- 1. Allow list members to see each other's profiles (names in ratings)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

CREATE POLICY "Users can view profiles in their lists"
  ON profiles FOR SELECT
  USING (
    id = auth.uid()
    OR id IN (
      SELECT user_id FROM shared_list_members
      WHERE list_id IN (SELECT get_my_list_ids())
    )
  );

-- 2. Allow list members to update and delete visits
--    (needed so rateVisit can update restaurant_visits.rating aggregate)
CREATE POLICY "List members can update visits"
  ON restaurant_visits FOR UPDATE
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE list_id IN (SELECT get_my_list_ids())
    )
  );

CREATE POLICY "List members can delete visits"
  ON restaurant_visits FOR DELETE
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE list_id IN (SELECT get_my_list_ids())
    )
  );

-- 3. Tighten visit_ratings RLS to use get_my_list_ids() (consistent with all other policies)
DROP POLICY IF EXISTS "List members can manage visit ratings" ON visit_ratings;

CREATE POLICY "List members can manage visit ratings" ON visit_ratings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM restaurant_visits rv
      JOIN restaurants r ON r.id = rv.restaurant_id
      WHERE rv.id = visit_ratings.visit_id
        AND r.list_id IN (SELECT get_my_list_ids())
    )
  );
