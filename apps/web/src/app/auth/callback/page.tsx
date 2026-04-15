import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ensureProfile, getPostAuthRedirect } from '@/lib/auth/profiles';
import {
  consumeInviteForUser,
  createHouseholdForNewUser,
} from '@/lib/auth/households';
import { INVITE_COOKIE_NAME } from '@/lib/auth/invite';

type AuthCallbackPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AuthCallbackPage({ searchParams }: AuthCallbackPageProps) {
  const params = await searchParams;
  const code = typeof params.code === 'string' ? params.code : null;
  const error = typeof params.error === 'string' ? params.error : null;
  const inviteCodeFromUrl = typeof params.invite_code === 'string' ? params.invite_code : null;

  if (error) {
    redirect('/login');
  }

  const supabase = await createServerSupabaseClient();

  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      redirect('/login');
    }
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  const { data: profile, error: profileError } = await ensureProfile(supabase, user);

  if (profileError || !profile) {
    redirect('/login');
  }

  const cookieStore = await cookies();
  const inviteCodeFromCookie = cookieStore.get(INVITE_COOKIE_NAME)?.value ?? null;
  const inviteCode = inviteCodeFromUrl ?? inviteCodeFromCookie;

  if (!profile.household_id && inviteCode) {
    const inviteResult = await consumeInviteForUser(inviteCode, user, profile);

    if (inviteResult.error || !inviteResult.data) {
      redirect('/login');
    }

    redirect(
      `${inviteResult.data.role === 'child' ? '/child' : '/dashboard'}?joined=1`
    );
  }

  if (!profile.household_id) {
    const householdResult = await createHouseholdForNewUser(user, profile);

    if (householdResult.error || !householdResult.data) {
      redirect('/login');
    }

    redirect('/dashboard');
  }

  redirect(getPostAuthRedirect(profile));
}
