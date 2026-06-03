'use client';

import { useState, useEffect } from 'react';
import { getAuditLogsAction } from '@/app/admin/actions/audit.actions';
import { formatINR } from '@/lib/currency';
import { Search, ChevronLeft, ChevronRight, Calendar, User, Settings, ArrowRight } from 'lucide-react';

interface AuditLog {
  id: string;
  tenant_id: string;
  branch_id: string | null;
  actor_id: string | null;
  actor_role: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  metadata: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const result = await getAuditLogsAction(page, 15);
      setLogs(result.data as AuditLog[]);
      setCount(result.count);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const toggleExpand = (logId: string) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#fcfaf4]">
      {/* Tab Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold font-display text-transparent bg-clip-text bg-gradient-to-r from-[#fcfaf4] to-[#e28743]">
            Audit Logging & Compliance
          </h2>
          <p className="text-xs text-[#fcfaf4]/50 mt-1">
            Immutable trace of administrative shifts, modifications, and billing actions.
          </p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-[#151820] border border-[#262b38] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#262b38]/50 bg-[#1e222d]/30 text-xs font-bold text-[#fcfaf4]/40 tracking-wider uppercase">
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6">Operator</th>
                <th className="py-4 px-6">Action</th>
                <th className="py-4 px-6">Entity Target</th>
                <th className="py-4 px-6">IP Address</th>
                <th className="py-4 px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262b38]/30 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#fcfaf4]/40">
                    <span className="inline-block w-6 h-6 border-2 border-[#e28743] border-t-transparent rounded-full animate-spin"></span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#fcfaf4]/40 font-semibold">
                    No compliance records logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <>
                      <tr key={log.id} className="hover:bg-[#1e222d]/20 transition-all">
                        <td className="py-4 px-6 font-mono text-xs text-[#fcfaf4]/60">
                          {new Date(log.created_at).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#fcfaf4]/80">System Operator</span>
                            <span className="text-xs text-[#e28743] font-bold uppercase tracking-wider scale-[0.9] origin-left">
                              {log.actor_role}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-mono text-xs font-semibold text-[#f0a050]">
                          {log.action}
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-[#fcfaf4]/50">
                          {log.entity_type} {log.entity_id ? `(${log.entity_id.substring(0, 8)})` : ''}
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-[#fcfaf4]/40">
                          {log.ip_address || '—'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => toggleExpand(log.id)}
                            className="px-3 py-1.5 bg-[#1e222d] border border-[#262b38] hover:border-[#e28743]/50 text-[#fcfaf4]/70 hover:text-[#e28743] text-xs font-bold rounded-xl transition-all cursor-pointer"
                          >
                            {isExpanded ? 'Hide' : 'Changes'}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-[#1e222d]/40">
                          <td colSpan={6} className="py-6 px-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
                              <div className="space-y-2">
                                <span className="text-[#fcfaf4]/40 font-bold block uppercase tracking-wider">Before Change</span>
                                <pre className="p-4 bg-[#0d0f12] border border-[#262b38] rounded-2xl overflow-auto max-h-60 text-red-300">
                                  {log.old_data ? JSON.stringify(log.old_data, null, 2) : 'No old data available'}
                                </pre>
                              </div>
                              <div className="space-y-2">
                                <span className="text-[#fcfaf4]/40 font-bold block uppercase tracking-wider">After Change</span>
                                <pre className="p-4 bg-[#0d0f12] border border-[#262b38] rounded-2xl overflow-auto max-h-60 text-green-300">
                                  {log.new_data ? JSON.stringify(log.new_data, null, 2) : 'No new data available'}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="py-4 px-6 bg-[#1e222d]/20 border-t border-[#262b38]/50 flex items-center justify-between text-xs text-[#fcfaf4]/40">
          <span>
            Showing <strong className="text-[#fcfaf4]/60">{logs.length}</strong> logs of <strong className="text-[#fcfaf4]/60">{count}</strong> records
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="p-2 bg-[#1e222d] border border-[#262b38] rounded-xl hover:text-[#e28743] transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-bold text-[#fcfaf4]/60">Page {page + 1}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={(page + 1) * 15 >= count}
              className="p-2 bg-[#1e222d] border border-[#262b38] rounded-xl hover:text-[#e28743] transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
