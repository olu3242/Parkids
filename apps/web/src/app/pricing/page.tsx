import { createServerSupabaseClient } from '@/lib/supabase/server';
import PricingClient from './PricingClient';

export default async function PricingPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch current tier if logged in — default to free for anonymous visitors
  let currentTier = 'free';
  if (user) {
    const { data: membership } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (membership?.household_id) {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('household_id', membership.household_id)
        .limit(1)
        .single();

      if (sub?.tier) currentTier = sub.tier;
    }
  }

  return <PricingClient currentTier={currentTier} />;
}
