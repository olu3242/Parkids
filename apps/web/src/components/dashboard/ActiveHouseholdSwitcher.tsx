'use client';

import { useUser } from '@/hooks/useUser';

export default function ActiveHouseholdSwitcher() {
  const { memberships, activeHouseholdId, setActiveHouseholdId } = useUser();

  if (memberships.length <= 1) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <label htmlFor="active-household" className="mb-2 block text-sm font-semibold text-[#1E2D2F]">
        Active Household
      </label>
      <select
        id="active-household"
        value={activeHouseholdId ?? ''}
        onChange={(event) => setActiveHouseholdId(event.target.value || null)}
        className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm text-[#1E2D2F] focus:outline-none focus:ring-2 focus:ring-[#2D7D5A]"
      >
        {memberships.map((membership) => (
          <option key={membership.id} value={membership.household_id}>
            {membership.household_id} ({membership.role})
          </option>
        ))}
      </select>
    </div>
  );
}
