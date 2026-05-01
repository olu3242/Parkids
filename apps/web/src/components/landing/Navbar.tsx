"use client";

import { Logo } from "./logo";
import "./landingpage.css";

import { useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className={`pk-mobile ${mobileOpen ? "open" : ""}`}>
        <div
          className="pk-mobile-backdrop"
          onClick={() => setMobileOpen(false)}
        />

        <aside className="pk-mobile-panel">
          <button
            className="pk-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>

          <div className="pk-mobile-links">
            <a href="#checkin" onClick={() => setMobileOpen(false)}>
              Check-In
            </a>

            <a href="#goals" onClick={() => setMobileOpen(false)}>
              Goals
            </a>

            <a href="#insights" onClick={() => setMobileOpen(false)}>
              Insights
            </a>

            <a href="#pricing" onClick={() => setMobileOpen(false)}>
              Pricing
            </a>

            <a href="#faq" onClick={() => setMobileOpen(false)}>
              FAQ
            </a>
            <div className="space-y-5 flex flex-col w-2/3 md:w-1/2">
              <a href="/login" className="nctb">
                Log In
              </a>
              <a href="/login" className="ncta">
                Get Started
              </a>
            </div>
          </div>
        </aside>
      </div>

      <nav className="pk-nav">
        <Logo />
        <div className="flex gap-2">
          <ul className="nav-links hidden lg:flex items-center">
            <li>
              <a href="#checkin">Check-In</a>
            </li>
            <li>
              {" "}
              <a href="#goals">Goals</a>
            </li>
            <li>
              <a href="#voting">Decisions</a>
            </li>
            <li>
              {" "}
              <a href="#insights">Insights</a>
            </li>
            <li>
              {" "}
              <a href="#pricing">Pricing</a>
            </li>
            <li>
              <a href="#faq">FAQ</a>
            </li>
            <div className="nav-actions">
              <li>
                <a href="/login" className="nctb">
                  Log In
                </a>
              </li>
              <li>
                <a href="/login" className="ncta">
                  Get Started
                </a>
              </li>
            </div>
          </ul>
          <button className="burger" onClick={() => setMobileOpen(true)}>
            <div className="space-y-2">
              <div className="w-5 h-0.5 bg-[var(--purple)]" />
              <div className="w-5 h-0.5 bg-[var(--purple)]" />
            </div>
          </button>
        </div>
      </nav>
    </>
  );
}
