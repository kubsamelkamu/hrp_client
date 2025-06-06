import React, { useEffect, useContext, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPropertyById, deleteProperty } from '@/store/slices/propertySlice';
import { requestBooking } from '@/store/slices/bookingSlice';
import PropertyReviews from '@/components/review/PropertyReviews';
import UserLayout from '@/components/userLayout/Layout';
import { ThemeContext } from '@/components/context/ThemeContext';
import Head from 'next/head';

const PropertyDetailPage: React.FC = () => {
  
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useAppDispatch();
  const { current, loading, error } = useAppSelector((s) => s.properties);
  const { loading: bookingLoading } = useAppSelector((s) => s.bookings);
  const authUser = useAppSelector((s) => s.auth.user);
  const { theme } = useContext(ThemeContext)!;

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    if (typeof id === 'string') {
      dispatch(fetchPropertyById(id));
    }
  }, [id, dispatch]);

  const handleDelete = async () => {
    if (!current?.id) return;
    const promise = dispatch(deleteProperty(current.id)).unwrap();
    toast.promise(promise, {
      loading: 'Deleting...',
      success: 'Property deleted',
      error: 'Delete failed',
    });
    promise.then(() => router.push('/properties'));
  };

  const handleBooking = () => {
    if (!startDate || !endDate) {
      return toast.error('Select both start and end dates');
    }
    if (!current) return;
    const promise = dispatch(
      requestBooking({ propertyId: current.id, startDate, endDate })
    ).unwrap();
    toast.promise(promise, {
      loading: 'Sending request...',
      success: 'Request sent!',
      error: 'Request failed. Try again later.',
    });
    promise.then(() => {
      setStartDate('');
      setEndDate('');
    });
  };

  const today = new Date().toISOString().split('T')[0];

  const isLoggedIn = !!authUser;
  const isTenant = authUser?.role === 'TENANT';
  const isPropLandlord =
    authUser?.role === 'LANDLORD' && authUser.id === current?.landlord?.id;

  return (
    <UserLayout>
      <Head>
        <title> Rentify | Properties</title>
        <meta
          name="description"
          content="View property details, images, and request bookings. Connect with landlords or tenants."
        />
        <link rel="canonical" href="/booking" />
      </Head>
      <div
        className={`min-h-screen py-8 px-4 lg:px-0 ${
          theme === 'light'
            ? 'bg-gray-100 text-gray-900'
            : 'bg-gray-900 text-gray-100'
        }`}
      >
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div
              className={`animate-spin h-12 w-12 border-t-4 rounded-full ${
                theme === 'light' ? 'border-blue-600' : 'border-blue-400'
              }`}
            />
          </div>
        )}

        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && current && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="col-span-2 space-y-6">
              <div
                className={`rounded-2xl overflow-hidden ${
                  theme === 'light' ? 'bg-white shadow-md' : 'bg-gray-800 shadow-gray-800/50'
                }`}
              >
                {current.images?.length ? (
                  <div className="grid grid-cols-2 gap-2">
                    {current.images.slice(0, 4).map((img, idx) => (
                      <motion.div
                        key={img.id}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                        className={`relative ${idx === 0 ? 'col-span-2 row-span-2 h-96' : 'h-48'}`}
                      >
                        <Image src={img.url} alt={img.fileName} fill className="object-cover" />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No Images
                  </div>
                )}
              </div>
              <div
                className={`p-6 rounded-2xl ${
                  theme === 'light' ? 'bg-white shadow-md' : 'bg-gray-800 shadow-gray-800/50'
                }`}
              >
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                  {current.title}
                </h1>
                <p className="text-lg text-gray-500 mb-4">{current.city}</p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-2 sm:space-y-0">
                  <div>
                    <span className="text-2xl font-extrabold">
                      {current.rentPerMonth} Birr/mo
                    </span>
                    <span className="ml-4 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                      {current.propertyType}
                    </span>
                  </div>
                  {isPropLandlord && (
                    <div className="flex space-x-2">
                      <Link
                        href={`/properties/${current.id}/edit`}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <p className={`mb-6 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>
                  {current.description}
                </p>
                <div className="border-t pt-4">
                  <h2 className="text-xl font-semibold mb-2">Owner Information</h2>
                  <p>
                    <span className="font-medium">Name:</span> {current.landlord?.name || '—'}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{' '}
                    {current.landlord?.email ? (
                      <a
                        href={`mailto:${current.landlord.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {current.landlord.email}
                      </a>
                    ) : (
                      '—'
                    )}
                  </p>
                </div>
                <div className="mt-8">
                  <PropertyReviews propertyId={current.id} />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div
                className={`p-6 rounded-2xl space-y-4 ${
                  theme === 'light' ? 'bg-white shadow-md' : 'bg-gray-800 shadow-gray-800/50'
                }`}
              >
                {!isLoggedIn ? (
                  <button
                    onClick={() =>
                      router.push(
                        `/auth/login?redirect=${encodeURIComponent(router.asPath)}`
                      )
                    }
                    className="w-full py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                  >
                    Login to Book
                  </button>
                ) : isTenant && !isPropLandlord ? (
                  <>
                    <h2 className="text-2xl font-semibold mb-4">Request Booking</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          min={today}
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
                            theme === 'light'
                              ? 'focus:ring-2 focus:ring-blue-500'
                              : 'focus:ring-2 focus:ring-blue-400'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          min={startDate || today}
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
                            theme === 'light'
                              ? 'focus:ring-2 focus:ring-blue-500'
                              : 'focus:ring-2 focus:ring-blue-400'
                          }`}
                        />
                      </div>
                      <motion.button
                        onClick={handleBooking}
                        disabled={bookingLoading}
                        whileHover={{ scale: 1.05 }}
                        className="w-full py-3 bg-blue-600 text-white rounded-full disabled:opacity-50 transition"
                      >
                        {bookingLoading ? 'Sending...' : 'Send Request'}
                      </motion.button>
                    </div>
                  </>
                ) : isPropLandlord ? (
                  <Link
                    href={`/properties/${current.id}/bookings`}
                    className="block text-center py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition"
                  >
                    View Booking Requests
                  </Link>
                ) : null}
              </div>
              <div>
                <Link
                  href={
                    authUser
                      ? `/properties/${current.id}/chat`
                      : `/auth/login?redirect=${encodeURIComponent(router.asPath)}`
                  }
                  className="w-full block text-center py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
                >
                  Chat with {isPropLandlord ? 'Tenant' : 'Owner'}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default PropertyDetailPage;
