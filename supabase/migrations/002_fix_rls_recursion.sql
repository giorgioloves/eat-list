-- Fix infinite recursion in shared_list_members RLS policies.
--
-- Root cause: the SELECT policy on shared_list_members queries shared_list_members
-- itself, which triggers the policy again → infinite loop.
--
-- Fix: a SECURITY DEFINER function runs without RLS, so querying
-- shared_list_members from inside it never triggers the policy.

-- ============================================================
-- HELPER FUNCTION (runs without RLS — breaks the recursion)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_my_list_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT list_id FROM public.shared_list_members WHERE user_id = auth.uid()
$$;

-- ============================================================
-- SHARED_LIST_MEMBERS — drop & recreate (self-referencing policy)
-- ============================================================
DROP POLICY IF EXISTS "Members can view list members" ON shared_list_members;
DROP POLICY IF EXISTS "Owners can add members" ON shared_list_members;
DROP POLICY IF EXISTS "Owners can remove members" ON shared_list_members;

CREATE POLICY "Members can view list members"
  ON shared_list_members FOR SELECT
  USING (list_id IN (SELECT get_my_list_ids()));

CREATE POLICY "Users can join or be added to lists"
  ON shared_list_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR list_id IN (SELECT id FROM shared_lists WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can leave or be removed from lists"
  ON shared_list_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR list_id IN (SELECT id FROM shared_lists WHERE created_by = auth.uid())
  );

-- ============================================================
-- SHARED_LISTS — uses get_my_list_ids() for consistency
-- ============================================================
DROP POLICY IF EXISTS "Members can view their shared lists" ON shared_lists;

CREATE POLICY "Members can view their shared lists"
  ON shared_lists FOR SELECT
  USING (id IN (SELECT get_my_list_ids()));

-- ============================================================
-- RESTAURANTS — use helper function
-- ============================================================
DROP POLICY IF EXISTS "List members can view restaurants" ON restaurants;
DROP POLICY IF EXISTS "List members can add restaurants" ON restaurants;
DROP POLICY IF EXISTS "List members can update restaurants" ON restaurants;
DROP POLICY IF EXISTS "List members can delete restaurants" ON restaurants;

CREATE POLICY "List members can view restaurants"
  ON restaurants FOR SELECT
  USING (list_id IN (SELECT get_my_list_ids()));

CREATE POLICY "List members can add restaurants"
  ON restaurants FOR INSERT
  WITH CHECK (list_id IN (SELECT get_my_list_ids()));

CREATE POLICY "List members can update restaurants"
  ON restaurants FOR UPDATE
  USING (list_id IN (SELECT get_my_list_ids()));

CREATE POLICY "List members can delete restaurants"
  ON restaurants FOR DELETE
  USING (list_id IN (SELECT get_my_list_ids()));

-- ============================================================
-- RESTAURANT VISITS — use helper function
-- ============================================================
DROP POLICY IF EXISTS "List members can view visits" ON restaurant_visits;
DROP POLICY IF EXISTS "List members can add visits" ON restaurant_visits;

CREATE POLICY "List members can view visits"
  ON restaurant_visits FOR SELECT
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants
      WHERE list_id IN (SELECT get_my_list_ids())
    )
  );

CREATE POLICY "List members can add visits"
  ON restaurant_visits FOR INSERT
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM restaurants
      WHERE list_id IN (SELECT get_my_list_ids())
    )
  );

-- ============================================================
-- INVITATIONS — use helper function
-- ============================================================
DROP POLICY IF EXISTS "Members can view invitations for their lists" ON invitations;
DROP POLICY IF EXISTS "Members can create invitations" ON invitations;

CREATE POLICY "Members can view invitations for their lists"
  ON invitations FOR SELECT
  USING (
    list_id IN (SELECT get_my_list_ids())
    OR invited_email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Members can create invitations"
  ON invitations FOR INSERT
  WITH CHECK (list_id IN (SELECT get_my_list_ids()));
