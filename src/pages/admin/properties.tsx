import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {fetchProperties,deletePropertyByAdmin} from '@/store/slices/adminSlice';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import Head from 'next/head';

const AdminPropertiesPage: NextPage = () => {

  const dispatch = useAppDispatch();
  const {properties,loading,error,propertiesPage,propertiesTotalPages,} = useAppSelector((state) => state.admin);
  const [page, setPage] = useState<number>(propertiesPage);
  const limit = 5;

  useEffect(() => {
    dispatch(fetchProperties({ page, limit }));
  }, [dispatch, page]);

  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});

  const handleDeleteProperty = async (propertyId: string) => {
    setDeletingIds((m) => ({ ...m, [propertyId]: true }));
    try {
      await dispatch(deletePropertyByAdmin(propertyId)).unwrap();
      toast.success('Property deleted');

      if (properties.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        dispatch(fetchProperties({ page, limit }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error('Could not delete property: ' + msg);
    } finally {
      setDeletingIds((m) => {
        const next = { ...m };
        delete next[propertyId];
        return next;
      });
    }
  };

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNext = () => {
    if (page < propertiesTotalPages) setPage(page + 1);
  };

  return (
    <AdminLayout>
      <Head>
        <title> Rentify | Properties</title>
        <meta
          name="description"
          content="Admin page to manage properties for Rentify."
        />
        <link rel="canonical" href="/admin/properties" />
      </Head>
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-bold text-blue-600">
          Manage Properties
        </h1>

        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        )}

        {error && <p className="text-red-500">Error loading properties: {error}</p>}
        {!loading && !error && properties.length === 0 && (
          <p className="text-gray-600">No properties found.</p>
        )}

        {!loading && !error && properties.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 bg-white text-gray-900">
                <thead className="bg-blue-600">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-white">Title</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-white">City</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-white">Rent (per mo)</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-white">Landlord ID</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-white">Created On</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {properties.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3 whitespace-nowrap">{p.title}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{p.city}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {p.rentPerMonth.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{p.landlordId}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleDeleteProperty(p.id)}
                          disabled={deletingIds[p.id]}
                          className={`px-3 py-1 rounded text-sm font-medium transition ${
                            deletingIds[p.id]
                              ? 'opacity-50 cursor-not-allowed bg-red-400 text-white'
                              : 'bg-red-500 hover:bg-red-600 text-white'
                          }`}
                        >
                          {deletingIds[p.id] ? 'Deleting…' : 'Delete'}
                        </button>
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
                Page {page} of {propertiesTotalPages}
              </span>

              <button
                onClick={handleNext}
                disabled={page >= propertiesTotalPages}
                className={`px-3 py-1 rounded ${
                  page >= propertiesTotalPages
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

export default AdminPropertiesPage;
