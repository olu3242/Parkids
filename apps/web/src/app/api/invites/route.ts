import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateInvite } from '@/lib/auth/households';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: { role?: 'parent' | 'child'; householdId?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const admin = createAdminClient();
  const selectedHouseholdId =
    typeof payload.householdId === 'string' && payload.householdId.trim()
      ? payload.householdId.trim()
      : null;

  const membershipQuery = admin
    .from('memberships')
    .select('household_id, role')
    .eq('user_id', user.id)
    .eq('role', 'parent');

  if (selectedHouseholdId) {
    membershipQuery.eq('household_id', selectedHouseholdId);
  }

  const { data: membership, error: membershipError } = await membershipQuery
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership?.household_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const role = payload.role === 'child' ? 'child' : 'parent';
  const result = await generateInvite(membership.household_id, role);

  if (result.error || !result.data) {
    return NextResponse.json({ error: 'Failed to generate invite' }, { status: 500 });
  }

  return NextResponse.json(result.data, { status: 201 });
}
