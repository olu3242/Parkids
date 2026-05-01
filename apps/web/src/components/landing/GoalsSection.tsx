// "use client";

// import "./landingpage.css";

// import { motion } from "framer-motion";

// interface Goal {
//   id: string;
//   label: string;
//   icon: string;
//   description: string;
//   tag: string;
//   tagColor: string;
//   progress: number;
//   iconBg: string;
//   progressGradient: string;
// }

// const GOALS: Goal[] = [
//   {
//     id: "academic",
//     label: "Academic",
//     icon: "📚",
//     description:
//       "Track reading goals, homework routines, and learning milestones together.",
//     tag: "3 active",
//     tagColor: "rgba(124,58,237,.12)",
//     progress: 68,
//     iconBg: "rgba(124,58,237,.12)",
//     progressGradient: "linear-gradient(90deg, #7c3aed, #a78bfa)",
//   },
//   {
//     id: "social",
//     label: "Social",
//     icon: "🤝",
//     description:
//       "Build friendships, empathy, and communication skills at every age.",
//     tag: "2 active",
//     tagColor: "rgba(52,211,153,.12)",
//     progress: 45,
//     iconBg: "rgba(52,211,153,.12)",
//     progressGradient: "linear-gradient(90deg, #34d399, #38bdf8)",
//   },
//   {
//     id: "personal",
//     label: "Personal",
//     icon: "🌱",
//     description:
//       "Self-care habits, emotional health, and personal growth routines.",
//     tag: "5 active",
//     tagColor: "rgba(251,146,60,.12)",
//     progress: 80,
//     iconBg: "rgba(251,146,60,.12)",
//     progressGradient: "linear-gradient(90deg, #fb923c, #fcd34d)",
//   },
//   {
//     id: "family",
//     label: "Family",
//     icon: "🏡",
//     description:
//       "Shared rituals, game nights, and memories that bring everyone closer.",
//     tag: "1 active",
//     tagColor: "rgba(244,114,182,.12)",
//     progress: 30,
//     iconBg: "rgba(244,114,182,.12)",
//     progressGradient: "linear-gradient(90deg, #f472b6, #a78bfa)",
//   },
// ];

// const container = {
//   hidden: {},
//   show: { transition: { staggerChildren: 0.1 } },
// };
// const item = {
//   hidden: { opacity: 0, y: 28 },
//   show: {
//     opacity: 1,
//     y: 0,
//     transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
//   },
// };

// export default function GoalsSection() {
//   return (
//     <section id="goals" className="section-shell soft">
//       <div className="max-w-7xl mx-auto">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
//         >
//           {/* <div className="section-label">
//             <span className="section-label-dot" />
//             Goal Setting
//           </div> */}
//           <h2 className="section-heading">
//             Goals your family <span className="grad">builds together</span>
//           </h2>
//           <p className="section-sub">
//             Set meaningful goals across every dimension of your child's life and
//             celebrate every step forward.
//           </p>
//         </motion.div>

//         <motion.div
//           className="goals-grid"
//           variants={container}
//           initial="hidden"
//           whileInView="show"
//           viewport={{ once: true }}
//         >
//           {GOALS.map((goal) => (
//             <motion.article key={goal.id} className="goal-card" variants={item}>
//               <div className="goal-icon" style={{ background: goal.iconBg }}>
//                 {goal.icon}
//               </div>
//               <div className="goal-title">{goal.label}</div>
//               <div className="goal-desc">{goal.description}</div>
//               <div className="goal-progress">
//                 <div
//                   className="goal-progress-fill"
//                   style={{
//                     width: `${goal.progress}%`,
//                     background: goal.progressGradient,
//                   }}
//                 />
//               </div>
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                 }}
//               >
//                 <span
//                   className="goal-tag"
//                   style={{
//                     background: goal.tagColor,
//                     color: "var(--text-mid)",
//                   }}
//                 >
//                   {goal.tag}
//                 </span>
//                 <span
//                   style={{
//                     fontSize: ".72rem",
//                     fontWeight: 700,
//                     color: "var(--text-soft)",
//                   }}
//                 >
//                   {goal.progress}%
//                 </span>
//               </div>
//             </motion.article>
//           ))}
//         </motion.div>
//       </div>
//     </section>
//   );
// }

"use client";

import "./landingpage.css";

import { motion } from "framer-motion";
import { BookOpen, Handshake, Sprout, Hotel } from "lucide-react";

interface Goal {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  tag: string;
  tagColor: string;
  progress: number;
  iconBg: string;
  progressGradient: string;
}

const GOALS: Goal[] = [
  {
    id: "academic",
    label: "Academic",
    icon: <BookOpen size={22} strokeWidth={2} />,
    description:
      "Track reading goals, homework routines, and learning milestones together.",
    tag: "3 active",
    tagColor: "rgba(124,58,237,.12)",
    progress: 68,
    iconBg: "rgba(124,58,237,.12)",
    progressGradient: "linear-gradient(90deg, #7c3aed, #a78bfa)",
  },
  {
    id: "social",
    label: "Social",
    icon: <Handshake size={22} strokeWidth={2} />,
    description:
      "Build friendships, empathy, and communication skills at every age.",
    tag: "2 active",
    tagColor: "rgba(52,211,153,.12)",
    progress: 45,
    iconBg: "rgba(52,211,153,.12)",
    progressGradient: "linear-gradient(90deg, #34d399, #38bdf8)",
  },
  {
    id: "personal",
    label: "Personal",
    icon: <Sprout size={22} strokeWidth={2} />,
    description:
      "Self-care habits, emotional health, and personal growth routines.",
    tag: "5 active",
    tagColor: "rgba(251,146,60,.12)",
    progress: 80,
    iconBg: "rgba(251,146,60,.12)",
    progressGradient: "linear-gradient(90deg, #fb923c, #fcd34d)",
  },
  {
    id: "family",
    label: "Family",
    icon: <Hotel size={22} strokeWidth={2} />,
    description:
      "Shared rituals, game nights, and memories that bring everyone closer.",
    tag: "1 active",
    tagColor: "rgba(244,114,182,.12)",
    progress: 30,
    iconBg: "rgba(244,114,182,.12)",
    progressGradient: "linear-gradient(90deg, #f472b6, #a78bfa)",
  },
];

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

export default function GoalsSection() {
  return (
    <section id="goals" className="section-shell soft">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="section-heading">
            Goals your family <span className="grad">builds together</span>
          </h2>
          <p className="section-sub">
            Set meaningful goals across every dimension of your child's life and
            celebrate every step forward.
          </p>
        </motion.div>

        <motion.div
          className="goals-grid"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {GOALS.map((goal) => (
            <motion.article key={goal.id} className="goal-card" variants={item}>
              <div
                className="goal-icon flex items-center justify-center"
                style={{ background: goal.iconBg, color: "var(--text-mid)" }}
              >
                {goal.icon}
              </div>
              <div className="goal-title">{goal.label}</div>
              <div className="goal-desc">{goal.description}</div>
              <div className="goal-progress">
                <div
                  className="goal-progress-fill"
                  style={{
                    width: `${goal.progress}%`,
                    background: goal.progressGradient,
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  className="goal-tag"
                  style={{
                    background: goal.tagColor,
                    color: "var(--text-mid)",
                  }}
                >
                  {goal.tag}
                </span>
                <span
                  style={{
                    fontSize: ".72rem",
                    fontWeight: 700,
                    color: "var(--text-soft)",
                  }}
                >
                  {goal.progress}%
                </span>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
