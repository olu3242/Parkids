import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
    const role = payload.role === 'child' ? 'child' : payload.role === 'parent' ? 'parent' : '';
    const childrenCount = Number(payload.children_count);
    const biggestChallenge =
      typeof payload.biggest_challenge === 'string' ? payload.biggest_challenge.trim() : '';

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    if (!role) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    if (!Number.isInteger(childrenCount) || childrenCount < 0 || childrenCount > 20) {
      return NextResponse.json({ error: 'Invalid children_count' }, { status: 400 });
    }

    if (!biggestChallenge) {
      return NextResponse.json({ error: 'biggest_challenge is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('waitlist')
      .upsert(
        {
          email,
          role,
          children_count: childrenCount,
          biggest_challenge: biggestChallenge,
        },
        { onConflict: 'email' }
      )
      .select('id, email, role, children_count, biggest_challenge, created_at')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
