import type { SupabaseClient, User } from '@supabase/supabase-js';

export type ProfileRole = 'parent' | 'child';
export type ProfileTheme = 'light' | 'dark' | 'system';

export interface AuthProfile {
  id: string;
  auth_user_id: string;
  email: string | null;
  role: ProfileRole | null;
  household_id: string | null;
  theme: ProfileTheme | null;
  created_at: string;
}

type RawProfile = {
  id: string;
  auth_user_id: string;
  email: string | null;
  household_id: string | null;
  theme: ProfileTheme | null;
  created_at: string;
};

type MembershipRow = {
  household_id: string;
  role: ProfileRole;
  created_at: string;
};

async function getPrimaryMembership(
  supabase: SupabaseClient,
  authUserId: string,
  preferredHouseholdId: string | null
) {
  if (preferredHouseholdId) {
    const preferred = await supabase
      .from('memberships')
      .select('household_id, role, created_at')
      .eq('user_id', authUserId)
      .eq('household_id', preferredHouseholdId)
      .maybeSingle<MembershipRow>();

    if (preferred.data) {
      return preferred;
    }
  }

  return supabase
    .from('memberships')
    .select('household_id, role, created_at')
    .eq('user_id', authUserId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle<MembershipRow>();
}

function withMembership(
  profile: RawProfile,
  membership: MembershipRow | null
): AuthProfile {
  return {
    ...profile,
    household_id: membership?.household_id ?? profile.household_id,
    role: membership?.role ?? null,
  };
}

export async function getProfileByAuthUserId(
  supabase: SupabaseClient,
  authUserId: string
) {
  const profileResult = await supabase
    .from('profiles')
    .select('id, auth_user_id, email, household_id, theme, created_at')
    .eq('auth_user_id', authUserId)
    .maybeSingle<RawProfile>();

  if (profileResult.error || !profileResult.data) {
    return { data: null, error: profileResult.error };
  }

  const membershipResult = await getPrimaryMembership(
    supabase,
    authUserId,
    profileResult.data.household_id
  );

  if (membershipResult.error) {
    return { data: null, error: membershipResult.error };
  }

  return { data: withMembership(profileResult.data, membershipResult.data ?? null), error: null };
}

export async function ensureProfile(
  supabase: SupabaseClient,
  user: User
) {
  const existingProfile = await getProfileByAuthUserId(supabase, user.id);

  if (existingProfile.error) {
    return existingProfile;
  }

  if (existingProfile.data) {
    return existingProfile;
  }

  return supabase
    .from('profiles')
    .insert({
      auth_user_id: user.id,
      email: user.email ?? null,
      theme: 'system',
    })
    .select('id, auth_user_id, email, household_id, theme, created_at')
    .single<RawProfile>()
    .then(async (inserted) => {
      if (inserted.error || !inserted.data) {
        return { data: null, error: inserted.error };
      }

      const membershipResult = await getPrimaryMembership(
        supabase,
        user.id,
        inserted.data.household_id
      );

      if (membershipResult.error) {
        return { data: null, error: membershipResult.error };
      }

      return { data: withMembership(inserted.data, membershipResult.data ?? null), error: null };
    });
}

export function getPostAuthRedirect(profile: Pick<AuthProfile, 'household_id' | 'role'>) {
  if (!profile.household_id) {
    return '/onboarding';
  }

  if (profile.role === 'child') {
    return '/child';
  }

  return '/dashboard';
}
