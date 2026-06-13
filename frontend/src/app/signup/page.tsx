'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Store, MapPin, Building, CreditCard,
  ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, RefreshCw,
  Building2, Hash, FileText
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [form, setForm] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    email: '',
    gstin: '',
    fssaiNumber: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    businessType: 'cafe',
    expectedStaffCount: '5',
    expectedBranchCount: '1',
    planKey: 'growth',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateStep = () => {
    setError(null);
    if (step === 1) {
      if (!form.ownerName.trim()) {
        setError('Owner name is required.');
        return false;
      }
      if (!form.email.trim()) {
        setError('Email address is required.');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        setError('Invalid email address format.');
        return false;
      }
      if (!form.phone.trim()) {
        setError('Phone number is required.');
        return false;
      }
      const phoneRegex = /^[0-9+ ]{10,15}$/;
      if (!phoneRegex.test(form.phone)) {
        setError('Please enter a valid phone number (10-15 digits).');
        return false;
      }
    } else if (step === 2) {
      if (!form.businessName.trim()) {
        setError('Business/Brand name is required.');
        return false;
      }
      if (!form.businessType) {
        setError('Please select a business type.');
        return false;
      }
    } else if (step === 3) {
      if (form.gstin && form.gstin.trim().length !== 15) {
        setError('GSTIN must be exactly 15 characters if provided.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tenants/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const result = await response.json();
      if (result.success) {
        setSuccess(true);
      } else {
        throw new Error(result.error || 'Failed to submit onboarding request.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#f8fafc] text-[#1e293b]">
      {/* Dynamic Animated Liquid Background Blobs */}
      <div className="liquid-blob-1 top-[5%] left-[5%]" />
      <div className="liquid-blob-2 bottom-[10%] right-[5%]" />
      <div className="liquid-blob-3 top-[40%] left-[30%]" />

      {/* Grid overlay mask */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(30,41,59,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,41,59,0.015)_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] pointer-events-none mask-radial" />

      {/* Main Entrance Wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass w-full max-w-lg p-8 rounded-3xl z-10 relative border border-[#eae5d8] bg-white/70 shadow-xl"
      >
        {/* Decorative canvas top accent line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-1 brand-gradient rounded-full" />

        {/* Branding Area */}
        <div className="flex flex-col items-center gap-3.5 mb-6">
          <Link href="/" className="w-14 h-14 bg-[#fef3c7] border border-[#e2e8f0] rounded-2xl flex items-center justify-center shadow-md shadow-[#d97706]/10 overflow-hidden hover:scale-105 transition-transform">
            <img src="/logo.png" alt="Cafe Canvas Logo" className="w-10 h-10 object-contain" />
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight text-[#1e293b] font-display">
              Start Your <span className="text-[#d97706]">Free Trial</span>
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold mt-1">
              CafeCanvas Restaurant Operating System
            </p>
          </div>
        </div>

        {/* Progress Tracker */}
        {!success && (
          <div className="flex justify-between items-center mb-8 px-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1 last:flex-initial">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                    step >= s
                      ? 'bg-[#d97706] text-white border-[#d97706] shadow-sm'
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-all ${
                      step > s ? 'bg-[#d97706]' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Error Alert */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-start gap-2.5 overflow-hidden"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6 space-y-4"
            >
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-xl font-black text-slate-800 font-display">Registration Submitted!</h2>
              <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                Thank you for choosing CafeCanvas. Our super-administration team will review your parameters and dispatch your credentials via WhatsApp shortly.
              </p>
              <div className="pt-4">
                <Link
                  href="/"
                  className="px-6 py-2.5 bg-gradient-to-r from-[#d97706] to-[#ca8a04] text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-md hover:opacity-95 transition-all inline-block"
                >
                  Return to Homepage
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-700 mb-2">Step 1: Owner Profile</h3>
                  
                  <div className="space-y-2">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      Owner Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="ownerName"
                        required
                        value={form.ownerName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full pl-11 pr-4 py-3.5 bg-[#fcfaf4] border border-[#eae5d8] rounded-2xl text-[#1e293b] text-xs font-medium focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]/10 transition-all placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="w-full pl-11 pr-4 py-3.5 bg-[#fcfaf4] border border-[#eae5d8] rounded-2xl text-[#1e293b] text-xs font-medium focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]/10 transition-all placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      Primary Contact Number (10 digits)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="e.g. 9876543210"
                        className="w-full pl-11 pr-4 py-3.5 bg-[#fcfaf4] border border-[#eae5d8] rounded-2xl text-[#1e293b] text-xs font-medium focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]/10 transition-all placeholder-slate-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-700 mb-2">Step 2: Business & Brand</h3>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      Business / Brand Name
                    </label>
                    <div className="relative">
                      <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="businessName"
                        required
                        value={form.businessName}
                        onChange={handleChange}
                        placeholder="e.g. Mocha Magic"
                        className="w-full pl-11 pr-4 py-3.5 bg-[#fcfaf4] border border-[#eae5d8] rounded-2xl text-[#1e293b] text-xs font-medium focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]/10 transition-all placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        Business Type
                      </label>
                      <div className="relative">
                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <select
                          name="businessType"
                          value={form.businessType}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3.5 bg-[#fcfaf4] border border-[#eae5d8] rounded-2xl text-[#1e293b] text-xs font-semibold focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]/10 transition-all appearance-none cursor-pointer"
                        >
                          <option value="cafe">Cafe</option>
                          <option value="restaurant">Restaurant</option>
                          <option value="bakery">Bakery</option>
                          <option value="bar">Bar & Lounge</option>
                          <option value="cloudkitchen">Cloud Kitchen</option>
                          <option value="qsr">QSR (Quick Service)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        Subscription Plan
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <select
                          name="planKey"
                          value={form.planKey}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3.5 bg-[#fcfaf4] border border-[#eae5d8] rounded-2xl text-[#1e293b] text-xs font-semibold focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]/10 transition-all appearance-none cursor-pointer"
                        >
                          <option value="starter">Starter Suite</option>
                          <option value="growth">Growth Suite</option>
                          <option value="professional">Professional Hub</option>
                          <option value="enterprise">Enterprise Custom</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        Expected Outlets
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <select
                          name="expectedBranchCount"
                          value={form.expectedBranchCount}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3.5 bg-[#fcfaf4] border border-[#eae5d8] rounded-2xl text-[#1e293b] text-xs font-semibold focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]/10 transition-all appearance-none cursor-pointer"
                        >
                          <option value="1">1 Location</option>
                          <option value="2-5">2-5 Locations</option>
                          <option value="6-15">6-15 Locations</option>
                          <option value="15+">15+ Locations</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        Expected Staff Count
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <select
                          name="expectedStaffCount"
                          value={form.expectedStaffCount}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3.5 bg-[#fcfaf4] border border-[#eae5d8] rounded-2xl text-[#1e293b] text-xs font-semibold focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]/10 transition-all appearance-none cursor-pointer"
                        >
                          <option value="5">Up to 5 Staff</option>
                          <option value="20">Up to 20 Staff</option>
                          <option value="50">Up to 50 Staff</option>
                          <option value="200">Up to 200 Staff</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-700 mb-2">Step 3: Location & Compliance</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        GSTIN (Optional)
                      </label>
                      <div className="relative">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          name="gstin"
                          value={form.gstin}
                          onChange={handleChange}
                          placeholder="15-digit GSTIN"
                          maxLength={15}
                          className="w-full pl-11 pr-4 py-3.5 bg-[#fcfaf4] border border-[#eae5d8] rounded-2xl text-[#1e293b] text-xs font-medium focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]/10 transition-all placeholder-slate-400 font-mono uppercase"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        FSSAI Number (Optional)
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          name="fssaiNumber"
                          value={form.fssaiNumber}
                          onChange={handleChange}
                          placeholder="14-digit FSSAI"
                          maxLength={14}
                          className="w-full pl-11 pr-4 py-3.5 bg-[#fcfaf4] border border-[#eae5d8] rounded-2xl text-[#1e293b] text-xs font-medium focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]/10 transition-all placeholder-slate-400 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      Street Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                      <textarea
                        name="address"
                        rows={2}
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Outlet Street Address"
                        className="w-full pl-11 pr-4 py-3.5 bg-[#fcfaf4] border border-[#eae5d8] rounded-2xl text-[#1e293b] text-xs font-medium focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]/10 transition-all placeholder-slate-400 resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="e.g. Mumbai"
                        className="w-full px-4 py-3.5 bg-[#fcfaf4] border border-[#eae5d8] rounded-2xl text-[#1e293b] text-xs font-medium focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]/10 transition-all placeholder-slate-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        placeholder="e.g. Maharashtra"
                        className="w-full px-4 py-3.5 bg-[#fcfaf4] border border-[#eae5d8] rounded-2xl text-[#1e293b] text-xs font-medium focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]/10 transition-all placeholder-slate-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Action Buttons */}
              <div className="flex gap-4 mt-8">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-3.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-extrabold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 py-3.5 bg-[#1e293b] hover:bg-black text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>Continue</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 py-3.5 bg-gradient-to-r from-[#d97706] to-[#ca8a04] hover:opacity-95 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md shadow-[#d97706]/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <>
                        <span>Submit Registration</span>
                        <CheckCircle2 size={14} />
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Existing account redirect */}
        {!success && (
          <div className="mt-8 pt-6 border-t border-[#eae5d8]/50 text-center">
            <p className="text-xs font-semibold text-slate-500">
              Already registered?{' '}
              <Link href="/login" className="text-[#d97706] hover:underline font-extrabold">
                Sign In to Terminal
              </Link>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
