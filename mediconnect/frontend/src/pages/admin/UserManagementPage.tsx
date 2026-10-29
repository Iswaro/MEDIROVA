import React, { useEffect, useState } from 'react';
import { Users, Search, Shield, Ban, CheckCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { adminApi } from '../../api/admin';

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    adminApi
      .getUsers({ role: roleFilter || undefined, search: search || undefined })
      .then(res => {
        const list = Array.isArray(res?.data) ? res.data : (res?.data as any)?.items || [];
        setUsers(list);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    if (currentStatus) {
      await adminApi.suspendUser(userId, 'Suspended by admin');
    } else {
      await adminApi.activateUser(userId);
    }
    fetchUsers();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">User Account Management</h1>
          <p className="text-sm text-gray-500">Search, inspect roles, and manage account statuses.</p>
        </div>

        <div className="flex items-center gap-3">
          <Input
            placeholder="Search email/phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchUsers()}
            leftIcon={<Search className="w-4 h-4 text-gray-400" />}
            className="w-48 sm:w-64"
          />
          <Select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            placeholder="All Roles"
            options={[
              { value: 'PATIENT', label: 'Patient' },
              { value: 'PROVIDER', label: 'Provider' },
              { value: 'ADMIN', label: 'Admin' },
            ]}
          />
        </div>
      </div>

      <Card className="p-6 overflow-hidden">
        {loading ? (
          <Spinner size="lg" />
        ) : users.length === 0 ? (
          <p className="text-xs text-gray-400 py-8 text-center">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Joined</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="p-3 font-semibold text-gray-900">
                      {u.first_name} {u.last_name || ''}
                      <span className="text-gray-400 block font-normal text-[11px]">{u.email}</span>
                    </td>
                    <td className="p-3">{u.phone || '—'}</td>
                    <td className="p-3">
                      <Badge variant={u.role === 'ADMIN' ? 'danger' : u.role === 'PROVIDER' ? 'secondary' : 'primary'}>
                        {u.role}
                      </Badge>
                      {u.provider_type && (
                        <span className="block text-[10px] text-gray-400 mt-0.5">{u.provider_type}</span>
                      )}
                    </td>
                    <td className="p-3">
                      {u.is_active ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded-full font-bold border border-red-200">
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-gray-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      {u.role !== 'ADMIN' && (
                        <Button
                          size="sm"
                          variant={u.is_active ? 'ghost' : 'outline'}
                          onClick={() => handleToggleStatus(u.id, !!u.is_active)}
                          className={u.is_active ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600'}
                        >
                          {u.is_active ? 'Suspend' : 'Activate'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserManagementPage;
