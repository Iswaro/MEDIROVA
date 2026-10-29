import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { adminApi } from '../../api/admin';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import type { AuditLog } from '../../types';

const AuditLogsPage = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    action: '',
    resource: '',
    userId: '',
    startDate: '',
    endDate: '',
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'audit-logs', page, filters],
    queryFn: () =>
      adminApi.getAuditLogs({
        page,
        limit,
        ...(filters.action && { action: filters.action }),
        ...(filters.resource && { resource: filters.resource }),
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      }),
  });

  const logs = data?.data?.items ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-500 mt-1">Review all system activity and changes</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Action..."
              value={filters.action}
              onChange={(e) => { setFilters((f) => ({ ...f, action: e.target.value })); setPage(1); }}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <input
            type="text"
            placeholder="Resource type..."
            value={filters.resource}
            onChange={(e) => { setFilters((f) => ({ ...f, resource: e.target.value })); setPage(1); }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <input
            type="text"
            placeholder="User ID..."
            value={filters.userId}
            onChange={(e) => { setFilters((f) => ({ ...f, userId: e.target.value })); setPage(1); }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => { setFilters((f) => ({ ...f, startDate: e.target.value })); setPage(1); }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => { setFilters((f) => ({ ...f, endDate: e.target.value })); setPage(1); }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" />
          </div>
        ) : logs.length === 0 ? (
          <EmptyState icon={FileText} title="No audit logs" description="No activity has been recorded yet." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Timestamp</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Action</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Resource</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">IP Address</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {log.user ? (
                          <span className="font-medium text-gray-800">
                            {log.user.firstName} {log.user.lastName}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">System</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="info">{log.action}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {log.resource}
                        {log.resourceId && (
                          <span className="text-gray-400 text-xs ml-1">#{log.resourceId.slice(0, 8)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                        {log.ipAddress || '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-primary hover:text-primary-dark transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages} · {data?.data?.total ?? 0} total entries
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} title="Audit Log Details">
        {selectedLog && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 mb-1">Timestamp</p>
                <p className="font-medium">{new Date(selectedLog.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Action</p>
                <Badge variant="info">{selectedLog.action}</Badge>
              </div>
              <div>
                <p className="text-gray-500 mb-1">User</p>
                <p className="font-medium">
                  {selectedLog.user
                    ? `${selectedLog.user.firstName} ${selectedLog.user.lastName} (${selectedLog.user.email})`
                    : 'System'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Resource</p>
                <p className="font-medium">
                  {selectedLog.resource} {selectedLog.resourceId && `#${selectedLog.resourceId.slice(0, 8)}`}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">IP Address</p>
                <p className="font-mono">{selectedLog.ipAddress || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">User Agent</p>
                <p className="text-xs break-all">{selectedLog.userAgent || '—'}</p>
              </div>
            </div>
            {selectedLog.details && (
              <div>
                <p className="text-gray-500 mb-1">Details</p>
                <pre className="bg-gray-50 rounded-lg p-3 text-xs overflow-auto max-h-48">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogsPage;
