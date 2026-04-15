'use client';
// ============================================================
// PAR-KIDS — Dashboard Shell
// Wraps all dashboard pages with sidebar + header
// ============================================================
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Users, CheckSquare, BarChart2,
  Settings, Bell, Menu, X, Leaf
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/children', label: 'Children', icon: Users },
  { href: '/dashboard/check-ins', label: 'Check-Ins', icon: CheckSquare },
  { href: '/dashboard/growth', label: 'Growth', icon: BarChart2 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const displayName = user?.email?.split('@')[0] ?? 'Par-Kids User';
  const displayInitial = displayName[0]?.toUpperCase() ?? '?';

  return (
    <div className="min-h-screen bg-sand-100 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300',
          'lg:relative lg:translate-x-0 lg:shadow-none lg:border-r lg:border-sand-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-sand-200">
          <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-charcoal-800 tracking-tight">Par-Kids</span>
        </div>

        {/* Nav */}
        <nav className="px-4 py-6 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-green-50 text-green-600'
                    : 'text-charcoal-500 hover:bg-sand-100 hover:text-charcoal-800'
                )}
              >
                <Icon className={cn('w-5 h-5', active ? 'text-green-500' : '')} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-4 border-t border-sand-200">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm">
              {displayInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-charcoal-800 truncate">
                {displayName}
              </p>
              <p className="text-xs text-charcoal-400 truncate">{profile?.email ?? user?.email}</p>
              <button
                onClick={signOut}
                className="text-xs text-charcoal-400 hover:text-red-500 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-sand-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-sand-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-sand-100 text-charcoal-500">
              <Bell className="w-5 h-5" />
              {/* Notification badge */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
