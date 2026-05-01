"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getClient } from "@/lib/supabase/client";
import {
  getProfileByAuthUserId,
  type AuthProfile,
  type ProfileRole,
} from "@/lib/auth/profiles";

export type UserMembership = {
  id: string;
  user_id: string;
  household_id: string;
  role: ProfileRole;
  created_at: string;
};

type UserContextValue = {
  user: User | null;
  session: Session | null;
  profile: AuthProfile | null;
  memberships: UserMembership[];
  activeHouseholdId: string | null;
  role: ProfileRole | null;
  household_id: string | null;
  isLoading: boolean;
  setActiveHouseholdId: (householdId: string | null) => void;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);
const ACTIVE_HOUSEHOLD_STORAGE_KEY = "parkids-active-household-id";

async function fetchProfile(userId: string) {
  const supabase = getClient();
  const { data } = await getProfileByAuthUserId(supabase, userId);
  return data ?? null;
}

async function fetchMemberships(userId: string) {
  const supabase = getClient();
  const { data } = await supabase
    .from("memberships")
    .select("id, user_id, household_id, role, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  return (data as UserMembership[] | null) ?? [];
}

export function UserProvider({ children }: { children: ReactNode }) {
  const supabase = getClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [memberships, setMemberships] = useState<UserMembership[]>([]);
  const [activeHouseholdId, setActiveHouseholdIdState] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  const setActiveHouseholdId = (householdId: string | null) => {
    setActiveHouseholdIdState(householdId);
    if (typeof window === "undefined") return;
    if (householdId) {
      window.localStorage.setItem(ACTIVE_HOUSEHOLD_STORAGE_KEY, householdId);
    } else {
      window.localStorage.removeItem(ACTIVE_HOUSEHOLD_STORAGE_KEY);
    }
  };

  const refreshUser = async () => {
    setIsLoading(true);
    const {
      data: { session: nextSession },
    } = await supabase.auth.getSession();
    setSession(nextSession);
    setUser(nextSession?.user ?? null);

    if (nextSession?.user) {
      const nextProfile = await fetchProfile(nextSession.user.id);
      const nextMemberships = await fetchMemberships(nextSession.user.id);
      const validHouseholds = new Set(
        nextMemberships.map((m) => m.household_id)
      );
      const storedHouseholdId =
        typeof window !== "undefined"
          ? window.localStorage.getItem(ACTIVE_HOUSEHOLD_STORAGE_KEY)
          : null;
      const fallbackHouseholdId =
        nextProfile?.household_id ?? nextMemberships[0]?.household_id ?? null;
      const nextActiveHouseholdId =
        storedHouseholdId && validHouseholds.has(storedHouseholdId)
          ? storedHouseholdId
          : fallbackHouseholdId;

      setProfile(nextProfile);
      setMemberships(nextMemberships);
      setActiveHouseholdId(nextActiveHouseholdId);
    } else {
      setProfile(null);
      setMemberships([]);
      setActiveHouseholdId(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    refreshUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, nextSession) => {
      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        const nextProfile = await fetchProfile(nextSession.user.id);
        const nextMemberships = await fetchMemberships(nextSession.user.id);
        const validHouseholds = new Set(
          nextMemberships.map((m) => m.household_id)
        );
        const storedHouseholdId =
          typeof window !== "undefined"
            ? window.localStorage.getItem(ACTIVE_HOUSEHOLD_STORAGE_KEY)
            : null;
        const fallbackHouseholdId =
          nextProfile?.household_id ?? nextMemberships[0]?.household_id ?? null;
        const nextActiveHouseholdId =
          storedHouseholdId && validHouseholds.has(storedHouseholdId)
            ? storedHouseholdId
            : fallbackHouseholdId;

        setProfile(nextProfile);
        setMemberships(nextMemberships);
        setActiveHouseholdId(nextActiveHouseholdId);
      } else {
        setProfile(null);
        setMemberships([]);
        setActiveHouseholdId(null);
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      session,
      profile,
      memberships,
      activeHouseholdId,
      role:
        memberships.find((m) => m.household_id === activeHouseholdId)?.role ??
        profile?.role ??
        null,
      household_id: activeHouseholdId,
      isLoading,
      setActiveHouseholdId,
      refreshUser,
    }),
    [user, session, profile, memberships, activeHouseholdId, isLoading]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}
