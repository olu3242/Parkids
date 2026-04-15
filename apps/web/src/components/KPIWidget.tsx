'use client';

import { motion } from 'framer-motion';

type KPIWidgetProps = {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
};

export default function KPIWidget({ label, value, delta, positive = true }: KPIWidgetProps) {
  return (
    <motion.article
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm"
    >
      <p className="text-xs uppercase tracking-wide text-[#486668]">{label}</p>
      <p className="mt-2 text-3xl font-bold text-[#1E2D2F]">{value}</p>
      {delta ? (
        <p className={`mt-2 text-sm font-medium ${positive ? 'text-[#2D7D5A]' : 'text-[#A94442]'}`}>
          {positive ? '↑' : '↓'} {delta}
        </p>
      ) : null}
    </motion.article>
  );
}
