'use client';

import { useState } from 'react';
import { useUser } from '@/hooks/useUser';

type InviteRole = 'parent' | 'child';

export default function InviteButton() {
  const { activeHouseholdId } = useUser();
  const [role, setRole] = useState<InviteRole>('child');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleGenerateInvite = async () => {
    setIsLoading(true);
    setMessage(null);

    const response = await fetch('/api/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, householdId: activeHouseholdId }),
    });

    const data = await response.json().catch(() => null);
    setIsLoading(false);

    if (!response.ok || !data?.inviteLink) {
      setMessage('Unable to generate invite right now.');
      return;
    }

    const inviteUrl = `${window.location.origin}${data.inviteLink}`;
    await navigator.clipboard.writeText(inviteUrl).catch(() => undefined);
    setMessage(`Invite copied: ${inviteUrl}`);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as InviteRole)}
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-[#1E2D2F] focus:outline-none focus:ring-2 focus:ring-[#2D7D5A]"
        >
          <option value="child">Child Invite</option>
          <option value="parent">Parent Invite</option>
        </select>

        <button
          type="button"
          onClick={handleGenerateInvite}
          disabled={isLoading || !activeHouseholdId}
          className="rounded-xl bg-[#2D7D5A] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#236346] disabled:opacity-70"
        >
          {isLoading ? 'Generating...' : 'Generate Invite'}
        </button>
      </div>

      {!activeHouseholdId ? (
        <p className="mt-3 text-sm text-[#B45309]">Select a household to generate invites.</p>
      ) : null}

      {message ? (
        <p className="mt-3 text-sm text-[#486668]">{message}</p>
      ) : null}
    </div>
  );
}
