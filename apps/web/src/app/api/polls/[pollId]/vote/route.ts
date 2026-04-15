import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { AuthorizationError, requireAuthenticatedProfile } from '@/lib/auth/authorization';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ pollId: string }> }
) {
  try {
    const { user, profile } = await requireAuthenticatedProfile();
    const { pollId } = await params;
    const payload = await req.json();
    const optionId = typeof payload.optionId === 'string' ? payload.optionId : '';

    if (!optionId) {
      return NextResponse.json({ error: 'Option is required' }, { status: 400 });
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

    if (poll.status !== 'active') {
      return NextResponse.json({ error: 'Decision finalized by parent' }, { status: 409 });
    }

    const { data: existingVote } = await admin
      .from('poll_votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingVote) {
      return NextResponse.json({ error: 'You have already voted' }, { status: 409 });
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

    const { error: voteError } = await admin.from('poll_votes').insert({
      poll_id: pollId,
      option_id: optionId,
      user_id: user.id,
    });

    if (voteError) {
      return NextResponse.json({ error: voteError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
