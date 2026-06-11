'use client';
import { useToast } from '@/components/admin/UIPrimitives';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { MapPin, Image as ImageIcon, Clock, User, X } from 'lucide-react';

interface AttendanceLog {
  id: string;
  tenant_id: string;
  branch_id: string;
  staff_id: string;
  clock_in: string;
  clock_out: string | null;
  clock_in_lat: number | null;
  clock_in_lng: number | null;
  clock_out_lat: number | null;
  clock_out_lng: number | null;
  clock_in_selfie_url: string | null;
  clock_out_selfie_url: string | null;
  clock_in_address: string | null;
  status: 'clocked_in' | 'clocked_out' | 'auto_closed';
  duration_minutes: number | null;
  source: 'manual' | 'pos' | 'biometric';
  users?: {
    name: string;
    role: string;
  } | null;
}

interface AttendanceTabProps {
  branchId: string;
}

export default function AttendanceTab({ branchId }: AttendanceTabProps) {
  const supabase = createClient();
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [toastItem, toast] = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedSelfie, setSelectedSelfie] = useState<string | null>(null);
  const [selectedMap, setSelectedMap] = useState<{ lat: number; lng: number; label: string } | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('staff_attendance')
        .select('*, users:staff_id(name, role)')
        .eq('branch_id', branchId)
        .order('clock_in', { ascending: false });

      if (error) throw error;
      setLogs((data || []) as unknown as AttendanceLog[]);
    } catch (err) {
      toast('Failed to load attendance logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [branchId]);

  const getSelfieUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const { data } = supabase.storage.from('selfies').getPublicUrl(path);
    return data.publicUrl;
  };

  const formatDuration = (mins: number | null, start: string, end: string | null) => {
    if (mins) {
      const hrs = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return hrs > 0 ? `${hrs}h ${remainingMins}m` : `${remainingMins}m`;
    }
    if (!end) return 'Active';
    const durationMs = new Date(end).getTime() - new Date(start).getTime();
    const durationMins = Math.floor(durationMs / 60000);
    const hrs = Math.floor(durationMins / 60);
    const remainingMins = durationMins % 60;
    return hrs > 0 ? `${hrs}h ${remainingMins}m` : `${remainingMins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'clocked_in': return 'bg-green-500/15 text-green-600';
      case 'clocked_out': return 'bg-blue-500/15 text-blue-600';
      default: return 'bg-amber-500/15 text-amber-600';
    }
  };

  // Metrics
  const activeCount = logs.filter(l => l.status === 'clocked_in').length;
  const completedToday = logs.filter(l => l.status === 'clocked_out').length;

  return (
    <div className="space-y-6 text-[#1e293b] animate-fade-in">
      <div className="flex items-center justify-between border-b border-[#e2e8f0]/50 pb-4">
        <div>
          <h2 className="text-xl font-extrabold font-display">Daily Attendance Logs</h2>
          <p className="text-xs text-[#1e293b]/50">Monitor staff check-ins, coordinates verification, and selfie captures in real-time.</p>
        </div>
        <button 
          onClick={loadLogs}
          className="px-3 py-1.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-xs font-bold rounded-lg cursor-pointer transition-all border border-[#e2e8f0]"
        >
          Refresh Logs
        </button>
      </div>

      {/* Metrics Strips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600">
            <User size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#1e293b]/40">Active Shifts</span>
            <p className="text-xl font-black">{activeCount} Staff</p>
          </div>
        </div>
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#1e293b]/40">Completed Shifts</span>
            <p className="text-xl font-black">{completedToday} Today</p>
          </div>
        </div>
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600">
            <MapPin size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#1e293b]/40">Tracking Outlets</span>
            <p className="text-xl font-black">1 Geofence</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-[#1e293b]/40">
          <span className="inline-block w-6 h-6 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin"></span>
        </div>
      ) : (
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e2e8f0]/50 bg-[#f1f5f9]/30 text-xs font-bold text-[#1e293b]/40 tracking-wider uppercase">
                  <th className="py-4 px-6">Staff Member</th>
                  <th className="py-4 px-6">Selfie Capture</th>
                  <th className="py-4 px-6">Clock-in Time</th>
                  <th className="py-4 px-6">Clock-out Time</th>
                  <th className="py-4 px-6">Duration</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Geofenced Map</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]/30 text-sm">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-[#1e293b]/40">No attendance sessions registered today.</td>
                  </tr>
                ) : (
                  logs.map((l) => {
                    const checkInSelfie = getSelfieUrl(l.clock_in_selfie_url);
                    const clockInTime = new Date(l.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const clockOutTime = l.clock_out 
                      ? new Date(l.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '—';

                    return (
                      <tr key={l.id} className="hover:bg-[#f1f5f9]/20 transition-all">
                        <td className="py-4 px-6">
                          <div className="font-bold text-[#1e293b]">{l.users?.name || 'Staff Member'}</div>
                          <div className="text-[10px] text-[#d97706] font-bold uppercase tracking-wider">{l.users?.role || 'staff'}</div>
                        </td>
                        <td className="py-4 px-6">
                          {checkInSelfie ? (
                            <button 
                              onClick={() => setSelectedSelfie(checkInSelfie)}
                              className="w-10 h-10 rounded-xl overflow-hidden border border-[#e2e8f0] cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-sm"
                            >
                              <img src={checkInSelfie} alt="Selfie" className="w-full h-full object-cover" />
                            </button>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] flex items-center justify-center text-[#1e293b]/30">
                              <ImageIcon size={14} />
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-[#1e293b]/80">
                          {clockInTime}
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-[#1e293b]/80">
                          {clockOutTime}
                        </td>
                        <td className="py-4 px-6 font-semibold">
                          {formatDuration(l.duration_minutes, l.clock_in, l.clock_out)}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${getStatusColor(l.status)}`}>
                            {l.status === 'clocked_in' ? 'Clocked In' : l.status === 'clocked_out' ? 'Clocked Out' : 'Auto Closed'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {l.clock_in_lat && l.clock_in_lng ? (
                            <button
                              onClick={() => setSelectedMap({ 
                                lat: l.clock_in_lat!, 
                                lng: l.clock_in_lng!, 
                                label: l.users?.name || 'Staff' 
                              })}
                              className="px-2.5 py-1 bg-[#f1f5f9] border border-[#e2e8f0] hover:bg-[#e2e8f0] text-xs font-bold rounded-lg cursor-pointer transition-all inline-flex items-center gap-1"
                            >
                              <MapPin size={12} className="text-[#d97706]" />
                              <span>View Map</span>
                            </button>
                          ) : (
                            <span className="text-xs text-[#1e293b]/30">No GPS data</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selfie Lightbox Modal */}
      {selectedSelfie && (
        <div className="fixed inset-0 bg-[#0f172a]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-4 max-w-sm w-full relative shadow-2xl animate-fade-in">
            <button 
              onClick={() => setSelectedSelfie(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 border border-[#e2e8f0] hover:bg-[#f1f5f9] flex items-center justify-center cursor-pointer shadow-md"
            >
              <X size={16} />
            </button>
            <div className="aspect-square rounded-2xl overflow-hidden border border-[#e2e8f0]">
              <img src={selectedSelfie} alt="Selfie Zoomed" className="w-full h-full object-cover" />
            </div>
            <div className="text-center mt-3 text-xs font-bold text-[#1e293b]/60">Check-in Photo Verification</div>
          </div>
        </div>
      )}

      {/* Map Lightbox Modal */}
      {selectedMap && (
        <div className="fixed inset-0 bg-[#0f172a]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full relative shadow-2xl animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-[#e2e8f0]/50 pb-2">
              <h3 className="font-extrabold text-sm text-[#1e293b] flex items-center gap-1.5">
                <MapPin size={16} className="text-[#d97706]" />
                <span>Clock-in Location: {selectedMap.label}</span>
              </h3>
              <button 
                onClick={() => setSelectedMap(null)}
                className="text-[#1e293b]/40 hover:text-[#1e293b]/70 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-[#e2e8f0] shadow-inner">
              <iframe 
                width="100%" 
                height="320" 
                frameBorder="0" 
                style={{ border: 0 }} 
                src={`https://maps.google.com/maps?q=${selectedMap.lat},${selectedMap.lng}&hl=en&z=16&output=embed`} 
                allowFullScreen
              ></iframe>
            </div>
            <div className="text-right">
              <button
                onClick={() => setSelectedMap(null)}
                className="px-4 py-1.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-xs font-bold rounded-lg cursor-pointer transition-all border border-[#e2e8f0]"
              >
                Close Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
