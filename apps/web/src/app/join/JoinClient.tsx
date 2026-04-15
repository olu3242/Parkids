'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getClient } from '@/lib/supabase/client';
import { getInviteCookieValue } from '@/lib/auth/invite';

export default function JoinClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');

    if (!code) {
      router.replace('/login');
      return;
    }

    document.cookie = getInviteCookieValue(code);

    const supabase = getClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        router.replace('/auth/callback');
        return;
      }

      router.replace('/login');
    });
  }, [router, searchParams]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-sand-50 to-green-50 flex items-center justify-center px-6">
      <div className="max-w-md rounded-3xl border border-sand-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-500">
          Joining family
        </p>
        <h1 className="mt-4 text-3xl font-bold text-charcoal-800">You&apos;ve joined the family 🎉</h1>
        <p className="mt-3 text-sm text-charcoal-500">
          We&apos;re connecting your invite and signing you in now.
        </p>
      </div>
    </main>
  );
}
