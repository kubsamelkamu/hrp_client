import { useState, FormEvent } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Request failed.');
      }
      setMessage('If an account with that email exists, you will receive a password reset link shortly.');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title> Rentify | Forgot Password</title>
        <meta name="description" content="Reset your Rentify account password." />
      </Head>
      <div className="min-h-screen flex flex-col lg:flex-row">
        <div className="hidden lg:block lg:w-1/2 relative">
          <Image
            src="/forgot_bg.jpg"
            alt="Forgot password illustration"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex-1 flex items-center justify-center bg-gray-100 p-8">
          <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">
            <div className="flex items-center justify-center mb-6">
              <h1 className="text-4xl font-extrabold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500">
                Rentify
              </h1>
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
              Forgot your password?
            </h2>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
            {message && <p className="text-green-600 text-sm mb-4 text-center">{message}</p>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Mail className="mr-2 text-indigo-500" size={18} /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2 block w-full border-gray-200 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-600 disabled:opacity-50 transition-all"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Remembered your password?{' '}
                <Link href="/auth/login"className="text-purple-600 hover:underline font-medium">
                    Login
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" className="text-purple-600 hover:underline font-medium">
                    Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
