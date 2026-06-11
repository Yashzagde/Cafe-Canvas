'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, CheckCircle2, Ticket } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function WelcomeNotificationPopup({ cafeName, tenantId }: { cafeName: string; tenantId: string }) {
  const [show, setShow] = useState(false);
  const [phone, setPhone] = useState('');

  const [step, setStep] = useState<'phone' | 'done'>('phone');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const seen = localStorage.getItem('cc_popup_seen');
    const seenAt = seen ? new Date(seen) : null;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (!seenAt || seenAt < thirtyDaysAgo) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/customer/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'quick_checkin',
          phone: `+91${phone}`,
          tenantId
        })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to register or check in.');
      }

      // Trigger Confetti burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFC9CD', '#B4F8C8', '#E2C9A3', '#C9B19C']
      });

      setStep('done');
      localStorage.setItem('cc_popup_seen', new Date().toISOString());
    } catch (err: any) {
      console.error('Failed to check in:', err.message);
      setErrorMsg(err.message || 'Failed to check in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('cc_popup_seen', new Date().toISOString());
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-[6px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md bg-[#F7EEE2]/90 backdrop-blur-[20px] rounded-3xl border border-[#FFF6EC]/30 shadow-2xl p-6 relative overflow-hidden select-none"
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          >
            {/* Soft decorative background glow */}
            <div className="absolute -top-12 -left-12 w-28 h-28 bg-[#FFC9CD]/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-[#B4F8C8]/20 rounded-full blur-2xl pointer-events-none" />

            {/* Skip Button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-[#4A3728]/5 flex items-center justify-center text-[#4A3728]/60 hover:text-[#4A3728] transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Logo header */}
            <div className="text-center mb-4">
              <img
                src="/logo.png"
                className="w-14 h-14 mx-auto object-contain hover:rotate-6 transition-transform duration-300 mb-2"
                alt="Cafe Canvas Logo"
              />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#8B7355]">
                {cafeName}
              </span>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-xs font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {step === 'phone' && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-black text-[#4A3728] tracking-tight">
                    🧾 Get Your Digital Receipt & Offers
                  </h3>
                  <p className="text-xs text-[#8B7355] mt-1.5 leading-relaxed">
                    Add your mobile number to receive your online order receipts and get exclusive discounts, seasonal offers, and menu updates from <span className="font-bold">{cafeName}</span>.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B7355]">
                      <Phone size={15} />
                    </span>
                    <span className="absolute left-9 top-1/2 -translate-y-1/2 text-xs font-extrabold text-[#4A3728]">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      placeholder="Enter mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      maxLength={10}
                      className="w-full pl-18 pr-4 py-3 rounded-2xl border border-[#DEC5A4]/60 bg-white text-xs font-bold text-[#4A3728] focus:outline-none focus:border-[#FFC9CD] focus:ring-1 focus:ring-[#FFC9CD]/30 transition-all placeholder-[#A89580]/60"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#FFC9CD] hover:bg-[#E8A5AA] active:scale-[0.98] text-[#4A3728] rounded-2xl py-3.5 text-xs font-extrabold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? 'Sending OTP...' : 'Yes, Send Me My Receipts & Offers'}
                  </button>
                </form>

                <div className="flex justify-between items-center text-[10px] font-bold px-1 pt-1">
                  <button
                    onClick={handleSkip}
                    className="text-[#8B7355] hover:text-[#4A3728] transition-colors hover:underline"
                  >
                    ❌ Skip for now
                  </button>
                  <a
                    href="/offers"
                    className="text-[#8B7355] hover:text-[#4A3728] transition-colors flex items-center gap-1 hover:underline"
                  >
                    Read More →
                  </a>
                </div>
              </div>
            )}

            {step === 'done' && (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 bg-[#B4F8C8]/30 rounded-full flex items-center justify-center mx-auto border border-[#B4F8C8]/60">
                  <CheckCircle2 className="w-8 h-8 text-[#6BC88A]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-[#4A3728]">Welcome to the Club!</h3>
                  <p className="text-xs text-[#8B7355] leading-relaxed">
                    You are now subscribed to receive digital receipts on WhatsApp.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFF6EC] border border-[#DEC5A4]/40 inline-flex flex-col items-center gap-1 min-w-[240px] shadow-inner">
                  <Ticket size={18} className="text-[#FFC9CD]" />
                  <span className="text-[10px] font-extrabold text-[#8B7355] uppercase tracking-wider">
                    First Order Code
                  </span>
                  <span className="text-base font-black text-[#4A3728] tracking-widest uppercase">
                    WELCOME10
                  </span>
                  <span className="text-[9px] text-[#A89580] font-semibold mt-0.5">
                    Show this at checkout for 10% off
                  </span>
                </div>

                <button
                  onClick={() => setShow(false)}
                  className="w-full bg-[#4A3728] hover:bg-[#3D2B1F] text-white rounded-2xl py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Start Dining
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
