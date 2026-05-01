'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type {
  LandingFaq,
  LandingGalleryItem,
  LandingMetric,
  LandingPricingPlan,
  LandingUseCase,
} from '@/lib/landing';

type Props = {
  metric: LandingMetric;
  pricingPlans: LandingPricingPlan[];
  faqs: LandingFaq[];
  useCases: LandingUseCase[];
  galleryItems: LandingGalleryItem[];
};

const moodOptions = ['😊', '😄', '😐', '😔', '😤'];

function formatPrice(cents: number) {
  if (cents === 0) return '$0';
  return `$${Math.round(cents / 100)}/mo`;
}

export default function LandingPageClient({
  metric,
  pricingPlans,
  faqs,
  useCases,
  galleryItems,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState(1);
  const [votes, setVotes] = useState([3, 1, 1]);
  const [openFaq, setOpenFaq] = useState<string | null>(faqs[0]?.id ?? null);
  const [role, setRole] = useState<'parent' | 'child'>('parent');

  useEffect(() => {
    if (!openFaq && faqs[0]?.id) {
      setOpenFaq(faqs[0].id);
    }
  }, [openFaq, faqs]);

  const votePct = useMemo(() => {
    const total = votes.reduce((a, b) => a + b, 0);
    return votes.map((value) => Math.round((value / total) * 100));
  }, [votes]);

  return (
    <main className="pk-root">
      <div className={`pk-mobile ${mobileOpen ? 'open' : ''}`}>
        <button onClick={() => setMobileOpen(false)}>✕</button>
        <a href="#checkin" onClick={() => setMobileOpen(false)}>Check-In</a>
        <a href="#goals" onClick={() => setMobileOpen(false)}>Goals</a>
        <a href="#insights" onClick={() => setMobileOpen(false)}>Insights</a>
        <a href="#pricing" onClick={() => setMobileOpen(false)}>Pricing</a>
        <a href="#faq" onClick={() => setMobileOpen(false)}>FAQ</a>
      </div>

      <nav className="pk-nav">
        <div className="pk-logo">Par·Kids</div>
        <div className="pk-links">
          <a href="#checkin">Check-In</a>
          <a href="#goals">Goals</a>
          <a href="#voting">Decisions</a>
          <a href="#insights">Insights</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="pk-actions">
          <Link href="/login" className="btn ghost">Log In</Link>
          <Link href="/login" className="btn solid">Get Started</Link>
          <button className="burger" onClick={() => setMobileOpen(true)}>☰</button>
        </div>
      </nav>

      <section className="hero">
        <div>
          <p className="pill">Family Growth Platform</p>
          <h1>Where families grow together</h1>
          <p className="subtitle">
            Par-Kids brings structure through check-ins, shared goals, family decision-making, and real-time insights.
          </p>
          <div className="row">
            <Link href="/login" className="btn solid">Start Free Today</Link>
            <a href="#checkin" className="btn ghost">See How It Works</a>
          </div>
        </div>
        <div className="card">
          <h3>Today&apos;s Check-In</h3>
          <p>How are you feeling today?</p>
          <div className="moods">
            {moodOptions.map((item, idx) => (
              <button key={item} className={selectedMood === idx ? 'active' : ''} onClick={() => setSelectedMood(idx)}>
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="checkin" className="section">
        <h2>The Check-In Engine</h2>
        <p>Structured parent-child check-ins across eight life dimensions with summaries and reminders.</p>
      </section>

      <section id="goals" className="section soft">
        <h2>Goals your family builds together</h2>
        <div className="grid4">
          <article>Academic</article>
          <article>Social</article>
          <article>Personal</article>
          <article>Family</article>
        </div>
      </section>

      <section id="voting" className="section">
        <h2>Family decisions, made together</h2>
        <div className="vote-card">
          {['Bowling', 'Movies', 'Pizza Night'].map((label, idx) => (
            <button key={label} onClick={() => setVotes((prev) => prev.map((v, i) => (i === idx ? v + 1 : v)))}>
              <span>{label}</span>
              <span>{votePct[idx]}%</span>
            </button>
          ))}
        </div>
      </section>

      <section id="insights" className="section dark">
        <h2>Data that helps your family grow</h2>
        <div className="grid3">
          <article><h3>{metric.checkin_completion_pct}%</h3><p>Check-In Completion</p></article>
          <article><h3>{metric.mood_trend_label}</h3><p>Mood Trend</p></article>
          <article><h3>{metric.goals_completed_count}</h3><p>Goals Completed</p></article>
        </div>
      </section>

      <section className="section">
        <h2>Gallery System</h2>
        {galleryItems.length === 0 ? (
          <p className="empty">No gallery moments yet.</p>
        ) : (
          <div className="grid3">
            {galleryItems.map((item) => (
              <article key={item.id} className="gallery">
                <div className="icon">{item.icon}</div>
                <p>{item.title}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section soft">
        <h2>Dynamic Feature Rendering</h2>
        <div className="row">
          <button className={`tab ${role === 'parent' ? 'on' : ''}`} onClick={() => setRole('parent')}>Parent View</button>
          <button className={`tab ${role === 'child' ? 'on' : ''}`} onClick={() => setRole('child')}>Child View</button>
        </div>
        <div className="grid3">
          {role === 'parent' ? (
            <>
              <article>Full Insights Dashboard</article>
              <article>Poll Creation & Veto</article>
              <article>Notes Management</article>
            </>
          ) : (
            <>
              <article>Mood Logging</article>
              <article>Check-In Participation</article>
              <article>Voting Participation</article>
            </>
          )}
        </div>
      </section>

      <section className="section">
        <h2>Families use Par-Kids for</h2>
        {useCases.length === 0 ? (
          <p className="empty">Use cases will appear here once configured.</p>
        ) : (
          <div className="grid3">
            {useCases.map((item) => (
              <article key={item.id}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="pricing" className="section dark">
        <h2>A plan for every family</h2>
        {pricingPlans.length === 0 ? (
          <p className="empty dark-empty">No plans available yet.</p>
        ) : (
          <div className="grid3">
            {pricingPlans.map((plan) => (
              <article key={plan.id} className={plan.is_featured ? 'featured' : ''}>
                <h3>{plan.name}</h3>
                <p>{formatPrice(plan.price_monthly_cents)}</p>
                <ul>
                  {plan.feature_list.map((feature) => <li key={`${plan.id}-${feature}`}>{feature}</li>)}
                </ul>
                <Link href="/login" className="btn solid">{plan.cta_label}</Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="faq" className="section">
        <h2>Frequently asked questions</h2>
        {faqs.length === 0 ? (
          <p className="empty">No FAQs published yet.</p>
        ) : (
          <div className="faq">
            {faqs.map((item) => {
              const isOpen = openFaq === item.id;
              return (
                <article key={item.id}>
                  <button onClick={() => setOpenFaq(isOpen ? null : item.id)}>
                    <span>{item.question}</span>
                    <span>{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen ? <p>{item.answer}</p> : null}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="section cta">
        <h2>Start your family&apos;s growth journey</h2>
        <div className="row">
          <Link href="/login" className="btn solid">Create Your Family Account</Link>
          <a href="#pricing" className="btn ghost">See All Features</a>
        </div>
      </section>

      <style jsx>{`
        .pk-root { background: #faf7f2; color: #141210; }
        :global(html) { scroll-behavior: smooth; }
        .pk-nav { position: sticky; top: 0; display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; background: rgba(250,247,242,.95); border-bottom: 1px solid rgba(0,0,0,.08); z-index: 20; }
        .pk-logo { font-size: 24px; font-weight: 900; font-family: Georgia, serif; }
        .pk-links { display: flex; gap: 18px; font-size: 14px; }
        .pk-actions { display: flex; gap: 8px; align-items: center; }
        .burger { display: none; border: 0; background: transparent; font-size: 22px; }
        .pk-mobile { display: none; }
        .pk-mobile.open { display: flex; position: fixed; inset: 0; background: #faf7f2; z-index: 30; flex-direction: column; align-items: center; justify-content: center; gap: 18px; }
        .hero { max-width: 1100px; margin: 0 auto; padding: 70px 20px; display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; align-items: center; }
        .pill { display: inline-block; background: #eaf5ee; color: #3d7a56; border-radius: 999px; padding: 6px 14px; font-size: 12px; font-weight: 700; }
        h1 { font-family: Georgia, serif; font-size: clamp(36px, 5vw, 64px); line-height: 1.1; margin: 12px 0; }
        h2 { font-family: Georgia, serif; font-size: clamp(28px, 4vw, 46px); margin-bottom: 12px; }
        .subtitle { color: #555; max-width: 560px; }
        .row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }
        .btn { border-radius: 999px; padding: 10px 18px; font-weight: 700; }
        .btn.solid { background: #3d7a56; color: #fff; border: 0; }
        .btn.ghost { background: transparent; color: #141210; border: 2px solid #141210; }
        .card { background: #fff; border: 1px solid rgba(0,0,0,.08); border-radius: 18px; padding: 20px; }
        .moods { display: flex; gap: 8px; margin-top: 8px; }
        .moods button { border: 0; background: #f3ece0; border-radius: 999px; padding: 8px 11px; cursor: pointer; }
        .moods button.active { background: #3d7a56; color: #fff; }
        .section { max-width: 1100px; margin: 0 auto; padding: 68px 20px; }
        .section.soft { background: #f3ece0; border-radius: 24px; }
        .section.dark { background: #141210; color: #faf7f2; border-radius: 24px; }
        .grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .grid3 article, .grid4 article { background: #fff; border-radius: 14px; padding: 16px; border: 1px solid rgba(0,0,0,.08); color: #141210; }
        .section.dark .grid3 article { background: rgba(255,255,255,.08); color: #faf7f2; border-color: rgba(255,255,255,.08); }
        .vote-card { display: grid; gap: 10px; max-width: 420px; }
        .vote-card button { border: 0; border-radius: 10px; background: #f3ece0; padding: 11px 14px; display: flex; justify-content: space-between; cursor: pointer; }
        .gallery .icon { font-size: 36px; }
        .tab { border: 0; background: #ede4d4; border-radius: 999px; padding: 8px 14px; font-weight: 700; }
        .tab.on { background: #fff; }
        .featured { outline: 2px solid #3d7a56; }
        .faq article { border: 1px solid rgba(0,0,0,.08); border-radius: 12px; margin-bottom: 8px; background: #fff; overflow: hidden; }
        .faq button { width: 100%; border: 0; background: transparent; display: flex; justify-content: space-between; padding: 14px; text-align: left; font-weight: 700; }
        .faq p { padding: 0 14px 14px; color: #666; }
        .cta { text-align: center; background: #3d7a56; color: #fff; border-radius: 24px; margin-bottom: 40px; }
        .cta .btn.ghost { border-color: #fff; color: #fff; }
        .empty { color: #486668; font-size: 14px; }
        .dark-empty { color: rgba(255,255,255,.8); }
        @media (max-width: 900px) {
          .pk-links { display: none; }
          .burger { display: block; }
          .hero { grid-template-columns: 1fr; }
          .grid3 { grid-template-columns: 1fr 1fr; }
          .grid4 { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 580px) {
          .grid3, .grid4 { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
