'use client';

import { FormEvent, useState } from 'react';
import { createVote } from '@/lib/api/actions';
import { useUser } from '@/hooks/useUser';

type CreatePollFormProps = {
  onCreated?: () => Promise<void> | void;
};

export default function CreatePollForm({ onCreated }: CreatePollFormProps) {
  const { isLoading, role, activeHouseholdId } = useUser();
  const isParent = role === 'parent';
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading || !isParent) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle) return;

    if (!activeHouseholdId) {
      setError('No active household selected.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createVote({
        householdId: activeHouseholdId,
        title: nextTitle,
        description: '',
        options: [
          { label: 'Yes', place_id: null },
          { label: 'No', place_id: null },
        ],
      });
      setTitle('');
      if (onCreated) await onCreated();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to create poll.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#D8DDE3] bg-white p-4 shadow-sm"
    >
      <label htmlFor="poll-title" className="mb-2 block text-sm font-semibold text-[#1E2D2F]">
        Create Poll
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="poll-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Enter poll title"
          className="w-full rounded-xl border border-[#D8DDE3] px-3 py-2 text-sm text-[#1E2D2F] outline-none ring-[#2D7D5A] focus:ring-2"
          disabled={submitting}
          maxLength={120}
        />
        <button
          type="submit"
          disabled={submitting || title.trim().length === 0}
          className="rounded-xl bg-[#2D7D5A] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Creating...' : 'Create Poll'}
        </button>
      </div>
      {error ? <p className="mt-2 text-xs text-[#A94442]">{error}</p> : null}
    </form>
  );
}
