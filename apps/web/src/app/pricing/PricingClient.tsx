'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PLANS } from '@/lib/stripe';

const FREE_FEATURES = [
  '1 parent account',
  'Up to 2 children',
  'Basic weekly check-ins',
  'Goal tracking',
  'Family voting (limited)',
];

function PlanCard({
  name,
  price,
  interval,
  features,
  tier,
  isCurrent,
  isHighlighted,
}: {
  name: string;
  price: number;
  interval: string;
  features: readonly string[];
  tier: string;
  isCurrent: boolean;
  isHighlighted: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpgrade = async () => {
    if (isCurrent) return;
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error ?? 'Something went wrong. Please try again.');
        return;
      }
      if (json.url) {
        window.location.href = json.url;
      }
    } catch {
      alert('Could not connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`relative rounded-3xl p-8 flex flex-col ${
        isHighlighted
          ? 'bg-[#2D7D5A] text-white shadow-xl shadow-green-200'
          : 'bg-white border border-gray-100 shadow-sm'
      }`}
    >
      {isHighlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#3ABFBF] text-white text-xs font-bold px-4 py-1 rounded-full">
          Most Popular
        </span>
      )}

      <div className="mb-6">
        <h3
          className={`text-lg font-bold mb-1 ${
            isHighlighted ? 'text-white' : 'text-[#1E2D2F]'
          }`}
        >
          {name}
        </h3>
        <div className="flex items-end gap-1">
          <span
            className={`text-4xl font-extrabold ${
              isHighlighted ? 'text-white' : 'text-[#1E2D2F]'
            }`}
          >
            ${price}
          </span>
          <span
            className={`text-sm mb-1.5 ${
              isHighlighted ? 'text-green-100' : 'text-[#486668]'
            }`}
          >
            /{interval}
          </span>
        </div>
      </div>

      <ul className="space-y-3 flex-1 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <span
              className={`mt-0.5 flex-shrink-0 ${
                isHighlighted ? 'text-green-200' : 'text-[#2D7D5A]'
              }`}
            >
              ✓
            </span>
            <span className={isHighlighted ? 'text-green-50' : 'text-[#486668]'}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleUpgrade}
        disabled={isCurrent || loading}
        className={`w-full rounded-2xl py-3.5 font-semibold text-sm transition-colors disabled:opacity-60 ${
          isCurrent
            ? isHighlighted
              ? 'bg-white/20 text-white cursor-default'
              : 'bg-gray-100 text-[#486668] cursor-default'
            : isHighlighted
            ? 'bg-white text-[#2D7D5A] hover:bg-green-50'
            : 'bg-[#2D7D5A] text-white hover:bg-[#236346]'
        }`}
      >
        {loading
          ? 'Redirecting…'
          : isCurrent
          ? 'Current Plan'
          : 'Upgrade Now →'}
      </button>
    </motion.div>
  );
}

interface PricingClientProps {
  currentTier: string;
}

export default function PricingClient({ currentTier }: PricingClientProps) {
  return (
    <div className="min-h-screen bg-[#FDF6EC] py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-extrabold text-[#1E2D2F] mb-4">
            Simple, honest pricing
          </h1>
          <p className="text-[#486668] text-lg max-w-xl mx-auto">
            Start free. Upgrade when your family needs more. Cancel anytime — no fine print.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Free */}
          <PlanCard
            name="Free"
            price={0}
            interval="month"
            features={FREE_FEATURES}
            tier="free"
            isCurrent={currentTier === 'free'}
            isHighlighted={false}
          />

          {/* Growth (premium) */}
          <PlanCard
            name={PLANS.premium.name}
            price={PLANS.premium.price}
            interval={PLANS.premium.interval}
            features={PLANS.premium.features}
            tier="premium"
            isCurrent={currentTier === 'premium'}
            isHighlighted={true}
          />

          {/* Family Pro */}
          <PlanCard
            name={PLANS.family_pro.name}
            price={PLANS.family_pro.price}
            interval={PLANS.family_pro.interval}
            features={PLANS.family_pro.features}
            tier="family_pro"
            isCurrent={currentTier === 'family_pro'}
            isHighlighted={false}
          />
        </div>

        {/* Trust signals */}
        <div className="mt-12 text-center">
          <p className="text-sm text-[#9BB0AF] mb-4">
            Secured by Stripe · 30-day money-back guarantee · Cancel any time
          </p>
          <div className="flex items-center justify-center gap-8 text-[#9BB0AF]">
            {['🔒 256-bit encryption', '💳 All major cards', '🔄 Cancel anytime'].map((item) => (
              <span key={item} className="text-xs font-medium">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
