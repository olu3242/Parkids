'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Leaf, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import toast from 'react-hot-toast';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type AuthForm = z.infer<typeof authSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const loginForm = useForm<AuthForm>({ resolver: zodResolver(authSchema) });
  const signUpForm = useForm<AuthForm>({ resolver: zodResolver(authSchema) });

  const handleSignIn = async (data: AuthForm) => {
    setIsSigningIn(true);
    const { error } = await signIn(data.email, data.password);
    setIsSigningIn(false);

    if (error) {
      toast.error(error.message || 'Invalid email or password');
      return;
    }

    router.push('/auth/callback');
  };

  const handleSignUp = async (data: AuthForm) => {
    setIsSigningUp(true);
    const { error } = await signUp(data.email, data.password, {});
    setIsSigningUp(false);

    if (error) {
      toast.error(error.message || 'Unable to create your account');
      return;
    }

    router.push('/auth/callback');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-green-500 rounded-2xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-charcoal-800">Par-Kids</span>
          </Link>
          <h1 className="text-2xl font-semibold text-charcoal-800 mt-6">Welcome to Par-Kids</h1>
          <p className="text-charcoal-500 mt-1">Sign in or create your account to get started</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-sand-200 p-8">
          <div className="grid gap-8 md:grid-cols-2">
            <form onSubmit={loginForm.handleSubmit(handleSignIn)} className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-charcoal-800">Sign In</h2>
                <p className="text-sm text-charcoal-500 mt-1">Use your email and password.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                  Email address
                </label>
                <input
                  {...loginForm.register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-charcoal-800 placeholder:text-charcoal-300 text-sm"
                />
                {loginForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-charcoal-700">Password</label>
                  <Link href="/auth/forgot-password" className="text-xs text-green-500 hover:text-green-600">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    {...loginForm.register('password')}
                    type={showLoginPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-charcoal-800 placeholder:text-charcoal-300 text-sm pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSigningIn}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                {isSigningIn ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-charcoal-800">Sign Up</h2>
                <p className="text-sm text-charcoal-500 mt-1">Create a new email and password account.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                  Email address
                </label>
                <input
                  {...signUpForm.register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-charcoal-800 placeholder:text-charcoal-300 text-sm"
                />
                {signUpForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">{signUpForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    {...signUpForm.register('password')}
                    type={showSignUpPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Minimum 8 characters"
                    className="w-full px-4 py-3 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-charcoal-800 placeholder:text-charcoal-300 text-sm pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
                  >
                    {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signUpForm.formState.errors.password && (
                  <p className="text-red-500 text-xs mt-1">{signUpForm.formState.errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSigningUp}
                className="w-full bg-charcoal-800 hover:bg-charcoal-700 disabled:bg-charcoal-300 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                {isSigningUp ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-sand-200" />
            </div>
            <div className="relative flex justify-center text-sm font-medium">
              <span className="bg-white px-4 text-charcoal-400">OR</span>
            </div>
          </div>

          <GoogleSignInButton
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-sand-300 rounded-xl hover:bg-sand-50 transition-colors text-sm font-medium text-charcoal-700 disabled:opacity-70"
          />
        </div>
      </div>
    </div>
  );
}
