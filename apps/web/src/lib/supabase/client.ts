// ============================================================
// PAR-KIDS — Supabase Client (Web)
// ============================================================
import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for use in Client Components.
 * Uses the public anon key — RLS enforces data access.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  );
}

/**
 * Lazily-initialised singleton — avoids module-load errors during SSG
 * when env vars are not yet configured.
 */
let _client: ReturnType<typeof createBrowserClient> | undefined;
export function getClient() {
  if (!_client) _client = createClient();
  return _client;
}

/** @deprecated prefer getClient() for tree-shaking; kept for compatibility */
export const supabase = createClient();
