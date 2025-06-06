import { NextPage } from 'next';
import { useEffect, useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { changeUserRole } from '@/store/slices/adminSlice';
import { ThemeContext } from '@/components/context/ThemeContext';
import UserLayout from '@/components/userLayout/Layout';
import toast from 'react-hot-toast';
import Head from 'next/head';
import Link from 'next/link';

const BecomeLandlordPage: NextPage = () => {

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { theme } = useContext(ThemeContext)!;
  const user = useAppSelector((s) => s.auth.user);
  const authToken = useAppSelector((s) => s.auth.token);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user || !authToken) {
      router.replace(
        `/auth/login?redirect=${encodeURIComponent('/become-landlord')}`
      );
    }
  }, [user, authToken, router]);

  useEffect(() => {
    if (user?.role === 'LANDLORD' || user?.role === 'ADMIN') {
      router.replace('/properties/list');
    }
  }, [user, router]);

  const handleBecomeLandlord = () => {
    if (!user) return;
    setIsSubmitting(true);

    setTimeout(async () => {
      try {
        await dispatch(
          changeUserRole({ userId: user.id, role: 'LANDLORD' })
        ).unwrap();

        toast.success('🎉 You are now a landlord!');
        router.replace(
          `/auth/login?redirect=${encodeURIComponent('/properties/list')}`
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error('Could not upgrade role: ' + msg);
        setIsSubmitting(false);
      }
    }, 5000);
  };

  return (
    <UserLayout>
      <Head>
        <title>Rentify | Become Landlord</title>
        <meta
          name="description"
          content="Upgrade your account to become a landlord and start listing your properties on Rentify."
        />
      </Head>
      <div
        className={`min-h-screen flex items-center justify-center p-6 ${
          theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
        }`}
      >
        <div
          className={`max-w-3xl w-full rounded-2xl shadow-lg p-8 space-y-6 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h1 className="text-3xl font-bold">Become a Landlord</h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
            By enrolling as a landlord, you agree to our platform’s{' '}
            <Link href="/terms&conditions" className="underline hover:text-blue-600">
            Terms&nbsp;&amp;&nbsp;Conditions
            </Link>
          </p>
          <div className="space-y-4">
            <div
              className={`max-h-64 overflow-y-auto border rounded-lg p-4 ${
                theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-700'
              }`}
            >
              <h2 className="font-semibold mb-2">Terms & Conditions (excerpt)</h2>
              <ul
                className={`list-disc pl-5 space-y-1 text-sm ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}
              >
                <li>You may only list properties you own or manage legally.</li>
                <li>All property photos must be accurate and up to date.</li>
                <li>You must respond to tenant inquiries within 48 hours.</li>
                <li>Monthly rent payments are handled via our integrated payment gateway.</li>
                <li>Failure to comply may result in suspension of your landlord account.</li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleBecomeLandlord}
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg text-lg font-semibold shadow ${
              isSubmitting
                ? 'opacity-50 cursor-not-allowed'
                : theme === 'dark'
                ? 'bg-blue-700 text-white hover:bg-blue-600'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Processing…' : 'I Agree & Become a Landlord'}
          </button>
        </div>
      </div>
    </UserLayout>
  );
};

export default BecomeLandlordPage;
