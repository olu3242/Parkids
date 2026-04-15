'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSubscription } from '@/hooks/useSubscription';
import { PLANS } from '@/lib/stripe';

const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  premium: 'Growth',
  family_pro: 'Family Pro',
};

const TIER_BADGE: Record<string, string> = {
  free: 'bg-gray-100 text-gray-600',
  premium: 'bg-[#D6F0E4] text-[#2D7D5A]',
  family_pro: 'bg-[#D6F0F9] text-[#366B8A]',
};

interface Props {
  householdId: string;
  initialTier: string;
  initialStatus: string;
  currentPeriodEnd: string | null;
  checkoutSuccess: boolean;
}

export default function SettingsBillingClient({
  householdId,
  initialTier,
  initialStatus,
  currentPeriodEnd,
  checkoutSuccess,
}: Props) {
  const subscription = useSubscription(householdId);
  const tier = subscription.isLoading ? initialTier : subscription.tier;
  const status = subscription.isLoading ? initialStatus : subscription.status;

  const [showSuccess, setShowSuccess] = useState(checkoutSuccess);
  const [portalLoading, setPortalLoading] = useState(false);

  // Auto-dismiss success banner after 6s
  useEffect(() => {
    if (!showSuccess) return;
    const t = setTimeout(() => setShowSuccess(false), 6000);
    return () => clearTimeout(t);
  }, [showSuccess]);

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error ?? 'Something went wrong.');
        return;
      }
      if (json.url) window.location.href = json.url;
    } catch {
      alert('Could not connect. Please try again.');
    } finally {
      setPortalLoading(false);
    }
  };

  const periodEnd = subscription.currentPeriodEnd
    ? subscription.currentPeriodEnd
    : currentPeriodEnd
    ? new Date(currentPeriodEnd)
    : null;

  return (
    <div className="min-h-screen bg-[#FDF6EC] p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back link */}
        <Link href="/dashboard" className="text-sm text-[#2D7D5A] hover:underline font-medium">
          ← Back to Dashboard
        </Link>

        {/* Success banner */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="bg-[#D6F0E4] border border-[#B3E0C9] rounded-2xl p-4 flex items-start gap-3"
            >
              <span className="text-2xl">🎉</span>
              <div>
                <p className="font-semibold text-[#1E2D2F]">Payment successful!</p>
                <p className="text-sm text-[#486668]">
                  Your plan has been upgraded. Premium features are now active.
                </p>
              </div>
              <button
                onClick={() => setShowSuccess(false)}
                className="ml-auto text-[#486668] hover:text-[#1E2D2F] text-sm"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current plan card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#1E2D2F] mb-4">Billing & Plan</h2>

          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm text-[#486668] mb-1">Current plan</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-[#1E2D2F]">
                  {TIER_LABELS[tier] ?? tier}
                </span>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    TIER_BADGE[tier] ?? 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {status === 'active' ? 'Active' : status === 'cancelled' ? 'Cancelled' : status}
                </span>
              </div>
            </div>

            {tier !== 'free' && (
              <button
                onClick={openPortal}
                disabled={portalLoading}
                className="text-sm font-medium text-[#2D7D5A] hover:underline disabled:opacity-50"
              >
                {portalLoading ? 'Opening…' : 'Manage subscription →'}
              </button>
            )}
          </div>

          {periodEnd && tier !== 'free' && (
            <p className="text-xs text-[#9BB0AF] mb-5">
              {status === 'cancelled'
                ? `Access until ${periodEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                : `Next renewal ${periodEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
            </p>
          )}

          {/* Feature list for current plan */}
          {tier !== 'free' && (PLANS as any)[tier] && (
            <ul className="space-y-2 mb-5">
              {((PLANS as any)[tier].features as string[]).map((f: string) => (
                <li key={f} className="flex items-center gap-2 text-sm text-[#486668]">
                  <span className="text-[#2D7D5A]">✓</span> {f}
                </li>
              ))}
            </ul>
          )}

          {tier === 'free' && (
            <div className="bg-[#FDF6EC] rounded-2xl p-4 text-center mt-2">
              <p className="text-sm text-[#486668] mb-3">
                Unlock unlimited check-ins, polls, insights and more.
              </p>
              <Link
                href="/pricing"
                className="inline-block bg-[#2D7D5A] hover:bg-[#236346] text-white text-sm font-semibold rounded-xl px-5 py-2.5 transition-colors"
              >
                View plans & upgrade →
              </Link>
            </div>
          )}
        </div>

        {/* Invoice history placeholder */}
        {tier !== 'free' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-[#1E2D2F] mb-3">Invoice history</h3>
            <p className="text-sm text-[#486668]">
              View and download all your invoices from the{' '}
              <button
                onClick={openPortal}
                className="text-[#2D7D5A] hover:underline font-medium"
              >
                billing portal
              </button>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
