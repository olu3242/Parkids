-- ============================================================
-- PAR-KIDS — Family Voting, Rewards, Places
-- Migration: 003_family_voting_rewards
-- ============================================================

DO $$ BEGIN CREATE TYPE poll_status AS ENUM ('active', 'closed', 'vetoed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE reward_origin_type AS ENUM ('poll', 'goal', 'streak', 'milestone'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE reward_type AS ENUM ('place', 'experience', 'badge'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.places (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  city        TEXT NOT NULL,
  lat         DOUBLE PRECISION,
  lng         DOUBLE PRECISION,
  is_partner  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.family_polls (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id       UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  title              TEXT NOT NULL,
  description        TEXT,
  status             poll_status NOT NULL DEFAULT 'active',
  starts_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at            TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),
  closed_at          TIMESTAMPTZ,
  winning_option_id  UUID,
  final_option_id    UUID,
  created_by         UUID NOT NULL REFERENCES public.users(id),
  vetoed_by          UUID REFERENCES public.users(id),
  reward_created     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at         TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.poll_options (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id      UUID NOT NULL REFERENCES public.family_polls(id) ON DELETE CASCADE,
  label        TEXT NOT NULL,
  place_id     UUID REFERENCES public.places(id),
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.poll_votes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id      UUID NOT NULL REFERENCES public.family_polls(id) ON DELETE CASCADE,
  option_id    UUID NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (poll_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.rewards (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  poll_id       UUID REFERENCES public.family_polls(id) ON DELETE SET NULL,
  place_id      UUID REFERENCES public.places(id) ON DELETE SET NULL,
  type          reward_origin_type NOT NULL DEFAULT 'poll',
  reward_type   reward_type NOT NULL DEFAULT 'place',
  title         TEXT NOT NULL,
  description   TEXT,
  unlocked_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by    UUID REFERENCES public.users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_family_polls_household ON public.family_polls(household_id);
CREATE INDEX IF NOT EXISTS idx_family_polls_status ON public.family_polls(status);
CREATE INDEX IF NOT EXISTS idx_family_polls_ends_at ON public.family_polls(ends_at);
CREATE INDEX IF NOT EXISTS idx_poll_options_poll ON public.poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON public.poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user ON public.poll_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_household ON public.rewards(household_id);

ALTER TABLE public.family_polls DROP CONSTRAINT IF EXISTS family_polls_winning_option_id_fkey;
ALTER TABLE public.family_polls
  ADD CONSTRAINT family_polls_winning_option_id_fkey
  FOREIGN KEY (winning_option_id) REFERENCES public.poll_options(id) ON DELETE SET NULL;

ALTER TABLE public.family_polls DROP CONSTRAINT IF EXISTS family_polls_final_option_id_fkey;
ALTER TABLE public.family_polls
  ADD CONSTRAINT family_polls_final_option_id_fkey
  FOREIGN KEY (final_option_id) REFERENCES public.poll_options(id) ON DELETE SET NULL;

DROP TRIGGER IF EXISTS update_family_polls_updated_at ON public.family_polls;
CREATE TRIGGER update_family_polls_updated_at
  BEFORE UPDATE ON public.family_polls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_poll_votes_updated_at ON public.poll_votes;
CREATE TRIGGER update_poll_votes_updated_at
  BEFORE UPDATE ON public.poll_votes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION public.is_user_in_household(hid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.household_members hm
    WHERE hm.household_id = hid
      AND hm.user_id = auth.uid()
      AND hm.is_active = TRUE
  );
$$;

CREATE OR REPLACE FUNCTION public.is_parent_user(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = uid
      AND u.role = 'parent'
  );
$$;

CREATE OR REPLACE FUNCTION public.close_expired_polls()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  closed_count INTEGER := 0;
BEGIN
  WITH candidates AS (
    SELECT p.id
    FROM public.family_polls p
    WHERE p.status = 'active'
      AND p.ends_at <= NOW()
  ), winners AS (
    SELECT c.id AS poll_id,
      (
        SELECT po.id
        FROM public.poll_options po
        LEFT JOIN public.poll_votes pv ON pv.option_id = po.id
        WHERE po.poll_id = c.id
        GROUP BY po.id
        ORDER BY COUNT(pv.id) DESC, po.created_at ASC
        LIMIT 1
      ) AS winner_id
    FROM candidates c
  )
  UPDATE public.family_polls p
  SET status = 'closed',
      closed_at = NOW(),
      winning_option_id = COALESCE(w.winner_id, p.winning_option_id),
      final_option_id = COALESCE(p.final_option_id, w.winner_id),
      updated_at = NOW()
  FROM winners w
  WHERE p.id = w.poll_id;

  GET DIAGNOSTICS closed_count = ROW_COUNT;
  RETURN closed_count;
END;
$$;

REVOKE ALL ON FUNCTION public.close_expired_polls() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.close_expired_polls() TO authenticated;

CREATE OR REPLACE FUNCTION public.create_reward_for_finalized_poll()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  selected_option_id UUID;
  selected_place_id UUID;
  selected_label TEXT;
BEGIN
  IF NEW.reward_created = TRUE THEN
    RETURN NEW;
  END IF;

  IF NEW.status NOT IN ('closed', 'vetoed') THEN
    RETURN NEW;
  END IF;

  selected_option_id := COALESCE(NEW.final_option_id, NEW.winning_option_id);
  IF selected_option_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT po.place_id, po.label
  INTO selected_place_id, selected_label
  FROM public.poll_options po
  WHERE po.id = selected_option_id;

  INSERT INTO public.rewards (
    household_id,
    poll_id,
    place_id,
    type,
    reward_type,
    title,
    description,
    created_by
  ) VALUES (
    NEW.household_id,
    NEW.id,
    selected_place_id,
    'poll',
    'place',
    'Reward Unlocked',
    CONCAT('Family picked: ', COALESCE(selected_label, 'New experience')),
    NEW.created_by
  );

  NEW.reward_created := TRUE;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_create_reward_for_finalized_poll ON public.family_polls;
CREATE TRIGGER trigger_create_reward_for_finalized_poll
  BEFORE UPDATE ON public.family_polls
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.final_option_id IS DISTINCT FROM NEW.final_option_id)
  EXECUTE FUNCTION public.create_reward_for_finalized_poll();

ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS places_public_read ON public.places;
CREATE POLICY places_public_read ON public.places
  FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS polls_household_access ON public.family_polls;
CREATE POLICY polls_household_access ON public.family_polls
  FOR SELECT
  USING (public.is_user_in_household(household_id));

DROP POLICY IF EXISTS polls_household_create ON public.family_polls;
CREATE POLICY polls_household_create ON public.family_polls
  FOR INSERT
  WITH CHECK (
    public.is_user_in_household(household_id)
    AND created_by = auth.uid()
  );

DROP POLICY IF EXISTS polls_parent_veto_update ON public.family_polls;
CREATE POLICY polls_parent_veto_update ON public.family_polls
  FOR UPDATE
  USING (public.is_user_in_household(household_id))
  WITH CHECK (
    public.is_user_in_household(household_id)
    AND (
      status <> 'vetoed'
      OR public.is_parent_user(auth.uid())
    )
  );

DROP POLICY IF EXISTS poll_options_household_access ON public.poll_options;
CREATE POLICY poll_options_household_access ON public.poll_options
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.family_polls p
      WHERE p.id = poll_options.poll_id
        AND public.is_user_in_household(p.household_id)
    )
  );

DROP POLICY IF EXISTS poll_options_household_create ON public.poll_options;
CREATE POLICY poll_options_household_create ON public.poll_options
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.family_polls p
      WHERE p.id = poll_options.poll_id
        AND public.is_user_in_household(p.household_id)
    )
  );

DROP POLICY IF EXISTS poll_votes_household_access ON public.poll_votes;
CREATE POLICY poll_votes_household_access ON public.poll_votes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.family_polls p
      WHERE p.id = poll_votes.poll_id
        AND public.is_user_in_household(p.household_id)
    )
  );

DROP POLICY IF EXISTS poll_votes_one_per_user ON public.poll_votes;
CREATE POLICY poll_votes_one_per_user ON public.poll_votes
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.family_polls p
      WHERE p.id = poll_votes.poll_id
        AND p.status = 'active'
        AND p.ends_at > NOW()
        AND public.is_user_in_household(p.household_id)
    )
  );

DROP POLICY IF EXISTS poll_votes_update_own ON public.poll_votes;
CREATE POLICY poll_votes_update_own ON public.poll_votes
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.family_polls p
      WHERE p.id = poll_votes.poll_id
        AND p.status = 'active'
        AND p.ends_at > NOW()
    )
  );

DROP POLICY IF EXISTS rewards_household_access ON public.rewards;
CREATE POLICY rewards_household_access ON public.rewards
  FOR SELECT
  USING (public.is_user_in_household(household_id));

-- Seed a few city explorer places.
INSERT INTO public.places (name, category, city, lat, lng, is_partner)
VALUES
  ('Sunrise Science Museum', 'education', 'Lagos', 6.5244, 3.3792, TRUE),
  ('Greenfield Adventure Park', 'outdoor', 'Lagos', 6.6000, 3.3500, FALSE),
  ('Story House Book Cafe', 'learning', 'Abuja', 9.0765, 7.3986, TRUE),
  ('City Aquarium', 'family', 'Abuja', 9.0900, 7.4500, FALSE)
ON CONFLICT DO NOTHING;
