import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { UserCheck, UserX, Trash2, Search, Filter } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;

      const response = await api.get('/admin/users', { params });
      setUsers(response.data.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleApproveTeacher = async (id) => {
    if (!window.confirm('Setujui akun guru ini?')) return;
    try {
      await api.patch(`/admin/teachers/${id}/approve`);
      fetchUsers();
    } catch (error) {
      alert('Gagal menyetujui guru.');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Yakin ingin menghapus user ini secara permanen?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menghapus user.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen User</h1>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <button type="submit" className="hidden">Cari</button>
          </form>

          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white/50 dark:bg-gray-800/50 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Semua Role</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="p-4 font-medium">Nama</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      Tidak ada user ditemukan.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="p-4 font-medium text-gray-900 dark:text-white">{u.name}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-300">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full 
                          ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 
                            u.role === 'teacher' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 
                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.role === 'teacher' ? (
                          u.is_approved ? (
                            <span className="flex items-center text-sm text-green-600 dark:text-green-400">
                              <UserCheck size={16} className="mr-1" /> Approved
                            </span>
                          ) : (
                            <span className="flex items-center text-sm text-yellow-600 dark:text-yellow-400">
                              <UserX size={16} className="mr-1" /> Pending
                            </span>
                          )
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {u.role === 'teacher' && !u.is_approved && (
                          <button
                            onClick={() => handleApproveTeacher(u.id)}
                            className="p-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                            title="Setujui Guru"
                          >
                            <UserCheck size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                          title="Hapus User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
