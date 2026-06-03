-- Fix: ensure all INSERT policies exist and profiles are populated.
-- Safe to run multiple times.

-- ============================================================
-- 1. ENSURE INSERT POLICY EXISTS ON shared_lists
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can create shared lists" ON shared_lists;

CREATE POLICY "Authenticated users can create shared lists"
  ON shared_lists FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- ============================================================
-- 2. BACKFILL PROFILES for any users who signed up before the
--    trigger was created (trigger only runs for NEW signups)
-- ============================================================
INSERT INTO public.profiles (id, email, name, avatar_url)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
  u.raw_user_meta_data->>'avatar_url'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

-- ============================================================
-- 3. VERIFY — you should see rows for all your policies
-- ============================================================
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
