-- ============================================================
-- PAR-KIDS — Verification queries for memberships safe cutover
-- ============================================================

-- 1) Backfill integrity
SELECT
  (SELECT COUNT(*) FROM public.memberships) AS memberships_count,
  (SELECT COUNT(*) FROM public.household_members WHERE household_id IS NOT NULL) AS household_members_count;

-- Members present in household_members but missing in memberships
SELECT hm.user_id, hm.household_id
FROM public.household_members hm
LEFT JOIN public.memberships m
  ON m.user_id = hm.user_id
 AND m.household_id = hm.household_id
WHERE hm.household_id IS NOT NULL
  AND m.id IS NULL
LIMIT 100;

-- Profiles with household_id but no membership
SELECT p.auth_user_id, p.household_id
FROM public.profiles p
LEFT JOIN public.memberships m
  ON m.user_id = p.auth_user_id
 AND m.household_id = p.household_id
WHERE p.household_id IS NOT NULL
  AND m.id IS NULL
LIMIT 100;

-- 2) Role distribution sanity
SELECT role, COUNT(*) AS total
FROM public.memberships
GROUP BY role
ORDER BY role;

-- 3) One vote per user constraint check
SELECT poll_id, user_id, COUNT(*) AS c
FROM public.poll_votes
GROUP BY poll_id, user_id
HAVING COUNT(*) > 1;

-- 4) Invite single-use + expiry checks
SELECT id, code, used_at, used_by, expires_at
FROM public.household_invites
WHERE (used_at IS NULL AND used_by IS NOT NULL)
   OR (used_at IS NOT NULL AND used_by IS NULL)
LIMIT 100;

SELECT id, code, expires_at, used_at
FROM public.household_invites
WHERE expires_at <= NOW() AND used_at IS NULL
ORDER BY expires_at DESC
LIMIT 100;

-- 5) RLS helper output (run as authenticated user in SQL editor)
SELECT public.current_household_id() AS current_household_id;
SELECT * FROM public.current_household_ids();
SELECT public.current_user_role() AS current_role;
SELECT public.is_parent() AS is_parent;

-- 6) Cross-household leak probe
-- Should return 0 rows for a normal authenticated user:
SELECT p.id, p.household_id
FROM public.family_polls p
WHERE p.household_id NOT IN (SELECT public.current_household_ids())
LIMIT 10;

-- 7) Parent/child enforcement probes
-- As a child session these should fail:
-- INSERT INTO public.family_polls (household_id, title, created_by) VALUES (...);
-- UPDATE public.family_polls SET status = 'vetoed' WHERE id = '...';
--
-- As a parent session these should succeed (within household):
-- INSERT INTO public.family_polls (household_id, title, created_by) VALUES (...);
-- UPDATE public.family_polls SET status = 'vetoed' WHERE id = '...';

-- 8) Cutover readiness
SELECT
  CASE WHEN EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.household_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.memberships m
        WHERE m.user_id = p.auth_user_id
          AND m.household_id = p.household_id
      )
  ) THEN 'NOT_READY' ELSE 'READY' END AS cutover_status;
