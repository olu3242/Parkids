'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { Place } from '@/types/voting';

type CelebrationModalProps = {
  open: boolean;
  place: Place | null;
  onClose: () => void;
  title?: string;
  description?: string;
  ctaLabel?: string;
};

export default function CelebrationModal({
  open,
  place,
  onClose,
  title = 'Reward Unlocked!',
  description = 'Your family completed the vote and unlocked a new real-world activity.',
  ctaLabel = 'View Place',
}: CelebrationModalProps) {
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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="pointer-events-none absolute inset-0">
              {Array.from({ length: 14 }).map((_, idx) => (
                <motion.span
                  key={idx}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 220, opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 1.8, delay: idx * 0.04, repeat: Infinity, repeatDelay: 0.6 }}
                  className="absolute h-2 w-2 rounded-full"
                  style={{
                    left: `${8 + idx * 6}%`,
                    backgroundColor: ['#2D7D5A', '#3ABFBF', '#F2A65A'][idx % 3],
                  }}
                />
              ))}
            </div>
            <div className="mb-3 flex gap-1 text-xl">
              <span>🎉</span><span>🎊</span><span>✨</span>
            </div>
            <h2 className="text-2xl font-bold text-[#1E2D2F]">{title}</h2>
            <p className="mt-2 text-sm text-[#486668]">{description}</p>
            {place ? (
              <div className="mt-4 rounded-2xl bg-[#FDF6EC] p-4">
                <p className="text-xs uppercase tracking-wide text-[#486668]">Selected Place</p>
                <p className="mt-1 text-lg font-semibold text-[#1E2D2F]">{place.name}</p>
                <p className="text-sm text-[#486668]">{place.category} · {place.city}</p>
              </div>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              {place ? (
                <Link
                  href={`/places/${place.id}`}
                  className="rounded-xl bg-[#2D7D5A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#236346]"
                >
                  {ctaLabel}
                </Link>
              ) : null}
              <button
                onClick={onClose}
                className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#1E2D2F]"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
