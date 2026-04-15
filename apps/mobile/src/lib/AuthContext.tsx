// ============================================================
// PAR-KIDS — Auth Context (Mobile)
// ============================================================
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { User as ParkidsUser } from '@parkids/shared-types';

interface AuthContextValue {
  session: Session | null;
  parkidsUser: ParkidsUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [parkidsUser, setParkidsUser] = useState<ParkidsUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchParkidsUser = async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    return data as ParkidsUser | null;
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const user = await fetchParkidsUser(session.user.id);
        setParkidsUser(user);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          const user = await fetchParkidsUser(session.user.id);
          setParkidsUser(user);
        } else {
          setParkidsUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setParkidsUser(null);
  };

  return (
    <AuthContext.Provider value={{ session, parkidsUser, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function useIsParent() {
  const { parkidsUser } = useAuth();
  return parkidsUser?.role === 'parent' || parkidsUser?.role === 'co_parent';
}

export function useIsChild() {
  const { parkidsUser } = useAuth();
  return parkidsUser?.role === 'child';
}
