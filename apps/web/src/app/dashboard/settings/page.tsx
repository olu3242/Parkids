import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import SettingsBillingClient from './SettingsBillingClient';

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { checkout?: string; session_id?: string };
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  // Fetch household
  const { data: membership } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1)
    .single();

  if (!membership) redirect('/onboarding');

  const householdId = membership.household_id;

  // Fetch current subscription
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('tier, status, current_period_end, cancelled_at')
    .eq('household_id', householdId)
    .limit(1)
    .single();

  const currentTier = sub?.tier ?? 'free';
  const currentStatus = sub?.status ?? 'active';
  const currentPeriodEnd = sub?.current_period_end ?? null;
  const checkoutSuccess = searchParams.checkout === 'success';

  return (
    <SettingsBillingClient
      householdId={householdId}
      initialTier={currentTier}
      initialStatus={currentStatus}
      currentPeriodEnd={currentPeriodEnd}
      checkoutSuccess={checkoutSuccess}
    />
  );
}
