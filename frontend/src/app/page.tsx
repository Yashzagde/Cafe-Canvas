'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Coffee, ArrowRight, BarChart3, ChefHat, Smartphone, X, Check, 
  Building2, ShieldCheck, Mail, Phone, MapPin, Award, Store
} from 'lucide-react';

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    planKey: 'starter',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!form.businessName) {
        setErrorMsg('Please enter your business name.');
        return;
      }
    } else if (currentStep === 2) {
      // GSTIN optional but if provided must be validated
      if (form.gstin && form.gstin.trim().length !== 15) {
        setErrorMsg('GSTIN must be exactly 15 characters.');
        return;
      }
    }
    setErrorMsg(null);
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ownerName || !form.email || !form.phone) {
      setErrorMsg('Owner name, email, and phone are required.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

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
        throw new Error(result.error || 'Failed to submit registration request.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentStep(1);
    setSuccess(false);
    setErrorMsg(null);
    setForm({
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
      planKey: 'starter',
    });
  };

  return (
    <main className="min-h-screen bg-[#0F0E0C] text-[#FDF6EC] font-sans antialiased overflow-x-hidden relative">
      
      {/* Cinematic Hero Video Background */}
      <div className="absolute inset-0 w-full h-[100vh] overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F0E0C]/40 via-[#0F0E0C]/75 to-[#0F0E0C] z-10" />
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover opacity-35"
        >
          <source 
            src="https://assets.mixkit.co/videos/preview/mixkit-coffee-pouring-from-a-machine-3184-large.mp4" 
            type="video/mp4" 
          />
        </video>
      </div>

      {/* Sticky Premium Header */}
      <nav className="sticky top-0 w-full backdrop-blur-md bg-[#0F0E0C]/75 border-b border-[#D4854A]/10 p-5 flex justify-between items-center z-40 max-w-7xl mx-auto rounded-b-2xl">
        <div className="flex items-center gap-2 font-bold text-2xl tracking-tight">
          <div className="w-9 h-9 rounded-xl bg-[#D4854A] flex items-center justify-center shadow-lg shadow-[#D4854A]/20">
            <Coffee className="text-[#0F0E0C] w-5 h-5" />
          </div>
          <span className="font-extrabold text-[#FDF6EC]">Cafe<span className="text-[#D4854A]">Canva</span></span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-[#FDF6EC] hover:bg-white/5 transition-all">
            Dashboard Sign In
          </Link>
          <button 
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-tr from-[#D4854A] to-[#C9A84C] text-[#0F0E0C] shadow-lg shadow-[#D4854A]/15 hover:opacity-95 transition-all cursor-pointer active:scale-98"
          >
            Launch Storefront
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-6xl mx-auto px-6 pt-32 pb-24 text-center z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-wider text-[#C9A84C] uppercase mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4854A] animate-pulse"></span>
          V4 Enterprise Platform Live
        </div>
        
        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight max-w-5xl">
          Evolving Restaurant Operations into <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4854A] via-[#C9A84C] to-[#E8A598]">Beautiful Ease.</span>
        </h1>
        
        <p className="text-sm md:text-lg text-zinc-400 mb-12 max-w-3xl leading-relaxed">
          The comprehensive multi-tenant operating platform tailored for luxury cafes, bistros, bars, and lounges. Orchestrate POS billing, real-time KDS, dynamic table booking, and customer storefronts.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-tr from-[#D4854A] to-[#C9A84C] text-[#0F0E0C] rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#D4854A]/10 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
          >
            Open your digital store <ArrowRight size={16} />
          </button>
          <a 
            href="#features" 
            className="flex items-center justify-center px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
          >
            Explore features
          </a>
        </div>
      </section>

      {/* Visual Feature Grid */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 relative z-10 border-t border-[#D4854A]/5">
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-2xl md:text-4xl font-extrabold text-[#FDF6EC]">SaaS Architecture Powered by Precision</h2>
          <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Built to scale. Structured to perform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Smartphone className="w-6 h-6 text-[#D4854A]" />}
            title="Interactive Storefront"
            description="Luxury digital menus rendered as progressive web apps scoped to your custom subdomain, allowing instant tableside checkout."
          />
          <FeatureCard 
            icon={<ChefHat className="w-6 h-6 text-[#C9A84C]" />}
            title="Live Kitchen Display (KDS)"
            description="Real-time order synchronization using WebSocket channels directly pushing tickets to cooking displays instantly."
          />
          <FeatureCard 
            icon={<BarChart3 className="w-6 h-6 text-[#E8A598]" />}
            title="Multi-Tenant Analytics"
            description="Complete billing insight, branch audit reports, hourly revenue trackers, and GST-compliant reports computed in paise."
          />
        </div>
      </section>

      {/* Footer Strip */}
      <footer className="w-full bg-[#090807] py-12 text-center border-t border-[#D4854A]/5 relative z-10">
        <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">
          © {new Date().getFullYear()} CafeCanvas OS. All rights reserved. CGST + SGST tax split compliant.
        </p>
      </footer>

      {/* ONBOARDING DIALOG MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all">
          <div className="bg-[#14120F] border border-[#D4854A]/20 w-full max-w-xl rounded-3xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={handleCloseModal}
              className="absolute top-6 right-6 text-stone-400 hover:text-[#FDF6EC] p-2 hover:bg-white/5 rounded-xl transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            {!success ? (
              <div>
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#D4854A]/10 text-[#D4854A] flex items-center justify-center border border-[#D4854A]/20">
                    <Store size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#FDF6EC] uppercase tracking-wider">Create Tenant Account</h3>
                    <p className="text-xs text-stone-400 mt-1">Step {currentStep} of 3: Enter your details</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 bg-stone-850 rounded-full mb-6 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#D4854A] to-[#C9A84C] transition-all duration-300"
                    style={{ width: `${(currentStep / 3) * 100}%` }}
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-950/50 border border-red-900/50 text-red-400 text-xs rounded-xl mb-4 font-semibold">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* STEP 1: BUSINESS BASE INFO */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Business / Brand Name</label>
                        <input 
                          type="text" 
                          name="businessName"
                          required
                          placeholder="e.g. Bandra Brews"
                          value={form.businessName}
                          onChange={handleChange}
                          className="w-full bg-[#1A1814] border border-[#D4854A]/15 rounded-xl px-4 py-2.5 text-xs text-[#FDF6EC] focus:outline-none focus:border-[#D4854A]/50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Business Type</label>
                          <select 
                            name="businessType"
                            value={form.businessType}
                            onChange={handleChange}
                            className="w-full bg-[#1A1814] border border-[#D4854A]/15 rounded-xl px-3 py-2.5 text-xs text-stone-300 focus:outline-none focus:border-[#D4854A]/50"
                          >
                            <option value="cafe">Cafe / Roastery</option>
                            <option value="restaurant">Restaurant / Dining</option>
                            <option value="bar">Bar / Pub / Lounge</option>
                            <option value="bakery">Bakery / Patisserie</option>
                            <option value="cloud_kitchen">Cloud Kitchen</option>
                            <option value="other">Other Operations</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Plan Tier</label>
                          <select 
                            name="planKey"
                            value={form.planKey}
                            onChange={handleChange}
                            className="w-full bg-[#1A1814] border border-[#D4854A]/15 rounded-xl px-3 py-2.5 text-xs text-stone-300 focus:outline-none focus:border-[#D4854A]/50"
                          >
                            <option value="starter">Starter Suite (1 Outlet)</option>
                            <option value="growth">Growth Suite (5 Outlets)</option>
                            <option value="professional">Professional Hub (15 Outlets)</option>
                            <option value="enterprise">Enterprise Custom</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Expected Staff Limit</label>
                          <input 
                            type="number" 
                            name="expectedStaffCount"
                            min="1"
                            max="50"
                            value={form.expectedStaffCount}
                            onChange={handleChange}
                            className="w-full bg-[#1A1814] border border-[#D4854A]/15 rounded-xl px-4 py-2.5 text-xs text-[#FDF6EC] focus:outline-none focus:border-[#D4854A]/50"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Expected Branch Count</label>
                          <input 
                            type="number" 
                            name="expectedBranchCount"
                            min="1"
                            value={form.expectedBranchCount}
                            onChange={handleChange}
                            className="w-full bg-[#1A1814] border border-[#D4854A]/15 rounded-xl px-4 py-2.5 text-xs text-[#FDF6EC] focus:outline-none focus:border-[#D4854A]/50"
                          />
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <button 
                          type="button"
                          onClick={handleNextStep}
                          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-tr from-[#D4854A] to-[#C9A84C] text-[#0F0E0C] rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                        >
                          Next Step <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: CREDENTIALS & LOCATION INFO */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">GSTIN (Optional)</label>
                          <input 
                            type="text" 
                            name="gstin"
                            placeholder="15-character ID"
                            maxLength={15}
                            value={form.gstin}
                            onChange={handleChange}
                            className="w-full bg-[#1A1814] border border-[#D4854A]/15 rounded-xl px-4 py-2.5 text-xs text-[#FDF6EC] focus:outline-none focus:border-[#D4854A]/50 font-mono"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">FSSAI Number (Optional)</label>
                          <input 
                            type="text" 
                            name="fssaiNumber"
                            placeholder="FSSAI Registration"
                            value={form.fssaiNumber}
                            onChange={handleChange}
                            className="w-full bg-[#1A1814] border border-[#D4854A]/15 rounded-xl px-4 py-2.5 text-xs text-[#FDF6EC] focus:outline-none focus:border-[#D4854A]/50 font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Street Address</label>
                        <input 
                          type="text" 
                          name="address"
                          placeholder="Registered Address"
                          value={form.address}
                          onChange={handleChange}
                          className="w-full bg-[#1A1814] border border-[#D4854A]/15 rounded-xl px-4 py-2.5 text-xs text-[#FDF6EC] focus:outline-none focus:border-[#D4854A]/50"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">City</label>
                          <input 
                            type="text" 
                            name="city"
                            placeholder="City"
                            value={form.city}
                            onChange={handleChange}
                            className="w-full bg-[#1A1814] border border-[#D4854A]/15 rounded-xl px-4 py-2.5 text-xs text-[#FDF6EC] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">State</label>
                          <input 
                            type="text" 
                            name="state"
                            placeholder="State"
                            value={form.state}
                            onChange={handleChange}
                            className="w-full bg-[#1A1814] border border-[#D4854A]/15 rounded-xl px-4 py-2.5 text-xs text-[#FDF6EC] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Country</label>
                          <input 
                            type="text" 
                            name="country"
                            value={form.country}
                            onChange={handleChange}
                            className="w-full bg-[#1A1814] border border-[#D4854A]/15 rounded-xl px-4 py-2.5 text-xs text-[#FDF6EC] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="pt-4 flex justify-between">
                        <button 
                          type="button"
                          onClick={handlePrevStep}
                          className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer text-stone-300"
                        >
                          Back
                        </button>
                        <button 
                          type="button"
                          onClick={handleNextStep}
                          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-tr from-[#D4854A] to-[#C9A84C] text-[#0F0E0C] rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                        >
                          Next Step <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: ADMINISTRATOR INFO */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Owner / Administrator Full Name</label>
                        <input 
                          type="text" 
                          name="ownerName"
                          required
                          placeholder="e.g. Yash Zagde"
                          value={form.ownerName}
                          onChange={handleChange}
                          className="w-full bg-[#1A1814] border border-[#D4854A]/15 rounded-xl px-4 py-2.5 text-xs text-[#FDF6EC] focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Primary Email Address</label>
                          <input 
                            type="email" 
                            name="email"
                            required
                            placeholder="owner@cafebrand.com"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full bg-[#1A1814] border border-[#D4854A]/15 rounded-xl px-4 py-2.5 text-xs text-[#FDF6EC] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Primary Contact Number</label>
                          <input 
                            type="tel" 
                            name="phone"
                            required
                            placeholder="Mobile with country code"
                            value={form.phone}
                            onChange={handleChange}
                            className="w-full bg-[#1A1814] border border-[#D4854A]/15 rounded-xl px-4 py-2.5 text-xs text-[#FDF6EC] focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="p-3.5 bg-stone-900/50 border border-stone-850 rounded-2xl flex gap-2 text-[10px] text-stone-400 font-semibold leading-relaxed">
                        <ShieldCheck size={18} className="text-[#D4854A] flex-shrink-0" />
                        <span>Security: All submitted registrations undergo Super Admin verification. You will receive an onboarding confirmation email with access details within 24 hours.</span>
                      </div>

                      <div className="pt-4 flex justify-between">
                        <button 
                          type="button"
                          onClick={handlePrevStep}
                          className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer text-stone-300"
                        >
                          Back
                        </button>
                        <button 
                          type="submit"
                          disabled={loading}
                          className="px-6 py-2.5 bg-gradient-to-tr from-[#D4854A] to-[#C9A84C] text-[#0F0E0C] rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-[#D4854A]/10"
                        >
                          {loading ? 'Submitting Registration...' : 'Complete Self-Onboarding'}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            ) : (
              /* Success Panel */
              <div className="text-center space-y-6 py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#C9A84C] flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/5">
                  <Award size={32} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-black text-[#FDF6EC] uppercase tracking-wider">Registration Completed</h3>
                  <p className="text-xs text-stone-400 leading-relaxed px-4">
                    Your self-onboarding details for <strong className="text-[#FDF6EC]">{form.businessName}</strong> have been successfully registered in the platform system.
                  </p>
                </div>

                <div className="p-4 bg-[#1A1814] border border-[#D4854A]/10 rounded-2xl text-left space-y-3">
                  <div className="flex gap-2 text-xs">
                    <Building2 size={16} className="text-[#D4854A] shrink-0" />
                    <div>
                      <div className="font-bold text-stone-300">Approval Queue Pending</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">Verification details & FSSAI are being audited.</div>
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <Mail size={16} className="text-[#C9A84C] shrink-0" />
                    <div>
                      <div className="font-bold text-stone-300">Onboarding Email Dispatch</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">Access details will be routed to {form.email}.</div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleCloseModal}
                  className="w-full py-3 bg-gradient-to-tr from-[#D4854A] to-[#C9A84C] text-[#0F0E0C] rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md"
                >
                  Close & Return Home
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-[#14120F] border border-[#D4854A]/5 p-8 rounded-3xl hover:bg-white/5 transition-all group cursor-default">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-[#ff6b35] group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-3 text-[#FDF6EC]">{title}</h3>
      <p className="text-zinc-400 text-xs leading-relaxed font-semibold">{description}</p>
    </div>
  );
}
