'use client';
import { useCallback } from 'react';
import { getClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';

export function useAuth() {
  const supabase = getClient();
  const {
    user,
    session,
    profile,
    memberships,
    activeHouseholdId,
    role,
    household_id,
    isLoading,
    setActiveHouseholdId,
    refreshUser,
  } = useUser();

  const signIn = useCallback(async (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }), [supabase.auth]);

  const signUp = useCallback(async (email: string, password: string, metadata: Record<string,string>) =>
    supabase.auth.signUp({ email, password, options: { data: metadata } }), [supabase.auth]);

  const signOut = useCallback(async () => {
    const result = await supabase.auth.signOut();
    await refreshUser();
    return result;
  }, [refreshUser, supabase.auth]);

  const signInWithGoogle = useCallback(async () =>
    supabase.auth.signInWithOAuth({ provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` } }), [supabase.auth]);

  return {
    user,
    session,
    profile,
    memberships,
    activeHouseholdId,
    role,
    household_id,
    isLoading,
    setActiveHouseholdId,
    isParent: role === 'parent',
    isChild: role === 'child',
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    refreshUser,
  };
}
