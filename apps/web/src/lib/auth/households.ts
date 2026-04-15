import { randomBytes } from 'crypto';
import type { User } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/server';
import type { AuthProfile, ProfileRole } from '@/lib/auth/profiles';

export interface HouseholdInvite {
  id: string;
  household_id: string;
  code: string;
  role: ProfileRole;
  expires_at: string;
  created_at: string;
  used_at?: string | null;
  used_by?: string | null;
}

function getDefaultName(email?: string | null) {
  const prefix = email?.split('@')[0]?.trim();
  return prefix ? `${prefix}'s Family` : 'My Family';
}

export async function upsertAppUser(user: User, role: ProfileRole) {
  const admin = createAdminClient();

  const { error } = await admin.from('users').upsert(
    {
      id: user.id,
      email: user.email ?? null,
      first_name: user.user_metadata?.first_name ?? user.email?.split('@')[0] ?? 'Parent',
      last_name: user.user_metadata?.last_name ?? null,
      role,
    },
    { onConflict: 'id', ignoreDuplicates: false }
  );

  return { error };
}

export async function assignProfileToHousehold(
  user: User,
  profile: AuthProfile,
  householdId: string,
  role: ProfileRole
) {
  const admin = createAdminClient();

  const { error: userError } = await upsertAppUser(user, role);
  if (userError) {
    return { error: userError };
  }

  const { error: profileError } = await admin
    .from('profiles')
    .update({
      household_id: householdId,
      email: user.email ?? profile.email,
    })
    .eq('auth_user_id', user.id)
    .is('household_id', null);

  if (profileError) {
    return { error: profileError };
  }

  const { error: memberError } = await admin.from('household_members').upsert(
    {
      household_id: householdId,
      user_id: user.id,
      role,
      access_level: role === 'child' ? 'view_only' : 'full',
      invite_accepted_at: new Date().toISOString(),
      is_active: true,
    },
    { onConflict: 'household_id,user_id', ignoreDuplicates: false }
  );

  if (memberError) {
    return { error: memberError };
  }

  const { error: membershipError } = await admin.from('memberships').upsert(
    {
      user_id: user.id,
      household_id: householdId,
      role,
    },
    { onConflict: 'user_id,household_id', ignoreDuplicates: false }
  );

  return { error: membershipError };
}

export async function createHouseholdForNewUser(user: User, profile: AuthProfile) {
  const admin = createAdminClient();

  const { data: household, error: householdError } = await admin
    .from('households')
    .insert({
      name: getDefaultName(user.email),
      primary_user_id: user.id,
    })
    .select('id')
    .single();

  if (householdError || !household) {
    return { data: null, error: householdError };
  }

  const assignment = await assignProfileToHousehold(user, profile, household.id, 'parent');
  if (assignment.error) {
    return { data: null, error: assignment.error };
  }

  return { data: household, error: null };
}

export async function getValidInvite(code: string) {
  const admin = createAdminClient();

  const result = await admin
    .from('household_invites')
    .select('id, household_id, code, role, expires_at, created_at, used_at')
    .eq('code', code)
    .gt('expires_at', new Date().toISOString())
    .is('used_at', null)
    .maybeSingle();

  return {
    data: (result.data as HouseholdInvite | null) ?? null,
    error: result.error,
  };
}

export async function consumeInviteForUser(
  code: string,
  user: User,
  profile: AuthProfile
) {
  const admin = createAdminClient();
  const nowIso = new Date().toISOString();
  const { error: preUpsertError } = await upsertAppUser(user, 'parent');
  if (preUpsertError) {
    return { data: null, error: preUpsertError };
  }

  const { data: consumedInvite, error: consumeError } = await admin
    .from('household_invites')
    .update({ used_at: nowIso, used_by: user.id })
    .eq('code', code)
    .is('used_at', null)
    .gt('expires_at', nowIso)
    .select('id, household_id, code, role, expires_at, created_at')
    .maybeSingle();

  if (consumeError || !consumedInvite) {
    return { data: null, error: consumeError ?? new Error('Invalid invite code') };
  }

  const assignment = await assignProfileToHousehold(
    user,
    profile,
    consumedInvite.household_id,
    consumedInvite.role
  );

  if (assignment.error) {
    await admin
      .from('household_invites')
      .update({ used_at: null, used_by: null })
      .eq('id', consumedInvite.id)
      .eq('used_by', user.id);
    return { data: null, error: assignment.error };
  }

  return {
    data: consumedInvite as HouseholdInvite,
    error: null,
  };
}

export async function generateInvite(householdId: string, role: ProfileRole) {
  const admin = createAdminClient();
  const code = randomBytes(6).toString('hex').toUpperCase();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await admin
    .from('household_invites')
    .insert({
      household_id: householdId,
      code,
      role,
      expires_at: expiresAt,
    })
    .select('id, household_id, code, role, expires_at, created_at')
    .single();

  if (error || !data) {
    return { data: null, error };
  }

  return {
    data: {
      ...(data as HouseholdInvite),
      inviteLink: `/join?code=${data.code}`,
    },
    error: null,
  };
}
