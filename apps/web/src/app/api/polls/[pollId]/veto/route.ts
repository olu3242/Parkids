import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import {
  AuthorizationError,
  requireAuthenticatedProfile,
  requireParent,
} from '@/lib/auth/authorization';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ pollId: string }> }
) {
  try {
    const { user, profile } = await requireAuthenticatedProfile();
    requireParent(profile);

    const { pollId } = await params;
    const payload = await req.json();
    const optionId = typeof payload.optionId === 'string' ? payload.optionId : '';
    const reason = typeof payload.reason === 'string' ? payload.reason.trim() : null;

    if (!optionId) {
      return NextResponse.json({ error: 'Final option is required' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: poll, error: pollError } = await admin
      .from('family_polls')
      .select('id, household_id, status')
      .eq('id', pollId)
      .eq('household_id', profile.household_id)
      .maybeSingle();

    if (pollError || !poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    if (poll.status === 'vetoed') {
      return NextResponse.json({ error: 'Poll already vetoed' }, { status: 409 });
    }

    const { data: option } = await admin
      .from('poll_options')
      .select('id')
      .eq('id', optionId)
      .eq('poll_id', pollId)
      .maybeSingle();

    if (!option) {
      return NextResponse.json({ error: 'Option not found' }, { status: 404 });
    }

    const { error: vetoError } = await admin.from('veto_actions').insert({
      poll_id: pollId,
      household_id: profile.household_id,
      parent_id: user.id,
      final_option_id: optionId,
      reason,
    });

    if (vetoError) {
      return NextResponse.json({ error: vetoError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
