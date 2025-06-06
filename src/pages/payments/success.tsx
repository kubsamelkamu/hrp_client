import { useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { useAppDispatch } from '@/store/hooks';
import { fetchUserBookings } from '@/store/slices/bookingSlice';
import toast from 'react-hot-toast';
import UserLayout from '@/components/userLayout/Layout';
import { ThemeContext } from '@/components/context/ThemeContext';
import Head from 'next/head';

const PaymentSuccessPage = () => {
  
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { theme } = useContext(ThemeContext)!;
  const { bookingId } = router.query;

  useEffect(() => {
    if (bookingId) {
      dispatch(fetchUserBookings())
        .unwrap()
        .then(() => {
          toast.success('Payment successfully completed!');
        })
        .catch(() => {
          toast.error('Failed to refresh your bookings.');
        });
    }
  }, [bookingId, dispatch]);

  return (
    <UserLayout>
        <Head>
          <title> Rentify | Payment</title>
          <meta
            name="description"
            content="Your payment has been successfully processed. Thank you for choosing Rentify!"
          />
          <link rel="canonical" href="/booking" />
        </Head>
      <div
        className={`min-h-screen p-6 flex flex-col justify-center items-center transition-colors 
          ${theme === 'light' ? 'bg-gray-50 border-gray-200 text-gray-800' : 'bg-gray-900 border-gray-700 text-gray-100'}`}
      >
        <h1 className="text-3xl font-bold mb-4">
          Payment Successfully Completed! 🎉
        </h1>
        <p className="mb-6">
          Thank you for your payment. Your booking is confirmed and we look forward to serving you.
        </p>
        <button
          onClick={() => router.push('/bookings')}
          className={`px-4 py-2 text-white rounded transition ${
            theme === 'dark'
              ? 'bg-green-700 hover:bg-green-600'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          Go to My Bookings
        </button>
      </div>
    </UserLayout>
  );
};

export default PaymentSuccessPage;
