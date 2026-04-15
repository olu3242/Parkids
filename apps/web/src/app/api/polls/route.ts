import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import {
  AuthorizationError,
  requireAuthenticatedProfile,
} from '@/lib/auth/authorization';

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuthenticatedProfile();

    const payload = await req.json();
    const householdId = typeof payload.householdId === 'string' ? payload.householdId : '';
    const title = typeof payload.title === 'string' ? payload.title.trim() : '';
    const description = typeof payload.description === 'string' ? payload.description.trim() : '';
    const options = Array.isArray(payload.options)
      ? (payload.options as Array<{ label?: unknown; place_id?: unknown }>)
      : [];

    if (!householdId || !title || options.length < 2) {
      return NextResponse.json({ error: 'Invalid poll payload' }, { status: 400 });
    }

    const cleanedOptions = options
      .map((option) => ({
        label: typeof option.label === 'string' ? option.label.trim() : '',
        place_id: typeof option.place_id === 'string' ? option.place_id : null,
      }))
      .filter((option) => option.label.length > 0);

    if (cleanedOptions.length < 2) {
      return NextResponse.json({ error: 'At least two options are required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: membership, error: membershipError } = await admin
      .from('memberships')
      .select('id, role')
      .eq('user_id', user.id)
      .eq('household_id', householdId)
      .maybeSingle();

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (membership.role !== 'parent') {
      return NextResponse.json({ error: 'Parent access required' }, { status: 403 });
    }

    const endsAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const { data: poll, error: pollError } = await admin
      .from('family_polls')
      .insert({
        household_id: householdId,
        title,
        description: description || null,
        created_by: user.id,
        status: 'active',
        ends_at: endsAt,
      })
      .select('id')
      .single();

    if (pollError || !poll) {
      return NextResponse.json({ error: pollError?.message ?? 'Failed to create poll' }, { status: 400 });
    }

    const { error: optionsError } = await admin.from('poll_options').insert(
      cleanedOptions.map((option) => ({
        poll_id: poll.id,
        label: option.label,
        place_id: option.place_id,
      }))
    );

    if (optionsError) {
      return NextResponse.json({ error: optionsError.message }, { status: 400 });
    }

    return NextResponse.json({ id: poll.id }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
