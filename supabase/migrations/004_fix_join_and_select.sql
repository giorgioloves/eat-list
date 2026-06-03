-- Fix: two issues remain after migrations 001-003
--
-- 1. shared_lists SELECT policy blocked creators from seeing their own list
--    right after INSERT (before they were added as a member), causing
--    INSERT...RETURNING to silently fail or throw.
--
-- 2. Non-members couldn't look up a list by invite code to join it because
--    the SELECT policy required existing membership.

-- ============================================================
-- 1. Allow list creators to see their own list
-- ============================================================
DROP POLICY IF EXISTS "Members can view their shared lists" ON shared_lists;
DROP POLICY IF EXISTS "Members and creators can view shared lists" ON shared_lists;

CREATE POLICY "Members and creators can view shared lists"
  ON shared_lists FOR SELECT
  USING (
    created_by = auth.uid()
    OR id IN (SELECT get_my_list_ids())
  );

-- ============================================================
-- 2. SECURITY DEFINER function for invite-code lookup
--    Bypasses RLS so a non-member can find a list to join.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_list_by_invite_code(code TEXT)
RETURNS TABLE(id UUID, name TEXT)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT id, name
  FROM public.shared_lists
  WHERE invite_code = UPPER(TRIM(code))
  LIMIT 1
$$;
