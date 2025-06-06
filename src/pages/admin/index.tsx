import { NextPage } from 'next';
import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMetrics } from '@/store/slices/adminSlice';
import  AdminLayout from '@/components/admin/AdminLayout';
import { motion } from 'framer-motion';
import {Users as UsersIcon,Home as HomeIcon,CalendarCheck as BookingsIcon,Star as ReviewsIcon,
Currency as RevenueIcon,
} from 'lucide-react';
import Head from 'next/head';

const AdminDashboardPage: NextPage = () => {

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth)!;
  const { metrics, loading, error } = useAppSelector((state) => state.admin);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      dispatch(fetchMetrics());
    }
  }, [dispatch, user]);

  const todayString = useMemo(() => {
    const opts: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date().toLocaleDateString('en-US', opts);
  }, []);

  return (
    <AdminLayout>
      <Head>
        <title> Rentify | Dashboard</title>
        <meta
          name="description"
          content="Admin dashboard for Rentify to manage properties, bookings, and users."
        />
        <link rel="canonical" href="/admin" />
      </Head>
      <div className="flex flex-col space-y-6">
        <div
          className="
            flex flex-col sm:flex-row sm:items-center sm:justify-between
            p-15 rounded-lg shadow
            bg-blue-600
          "
        >
          <div>
            <h1 className="text-2xl font-bold text-white">
              Hello, {user?.name || 'Admin'} 👋
            </h1>
            <p className="mt-1 text-sm text-blue-100">
              Today is {todayString}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <h2 className="text-lg font-semibold text-white">
              Dashboard Overview
            </h2>
          </div>
        </div>
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        )}
        {error && (
          <p className="text-red-500 text-center">
            Error loading metrics: {error}
          </p>
        )}
        {!loading && metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="
                p-6 rounded-lg transition-shadow duration-200
                bg-blue-600 text-white hover:shadow-xl
                cursor-pointer
              "
            >
              <div className="flex items-center space-x-3">
                <UsersIcon className="w-6 h-6 text-white" />
                <h3 className="text-sm font-medium text-white">
                  Total Users
                </h3>
              </div>
              <p className="mt-4 text-3xl font-extrabold">
                {metrics.totalUsers.toLocaleString()}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.03 }}
              className="
                p-6 rounded-lg transition-shadow duration-200
                bg-blue-600 text-white hover:shadow-xl
                cursor-pointer
              "
            >
              <div className="flex items-center space-x-3">
                <HomeIcon className="w-6 h-6 text-white" />
                <h3 className="text-sm font-medium text-white">
                  Total Properties
                </h3>
              </div>
              <p className="mt-4 text-3xl font-extrabold">
                {metrics.totalProperties.toLocaleString()}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.03 }}
              className="
                p-6 rounded-lg transition-shadow duration-200
                bg-blue-600 text-white hover:shadow-xl
                cursor-pointer
              "
            >
              <div className="flex items-center space-x-3">
                <BookingsIcon className="w-6 h-6 text-white" />
                <h3 className="text-sm font-medium text-white">
                  Total Bookings
                </h3>
              </div>
              <p className="mt-4 text-3xl font-extrabold">
                {metrics.totalBookings.toLocaleString()}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.03 }}
              className="
                p-6 rounded-lg transition-shadow duration-200
                bg-blue-600 text-white hover:shadow-xl
                cursor-pointer
              "
            >
              <div className="flex items-center space-x-3">
                <ReviewsIcon className="w-6 h-6 text-white" />
                <h3 className="text-sm font-medium text-white">
                  Total Reviews
                </h3>
              </div>
              <p className="mt-4 text-3xl font-extrabold">
                {metrics.totalReviews.toLocaleString()}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.03 }}
              className="
                p-6 rounded-lg transition-shadow duration-200
                bg-blue-600 text-white hover:shadow-xl
                cursor-pointer
              "
            >
              <div className="flex items-center space-x-3">
                <RevenueIcon className="w-6 h-6 text-white" />
                <h3 className="text-sm font-medium text-white">
                  Total Revenue (ETB)
                </h3>
              </div>
              <p className="mt-4 text-3xl font-extrabold">
                {metrics.totalRevenue.toLocaleString()}
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
