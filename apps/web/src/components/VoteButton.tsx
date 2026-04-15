'use client';

import { motion } from 'framer-motion';

type VoteButtonProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export default function VoteButton({ label, selected = false, disabled = false, onClick }: VoteButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
        selected
          ? 'border-[#2D7D5A] bg-[#F0FBF4] text-[#2D7D5A]'
          : 'border-[#E5E7EB] bg-white text-[#1E2D2F] hover:border-[#3ABFBF]'
      } ${disabled ? 'cursor-not-allowed opacity-70' : ''}`}
    >
      {label}
    </motion.button>
  );
}
