import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import {
  AuthorizationError,
  requireAuthenticatedProfile,
  requireParent,
} from '@/lib/auth/authorization';

export async function POST(req: NextRequest) {
  try {
    const { user, profile } = await requireAuthenticatedProfile();
    requireParent(profile);

    const payload = await req.json();
    const childUserId = typeof payload.childUserId === 'string' ? payload.childUserId : '';
    const amount = Number(payload.amount);
    const reason = typeof payload.reason === 'string' ? payload.reason.trim() : '';
    const pollId = typeof payload.pollId === 'string' ? payload.pollId : null;

    if (!childUserId || !Number.isFinite(amount) || amount <= 0 || !reason) {
      return NextResponse.json({ error: 'Invalid points payload' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: childMembership } = await admin
      .from('memberships')
      .select('user_id, household_id, role')
      .eq('user_id', childUserId)
      .eq('household_id', profile.household_id)
      .eq('role', 'child')
      .maybeSingle();

    if (!childMembership) {
      return NextResponse.json({ error: 'Child not found in household' }, { status: 404 });
    }

    const { error } = await admin.from('points').insert({
      household_id: profile.household_id,
      child_user_id: childUserId,
      awarded_by: user.id,
      amount,
      reason,
      poll_id: pollId,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
