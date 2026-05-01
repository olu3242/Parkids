"use client";

import "./landingpage.css";

import { useState } from "react";

import {
  AnimatePresence,
  motion,
  type AnimatePresenceProps,
} from "framer-motion";

const SafeAnimatePresence = AnimatePresence as React.FC<
  React.PropsWithChildren<AnimatePresenceProps>
>;

interface LandingFaq {
  id: string;
  question: string;
  answer: string;
}

type Props = {
  faqs: LandingFaq[];
};

export default function FaqSection({ faqs }: Props) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <section id="faq" className="section-shell plain">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: "center" }}
        >
          {/* <div className="section-label" style={{ margin: "0 auto 18px" }}>
            <span className="section-label-dot" />
            FAQ
          </div> */}
          <h2 className="section-heading">
            Frequently asked <span className="grad">questions</span>
          </h2>
          <p
            className="section-sub"
            style={{ margin: "0 auto 52px", textAlign: "center" }}
          >
            Everything you need to know before getting started.
          </p>
        </motion.div>

        {faqs.length === 0 ? (
          <p className="empty-state">No FAQs published yet.</p>
        ) : (
          <motion.div
            className="faq-list"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.65,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {faqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <article
                  key={faq.id}
                  className={`faq-item ${isOpen ? "open" : ""}`}
                >
                  <button
                    className="faq-trigger"
                    onClick={() => toggle(faq.id)}
                  >
                    <span className="faq-question">{faq.question}</span>
                    <span className="faq-icon">+</span>
                  </button>
                  <SafeAnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        style={{ overflow: "hidden" }}
                      >
                        <p className="faq-answer">{faq.answer}</p>
                      </motion.div>
                    )}
                  </SafeAnimatePresence>
                </article>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
