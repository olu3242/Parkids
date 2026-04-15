'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setIsLoading(true);
    const { error } = await signUp(form.email, form.password, {
      first_name: form.firstName, last_name: form.lastName, role: 'parent',
    });
    if (error) { toast.error(error.message); setIsLoading(false); }
    else { toast.success("Account created! Let's set up your family."); router.push('/onboarding'); }
  };

  return (
    <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-3xl">🌱</span>
            <span className="text-2xl font-bold text-[#2D7D5A]">Par-Kids</span>
          </div>
          <p className="text-[#486668] text-sm">Start your family&apos;s growth journey</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-2xl font-bold text-[#1E2D2F] mb-2">Create your account</h1>
          <p className="text-[#486668] text-sm mb-6">Free to start — no credit card required</p>

          <GoogleSignInButton
            className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl py-3 text-[#28393B] font-medium hover:bg-[#FDF6EC] transition-colors mb-4 disabled:opacity-70"
          />

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-[#486668]">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {['firstName','lastName'].map((field, i) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-[#28393B] mb-1.5">{i === 0 ? 'First Name' : 'Last Name'}</label>
                  <input type="text" value={(form as any)[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    required={i === 0} placeholder={i === 0 ? 'Jane' : 'Smith'}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#1E2D2F] placeholder-gray-300 focus:outline-none focus:border-[#2D7D5A] transition-colors" />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#28393B] mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required placeholder="you@example.com"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#1E2D2F] placeholder-gray-300 focus:outline-none focus:border-[#2D7D5A] transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#28393B] mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required placeholder="Min. 8 characters"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[#1E2D2F] placeholder-gray-300 focus:outline-none focus:border-[#2D7D5A] transition-colors" />
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full bg-[#2D7D5A] hover:bg-[#236346] disabled:opacity-50 text-white font-semibold rounded-xl py-3 transition-colors">
              {isLoading ? 'Creating account...' : 'Create Free Account'}
            </button>
            <p className="text-xs text-[#486668] text-center">
              By signing up you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>
            </p>
          </form>

          <p className="text-center text-sm text-[#486668] mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#2D7D5A] font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
