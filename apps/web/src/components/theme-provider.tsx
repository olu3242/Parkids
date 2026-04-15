'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getClient } from '@/lib/supabase/client';
import { updateTheme as updateThemeAction } from '@/lib/api/actions';

export type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

type ThemeContextValue = {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => Promise<void>;
  isLoaded: boolean;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const STORAGE_KEY = 'parkids-theme';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme: ThemeMode): ResolvedTheme {
  return theme === 'system' ? getSystemTheme() : theme;
}

function applyThemeClass(theme: ThemeMode) {
  const root = document.documentElement;
  const resolved = resolveTheme(theme);
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved;
}

async function getThemeFromDb() {
  const supabase = getClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('theme, household_id')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (profileError) return null;
  if (!profile) return null;

  const membershipQuery = supabase
    .from('memberships')
    .select('role')
    .eq('user_id', user.id);

  if (profile.household_id) {
    membershipQuery.eq('household_id', profile.household_id);
  }

  const { data: membership } = await membershipQuery.limit(1).maybeSingle();
  const role = membership?.role as 'parent' | 'child' | null;

  if (role === 'child' && !profile.theme) {
    return 'light' as ThemeMode;
  }

  const theme = profile.theme as ThemeMode | null;
  return theme ?? (role === 'child' ? 'light' : null);
}

async function setThemeInDb(theme: ThemeMode) {
  const supabase = getClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return;
  await updateThemeAction(theme);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadTheme = async () => {
      const dbTheme = await getThemeFromDb();
      const localTheme = (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? null;
      const finalTheme = dbTheme ?? localTheme ?? 'system';

      if (!mounted) return;

      setThemeState(finalTheme);
      applyThemeClass(finalTheme);
      setIsLoaded(true);
    };

    loadTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const onMediaChange = () => {
      setThemeState((current) => {
        if (current === 'system') {
          applyThemeClass('system');
        }
        return current;
      });
    };
    mediaQuery.addEventListener('change', onMediaChange);

    const supabase = getClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (!session?.user) return;
      const dbTheme = await getThemeFromDb();
      if (!dbTheme) return;
      setThemeState(dbTheme);
      applyThemeClass(dbTheme);
    });

    return () => {
      mounted = false;
      mediaQuery.removeEventListener('change', onMediaChange);
      subscription.unsubscribe();
    };
  }, []);

  const setTheme = useCallback(async (nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
    localStorage.setItem(STORAGE_KEY, nextTheme);
    applyThemeClass(nextTheme);
    await setThemeInDb(nextTheme);
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    resolvedTheme: resolveTheme(theme),
    setTheme,
    isLoaded,
  }), [theme, setTheme, isLoaded]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
