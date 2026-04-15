'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export type SubscriptionTier = 'free' | 'premium' | 'family_pro';

interface SubscriptionState {
  tier: SubscriptionTier;
  status: string;
  isLoading: boolean;
  isPremium: boolean;    // premium or family_pro
  isFamilyPro: boolean; // family_pro only
  currentPeriodEnd: Date | null;
  cancelledAt: Date | null;
  refresh: () => void;
}

export function useSubscription(householdId: string | null): SubscriptionState {
  const supabase = createClient();
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [status, setStatus] = useState<string>('active');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<Date | null>(null);
  const [cancelledAt, setCancelledAt] = useState<Date | null>(null);

  const fetchSub = useCallback(async () => {
    if (!householdId) {
      setIsLoading(false);
      return;
    }
    const { data } = await supabase
      .from('subscriptions')
      .select('tier, status, current_period_end, cancelled_at')
      .eq('household_id', householdId)
      .limit(1)
      .single();

    if (data) {
      setTier((data.tier as SubscriptionTier) ?? 'free');
      setStatus(data.status ?? 'active');
      setCurrentPeriodEnd(data.current_period_end ? new Date(data.current_period_end) : null);
      setCancelledAt(data.cancelled_at ? new Date(data.cancelled_at) : null);
    }
    setIsLoading(false);
  }, [householdId, supabase]);

  useEffect(() => {
    fetchSub();

    if (!householdId) return;

    // Realtime — subscribe so upgrade reflects immediately
    const channel = supabase
      .channel(`sub:${householdId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `household_id=eq.${householdId}`,
        },
        () => fetchSub()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSub, householdId, supabase]);

  return {
    tier,
    status,
    isLoading,
    isPremium: tier === 'premium' || tier === 'family_pro',
    isFamilyPro: tier === 'family_pro',
    currentPeriodEnd,
    cancelledAt,
    refresh: fetchSub,
  };
}
