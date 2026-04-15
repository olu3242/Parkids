import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const waitlistId =
      typeof payload.waitlist_id === 'string' && payload.waitlist_id.trim()
        ? payload.waitlist_id.trim()
        : null;
    const email =
      typeof payload.email === 'string' && payload.email.trim()
        ? payload.email.trim().toLowerCase()
        : null;
    const frequency =
      typeof payload.frequency_of_conversations === 'string'
        ? payload.frequency_of_conversations.trim()
        : '';
    const biggestChallenges =
      typeof payload.biggest_challenges === 'string' ? payload.biggest_challenges.trim() : '';
    const emotionalOpenness = Number(payload.emotional_openness);
    const willingnessToUseTool = Number(payload.willingness_to_use_tool);
    const willingnessToPay =
      typeof payload.willingness_to_pay === 'string' ? payload.willingness_to_pay.trim() : '';

    if (!frequency || !biggestChallenges || !willingnessToPay) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (
      !Number.isInteger(emotionalOpenness) ||
      emotionalOpenness < 1 ||
      emotionalOpenness > 5 ||
      !Number.isInteger(willingnessToUseTool) ||
      willingnessToUseTool < 1 ||
      willingnessToUseTool > 5
    ) {
      return NextResponse.json({ error: 'Invalid score values' }, { status: 400 });
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('parent_surveys')
      .insert({
        waitlist_id: waitlistId,
        email,
        frequency_of_conversations: frequency,
        biggest_challenges: biggestChallenges,
        emotional_openness: emotionalOpenness,
        willingness_to_use_tool: willingnessToUseTool,
        willingness_to_pay: willingnessToPay,
      })
      .select(
        'id, waitlist_id, email, frequency_of_conversations, biggest_challenges, emotional_openness, willingness_to_use_tool, willingness_to_pay, created_at'
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
