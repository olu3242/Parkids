'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface PremiumGateProps {
  /** Whether the user currently has premium access */
  isPremium: boolean;
  /** Plan name required: "Growth" or "Family Pro" */
  requiredPlan?: string;
  /** Content to render when unlocked */
  children: React.ReactNode;
  /** Custom upgrade CTA text */
  ctaText?: string;
}

/**
 * Wraps premium content. Renders gated overlay when not permitted.
 * Usage:
 *   <PremiumGate isPremium={subscription.isPremium}>
 *     <AdvancedAnalytics />
 *   </PremiumGate>
 */
export function PremiumGate({
  isPremium,
  requiredPlan = 'Growth',
  children,
  ctaText = 'Unlock with Growth',
}: PremiumGateProps) {
  if (isPremium) return <>{children}</>;

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Blurred preview */}
      <div className="pointer-events-none select-none blur-sm opacity-40" aria-hidden>
        {children}
      </div>

      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center"
      >
        <div className="text-3xl mb-3">🔒</div>
        <h3 className="text-base font-bold text-[#1E2D2F] mb-1">
          {requiredPlan} feature
        </h3>
        <p className="text-sm text-[#486668] mb-4 max-w-xs">
          Upgrade your plan to unlock this and all premium features.
        </p>
        <Link
          href="/pricing"
          className="inline-block bg-[#2D7D5A] hover:bg-[#236346] text-white text-sm font-semibold rounded-xl px-5 py-2.5 transition-colors"
        >
          {ctaText} →
        </Link>
      </motion.div>
    </div>
  );
}
