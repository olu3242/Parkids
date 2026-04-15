import type { SupabaseClient } from '@supabase/supabase-js';

export async function fetchUserMemberships(supabase: SupabaseClient, userId: string) {
  return supabase
    .from('memberships')
    .select('id, user_id, household_id, role, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
}

export async function fetchHouseholdMembers(supabase: SupabaseClient, householdId: string) {
  return supabase
    .from('memberships')
    .select('id, user_id, household_id, role, created_at, users:user_id (id, first_name, last_name, email, child_profiles (nickname, grade, avatar_color))')
    .eq('household_id', householdId)
    .order('created_at', { ascending: true });
}

export async function fetchPollsByHousehold(supabase: SupabaseClient, householdId: string) {
  return supabase
    .from('family_polls')
    .select('id, household_id, title, description, status, starts_at, ends_at, closed_at, winning_option_id, final_option_id, vetoed_by, veto_reason, reward_created, created_at')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });
}

export async function fetchRewardsByHousehold(supabase: SupabaseClient, householdId: string) {
  return supabase
    .from('rewards')
    .select('id, household_id, poll_id, place_id, title, description, unlocked_at, created_by, created_at')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });
}
