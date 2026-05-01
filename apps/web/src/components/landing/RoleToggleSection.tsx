// "use client";

// import "./landingpage.css";

// import { useState } from "react";
// import {
//   AnimatePresence,
//   motion,
//   type AnimatePresenceProps,
// } from "framer-motion";

// const SafeAnimatePresence = AnimatePresence as React.FC<
//   React.PropsWithChildren<AnimatePresenceProps>
// >;
// type Role = "parent" | "child";

// interface RoleFeature {
//   id: string;
//   icon: string;
//   title: string;
//   description: string;
//   iconBg: string;
// }

// const PARENT_FEATURES: RoleFeature[] = [
//   {
//     id: "p1",
//     icon: "📊",
//     title: "Full Insights Dashboard",
//     description:
//       "Deep analytics on mood, engagement, goals, and growth trends across every child.",
//     iconBg: "rgba(124,58,237,.12)",
//   },
//   {
//     id: "p2",
//     icon: "🗳️",
//     title: "Poll Creation & Veto",
//     description:
//       "Create family polls and retain veto rights to guide decisions constructively.",
//     iconBg: "rgba(251,146,60,.12)",
//   },
//   {
//     id: "p3",
//     icon: "📝",
//     title: "Notes Management",
//     description:
//       "Private parent notes, shared family notes, and guided journaling prompts.",
//     iconBg: "rgba(52,211,153,.12)",
//   },
// ];

// const CHILD_FEATURES: RoleFeature[] = [
//   {
//     id: "c1",
//     icon: "😊",
//     title: "Mood Logging",
//     description:
//       "A safe, expressive space for kids to log how they feel each day with emoji and notes.",
//     iconBg: "rgba(252,211,77,.12)",
//   },
//   {
//     id: "c2",
//     icon: "✅",
//     title: "Check-In Participation",
//     description:
//       "Fun daily check-ins with streaks, badges, and positive reinforcement built in.",
//     iconBg: "rgba(56,189,248,.12)",
//   },
//   {
//     id: "c3",
//     icon: "🗳️",
//     title: "Voting Participation",
//     description:
//       "Kids get a real say in family decisions — their votes count just as much.",
//     iconBg: "rgba(244,114,182,.12)",
//   },
// ];

// const TABS: { value: Role; label: string; emoji: string }[] = [
//   { value: "parent", label: "Parent View", emoji: "👩‍👧" },
//   { value: "child", label: "Child View", emoji: "🧒" },
// ];

// const container = {
//   hidden: {},
//   show: { transition: { staggerChildren: 0.1 } },
// };
// const item = {
//   hidden: { opacity: 0, y: 20 },
//   show: {
//     opacity: 1,
//     y: 0,
//     transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
//   },
// };

// export default function RoleToggleSection() {
//   const [role, setRole] = useState<Role>("parent");
//   const features = role === "parent" ? PARENT_FEATURES : CHILD_FEATURES;

//   return (
//     <section className="section-shell soft">
//       <div className="max-w-7xl mx-auto">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
//         >
//           {/* <div className="section-label">
//             <span className="section-label-dot" />
//             Role-Based Features
//           </div> */}
//           <h2 className="section-heading">
//             <span className="grad">Tailored</span> for every family member
//           </h2>
//           <p className="section-sub">
//             Parents and kids each get a view designed just for them —
//             age-appropriate, safe, and purposeful.
//           </p>
//         </motion.div>

//         <div className="role-tabs">
//           {TABS.map((tab) => (
//             <button
//               key={tab.value}
//               className={`role-tab ${role === tab.value ? "active" : ""}`}
//               onClick={() => setRole(tab.value)}
//             >
//               {tab.emoji} {tab.label}
//             </button>
//           ))}
//         </div>

//         <SafeAnimatePresence mode="wait">
//           <motion.div
//             key={role}
//             className="role-grid"
//             variants={container}
//             initial="hidden"
//             animate="show"
//             exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
//           >
//             {features.map((f) => (
//               <motion.article key={f.id} className="role-card" variants={item}>
//                 <div
//                   className="role-card-icon"
//                   style={{ background: f.iconBg }}
//                 >
//                   {f.icon}
//                 </div>
//                 <div className="role-card-title">{f.title}</div>
//                 <div className="role-card-desc">{f.description}</div>
//               </motion.article>
//             ))}
//           </motion.div>
//         </SafeAnimatePresence>
//       </div>
//     </section>
//   );
// }

"use client";

import "./landingpage.css";

import { useState } from "react";
import {
  AnimatePresence,
  motion,
  type AnimatePresenceProps,
} from "framer-motion";
import {
  BarChart2,
  Vote,
  NotebookPen,
  Smile,
  CheckCircle2,
  Users,
  User,
} from "lucide-react";

const SafeAnimatePresence = AnimatePresence as React.FC<
  React.PropsWithChildren<AnimatePresenceProps>
>;
type Role = "parent" | "child";

interface RoleFeature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBg: string;
}

interface Tab {
  value: Role;
  label: string;
  icon: React.ReactNode;
}

const PARENT_FEATURES: RoleFeature[] = [
  {
    id: "p1",
    icon: <BarChart2 size={20} strokeWidth={2} />,
    title: "Full Insights Dashboard",
    description:
      "Deep analytics on mood, engagement, goals, and growth trends across every child.",
    iconBg: "rgba(124,58,237,.12)",
  },
  {
    id: "p2",
    icon: <Vote size={20} strokeWidth={2} />,
    title: "Poll Creation & Veto",
    description:
      "Create family polls and retain veto rights to guide decisions constructively.",
    iconBg: "rgba(251,146,60,.12)",
  },
  {
    id: "p3",
    icon: <NotebookPen size={20} strokeWidth={2} />,
    title: "Notes Management",
    description:
      "Private parent notes, shared family notes, and guided journaling prompts.",
    iconBg: "rgba(52,211,153,.12)",
  },
];

const CHILD_FEATURES: RoleFeature[] = [
  {
    id: "c1",
    icon: <Smile size={20} strokeWidth={2} />,
    title: "Mood Logging",
    description:
      "A safe, expressive space for kids to log how they feel each day with emoji and notes.",
    iconBg: "rgba(252,211,77,.12)",
  },
  {
    id: "c2",
    icon: <CheckCircle2 size={20} strokeWidth={2} />,
    title: "Check-In Participation",
    description:
      "Fun daily check-ins with streaks, badges, and positive reinforcement built in.",
    iconBg: "rgba(56,189,248,.12)",
  },
  {
    id: "c3",
    icon: <Vote size={20} strokeWidth={2} />,
    title: "Voting Participation",
    description:
      "Kids get a real say in family decisions — their votes count just as much.",
    iconBg: "rgba(244,114,182,.12)",
  },
];

// const TABS: Tab[] = [
//   {
//     value: "parent",
//     label: "Parent View",
//     icon: <Users size={15} strokeWidth={2} />,
//   },
//   {
//     value: "child",
//     label: "Child View",
//     icon: <User size={15} strokeWidth={2} />,
//   },
// ];

const TABS: { value: Role; label: string; emoji: string }[] = [
  { value: "parent", label: "Parent View", emoji: "👩‍👧" },
  { value: "child", label: "Child View", emoji: "🧒" },
];
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function RoleToggleSection() {
  const [role, setRole] = useState<Role>("parent");
  const features = role === "parent" ? PARENT_FEATURES : CHILD_FEATURES;

  return (
    <section className="section-shell soft">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="section-heading">
            <span className="grad">Tailored</span> for every family member
          </h2>
          <p className="section-sub">
            Parents and kids each get a view designed just for them —
            age-appropriate, safe, and purposeful.
          </p>
        </motion.div>

        <div className="role-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              className={`role-tab ${role === tab.value ? "active" : ""}`}
              onClick={() => setRole(tab.value)}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>
        <SafeAnimatePresence mode="wait">
          <motion.div
            key={role}
            className="role-grid"
            variants={container}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
          >
            {features.map((f) => (
              <motion.article key={f.id} className="role-card" variants={item}>
                <div
                  className="role-card-icon flex items-center justify-center"
                  style={{ background: f.iconBg }}
                >
                  {f.icon}
                </div>
                <div className="role-card-title">{f.title}</div>
                <div className="role-card-desc">{f.description}</div>
              </motion.article>
            ))}
          </motion.div>
        </SafeAnimatePresence>
      </div>
    </section>
  );
}
