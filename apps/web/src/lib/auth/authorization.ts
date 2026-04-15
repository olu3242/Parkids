import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ensureProfile, type AuthProfile } from '@/lib/auth/profiles';

export class AuthorizationError extends Error {
  status: number;

  constructor(message: string, status = 403) {
    super(message);
    this.status = status;
  }
}

export async function requireAuthenticatedProfile() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthorizationError('Unauthorized', 401);
  }

  const { data: profile, error } = await ensureProfile(supabase, user);

  if (error || !profile) {
    throw new AuthorizationError('Profile not found', 401);
  }

  if (!profile.household_id) {
    throw new AuthorizationError('No household assigned', 403);
  }

  return { supabase, user, profile };
}

export function requireParent(profile: AuthProfile) {
  if (profile.role !== 'parent') {
    throw new AuthorizationError('Parent access required', 403);
  }
}

export function requireHousehold(profile: AuthProfile) {
  if (!profile.household_id) {
    throw new AuthorizationError('No household assigned', 403);
  }
}
