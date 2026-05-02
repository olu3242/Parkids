// "use client";

// import "./landingpage.css";

// import { useState, useMemo } from "react";
// import { motion } from "framer-motion";

// interface VoteOption {
//   label: string;
//   emoji: string;
//   gradient: string;
// }

// const OPTIONS: VoteOption[] = [
//   {
//     label: "Bowling",
//     emoji: "🎳",
//     gradient: "linear-gradient(135deg, #7c3aed, #a78bfa)",
//   },
//   {
//     label: "Movies",
//     emoji: "🎬",
//     gradient: "linear-gradient(135deg, #fb923c, #fcd34d)",
//   },
//   {
//     label: "Pizza Night",
//     emoji: "🍕",
//     gradient: "linear-gradient(135deg, #f472b6, #fb923c)",
//   },
// ];

// const INFO_STATS = [
//   {
//     icon: "🗳️",
//     text: "Every voice counts",
//     sub: "Kids vote too",
//     bg: "rgba(124,58,237,.1)",
//   },
//   {
//     icon: "🔔",
//     text: "Live results",
//     sub: "Updated in real-time",
//     bg: "rgba(251,146,60,.1)",
//   },
//   {
//     icon: "🏆",
//     text: "Winner announced",
//     sub: "At end of voting window",
//     bg: "rgba(52,211,153,.1)",
//   },
// ];

// export default function VotingSection() {
//   const [votes, setVotes] = useState<number[]>([3, 1, 1]);

//   const votePct = useMemo<number[]>(() => {
//     const total = votes.reduce((a, b) => a + b, 0);
//     return votes.map((v) => Math.round((v / total) * 100));
//   }, [votes]);

//   const total = votes.reduce((a, b) => a + b, 0);

//   const handleVote = (idx: number) => {
//     setVotes((prev) => prev.map((v, i) => (i === idx ? v + 1 : v)));
//   };

//   return (
//     <section id="voting" className="section-shell plain">
//       <div className="max-w-7xl mx-auto">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
//         >
//           {/* <div className="section-label">
//             <span className="section-label-dot" />
//             Family Voting
//           </div> */}
//           <h2 className="section-heading">
//             Family decisions, <span className="grad">made together</span>
//           </h2>
//           <p className="section-sub">
//             Let everyone have a say — kids included. Vote on weekend plans,
//             meals, and family activities.
//           </p>
//         </motion.div>

//         <motion.div
//           className="vote-wrap"
//           initial={{ opacity: 0, y: 24 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
//         >
//           {/* Poll card */}
//           <div className="vote-card">
//             <div style={{ marginBottom: 6 }}>
//               <div
//                 style={{
//                   fontSize: ".72rem",
//                   fontWeight: 700,
//                   color: "var(--text-soft)",
//                   textTransform: "uppercase",
//                   letterSpacing: ".06em",
//                   marginBottom: 4,
//                 }}
//               >
//                 This weekend, let's go…
//               </div>
//               <div
//                 style={{
//                   fontSize: ".78rem",
//                   color: "var(--text-mid)",
//                   fontWeight: 600,
//                 }}
//               >
//                 Click to cast your vote 👇
//               </div>
//             </div>

//             {OPTIONS.map((opt, idx) => (
//               <button
//                 key={opt.label}
//                 className="vote-btn"
//                 onClick={() => handleVote(idx)}
//               >
//                 <div className="vote-emoji">{opt.emoji}</div>
//                 <div className="vote-bar-outer">
//                   <div
//                     className="vote-bar-inner"
//                     style={{
//                       width: `${votePct[idx]}%`,
//                       background: opt.gradient,
//                     }}
//                   >
//                     <span className="vote-label">{opt.label}</span>
//                     <span className="vote-pct">{votePct[idx]}%</span>
//                   </div>
//                 </div>
//               </button>
//             ))}

//             <div className="vote-total">{total} votes cast</div>
//           </div>

//           {/* Info card */}
//           <div className="vote-info-card">
//             <div className="vote-info-title">
//               Everyone gets a vote, even the little ones 🗳️
//             </div>
//             <div className="vote-info-desc">
//               Family decisions feel better when everyone participates.
//               Parent-Kids makes it easy to run quick polls, see live results,
//               and let the whole family weigh in.
//             </div>
//             <div
//               style={{
//                 display: "flex",
//                 flexDirection: "column",
//                 gap: 10,
//                 marginTop: 8,
//               }}
//             >
//               {INFO_STATS.map((s) => (
//                 <div key={s.text} className="vote-info-stat">
//                   <div
//                     className="vote-info-stat-icon"
//                     style={{ background: s.bg }}
//                   >
//                     {s.icon}
//                   </div>
//                   <div>
//                     <div className="vote-info-stat-text">{s.text}</div>
//                     <div className="vote-info-stat-sub">{s.sub}</div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </section>
//   );
// }

"use client";

import "./landingpage.css";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Disc3,
  Clapperboard,
  Pizza,
  Vote,
  Bell,
  Trophy,
  ChevronDown,
} from "lucide-react";

interface VoteOption {
  label: string;
  icon: React.ReactNode;
  gradient: string;
}

interface InfoStat {
  icon: React.ReactNode;
  text: string;
  sub: string;
  bg: string;
}

const OPTIONS: VoteOption[] = [
  {
    label: "Bowling",
    icon: <Disc3 size={24} strokeWidth={2} />,
    gradient: "linear-gradient(135deg, #7c3aed, #a78bfa)",
  },
  {
    label: "Movies",
    icon: <Clapperboard size={24} strokeWidth={2} />,
    gradient: "linear-gradient(135deg, #fb923c, #fcd34d)",
  },
  {
    label: "Pizza Night",
    icon: <Pizza size={24} strokeWidth={2} />,
    gradient: "linear-gradient(135deg, #f472b6, #fb923c)",
  },
];

const INFO_STATS: InfoStat[] = [
  {
    icon: <Vote size={18} strokeWidth={2} />,
    text: "Every voice counts",
    sub: "Kids vote too",
    bg: "rgba(124,58,237,.1)",
  },
  {
    icon: <Bell size={18} strokeWidth={2} />,
    text: "Live results",
    sub: "Updated in real-time",
    bg: "rgba(251,146,60,.1)",
  },
  {
    icon: <Trophy size={18} strokeWidth={2} />,
    text: "Winner announced",
    sub: "At end of voting window",
    bg: "rgba(52,211,153,.1)",
  },
];

export default function VotingSection() {
  const [votes, setVotes] = useState<number[]>([3, 1, 1]);

  const votePct = useMemo<number[]>(() => {
    const total = votes.reduce((a, b) => a + b, 0);
    return votes.map((v) => Math.round((v / total) * 100));
  }, [votes]);

  const total = votes.reduce((a, b) => a + b, 0);

  const handleVote = (idx: number) => {
    setVotes((prev) => prev.map((v, i) => (i === idx ? v + 1 : v)));
  };

  return (
    <section id="voting" className="section-shell plain">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="section-heading">
            Family decisions, <span className="grad">made together</span>
          </h2>
          <p className="section-sub">
            Let everyone have a say — kids included. Vote on weekend plans,
            meals, and family activities.
          </p>
        </motion.div>

        <motion.div
          className="vote-wrap"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Poll card */}
          <div className="vote-card">
            <div style={{ marginBottom: 6 }}>
              <div
                style={{
                  fontSize: ".72rem",
                  fontWeight: 700,
                  color: "var(--text-soft)",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: 4,
                }}
              >
                This weekend, let's go…
              </div>
              <div
                style={{
                  fontSize: ".78rem",
                  color: "var(--text-mid)",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                Click to cast your vote
                <ChevronDown size={14} strokeWidth={2.5} />
              </div>
            </div>

            {OPTIONS.map((opt, idx) => (
              <button
                key={opt.label}
                className="vote-btn"
                onClick={() => handleVote(idx)}
              >
                <div className="vote-emoji flex items-center justify-center">
                  {opt.icon}
                </div>
                <div className="vote-bar-outer">
                  <div
                    className="vote-bar-inner"
                    style={{
                      width: `${votePct[idx]}%`,
                      background: opt.gradient,
                    }}
                  >
                    <span className="vote-label">{opt.label}</span>
                    <span className="vote-pct">{votePct[idx]}%</span>
                  </div>
                </div>
              </button>
            ))}

            <div className="vote-total">{total} votes cast</div>
          </div>

          {/* Info card */}
          <div className="vote-info-card">
            <div className="vote-info-title flex items-center gap-2">
              <Vote size={24} strokeWidth={2} className="shrink-0" />
              Everyone gets a vote, even the little ones
            </div>
            <div className="vote-info-desc">
              Family decisions feel better when everyone participates.
              Parent-Kids makes it easy to run quick polls, see live results,
              and let the whole family weigh in.
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginTop: 8,
              }}
            >
              {INFO_STATS.map((s) => (
                <div key={s.text} className="vote-info-stat">
                  <div
                    className="vote-info-stat-icon flex items-center justify-center"
                    style={{ background: s.bg }}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <div className="vote-info-stat-text">{s.text}</div>
                    <div className="vote-info-stat-sub">{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
