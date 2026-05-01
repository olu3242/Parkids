"use client";
import "./landingpage.css";

import { motion } from "framer-motion";

interface Metric {
  id: string;
  icon: string;
  value: string;
  label: string;
  change: string;
  trend: "up" | "down";
  iconBg: string;
  valueBg: string;
}

const METRICS: Metric[] = [
  {
    id: "checkin",
    icon: "✅",
    value: "87%",
    label: "Check-In Completion",
    change: "↑ 12% this week",
    trend: "up",
    iconBg: "rgba(52,211,153,.15)",
    valueBg: "linear-gradient(135deg, #2d1b69, #7c3aed)",
  },
  {
    id: "mood",
    icon: "😊",
    value: "Positive",
    label: "Mood Trend",
    change: "↑ 3 day streak",
    trend: "up",
    iconBg: "rgba(252,211,77,.18)",
    valueBg: "linear-gradient(135deg, #7c3aed, #fb923c)",
  },
  {
    id: "goals",
    icon: "🏆",
    value: "14",
    label: "Goals Completed",
    change: "↑ 4 this month",
    trend: "up",
    iconBg: "rgba(167,139,250,.18)",
    valueBg: "linear-gradient(135deg, #fb923c, #f472b6)",
  },
];

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

export default function InsightsSection() {
  return (
    <section id="insights" className="section-shell soft">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* <div className="section-label">
            <span className="section-label-dot" />
            Family Insights
          </div> */}
          <h2 className="section-heading">
            Data that helps your family <span className="grad">grow</span>
          </h2>
          <p className="section-sub">
            Beautiful, real-time insights across mood, goals, and engagement —
            so you always know how your family is doing.
          </p>
        </motion.div>

        <motion.div
          className="insights-grid"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {METRICS.map((m) => (
            <motion.article
              key={m.id}
              className="insight-card-light"
              variants={item}
            >
              <div
                className="insight-icon-light"
                style={{ background: m.iconBg }}
              >
                {m.icon}
              </div>
              <div
                className="insight-value-light"
                style={{
                  background: m.valueBg,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {m.value}
              </div>
              <div className="insight-label-light">{m.label}</div>
              <div className={`insight-change ${m.trend}`}>{m.change}</div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
