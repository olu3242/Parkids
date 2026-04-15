ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT 'system';

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_theme_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_theme_check
  CHECK (theme IN ('light', 'dark', 'system'));

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);
