'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Place } from '@/types/voting';

type PollOptionDraft = {
  label: string;
  place_id: string | null;
};

type CreatePollModalProps = {
  open: boolean;
  places: Place[];
  onClose: () => void;
  onCreate: (payload: {
    title: string;
    description: string;
    options: PollOptionDraft[];
  }) => Promise<void>;
};

function emptyOption(): PollOptionDraft {
  return { label: '', place_id: null };
}

export default function CreatePollModal({ open, places, onClose, onCreate }: CreatePollModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<PollOptionDraft[]>([emptyOption(), emptyOption()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAddOption = options.length < 6;
  const canRemoveOption = options.length > 2;

  const cleanedOptions = useMemo(
    () => options.map((o) => ({ ...o, label: o.label.trim() })).filter((o) => o.label.length > 0),
    [options]
  );

  async function handleSubmit() {
    setError(null);

    if (!title.trim()) {
      setError('Poll title is required.');
      return;
    }

    if (cleanedOptions.length < 2) {
      setError('At least 2 options are required.');
      return;
    }

    try {
      setSubmitting(true);
      await onCreate({
        title: title.trim(),
        description: description.trim(),
        options: cleanedOptions,
      });

      setTitle('');
      setDescription('');
      setOptions([emptyOption(), emptyOption()]);
      onClose();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create poll.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-[#1E2D2F]">Create Family Poll</h2>
            <p className="mt-1 text-sm text-[#486668]">This poll will run for 48 hours automatically.</p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#486668]">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#1E2D2F]"
                  placeholder="What should we do this weekend?"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#486668]">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#1E2D2F]"
                  rows={3}
                  placeholder="Let everyone vote before Friday evening."
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[#486668]">Options</label>
                  <button
                    disabled={!canAddOption}
                    onClick={() => canAddOption && setOptions((prev) => [...prev, emptyOption()])}
                    className="rounded-lg border border-[#D8DDE3] px-2 py-1 text-xs font-semibold text-[#1E2D2F] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    + Add Option
                  </button>
                </div>

                {options.map((option, idx) => (
                  <div key={idx} className="rounded-xl border border-[#EEF2F3] p-3">
                    <div className="grid gap-2 md:grid-cols-[1fr,220px,auto] md:items-center">
                      <input
                        value={option.label}
                        onChange={(e) => {
                          const next = [...options];
                          next[idx] = { ...next[idx], label: e.target.value };
                          setOptions(next);
                        }}
                        className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
                        placeholder={`Option ${idx + 1}`}
                      />

                      <select
                        value={option.place_id ?? ''}
                        onChange={(e) => {
                          const next = [...options];
                          next[idx] = { ...next[idx], place_id: e.target.value || null };
                          setOptions(next);
                        }}
                        className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
                      >
                        <option value="">No linked place</option>
                        {places.map((place) => (
                          <option key={place.id} value={place.id}>
                            {place.name} ({place.city})
                          </option>
                        ))}
                      </select>

                      <button
                        disabled={!canRemoveOption}
                        onClick={() => {
                          if (!canRemoveOption) return;
                          setOptions((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        className="rounded-lg border border-[#F3D0D0] px-2 py-2 text-xs font-semibold text-[#A94442] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {error ? <p className="text-sm text-[#A94442]">{error}</p> : null}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className="rounded-xl border border-[#D8DDE3] px-4 py-2 text-sm font-semibold text-[#1E2D2F]"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={handleSubmit}
                className="rounded-xl bg-[#2D7D5A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#236346] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Creating...' : 'Create Poll'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
