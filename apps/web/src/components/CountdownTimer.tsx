'use client';

import { useEffect, useMemo, useState } from 'react';

type CountdownTimerProps = {
  targetTime: Date | string;
  onExpire?: () => void;
};

function formatUnit(value: number) {
  return value.toString().padStart(2, '0');
}

export default function CountdownTimer({ targetTime, onExpire }: CountdownTimerProps) {
  const target = useMemo(() => new Date(targetTime).getTime(), [targetTime]);
  const [remainingMs, setRemainingMs] = useState(Math.max(0, target - Date.now()));

  useEffect(() => {
    let hasFiredExpire = false;
    const id = setInterval(() => {
      const next = Math.max(0, target - Date.now());
      setRemainingMs(next);

      if (next === 0 && onExpire && !hasFiredExpire) {
        hasFiredExpire = true;
        onExpire();
      }
    }, 1000);

    return () => clearInterval(id);
  }, [onExpire, target]);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#A8E0BC] bg-[#F0FBF4] px-4 py-2 text-sm font-semibold text-[#2D7D5A]">
      <span>{remainingMs === 0 ? 'Poll Closed' : 'Poll Ends In'}</span>
      <span className="font-mono">
        {formatUnit(hours)}:{formatUnit(minutes)}:{formatUnit(seconds)}
      </span>
    </div>
  );
}
