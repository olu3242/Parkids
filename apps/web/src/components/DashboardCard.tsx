'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

type DashboardCardProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
};

export default function DashboardCard({ title, subtitle, action, children }: DashboardCardProps) {
  return (
    <motion.section
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 250, damping: 22 }}
      className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm"
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[#1E2D2F]">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-[#486668]">{subtitle}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </header>
      {children}
    </motion.section>
  );
}
