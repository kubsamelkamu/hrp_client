import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {fetchUsers,changeUserRole,deleteUser,User as AdminUser,} from '@/store/slices/adminSlice';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import Head from 'next/head';

const AdminUsersPage: NextPage = () => {

  const dispatch = useAppDispatch();
  const { users, loading, error, usersPage, usersTotalPages } = useAppSelector(
    (state) => state.admin
  );

  const [page, setPage] = useState<number>(usersPage);
  const limit = 5;

  useEffect(() => {
    dispatch(fetchUsers({ page, limit }));
  }, [dispatch, page]);

  const [changingRoleIds, setChangingRoleIds] = useState<Record<string, boolean>>({});
  const handleRoleChange = async (userId: string, newRole: AdminUser['role']) => {
    setChangingRoleIds((m) => ({ ...m, [userId]: true }));
    try {
      await dispatch(changeUserRole({ userId, role: newRole })).unwrap();
      toast.success('User role updated');
      dispatch(fetchUsers({ page, limit }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error('Could not change role: ' + msg);
    } finally {
      setChangingRoleIds((m) => {
        const next = { ...m };
        delete next[userId];
        return next;
      });
    }
  };

  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});
  const handleDeleteUser = async (userId: string) => {
    setDeletingIds((m) => ({ ...m, [userId]: true }));
    try {
      await dispatch(deleteUser(userId)).unwrap();
      toast.success('User deleted');

      if (users.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        dispatch(fetchUsers({ page, limit }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error('Could not delete user: ' + msg);
    } finally {
      setDeletingIds((m) => {
        const next = { ...m };
        delete next[userId];
        return next;
      });
    }
  };

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNext = () => {
    if (page < usersTotalPages) setPage(page + 1);
  };

  return (
    <AdminLayout>
      <Head>
        <title> Rentify | User</title>
        <meta
          name="description"
          content="Admin page to manage users for Rentify, including role changes and deletions."
        />
        <link rel="canonical" href="/about" />
      </Head>
      <div className="flex flex-col space-y-6">
        <div className="p-4 bg-blue-600 rounded-lg">
          <h1 className="text-2xl font-bold text-white">Manage Users</h1>
        </div>
        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        )}
        {error && <p className="text-red-500">Error loading users: {error}</p>}
        {!loading && !error && users.length === 0 && (
          <p className="text-gray-600">No users found.</p>
        )}
        {!loading && !error && users.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 bg-white text-gray-900">
                <thead className="bg-blue-600">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-white">Name</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-white">Email</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-white">Role</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-white">Joined</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="px-4 py-3 whitespace-nowrap">{u.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <a href={`mailto:${u.email}`} className="text-blue-600">
                          {u.email}
                        </a>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            handleRoleChange(u.id, e.target.value as AdminUser['role'])
                          }
                          disabled={changingRoleIds[u.id]}
                          className="px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-50"
                        >
                          <option value="TENANT">Tenant</option>
                          <option value="LANDLORD">Landlord</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={deletingIds[u.id]}
                          className={`px-3 py-1 rounded text-sm font-medium transition ${
                            deletingIds[u.id]
                              ? 'opacity-50 cursor-not-allowed'
                              : 'bg-red-500 hover:bg-red-600 text-white'
                          }`}
                        >
                          {deletingIds[u.id] ? 'Deleting…' : 'Delete'}
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
                Page {page} of {usersTotalPages}
              </span>

              <button
                onClick={handleNext}
                disabled={page >= usersTotalPages}
                className={`px-3 py-1 rounded ${
                  page >= usersTotalPages
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

export default AdminUsersPage;
