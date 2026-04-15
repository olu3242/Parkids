'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemeMode } from '@/components/theme-provider';

const options: { value: ThemeMode; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
];

export default function ThemeToggle() {
  const { theme, setTheme, isLoaded } = useTheme();

  if (!isLoaded) return null;

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-sand-300 bg-white/90 p-1 shadow-sm backdrop-blur dark:border-charcoal-700 dark:bg-charcoal-900/90">
      {options.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={`rounded-full px-3 py-2 text-xs font-semibold transition-all ${
              active
                ? 'bg-green-500 text-white'
                : 'text-charcoal-600 hover:bg-sand-100 dark:text-charcoal-200 dark:hover:bg-charcoal-800'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <Icon className="h-4 w-4" />
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
