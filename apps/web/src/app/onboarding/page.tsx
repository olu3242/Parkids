import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import OnboardingClient from './OnboardingClient';

export default async function OnboardingPage() {
  const supabase = await createServerSupabaseClient();

  // Must be authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  // If already in a household, skip onboarding
  const { data: membership } = await supabase
    .from('household_members')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1)
    .single();

  if (membership) redirect('/dashboard');

  return <OnboardingClient />;
}
