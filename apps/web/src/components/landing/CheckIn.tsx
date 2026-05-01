// "use client";

// import "./landingpage.css";

// import { useEffect, useRef, useState } from "react";

// export default function CheckIn() {
//   const moods = [
//     ["😊", "Happy"],
//     ["😔", "Sad"],
//     ["😤", "Angry"],
//     ["😰", "Worried"],
//     ["🤩", "Excited"],
//     ["😴", "Tired"],
//     ["😌", "Calm"],
//     ["🥰", "Loved"],
//   ];
//   const [sel, setSel] = useState(0);
//   const [logged, setLogged] = useState(false);
//   const [note, setNote] = useState("");

//   const handleLog = () => {
//     setLogged(true);
//     setTimeout(() => setLogged(false), 2200);
//   };

//   return (
//     <section
//       id="checkin"
//       className="px-[5%] py-16 relative"
//       style={{
//         background:
//           "radial-gradient(ellipse 70% 60% at 50% 30%,rgba(167,139,250,.14) 0%,transparent 60%),radial-gradient(ellipse 50% 40% at 80% 80%,rgba(251,146,60,.10) 0%,transparent 50%),linear-gradient(180deg,#fdfbff 0%,rgba(237,233,254,.4) 60%,#fdfbff 100%)",
//       }}
//     >
//       <div className="blobs">
//         <div className="blob b5"></div>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
//         <FadeIn>
//           <SLabel>Daily Check-In</SLabel>
//           <h2
//             className="text-4xl md:text-5xl font-black leading-tight tracking-tight text-[#1a0f3a] mb-5"
//             style={{ fontFamily: "'Fraunces', serif" }}
//           >
//             How Is Your <span className="grad">Child</span>
//             <br />
//             Feeling <span className="font-normal italic">Today?</span>
//           </h2>
//           <p className="text-[1.05rem] text-[#4b3d6e] leading-7 max-w-lg mb-7 font-medium">
//             A 60-second daily check-in helps you spot emotional patterns, open
//             conversations, and show up for your child when it matters most.
//           </p>
//           <div className="flex flex-wrap gap-1.5">
//             {[
//               "🔍 Spots patterns early",
//               "💬 Opens dialogue",
//               "📊 Weekly mood reports",
//               "🧠 AI-powered insights",
//             ].map((t) => (
//               <span
//                 key={t}
//                 className="px-3.5 py-1.5 rounded-full text-[.7rem] font-bold text-[#5b21b6]"
//                 style={{
//                   background: "rgba(167,139,250,.15)",
//                   border: "1px solid rgba(124,58,237,.18)",
//                 }}
//               >
//                 {t}
//               </span>
//             ))}
//           </div>
//         </FadeIn>

//         <FadeIn delay={200}>
//           <div
//             className="rounded-[28px] p-4 md:p-8"
//             style={{
//               background: "rgba(255,255,255,.85)",
//               backdropFilter: "blur(22px)",
//               border: "1.5px solid rgba(255,255,255,.95)",
//               boxShadow: "0 16px 56px rgba(92,33,182,.10)",
//             }}
//           >
//             <div
//               className="text-[1.12rem] font-extrabold text-[#1a0f3a] mb-1"
//               style={{ fontFamily: "'Fraunces', serif" }}
//             >
//               Emma's Daily Check-In
//             </div>
//             <div className="text-[.78rem] text-[#7c6fa0] font-semibold mb-5">
//               How is Emma feeling today? (Age 8)
//             </div>
//             <div className="grid grid-cols-4 gap-2 mb-5">
//               {moods.map(([e, l], i) => (
//                 <button
//                   key={l}
//                   onClick={() => setSel(i)}
//                   className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:scale-105"
//                   style={{
//                     background:
//                       sel === i
//                         ? "rgba(124,58,237,.12)"
//                         : "rgba(124,58,237,.05)",
//                     border:
//                       sel === i ? "2px solid #7c3aed" : "2px solid transparent",
//                     boxShadow:
//                       sel === i ? "0 4px 14px rgba(124,58,237,.2)" : "none",
//                     fontFamily: "'Nunito', sans-serif",
//                   }}
//                 >
//                   <span className="text-2xl">{e}</span>
//                   <span className="text-[.63rem] font-bold text-[#4b3d6e]">
//                     {l}
//                   </span>
//                 </button>
//               ))}
//             </div>
//             <div className="flex gap-2 w-full mb-3.5">
//               <input
//                 className="flex-1 min-w-0 px-4 py-3 rounded-[13px] text-[.85rem] text-[#1a0f3a] outline-none transition-all"
//                 style={{
//                   border: "2px solid rgba(124,58,237,.18)",
//                   background: "rgba(255,255,255,.7)",
//                   fontFamily: "'Nunito', sans-serif",
//                 }}
//                 placeholder="Any notes for today?"
//                 value={note}
//                 onChange={(e) => setNote(e.target.value)}
//                 onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
//                 onBlur={(e) =>
//                   (e.target.style.borderColor = "rgba(124,58,237,.18)")
//                 }
//               />
//               <button
//                 onClick={handleLog}
//                 className="px-4 py-3 shrink-0 whitespace-nowrap rounded-[13px] text-white text-[.85rem] font-extrabold border-none cursor-pointer transition-all hover:-translate-y-0.5 hover:scale-105"
//                 style={{
//                   background: logged
//                     ? "linear-gradient(135deg,#059669,#34d399)"
//                     : "linear-gradient(135deg,#7c3aed,#f472b6)",
//                   boxShadow: "0 4px 16px rgba(124,58,237,.28)",
//                   fontFamily: "'Nunito', sans-serif",
//                 }}
//               >
//                 {logged ? "✓ Logged!" : "Log It ✓"}
//               </button>
//             </div>
//             <span
//               className="px-3.5 py-1.5 rounded-full text-[.7rem] font-bold text-[#5b21b6]"
//               style={{
//                 background: "rgba(167,139,250,.15)",
//                 border: "1px solid rgba(124,58,237,.18)",
//               }}
//             >
//               💡 AI tip ready after logging
//             </span>
//           </div>
//         </FadeIn>
//       </div>
//     </section>
//   );
// }

// function useInView(
//   threshold = 0.1
// ): [React.RefObject<HTMLDivElement>, boolean] {
//   const ref = useRef<HTMLDivElement>(null);
//   const [visible, setVisible] = useState(false);

//   useEffect(() => {
//     const obs = new IntersectionObserver(
//       ([e]) => {
//         if (e.isIntersecting) {
//           setVisible(true);
//           obs.disconnect();
//         }
//       },
//       {
//         threshold,
//         rootMargin: "0px 0px -40px 0px",
//       }
//     );

//     if (ref.current) obs.observe(ref.current);

//     return () => obs.disconnect();
//   }, [threshold]);

//   return [ref, visible];
// }

// function FadeIn({
//   children,
//   delay = 0,
//   className = "",
// }: {
//   children: React.ReactNode;
//   delay?: number;
//   className?: string;
// }) {
//   const [ref, visible] = useInView();
//   return (
//     <div
//       ref={ref}
//       className={className}
//       style={{
//         opacity: visible ? 1 : 0,
//         transform: visible ? "translateY(0)" : "translateY(28px)",
//         transition: `opacity 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms`,
//       }}
//     >
//       {children}
//     </div>
//   );
// }

// function SLabel({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="inline-flex items-center gap-1.5 text-[.72rem] font-extrabold uppercase tracking-widest text-[#7c3aed] mb-3.5">
//       {children}
//     </div>
//   );
// }

"use client";

import "./landingpage.css";

import { useEffect, useRef, useState } from "react";
import {
  Smile,
  Frown,
  Angry,
  CloudRain,
  Zap,
  Moon,
  Leaf,
  Heart,
  Search,
  MessageCircle,
  BarChart2,
  Brain,
  Check,
  Lightbulb,
} from "lucide-react";

export default function CheckIn() {
  const moods: [React.ReactNode, string][] = [
    [<Smile size={24} strokeWidth={2} />, "Happy"],
    [<Frown size={24} strokeWidth={2} />, "Sad"],
    [<Angry size={24} strokeWidth={2} />, "Angry"],
    [<CloudRain size={24} strokeWidth={2} />, "Worried"],
    [<Zap size={24} strokeWidth={2} />, "Excited"],
    [<Moon size={24} strokeWidth={2} />, "Tired"],
    [<Leaf size={24} strokeWidth={2} />, "Calm"],
    [<Heart size={24} strokeWidth={2} />, "Loved"],
  ];

  const featureBadges: [React.ReactNode, string][] = [
    [<Search size={11} />, "Spots patterns early"],
    [<MessageCircle size={11} />, "Opens dialogue"],
    [<BarChart2 size={11} />, "Weekly mood reports"],
    [<Brain size={11} />, "AI-powered insights"],
  ];

  const [sel, setSel] = useState(0);
  const [logged, setLogged] = useState(false);
  const [note, setNote] = useState("");

  const handleLog = () => {
    setLogged(true);
    setTimeout(() => setLogged(false), 2200);
  };

  return (
    <section
      id="checkin"
      className="px-[5%] py-16 relative"
      style={{
        background:
          "radial-gradient(ellipse 70% 60% at 50% 30%,rgba(167,139,250,.14) 0%,transparent 60%),radial-gradient(ellipse 50% 40% at 80% 80%,rgba(251,146,60,.10) 0%,transparent 50%),linear-gradient(180deg,#fdfbff 0%,rgba(237,233,254,.4) 60%,#fdfbff 100%)",
      }}
    >
      <div className="blobs">
        <div className="blob b5"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <FadeIn>
          <SLabel>Daily Check-In</SLabel>
          <h2
            className="text-4xl md:text-5xl font-black leading-tight tracking-tight text-[#1a0f3a] mb-5"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            How Is Your <span className="grad">Child</span>
            <br />
            Feeling <span className="font-normal italic">Today?</span>
          </h2>
          <p className="text-[1.05rem] text-[#4b3d6e] leading-7 max-w-lg mb-7 font-medium">
            A 60-second daily check-in helps you spot emotional patterns, open
            conversations, and show up for your child when it matters most.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {featureBadges.map(([icon, label]) => (
              <span
                key={label}
                className="px-3.5 py-1.5 rounded-full text-[.7rem] font-bold text-[#5b21b6] flex items-center gap-1.5"
                style={{
                  background: "rgba(167,139,250,.15)",
                  border: "1px solid rgba(124,58,237,.18)",
                }}
              >
                <span className="text-[#7c3aed]">{icon}</span>
                {label}
              </span>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <div
            className="rounded-[28px] p-4 md:p-8"
            style={{
              background: "rgba(255,255,255,.85)",
              backdropFilter: "blur(22px)",
              border: "1.5px solid rgba(255,255,255,.95)",
              boxShadow: "0 16px 56px rgba(92,33,182,.10)",
            }}
          >
            <div
              className="text-[1.12rem] font-extrabold text-[#1a0f3a] mb-1"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Emma's Daily Check-In
            </div>
            <div className="text-[.78rem] text-[#7c6fa0] font-semibold mb-5">
              How is Emma feeling today? (Age 8)
            </div>
            <div className="grid grid-cols-4 gap-2 mb-5">
              {moods.map(([icon, label], i) => (
                <button
                  key={label}
                  onClick={() => setSel(i)}
                  className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:scale-105"
                  style={{
                    background:
                      sel === i
                        ? "rgba(124,58,237,.12)"
                        : "rgba(124,58,237,.05)",
                    border:
                      sel === i ? "2px solid #7c3aed" : "2px solid transparent",
                    boxShadow:
                      sel === i ? "0 4px 14px rgba(124,58,237,.2)" : "none",
                    fontFamily: "'Nunito', sans-serif",
                    color: sel === i ? "#7c3aed" : "#4b3d6e",
                  }}
                >
                  <span>{icon}</span>
                  <span className="text-[.63rem] font-bold text-[#4b3d6e]">
                    {label}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex gap-2 w-full mb-3.5">
              <input
                className="flex-1 min-w-0 px-4 py-3 rounded-[13px] text-[.85rem] text-[#1a0f3a] outline-none transition-all"
                style={{
                  border: "2px solid rgba(124,58,237,.18)",
                  background: "rgba(255,255,255,.7)",
                  fontFamily: "'Nunito', sans-serif",
                }}
                placeholder="Any notes for today?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(124,58,237,.18)")
                }
              />
              <button
                onClick={handleLog}
                className="px-4 py-3 shrink-0 whitespace-nowrap rounded-[13px] text-white text-[.85rem] font-extrabold border-none cursor-pointer transition-all hover:-translate-y-0.5 hover:scale-105 flex items-center gap-1.5"
                style={{
                  background: logged
                    ? "linear-gradient(135deg,#059669,#34d399)"
                    : "linear-gradient(135deg,#7c3aed,#f472b6)",
                  boxShadow: "0 4px 16px rgba(124,58,237,.28)",
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                <Check size={15} strokeWidth={3} />
                {logged ? "Logged!" : "Log It"}
              </button>
            </div>
            <span
              className="px-3.5 py-1.5 rounded-full text-[.7rem] font-bold text-[#5b21b6] flex items-center gap-1.5 w-fit"
              style={{
                background: "rgba(167,139,250,.15)",
                border: "1px solid rgba(124,58,237,.18)",
              }}
            >
              <Lightbulb size={11} className="text-[#7c3aed]" />
              AI tip ready after logging
            </span>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function useInView(
  threshold = 0.1
): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    if (ref.current) obs.observe(ref.current);

    return () => obs.disconnect();
  }, [threshold]);

  return [ref, visible];
}

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function SLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1.5 text-[.72rem] font-extrabold uppercase tracking-widest text-[#7c3aed] mb-3.5">
      {children}
    </div>
  );
}
