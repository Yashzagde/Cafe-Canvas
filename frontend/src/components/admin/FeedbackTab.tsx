'use client';

import { useState, useEffect } from 'react';
import { useToast, Toast } from '@/components/admin/UIPrimitives';
import { createClient } from '@/utils/supabase/client';
import { Star, MessageSquare, Phone, User, Utensils, Award, Smile, Frown } from 'lucide-react';

interface FeedbackItem {
  id: string;
  tenant_id: string;
  table_id: string | null;
  customer_name: string;
  phone: string | null;
  rating_overall: number;
  rating_food: number | null;
  rating_service: number | null;
  comment: string | null;
  would_revisit: boolean;
  staff_id: string | null;
  created_at: string;
  users?: {
    name: string;
  } | null;
  tables?: {
    name: string;
  } | null;
}

interface FeedbackTabProps {
  branchId: string;
}

export default function FeedbackTab({ branchId }: FeedbackTabProps) {
  const supabase = createClient();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [toastItem, toast] = useToast();
  const [loading, setLoading] = useState(true);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customer_feedback')
        .select('*, users:staff_id(name), tables:table_id(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedbacks((data || []) as unknown as FeedbackItem[]);
    } catch (err) {
      console.error('Failed to load guest feedback:', err);
      toast('Failed to load guest feedback', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, [branchId]);

  // Calculations
  const totalReviews = feedbacks.length;
  const avgOverall = totalReviews > 0 
    ? (feedbacks.reduce((acc, f) => acc + f.rating_overall, 0) / totalReviews).toFixed(1)
    : '0.0';

  const avgFood = totalReviews > 0
    ? (feedbacks.reduce((acc, f) => acc + (f.rating_food || f.rating_overall), 0) / totalReviews).toFixed(1)
    : '0.0';

  const avgService = totalReviews > 0
    ? (feedbacks.reduce((acc, f) => acc + (f.rating_service || f.rating_overall), 0) / totalReviews).toFixed(1)
    : '0.0';

  const wouldRevisitPct = totalReviews > 0
    ? Math.round((feedbacks.filter(f => f.would_revisit).length / totalReviews) * 100)
    : 0;

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5 text-amber-500">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} size={12} className={s <= rating ? 'fill-amber-500' : 'text-slate-200'} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 text-[#1e293b] animate-fade-in">
      <div className="flex items-center justify-between border-b border-[#e2e8f0]/50 pb-4">
        <div>
          <h2 className="text-xl font-extrabold font-display">Guest Feedbacks & Reviews</h2>
          <p className="text-xs text-[#1e293b]/50">Track dining satisfaction scores, service ratings, and custom guest comments.</p>
        </div>
        <button 
          onClick={loadFeedback}
          className="px-3 py-1.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-xs font-bold rounded-lg cursor-pointer transition-all border border-[#e2e8f0]"
        >
          Refresh Feedbacks
        </button>
      </div>

      {/* Metrics Strips */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Star size={20} className="fill-amber-500" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#1e293b]/40">Overall Score</span>
            <p className="text-xl font-black">{avgOverall} <span className="text-xs font-normal text-[#1e293b]/40">/ 5.0</span></p>
          </div>
        </div>
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Utensils size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#1e293b]/40">Food Rating</span>
            <p className="text-xl font-black">{avgFood} <span className="text-xs font-normal text-[#1e293b]/40">/ 5.0</span></p>
          </div>
        </div>
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Award size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#1e293b]/40">Service Rating</span>
            <p className="text-xl font-black">{avgService} <span className="text-xs font-normal text-[#1e293b]/40">/ 5.0</span></p>
          </div>
        </div>
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600">
            <Smile size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#1e293b]/40">Would Revisit</span>
            <p className="text-xl font-black">{wouldRevisitPct}% <span className="text-xs font-normal text-[#1e293b]/40">Yes</span></p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-[#1e293b]/40">
          <span className="inline-block w-6 h-6 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {feedbacks.length === 0 ? (
            <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-8 text-center text-[#1e293b]/40">
              <MessageSquare className="mx-auto text-[#1e293b]/20 mb-3" size={32} />
              <p className="text-sm font-semibold">No customer feedbacks submitted yet.</p>
            </div>
          ) : (
            feedbacks.map((f) => {
              const formattedDate = new Date(f.created_at).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div key={f.id} className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#e2e8f0]/80 transition-all">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#ca8a04]/10 flex items-center justify-center font-extrabold text-[#ca8a04]">
                        {f.customer_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm flex items-center gap-2">
                          <span>{f.customer_name}</span>
                          <span className="text-[10px] text-[#1e293b]/30 font-medium">{formattedDate}</span>
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-[#1e293b]/50">
                          {f.tables?.name && <span>Table: <span className="font-bold text-[#1e293b]/80">{f.tables.name}</span></span>}
                          {f.users?.name && <span>Served By: <span className="font-bold text-[#1e293b]/80">{f.users.name}</span></span>}
                        </div>
                      </div>
                    </div>

                    {/* Ratings Grid */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                      <div className="flex items-center gap-1">
                        <span className="text-[#1e293b]/50">Overall:</span>
                        {renderStars(f.rating_overall)}
                      </div>
                      {f.rating_food && (
                        <div className="flex items-center gap-1">
                          <span className="text-[#1e293b]/50">Food:</span>
                          {renderStars(f.rating_food)}
                        </div>
                      )}
                      {f.rating_service && (
                        <div className="flex items-center gap-1">
                          <span className="text-[#1e293b]/50">Service:</span>
                          {renderStars(f.rating_service)}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span className="text-[#1e293b]/50">Revisit:</span>
                        {f.would_revisit ? (
                          <Smile size={14} className="text-green-500 inline" />
                        ) : (
                          <Frown size={14} className="text-red-500 inline" />
                        )}
                      </div>
                    </div>

                    {/* Comment text */}
                    {f.comment && (
                      <p className="bg-[#f8fafc] border border-[#e2e8f0]/40 rounded-2xl p-3 text-xs italic text-[#1e293b]/80">
                        "{f.comment}"
                      </p>
                    )}
                  </div>

                  {/* Actions Column */}
                  {f.phone && (
                    <div className="flex md:flex-col gap-2 justify-end items-stretch">
                      <a
                        href={`tel:${f.phone}`}
                        className="px-4 py-2 border border-[#e2e8f0] hover:bg-[#f1f5f9] text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1.5 justify-center shadow-sm"
                      >
                        <Phone size={12} className="text-[#ca8a04]" />
                        <span>Call Guest</span>
                      </a>
                      <a
                        href={`https://wa.me/${f.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1.5 justify-center shadow-sm"
                      >
                        <MessageSquare size={12} />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
      {toastItem && <Toast msg={toastItem.msg} type={toastItem.type} onClose={() => { }} />}
    </div>
  );
}
