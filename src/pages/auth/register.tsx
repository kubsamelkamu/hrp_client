import { useState, FormEvent, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { registerUser } from '@/store/slices/authSlice';

export default function RegisterPage() {

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error: apiError } = useAppSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    dispatch({ type: 'auth/clearError' });
  }, [dispatch]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(name.trim())) {
      setFormError('Full Name must contain only letters and spaces.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    try {
      const result = await dispatch(registerUser({ name: name.trim(), email, password }));
      if (registerUser.fulfilled.match(result)) {
        router.push('/auth/login');
      }
    } catch (err: unknown) {
      if (err instanceof Error) setFormError(err.message);
      else setFormError('An error occurred. Please try again.');
    }
  };

  const getApiErrorMessage = () => {
    if (!apiError) return null;
    if (apiError.includes('400')) return 'Registration failed: Email already exists.';
    return apiError;
  };

  return (
    <>
      <Head>
        <title>Register | Rentify</title>
        <meta
          name="description"
          content="Create an account on Rentify to find or list properties."
        />
      </Head>
      <div className="min-h-screen flex flex-col lg:flex-row">
        <div className="hidden lg:block lg:w-1/2 relative">
          <Image
            src="/register-bg.jpg"
            alt="Register background"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-100">
          <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">
            <h1 className="text-4xl font-extrabold text-center mb-6 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500">
              Rentify
            </h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ─── Full Name ─────────────────────────────────────────────────────── */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <User className="mr-2 text-indigo-500" size={18} /> Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="mt-2 block w-full border-gray-200 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              {/* ─── Email ───────────────────────────────────────────────────────────── */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Mail className="mr-2 text-indigo-500" size={18} /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="mt-2 block w-full border-gray-200 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              {/* ─── Password ───────────────────────────────────────────────────────── */}
              <div className="relative">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Lock className="mr-2 text-indigo-500" size={18} /> Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                  className="mt-2 block w-full border-gray-200 rounded-lg shadow-sm pr-10 focus:border-purple-500 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* ─── Confirm Password ───────────────────────────────────────────────── */}
              <div className="relative">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Lock className="mr-2 text-indigo-500" size={18} /> Confirm Password
                </label>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="********"
                  required
                  className="mt-2 block w-full border-gray-200 rounded-lg shadow-sm pr-10 focus:border-purple-500 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* ─── Terms & Conditions Checkbox ────────────────────────────────────── */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={() => setAgree((prev) => !prev)}
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <Link href="/terms&conditions" className="font-medium text-purple-600 underline">
                    Terms &amp; Conditions
                  </Link>
                </label>
              </div>

              {/* ─── Error Message ───────────────────────────────────────────────────── */}
              {(formError || getApiErrorMessage()) && (
                <p className="text-red-500 text-sm">{formError || getApiErrorMessage()}</p>
              )}

              {/* ─── Submit Button ──────────────────────────────────────────────────── */}
              <button
                type="submit"
                disabled={!agree || loading}
                className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-600 disabled:opacity-50 transition-all"
              >
                {loading ? 'Registering…' : 'Create Account'}
              </button>

              {/* ─── Already Have Account? ─────────────────────────────────────────── */}
              <p className="text-sm text-gray-600 text-center">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-purple-600 hover:underline font-medium">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
