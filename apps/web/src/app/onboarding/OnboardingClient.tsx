'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// ── Types ─────────────────────────────────────────────────────
interface Child {
  id: string;
  name: string;
  emoji: string;
}

type Step = 1 | 2 | 3 | 4;

const CHILD_AVATARS = ['🧒', '👦', '👧', '🧑', '👶', '🐣', '🦁', '🐼', '🐻', '🦊', '🐸', '⭐'];

// ── Step progress bar ─────────────────────────────────────────
function ProgressBar({ step }: { step: Step }) {
  // Steps 2 and 3 are the "real" steps (1 = welcome, 4 = done)
  const total = 3;
  const current = Math.min(step - 1, total);
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[#486668]">
          {step < 4 ? `Step ${current} of ${total}` : 'All done!'}
        </span>
      </div>
      <div className="h-1.5 bg-[#E8F0EE] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#2D7D5A] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(current / total) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ── Step 1 — Welcome ─────────────────────────────────────────
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center">
      <div className="text-6xl mb-4">👨‍👩‍👧</div>
      <h1 className="text-2xl font-bold text-[#1E2D2F] mb-3">Welcome to Par-Kids</h1>
      <p className="text-[#486668] mb-8 leading-relaxed">
        Let's set up your family in just a minute. No fluff — just the essentials to get started.
      </p>
      <motion.button
        onClick={onNext}
        whileTap={{ scale: 0.97 }}
        className="w-full bg-[#2D7D5A] hover:bg-[#236346] text-white font-semibold rounded-2xl py-4 text-base transition-colors"
      >
        Get Started →
      </motion.button>
    </div>
  );
}

// ── Step 2 — Create Family ─────────────────────────────────────
function CreateFamilyStep({
  familyName,
  setFamilyName,
  onNext,
  onBack,
}: {
  familyName: string;
  setFamilyName: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [touched, setTouched] = useState(false);
  const hasError = touched && !familyName.trim();

  const handleNext = () => {
    setTouched(true);
    if (!familyName.trim()) return;
    onNext();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1E2D2F] mb-2">Name your family</h2>
      <p className="text-[#486668] mb-6 text-sm">
        Who's part of your team? Pick something fun — you can always change it later.
      </p>

      <div className="mb-5">
        <label className="block text-sm font-medium text-[#28393B] mb-2">Family name</label>
        <input
          type="text"
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)}
          onBlur={() => setTouched(true)}
          onKeyDown={(e) => e.key === 'Enter' && handleNext()}
          placeholder="e.g. The Johnsons, Team Williams…"
          autoFocus
          className={`w-full border-2 rounded-2xl px-4 py-3.5 text-[#1E2D2F] placeholder-gray-300 focus:outline-none transition-colors text-base ${
            hasError
              ? 'border-red-400 focus:border-red-400'
              : 'border-gray-200 focus:border-[#2D7D5A]'
          }`}
        />
        {hasError && (
          <p className="mt-1.5 text-xs text-red-500">Please enter a name for your family.</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 border-2 border-gray-200 text-[#486668] font-medium rounded-2xl py-3.5 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <motion.button
          onClick={handleNext}
          whileTap={{ scale: 0.97 }}
          className="flex-[2] bg-[#2D7D5A] hover:bg-[#236346] text-white font-semibold rounded-2xl py-3.5 transition-colors"
        >
          Continue →
        </motion.button>
      </div>
    </div>
  );
}

// ── Step 3 — Add Children ─────────────────────────────────────
function AddChildrenStep({
  children,
  setChildren,
  onNext,
  onBack,
  isSubmitting,
  error,
}: {
  children: Child[];
  setChildren: (c: Child[]) => void;
  onNext: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  error: string | null;
}) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const addChild = () => {
    setChildren([
      ...children,
      { id: crypto.randomUUID(), name: '', emoji: CHILD_AVATARS[children.length % CHILD_AVATARS.length] },
    ]);
  };

  const updateChild = (id: string, field: keyof Child, value: string) => {
    setChildren(children.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const removeChild = (id: string) => {
    if (children.length === 1) return; // keep at least one
    setChildren(children.filter((c) => c.id !== id));
  };

  const handleNext = () => {
    const newTouched: Record<string, boolean> = {};
    children.forEach((c) => (newTouched[c.id] = true));
    setTouched(newTouched);
    const allValid = children.every((c) => c.name.trim());
    if (!allValid) return;
    onNext();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1E2D2F] mb-2">Add your little ones</h2>
      <p className="text-[#486668] mb-6 text-sm">
        Add each child and pick their avatar. You can add more later.
      </p>

      <div className="space-y-4 mb-5">
        <AnimatePresence initial={false}>
          {children.map((child, idx) => {
            const hasError = touched[child.id] && !child.name.trim();
            return (
              <motion.div
                key={child.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-[#F9FBF9] rounded-2xl p-4 border border-gray-100"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar picker */}
                  <div className="flex-shrink-0">
                    <p className="text-xs text-[#486668] mb-1.5 font-medium">Avatar</p>
                    <div className="flex flex-wrap gap-1 max-w-[140px]">
                      {CHILD_AVATARS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => updateChild(child.id, 'emoji', emoji)}
                          className={`text-lg p-1 rounded-lg transition-colors ${
                            child.emoji === emoji
                              ? 'bg-[#D6F0E4] ring-2 ring-[#2D7D5A]'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name input */}
                  <div className="flex-1 min-w-0">
                    <label className="text-xs text-[#486668] mb-1.5 font-medium block">
                      Child {idx + 1} name
                    </label>
                    <input
                      type="text"
                      value={child.name}
                      onChange={(e) => updateChild(child.id, 'name', e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, [child.id]: true }))}
                      placeholder="e.g. Emma"
                      className={`w-full border-2 rounded-xl px-3 py-2.5 text-[#1E2D2F] placeholder-gray-300 focus:outline-none transition-colors text-sm ${
                        hasError
                          ? 'border-red-400 focus:border-red-400'
                          : 'border-gray-200 focus:border-[#2D7D5A]'
                      }`}
                    />
                    {hasError && (
                      <p className="mt-1 text-xs text-red-500">Please enter a name.</p>
                    )}
                  </div>

                  {/* Remove button */}
                  {children.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeChild(child.id)}
                      className="flex-shrink-0 mt-5 text-gray-400 hover:text-red-400 transition-colors p-1"
                      aria-label="Remove child"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {children.length < 6 && (
        <button
          type="button"
          onClick={addChild}
          className="w-full border-2 border-dashed border-[#B8D8CC] text-[#2D7D5A] font-medium rounded-2xl py-3 text-sm hover:bg-[#F0FBF4] transition-colors mb-5"
        >
          + Add another child
        </button>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 border-2 border-gray-200 text-[#486668] font-medium rounded-2xl py-3.5 hover:bg-gray-50 transition-colors disabled:opacity-40"
        >
          Back
        </button>
        <motion.button
          onClick={handleNext}
          disabled={isSubmitting}
          whileTap={{ scale: 0.97 }}
          className="flex-[2] bg-[#2D7D5A] hover:bg-[#236346] disabled:opacity-50 text-white font-semibold rounded-2xl py-3.5 transition-colors"
        >
          {isSubmitting ? 'Setting up…' : "Let's go! 🎉"}
        </motion.button>
      </div>
    </div>
  );
}

// ── Step 4 — Done ─────────────────────────────────────────────
function DoneStep({ familyName, onFinish }: { familyName: string; onFinish: () => void }) {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="text-6xl mb-4"
      >
        🎉
      </motion.div>
      <h2 className="text-2xl font-bold text-[#1E2D2F] mb-3">You're all set!</h2>
      <p className="text-[#486668] mb-2 text-sm leading-relaxed">
        Welcome to Par-Kids, <strong className="text-[#1E2D2F]">{familyName}</strong>!
      </p>
      <p className="text-[#486668] mb-8 text-sm leading-relaxed">
        Your family is ready. Start your first family vote and let everyone have a say.
      </p>
      <motion.button
        onClick={onFinish}
        whileTap={{ scale: 0.97 }}
        className="w-full bg-[#2D7D5A] hover:bg-[#236346] text-white font-semibold rounded-2xl py-4 text-base transition-colors"
      >
        Start your first family vote →
      </motion.button>
    </div>
  );
}

// ── Slide animation variants ──────────────────────────────────
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? 40 : -40,
    opacity: 0,
  }),
};

// ── Main component ────────────────────────────────────────────
export default function OnboardingClient() {
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState(1);
  const [familyName, setFamilyName] = useState('');
  const [children, setChildren] = useState<Child[]>([
    { id: crypto.randomUUID(), name: '', emoji: '🧒' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const goTo = (target: Step) => {
    setDirection(target > step ? 1 : -1);
    setStep(target);
  };

  const submit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyName,
          children: children.map((c) => ({ name: c.name, emoji: c.emoji })),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setSubmitError(json.error ?? 'Something went wrong. Please try again.');
        return;
      }

      // Advance to done screen
      goTo(4);
    } catch {
      setSubmitError('Could not connect. Please check your internet connection.');
    } finally {
      setIsSubmitting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyName, children]);

  const handleFinish = () => {
    router.push('/broadcast');
  };

  return (
    <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-2xl">🌱</span>
          <span className="text-xl font-bold text-[#2D7D5A]">Par-Kids</span>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-7 overflow-hidden">
          {step > 1 && step < 4 && <ProgressBar step={step} />}

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {step === 1 && <WelcomeStep onNext={() => goTo(2)} />}
              {step === 2 && (
                <CreateFamilyStep
                  familyName={familyName}
                  setFamilyName={setFamilyName}
                  onNext={() => goTo(3)}
                  onBack={() => goTo(1)}
                />
              )}
              {step === 3 && (
                <AddChildrenStep
                  children={children}
                  setChildren={setChildren}
                  onNext={submit}
                  onBack={() => goTo(2)}
                  isSubmitting={isSubmitting}
                  error={submitError}
                />
              )}
              {step === 4 && (
                <DoneStep familyName={familyName} onFinish={handleFinish} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Skip link (only on non-critical welcome/done screens) */}
        {step === 1 && (
          <p className="text-center mt-5 text-xs text-[#9BB0AF]">
            Already set up?{' '}
            <button
              onClick={() => router.push('/dashboard')}
              className="underline hover:text-[#486668] transition-colors"
            >
              Go to dashboard
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
