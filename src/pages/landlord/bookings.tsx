import { NextPage } from 'next';
import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import UserLayout from '@/components/userLayout/Layout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import toast from 'react-hot-toast';
import socket from '@/utils/socket';
import {fetchLandlordBookings,confirmBooking,rejectBooking,updateBookingInStore,Booking,} from '@/store/slices/bookingSlice';
import { ThemeContext } from '@/components/context/ThemeContext';

const PAGE_SIZE = 5;

const LandlordBookingsPage: NextPage = () => {

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { theme } = useContext(ThemeContext)!;
  const { user } = useAppSelector((state) => state.auth);
  const { items: bookings, loading, error } = useAppSelector(
    (state) => state.bookings
  );

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(bookings.length / PAGE_SIZE));
  const paginated = bookings.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    if (!user) {
      router.push(
        `/auth/login?redirect=${encodeURIComponent(router.asPath)}`
      );
    } else if (user.role !== 'LANDLORD') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role === 'LANDLORD') {
      dispatch(fetchLandlordBookings());
    }
  }, [dispatch, user]);

  useEffect(() => {
    const onFocus = () => {
      if (user?.role === 'LANDLORD') {
        dispatch(fetchLandlordBookings());
      }
    };
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, [dispatch, user]);

  useEffect(() => {
    if (!user?.id) return;
    const room = `landlord_${user.id}`;
    socket.emit('joinRoom', room);

    const handleNewBooking = (b: Booking) => {
      dispatch(updateBookingInStore(b));
      toast.success(`New booking for "${b.property?.title}" received!`);
    };

    const handleBookingStatusUpdate = (b: Booking) => {
      dispatch(updateBookingInStore(b));
      toast.success(`Booking "${b.property?.title}" is now ${b.status}`);
    };

    const handlePaymentStatusUpdate = (payload: {
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
        toast.success('Payment succeeded for booking');
      } else if (payload.paymentStatus === 'FAILED') {
        toast.error('Payment failed for booking');
      }
    };

    socket.on('newBooking', handleNewBooking);
    socket.on('bookingStatusUpdate', handleBookingStatusUpdate);
    socket.on('paymentStatusUpdated', handlePaymentStatusUpdate);

    return () => {
      socket.emit('leaveRoom', room);
      socket.off('newBooking', handleNewBooking);
      socket.off('bookingStatusUpdate', handleBookingStatusUpdate);
      socket.off('paymentStatusUpdated', handlePaymentStatusUpdate);
    };
  }, [dispatch, user]);

  const handleAction = async (bookingId: string, action: 'confirm' | 'reject') => {
    try {
      if (action === 'confirm') {
        await dispatch(confirmBooking(bookingId)).unwrap();
        toast.success('Booking confirmed');
      } else {
        await dispatch(rejectBooking(bookingId)).unwrap();
        toast.success('Booking rejected');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  return (
    <UserLayout>
      <div
        className={`min-h-screen p-6 transition-colors ${
          theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
        }`}
      >
        <h1 className="text-3xl font-bold mb-6">All Booking Requests</h1>
        {loading && <p className="text-gray-500">Loading…</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && bookings.length === 0 && (
          <p className="text-gray-600">No booking requests yet.</p>
        )}
        {!loading && paginated.length > 0 && (
          <div className="overflow-x-auto">
            <table
              className={`w-full min-w-[600px] rounded shadow ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}>
                <tr>
                  <th className="p-3 text-left">Property</th>
                  <th className="p-3 text-left">Tenant</th>
                  <th className="p-3 text-left">Dates</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Payment</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((b) => (
                  <tr
                    key={b.id}
                    className={`border-t ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    }`}
                  >
                    <td className="p-3">{b.property?.title}</td>
                    <td className="p-3">{b.tenant?.name}</td>
                    <td className="p-3">
                      {new Date(b.startDate).toLocaleDateString()} –{' '}
                      {new Date(b.endDate).toLocaleDateString()}
                    </td>
                    <td className="p-3">{b.status}</td>
                    <td className="p-3">
                      {b.status === 'CONFIRMED' && b.payment?.status === 'PENDING' && (
                         <span className="text-green-500 font-medium">Paid</span>
                      )}
                      {b.payment?.status === 'SUCCESS' && (
                        <span className="text-yellow-500 font-medium">Awaiting Payment</span>
                      )}
                      {!(b.status === 'CONFIRMED' && b.payment?.status === 'PENDING') &&
                        !(b.payment?.status === 'SUCCESS') && <span>—</span>}
                    </td>
                    <td className="p-3 text-center space-x-2">
                      {b.status === 'PENDING' ? (
                        <>
                          <button
                            onClick={() => handleAction(b.id, 'confirm')}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleAction(b.id, 'reject')}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            <span className={theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>
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

export default LandlordBookingsPage;
