"use client";

import "./landingpage.css";

import Link from "next/link";
import { motion } from "framer-motion";

interface PricingPlan {
  id: string;
  name: string;
  price_monthly_cents: number;
  feature_list: string[];
  cta_label: string;
  is_featured: boolean;
}

type Props = {
  pricingPlans: PricingPlan[];
};

function formatPrice(cents: number): string {
  if (cents === 0) return "$0";
  return `$${Math.round(cents / 100)}/mo`;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function PricingSection({ pricingPlans }: Props) {
  return (
    <section id="pricing" className="section-shell plain">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* <div className="section-label">
            <span className="section-label-dot" />
            Pricing
          </div> */}
          <h2 className="section-heading">
            A plan for <span className="grad">every family</span>
          </h2>
          <p className="section-sub">
            Start free and grow as your family does. No hidden fees, cancel
            anytime.
          </p>
        </motion.div>

        {pricingPlans.length === 0 ? (
          <p className="empty-state">No plans available yet.</p>
        ) : (
          <motion.div
            className="pricing-grid"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {pricingPlans.map((plan) => (
              <motion.article
                key={plan.id}
                className={`pricing-card-light ${
                  plan.is_featured ? "featured-light" : ""
                }`}
                variants={item}
              >
                {plan.is_featured && <div className="pricing-featured-badge" />}

                <div>
                  <div className="pricing-name-light">{plan.name}</div>
                  {plan.is_featured && (
                    <span className="pricing-popular-badge">Most Popular</span>
                  )}
                </div>

                <div>
                  <div className="pricing-price-light">
                    {formatPrice(plan.price_monthly_cents)}
                  </div>
                  {plan.price_monthly_cents > 0 && (
                    <div className="pricing-price-sub-light">
                      billed monthly · cancel anytime
                    </div>
                  )}
                </div>

                <div className="pricing-divider-light" />

                <ul className="pricing-features">
                  {plan.feature_list.map((f) => (
                    <li
                      key={`${plan.id}-${f}`}
                      className="pricing-feature-light"
                    >
                      <div className="pricing-feature-dot-light">✓</div>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/login"
                  className={`pricing-cta ${
                    plan.is_featured ? "solid" : "outline-light"
                  }`}
                >
                  {plan.cta_label}
                </Link>
              </motion.article>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
