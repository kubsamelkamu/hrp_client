import { NextPage } from 'next';
import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import UserLayout from '@/components/userLayout/Layout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import toast from 'react-hot-toast';
import socket from '@/utils/socket';
import {fetchUserBookings,cancelBooking,updateBookingInStore,Booking,} from '@/store/slices/bookingSlice';
import { initiatePayment } from '@/store/slices/paymentSlice';
import { ThemeContext } from '@/components/context/ThemeContext';
import Head from 'next/head';

const PAGE_SIZE = 5;

const TenantBookingsPage: NextPage = () => {
  
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { theme } = useContext(ThemeContext)!;
  const { user } = useAppSelector((state) => state.auth);
  const { items: bookings, loading, error } = useAppSelector(
    (state) => state.bookings
  );
  const { statuses: paymentStatuses } = useAppSelector(
    (state) => state.payment
  );

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(bookings.length / PAGE_SIZE);
  const paginated = bookings.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    if (!user) {
      router.replace(
        `/auth/login?redirect=${encodeURIComponent('/bookings')}`
      );
    } else if (user.role !== 'TENANT') {
      router.replace('/');
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role === 'TENANT') {
      dispatch(fetchUserBookings());
    }
  }, [dispatch, user]);

  useEffect(() => {
    const onFocus = () => {
      if (user?.role === 'TENANT') {
        dispatch(fetchUserBookings());
      }
    };
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, [dispatch, user]);

  useEffect(() => {
    if (!user?.id) return;
    const room = `user_${user.id}`;
    socket.emit('joinRoom', room);

    const handleNewBooking = (b: Booking) => {
      dispatch(updateBookingInStore(b));
      toast.success(`New booking for "${b.property?.title}" created!`);
    };

    const handleBookingUpdate = (b: Booking) => {
      dispatch(updateBookingInStore(b));
      toast.success(`Booking "${b.property?.title}" is now ${b.status}`);
    };

    const handlePaymentUpdate = (payload: {
      bookingId: string;
      paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED';
    }) => {
      dispatch(
        updateBookingInStore({
          id: payload.bookingId as string,
          payment: {
            status: payload.paymentStatus,
            amount: 0,
            currency: '',
            transactionId: '',
          },
        } as Booking)
      );

      if (payload.paymentStatus === 'SUCCESS') {
        toast.success('Payment succeeded for your booking.');
      } else if (payload.paymentStatus === 'FAILED') {
        toast.error('Payment failed for your booking.');
      }
    };

    socket.on('newBooking', handleNewBooking);
    socket.on('bookingStatusUpdate', handleBookingUpdate);
    socket.on('paymentStatusUpdated', handlePaymentUpdate);

    return () => {
      socket.emit('leaveRoom', room);
      socket.off('newBooking', handleNewBooking);
      socket.off('bookingStatusUpdate', handleBookingUpdate);
      socket.off('paymentStatusUpdated', handlePaymentUpdate);
    };
  }, [dispatch, user]);

  const handleCancel = (bookingId: string) => {
    const promise = dispatch(cancelBooking(bookingId)).unwrap();
    toast.promise(promise, {
      loading: 'Cancelling…',
      success: 'Booking cancelled',
      error: 'Cancel failed',
    });
  };

  const handlePayNow = async (bookingId: string) => {
    try {
      const resultAction = await dispatch(
        initiatePayment({ bookingId })
      ).unwrap();
      window.location.href = resultAction.checkoutUrl;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Already Paid';
      toast.error(msg);
    }
  };

  if (!user || user.role !== 'TENANT') {
    return null;
  }

  return (
    <UserLayout>
      <Head>
        <title> Rentify | Booking</title>
        <meta
          name="description"
          content="View and manage your bookings on Rentify. Cancel or pay for your bookings easily."
        />
        <link rel="canonical" href="/booking" />
      </Head>
      <div
        className={`min-h-screen p-6 transition-colors ${
          theme === 'dark'
            ? 'bg-gray-900 text-gray-100'
            : 'bg-gray-50 text-gray-900'
        }`}
      >
        <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
        {loading && (
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Loading your bookings…
          </p>
        )}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && bookings.length === 0 && (
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            You haven’t made any bookings yet.
          </p>
        )}
        {!loading && paginated.length > 0 && (
          <div className="space-y-4">
            {paginated.map((b) => {
              const serverStatus = b.payment?.status ?? null;
              const clientStatus = paymentStatuses[b.id] ?? null;
              const effectivePaymentStatus:
                | 'PENDING'
                | 'SUCCESS'
                | 'FAILED'
                | null =
                serverStatus !== null
                  ? serverStatus
                  : clientStatus !== null
                  ? clientStatus
                  : null;

              let paymentElement: React.ReactNode;

              if (b.status === 'PENDING') {
                paymentElement = (
                  <span
                    className={
                      theme === 'dark'
                        ? 'text-gray-400'
                        : 'text-gray-600'
                    }
                  >
                    Booking Pending
                  </span>
                );
              } else if (b.status === 'CONFIRMED') {
                if (
                  effectivePaymentStatus === 'PENDING' ||
                  effectivePaymentStatus === null
                ) {
                  paymentElement = (
                    <button
                      onClick={() => handlePayNow(b.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Pay Now
                    </button>
                  );
                } else if (effectivePaymentStatus === 'SUCCESS') {
                  paymentElement = (
                    <span className="text-green-500 font-medium">Paid</span>
                  );
                } else if (effectivePaymentStatus === 'FAILED') {
                  paymentElement = (
                    <span className="text-red-500">Payment Failed</span>
                  );
                } else {
                  paymentElement = <span>—</span>;
                }
              } else {
                paymentElement = <span>—</span>;
              }

              return (
                <div
                  key={b.id}
                  className={`p-4 rounded shadow transition-colors ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p
                        className={`font-medium ${
                          theme === 'dark'
                            ? 'text-gray-100'
                            : 'text-gray-900'
                        }`}
                      >
                        {b.property?.title}{' '}
                        <span className="italic">({b.status})</span>
                      </p>
                      <p
                        className={
                          theme === 'dark'
                            ? 'text-gray-400'
                            : 'text-gray-600'
                        }
                      >
                        {new Date(b.startDate).toLocaleDateString()} –{' '}
                        {new Date(b.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    {b.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  <div className="mt-3">{paymentElement}</div>
                </div>
              );
            })}
          </div>
        )}
        {!loading && bookings.length > PAGE_SIZE && (
          <div className="mt-6 flex justify-center items-center space-x-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600 transition"
            >
              Previous
            </button>
            <span
              className={theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}
            >
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default TenantBookingsPage;
