import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { AuthorizationError, requireAuthenticatedProfile } from '@/lib/auth/authorization';

const VALID_THEMES = new Set(['light', 'dark', 'system']);

export async function PATCH(req: NextRequest) {
  try {
    const { user } = await requireAuthenticatedProfile();
    const payload = await req.json();
    const theme = typeof payload.theme === 'string' ? payload.theme : '';

    if (!VALID_THEMES.has(theme)) {
      return NextResponse.json({ error: 'Invalid theme' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from('profiles')
      .update({ theme })
      .eq('auth_user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
