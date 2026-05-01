"use client";

import "./landingpage.css";
import { useEffect, useState } from "react";

import type {
  LandingFaq,
  LandingGalleryItem,
  LandingMetric,
  LandingPricingPlan,
  LandingUseCase,
} from "@/lib/landing";

import GoalsSection from "./GoalsSection";
import VotingSection from "./VotingSection";
// import InsightsSection from "./InsightsSection";
import GallerySection from "./GallerySection";
import RoleToggleSection from "./RoleToggleSection";

import PricingSection from "./PricingSection";
import FaqSection from "./FaqSection";
import UseCasesSection from "./UseCasesSection ";
import { LiveChatWidget } from "./LiveChatWidget";
import Hero from "./Hero";
import Navbar from "./Navbar";
import CheckIn from "./CheckIn";
import { LogoFooter } from "./logo";

type Props = {
  metric: LandingMetric;
  pricingPlans: LandingPricingPlan[];
  faqs: LandingFaq[];
  useCases: LandingUseCase[];
  galleryItems: LandingGalleryItem[];
};

export default function LandingPageClient({
  metric,
  pricingPlans,
  faqs,
  useCases,
  galleryItems,
}: Props) {
  // const [mobileOpen, setMobileOpen] = useState(false);
  // const [selectedMood, setSelectedMood] = useState(1);
  const [openFaq, setOpenFaq] = useState<string | null>(faqs[0]?.id ?? null);
  // const [role, setRole] = useState<"parent" | "child">("parent");

  useEffect(() => {
    if (!openFaq && faqs[0]?.id) {
      setOpenFaq(faqs[0].id);
    }
  }, [openFaq, faqs]);

  return (
    <main className="pk-root">
      <Navbar />
      <Hero />
      <CheckIn />
      <GoalsSection />
      <VotingSection />
      {/* <InsightsSection metric={metric} /> */}
      <GallerySection galleryItems={galleryItems} />
      <RoleToggleSection />
      <UseCasesSection useCases={useCases} />
      <PricingSection pricingPlans={pricingPlans} />
      <FaqSection faqs={faqs} />
      <Ages />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <LiveChatWidget />
      <Footer />
    </main>
  );
}

function Footer() {
  return (
    <>
      <footer>
        <div>
          <LogoFooter />
          <div className="my-2" />
          <p className="fdesc">
            Empowering parents to support every stage of their child's growth —
            from age 4 to 17.
          </p>
        </div>
        <div className="fcol">
          <h4>Product</h4>
          <ul>
            <li>
              <a href="#">Features</a>
            </li>
            <li>
              <a href="#">Age Stages</a>
            </li>
            <li>
              <a href="#">AI Assistant</a>
            </li>
            <li>
              <a href="#">Pricing</a>
            </li>
          </ul>
        </div>
        <div className="fcol">
          <h4>Company</h4>
          <ul>
            <li>
              <a href="#">About Us</a>
            </li>
            <li>
              <a href="#">Blog</a>
            </li>
            <li>
              <a href="#">Careers</a>
            </li>
            <li>
              <a href="#">Press</a>
            </li>
          </ul>
        </div>
        <div className="fcol">
          <h4>Support</h4>
          <ul>
            <li>
              <a href="#">Help Center</a>
            </li>
            <li>
              <a href="#">Privacy</a>
            </li>
            <li>
              <a href="#">Terms</a>
            </li>
            <li>
              <a href="#">Contact</a>
            </li>
          </ul>
        </div>
      </footer>
      <div className="fbot">
        <span>© {new Date().getFullYear()} Par-Kids. All rights reserved.</span>
        <span>Made with 💜 for families everywhere</span>
      </div>
    </>
  );
}

function CTA() {
  return (
    <section
      style={{
        padding: "80px 0",
      }}
    >
      <div className="ctab">
        <h2>
          Your Family's Best Chapter
          <br />
          Starts Today
        </h2>

        <p>
          Join 14,000+ families using Parent-Kids to raise happy, confident,
          well-rounded children — free forever to start.
        </p>

        <div className="cacts">
          <a href="#" className="bw">
            Create Free Family Account →
          </a>

          <a href="#" className="bgw">
            Book a Live Demo
          </a>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="px-[5%] py-16">
      <div
        style={{
          textAlign: "center",
          maxWidth: "540px",
          margin: "0 auto 58px",
        }}
      >
        <div
          className="slbl"
          style={{
            justifyContent: "center",
          }}
        >
          How It Works
        </div>

        <h2 className="stitle">
          Start in Minutes.
          <br />
          Transform Years.
        </h2>

        <p
          className="ssub"
          style={{
            maxWidth: "100%",
            marginBottom: 0,
          }}
        >
          Three simple steps to a more connected, informed, and empowered
          family.
        </p>
      </div>

      <div className="steps">
        <div className="step">
          <div className="stepn">1</div>
          <h3>Create Family Profile</h3>
          <p>
            Add your children, their ages, and development goals. Takes 2
            minutes — no forms, no jargon.
          </p>
        </div>

        <div className="step d2">
          <div className="stepn">2</div>
          <h3>Track & Check In Daily</h3>
          <p>
            Log moods, activities, and milestones. Get instant AI-powered
            guidance tailored to your child's exact stage.
          </p>
        </div>

        <div className="step d4">
          <div className="stepn">3</div>
          <h3>Watch Them Flourish</h3>
          <p>
            Review weekly growth summaries, celebrate milestones, and strengthen
            your family bond every single day.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */
function Testimonials() {
  return (
    <section id="stories" className="px-[5%] py-16 tbg">
      <div
        style={{
          textAlign: "center",
          maxWidth: "520px",
          margin: "0 auto 50px",
        }}
      >
        <div
          className="slbl"
          style={{
            justifyContent: "center",
          }}
        >
          Family Stories
        </div>

        <h2 className="stitle">
          Families Who Found
          <br />
          Their Rhythm
        </h2>
      </div>

      <div className="tgrid">
        <div className="tcard">
          <div className="tq">"</div>

          <p>
            Parent-Kids showed me my 9-year-old had been anxious for weeks
            before I even noticed. The mood patterns changed how I showed up for
            her completely.
          </p>

          <div className="tau">
            <div
              className="tav"
              style={{
                background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
              }}
            >
              A
            </div>

            <div>
              <div className="tn">Amara O.</div>
              <div className="tr">Mom of Zoe, 9 · Austin, TX</div>
            </div>
          </div>
        </div>

        <div className="tcard d2">
          <div className="tq">"</div>

          <p>
            The teen guides are genuinely brilliant. My 15-year-old and I
            finally have a framework for conversations I never knew how to
            start. Total game changer.
          </p>

          <div className="tau">
            <div
              className="tav"
              style={{
                background: "linear-gradient(135deg,#fb923c,#fcd34d)",
              }}
            >
              R
            </div>

            <div>
              <div className="tn">Robert K.</div>
              <div className="tr">Dad of Kai, 15 · Chicago, IL</div>
            </div>
          </div>
        </div>

        <div className="tcard d4">
          <div className="tq">"</div>

          <p>
            Three kids, three different ages. Parent-Kids handles all of them
            brilliantly — each child gets content that's exactly right for where
            they are developmentally.
          </p>

          <div className="tau">
            <div
              className="tav"
              style={{
                background: "linear-gradient(135deg,#34d399,#38bdf8)",
              }}
            >
              L
            </div>

            <div>
              <div className="tn">Lisa M.</div>
              <div className="tr">Mom of 3 · Seattle, WA</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Ages() {
  return (
    <section id="ages" className="px-[5%] py-16 abg">
      <div className="slbl">Age-Based Growth</div>
      <h2 className="stitle">
        Built for Every Stage
        <br />
        of Childhood
      </h2>
      <p className="ssub">
        Parent-Kids adapts to your child's exact age — with content, milestones,
        and tools that evolve as they grow from 4 to 17.
      </p>

      <div className="agrid">
        <div className="acard">
          <div
            className="abadge"
            style={{
              background: "rgba(167,139,250,.15)",
              color: "var(--purple)",
            }}
          >
            4–6<span>yrs</span>
          </div>

          <div className="abody">
            <h3>Little Explorers</h3>
            <p>
              Foundation years. Language explosion, social play, and big
              feelings. Track speech, motor skills, and early curiosity
              milestones.
            </p>

            <div className="atags">
              <span
                className="atag"
                style={{
                  background: "rgba(167,139,250,.12)",
                  color: "var(--purple)",
                }}
              >
                Language
              </span>

              <span
                className="atag"
                style={{
                  background: "rgba(52,211,153,.12)",
                  color: "#0d9488",
                }}
              >
                Motor Skills
              </span>

              <span
                className="atag"
                style={{
                  background: "rgba(251,146,60,.12)",
                  color: "#c2410c",
                }}
              >
                Social Play
              </span>
            </div>
          </div>
        </div>

        <div className="acard d1">
          <div
            className="abadge"
            style={{
              background: "rgba(56,189,248,.15)",
              color: "#0369a1",
            }}
          >
            7–9<span>yrs</span>
          </div>

          <div className="abody">
            <h3>Young Thinkers</h3>
            <p>
              Reading, logic, and friendship. Build emotional vocabulary, study
              habits, and creative confidence in school-age children.
            </p>

            <div className="atags">
              <span
                className="atag"
                style={{
                  background: "rgba(56,189,248,.12)",
                  color: "#0369a1",
                }}
              >
                Reading
              </span>

              <span
                className="atag"
                style={{
                  background: "rgba(252,211,77,.15)",
                  color: "#92400e",
                }}
              >
                Emotions
              </span>

              <span
                className="atag"
                style={{
                  background: "rgba(244,114,182,.12)",
                  color: "#9d174d",
                }}
              >
                Creativity
              </span>
            </div>
          </div>
        </div>

        <div className="acard d2">
          <div
            className="abadge"
            style={{
              background: "rgba(251,146,60,.15)",
              color: "#c2410c",
            }}
          >
            10–13<span>yrs</span>
          </div>

          <div className="abody">
            <h3>Growing Independents</h3>
            <p>
              Pre-teen transitions. Self-identity, peer relationships, and
              academic pressure. Tools designed for both parent and child.
            </p>

            <div className="atags">
              <span
                className="atag"
                style={{
                  background: "rgba(251,146,60,.12)",
                  color: "#c2410c",
                }}
              >
                Identity
              </span>

              <span
                className="atag"
                style={{
                  background: "rgba(167,139,250,.12)",
                  color: "var(--purple)",
                }}
              >
                Study Skills
              </span>

              <span
                className="atag"
                style={{
                  background: "rgba(52,211,153,.12)",
                  color: "#0d9488",
                }}
              >
                Resilience
              </span>
            </div>
          </div>
        </div>

        <div className="acard d3">
          <div
            className="abadge"
            style={{
              background: "rgba(244,114,182,.15)",
              color: "#9d174d",
            }}
          >
            14–17<span>yrs</span>
          </div>

          <div className="abody">
            <h3>Teen Pathfinders</h3>
            <p>
              Purpose, autonomy, and emotional depth. Navigate teen
              conversations, mental health support, and future planning
              together.
            </p>

            <div className="atags">
              <span
                className="atag"
                style={{
                  background: "rgba(244,114,182,.12)",
                  color: "#9d174d",
                }}
              >
                Mental Health
              </span>

              <span
                className="atag"
                style={{
                  background: "rgba(252,211,77,.15)",
                  color: "#92400e",
                }}
              >
                Purpose
              </span>

              <span
                className="atag"
                style={{
                  background: "rgba(167,139,250,.12)",
                  color: "var(--purple)",
                }}
              >
                Autonomy
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
