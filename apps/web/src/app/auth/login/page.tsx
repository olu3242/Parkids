'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signIn(email, password);
    if (error) { toast.error(error.message); setIsLoading(false); }
    else router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-3xl">🌱</span>
            <span className="text-2xl font-bold text-[#2D7D5A]">Par-Kids</span>
          </div>
          <p className="text-[#486668] text-sm">Grow Together. Stay Connected.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-2xl font-bold text-[#1E2D2F] mb-2">Welcome back</h1>
          <p className="text-[#486668] text-sm mb-6">Sign in to your family account</p>

          <GoogleSignInButton
            className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl py-3 text-[#28393B] font-medium hover:bg-[#FDF6EC] transition-colors mb-4 disabled:opacity-70"
          />

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-[#486668]">or continue with email</span></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#28393B] mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#1E2D2F] placeholder-gray-300 focus:outline-none focus:border-[#2D7D5A] transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#28393B] mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#1E2D2F] placeholder-gray-300 focus:outline-none focus:border-[#2D7D5A] transition-colors" />
            </div>
            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-sm text-[#2D7D5A] hover:underline">Forgot password?</Link>
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full bg-[#2D7D5A] hover:bg-[#236346] disabled:opacity-50 text-white font-semibold rounded-xl py-3 transition-colors">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-[#486668] mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-[#2D7D5A] font-medium hover:underline">Start free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
