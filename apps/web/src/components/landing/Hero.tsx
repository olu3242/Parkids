"use client";

import "./landingpage.css";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  type AnimatePresenceProps,
} from "framer-motion";

const SafeAnimatePresence = AnimatePresence as React.FC<
  React.PropsWithChildren<AnimatePresenceProps>
>;

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&h=600&fit=crop",
    sector: "Family Moments",
    protocol: "Daily Check-In",
  },
  {
    image:
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&h=600&fit=crop",
    sector: "Child Development",
    protocol: "Growth Tracking",
  },
  {
    image:
      "https://images.unsplash.com/photo-1571210862729-78a52d3779a2?w=800&h=600&fit=crop",
    sector: "Learning Together",
    protocol: "Academic Goals",
  },
];
export default function Hero() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000); // Changes every 5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero">
      <div className="blobs">
        <div className="blob b1"></div>
        <div className="blob b2"></div>
        <div className="blob b3"></div>
      </div>
      <div className="hero-inner">
        <div className="hc">
          <h1>
            Where <span className="grad">Families</span> Grow,
            <span
              style={{
                fontStyle: "italic",
                fontFamily: "Fraunces",
                fontWeight: 400,
              }}
            >
              {" "}
              Together.
            </span>
          </h1>
          <p>
            ParKids brings structure through check-ins, shared goals, family
            decision-making, and real-time insights.
          </p>
          <div className="hbtns">
            <a href="#" className="btn-p">
              Get Started Free →
            </a>
            <a href="#features" className="btn-g">
              ▶ See How It Works
            </a>
          </div>
          <div className="htrust">
            <div className="avs">
              <div
                className="av"
                style={{
                  background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
                }}
              >
                M
              </div>
              <div
                className="av"
                style={{
                  background: "linear-gradient(135deg,#fb923c,#fcd34d)",
                }}
              >
                S
              </div>
              <div
                className="av"
                style={{
                  background: "linear-gradient(135deg,#34d399,#38bdf8)",
                }}
              >
                J
              </div>
              <div
                className="av"
                style={{
                  background: "linear-gradient(135deg,#f472b6,#7c3aed)",
                }}
              >
                K
              </div>
            </div>
            <span className="tt">
              <strong>14,000+</strong> active families
            </span>
            <div className="tsep"></div>
            <div className="sr">
              <span className="stars">★★★★★</span>
              <span className="stxt">
                <strong>4.9</strong> · 3,200+ reviews
              </span>
            </div>
          </div>
        </div>

        <div className="hv relative h-[500px] md:h-[500px] w-full">
          <SafeAnimatePresence mode="wait">
            <motion.div
              key={current} // Key ensures animation runs on state change
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 1.05, x: -20 }}
              transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="absolute inset-0"
            >
              {/* Main Image Card */}
              <div className="relative h-full border-2 border-slate-900 bg-slate-900 p-2 overflow-hidden shadow-2xl group">
                <div className="relative h-full overflow-hidden">
                  <img
                    src={slides[current].image}
                    alt={slides[current].sector}
                    className="w-full h-full object-cover opacity-60 group-hover:grayscale group-hover:opacity-100 transition-all duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                </div>
              </div>
            </motion.div>
          </SafeAnimatePresence>
        </div>
      </div>
    </div>
  );
}
