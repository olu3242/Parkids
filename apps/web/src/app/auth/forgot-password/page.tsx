import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-[#FDF6EC] flex items-center justify-center p-4">
      <section className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-[#1E2D2F] mb-3">Reset your password</h1>
        <p className="text-sm text-[#486668] mb-6">
          Password reset is not wired yet in this starter package. Contact your family admin or return to sign in.
        </p>
        <Link
          href="/auth/login"
          className="inline-block bg-[#2D7D5A] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#236346] transition-colors"
        >
          Back to login
        </Link>
      </section>
    </main>
  );
}
