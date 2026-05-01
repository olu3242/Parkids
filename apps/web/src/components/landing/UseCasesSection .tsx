"use client";

import { LandingUseCase } from "@/lib/landing";
import "./landingpage.css";

import { motion } from "framer-motion";

type Props = {
  useCases: LandingUseCase[];
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function UseCasesSection({ useCases }: Props) {
  return (
    <section className="section-shell plain">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* <div className="section-label">
            <span className="section-label-dot" />
            Why Families Love It
          </div> */}
          <h2 className="section-heading">
            What Families use <span className="grad">ParKids</span> For
          </h2>
          <p className="section-sub">
            Whether you're managing routines, co-parenting, or raising a
            neurodivergent child — there's a track built for you.
          </p>
        </motion.div>

        {useCases.length === 0 ? (
          <p className="empty-state">
            Use cases will appear here once configured.
          </p>
        ) : (
          <motion.div
            className="usecases-grid"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {useCases.map((uc) => (
              <motion.article
                key={uc.id}
                className="usecase-card"
                variants={item}
              >
                {/* <div className="usecase-icon" style={{ background: uc.iconBg }}>
                  {uc.icon}
                </div> */}
                <div className="usecase-title">{uc.title}</div>
                <div className="usecase-desc">{uc.description}</div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
