import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {fetchBookings,updateBookingStatus,Booking,} from '@/store/slices/adminSlice';
import toast from 'react-hot-toast';

import Head from 'next/head';
import AdminLayout from '@/components/admin/AdminLayout';

const PAGE_SIZE = 5;

const AdminBookingsPage: NextPage = () => {

  const dispatch = useAppDispatch();
  const {bookings,bookingsPage,bookingsTotalPages,loading,error,} = useAppSelector((state) => state.admin);
  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState<number>(bookingsPage);

  useEffect(() => {
    dispatch(fetchBookings({ page, limit: PAGE_SIZE }));
  }, [dispatch, page]);

  useEffect(() => {
    setPage(bookingsPage);
  }, [bookingsPage]);

  const handleStatusUpdate = async (
    bookingId: string,
    newStatus: 'CONFIRMED' | 'REJECTED'
  ) => {

    setUpdatingIds((m) => ({ ...m, [bookingId]: true }));
    try {
      await dispatch(updateBookingStatus({ bookingId, status: newStatus })).unwrap();
      toast.success(`Booking ${newStatus.toLowerCase()}`);
      dispatch(fetchBookings({ page, limit: PAGE_SIZE }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error('Could not update booking status: ' + msg);
    } finally {
      setUpdatingIds((m) => {
        const next = { ...m };
        delete next[bookingId];
        return next;
      });
    }
  };

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < bookingsTotalPages) setPage(page + 1);
  };

  return (
    <AdminLayout>
      <Head>
        <title> Rentify | Booking</title>
        <meta
          name="description"
          content="Admin page to manage bookings for Rentify properties."
        />
        <link rel="canonical" href="/admin/bookings" />
      </Head>
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-bold text-blue-600">
          Manage Bookings
        </h1>
        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        )}

        {error && (
          <p className="text-red-500">Error loading bookings: {error}</p>
        )}

        {!loading && !error && bookings.length === 0 && (
          <p className="text-gray-600">No bookings found.</p>
        )}
        {!loading && !error && bookings.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 bg-white text-gray-900">
                <thead className="bg-blue-600">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-white">Property</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-white">Tenant</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-white">Dates</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-white">Booking Status</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-white">Payment Status</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((b: Booking) => (
                    <tr key={b.id}>
                      <td className="px-4 py-3 whitespace-nowrap">{b.property?.title}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {b.tenant?.name} <br />
                        <a
                          href={`mailto:${b.tenant?.email}`}
                          className="text-blue-500 hover:underline text-sm"
                        >
                          {b.tenant?.email}
                        </a>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(b.startDate).toLocaleDateString()} &ndash;{' '}
                        {new Date(b.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            b.status === 'PENDING'
                              ? 'bg-yellow-200 text-yellow-800'
                              : b.status === 'CONFIRMED'
                              ? 'bg-green-200 text-green-800'
                              : b.status === 'REJECTED'
                              ? 'bg-red-200 text-red-800'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {b.payment ? (
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                              b.payment.status === 'PENDING'
                                ? 'bg-yellow-200 text-yellow-800'
                                : b.payment.status === 'SUCCESS'
                                ? 'bg-green-200 text-green-800'
                                : 'bg-red-200 text-red-800'
                            }`}
                          >
                            {b.payment.status}
                          </span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        {b.status === 'PENDING' ? (
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleStatusUpdate(b.id, 'CONFIRMED')}
                              disabled={updatingIds[b.id]}
                              className={`px-3 py-1 rounded text-sm font-medium transition ${
                                updatingIds[b.id]
                                  ? 'opacity-50 cursor-not-allowed bg-blue-400 text-white'
                                  : 'bg-green-500 hover:bg-green-600 text-white'
                              }`}
                            >
                              {updatingIds[b.id] ? '…' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(b.id, 'REJECTED')}
                              disabled={updatingIds[b.id]}
                              className={`px-3 py-1 rounded text-sm font-medium transition ${
                                updatingIds[b.id]
                                  ? 'opacity-50 cursor-not-allowed bg-blue-400 text-white'
                                  : 'bg-red-500 hover:bg-red-600 text-white'
                              }`}
                            >
                              {updatingIds[b.id] ? '…' : 'Reject'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-blue-600 rounded-b-lg">
              <button
                onClick={handlePrev}
                disabled={page <= 1}
                className={`px-3 py-1 rounded ${
                  page <= 1
                    ? 'opacity-50 cursor-not-allowed bg-blue-400 text-white'
                    : 'bg-blue-800 hover:bg-blue-700 text-white'
                }`}
              >
                Previous
              </button>

              <span className="text-white">
                Page {page} of {bookingsTotalPages}
              </span>

              <button
                onClick={handleNext}
                disabled={page >= bookingsTotalPages}
                className={`px-3 py-1 rounded ${
                  page >= bookingsTotalPages
                    ? 'opacity-50 cursor-not-allowed bg-blue-400 text-white'
                    : 'bg-blue-800 hover:bg-blue-700 text-white'
                }`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBookingsPage;
