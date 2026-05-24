"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { sendEmailVerification } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee,
  ArrowRight,
  Check,
  Building,
  Mail,
  MapPin,
  Phone,
  Lock,
  AlertCircle
} from "lucide-react";
import CinematicBackground from "@/components/background/CinematicBackground";

const indianCities = [
  "Mumbai",
  "Pune",
  "Bangalore",
  "Delhi NCR",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Goa",
  "Other"
];

export default function RegisterPage() {
  const router = useRouter();
  const { signUpWithEmail, user, profile, loading } = useAuth();

  // Form State
  const [restaurantName, setRestaurantName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  
  // Field Touch States (for inline validation triggers)
  const [touchedName, setTouchedName] = useState(false);
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [touchedCity, setTouchedCity] = useState(false);
  const [touchedPhone, setTouchedPhone] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);

  // UI State
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect if already authenticated and profile exists
  useEffect(() => {
    if (!loading && user) {
      if (profile && profile.onboarded) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    }
  }, [user, profile, loading, router]);

  // Validation Check helpers
  const isNameValid = restaurantName.trim().length >= 2;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isCityValid = city !== "";
  const isPhoneValid = /^[6-9]\d{9}$/.test(phone.replace(/[^0-9]/g, ""));
  
  // Password requirements checklist
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber;

  const isFormValid = isNameValid && isEmailValid && isCityValid && isPhoneValid && isPasswordValid;

  // Form Validation & Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Trigger all touch states to show any validation messages
    setTouchedName(true);
    setTouchedEmail(true);
    setTouchedCity(true);
    setTouchedPhone(true);
    setTouchedPassword(true);

    if (!isFormValid) {
      setFormError("Please correct the errors in the registration form.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create firebase auth user
      await signUpWithEmail(email, password, "Growth");

      // 2. Wait for auth initialization
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Authentication failed. Please try again.");

      // 3. Send email verification link
      try {
        await sendEmailVerification(currentUser);
      } catch (verifErr) {
        console.warn("Failed to send verification email:", verifErr);
        // Don't fail signup if verification email fails (e.g. localhost testing config)
      }

      // 4. Write profile data directly to Firestore
      const phoneClean = phone.replace(/[^0-9]/g, "");
      const formattedPhone = `+91${phoneClean}`;
      await setDoc(doc(db, "users", currentUser.uid), {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: restaurantName,
        restaurantName: restaurantName,
        city: city,
        phone: formattedPhone,
        membershipPlan: "Growth",
        onboarded: false,
        onboardingDetails: null,
        createdAt: new Date().toISOString()
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/onboarding");
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "Registration failed. Account might already exist.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0F1C] text-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-white/70 font-medium">Securing session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white bg-[#0A0F1C] font-sans selection:bg-green-950/50 selection:text-green-200 overflow-x-hidden relative flex items-center justify-center py-12 px-6">
      
      {/* Fixed cinematic backdrop */}
      <CinematicBackground />

      <div className="w-full max-w-md glass-dark-form p-8 md:p-10 rounded-2xl shadow-2xl relative z-10">
        <div className="text-center space-y-3 mb-8">
          <div className="flex items-center justify-center gap-2 text-xl font-bold tracking-tight text-white mb-2">
            <Coffee className="w-5 h-5 text-green-500" />
            <span>Cafe<span className="text-green-500">Canvas</span></span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Create Workspace</h2>
          <p className="text-xs text-white/50 font-semibold tracking-wide uppercase">Join the early pre-register waitlist</p>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/10 border-2 border-green-500/30 rounded-full flex items-center justify-center mx-auto text-green-400">
              <Check className="w-8 h-8" strokeWidth={3} />
            </div>
            <h3 className="text-xl font-bold text-white">Registration Complete</h3>
            <p className="text-sm text-white/60 max-w-xs mx-auto">
              A verification link has been sent to your email. Redirecting you to onboarding...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && (
              <div className="p-3 bg-red-500/10 border-l-4 border-red-500 text-red-200 text-xs rounded flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Restaurant Name Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="restaurantName" className="block text-xs font-bold text-white/70 uppercase tracking-wider">
                  Restaurant Name
                </label>
                {touchedName && (
                  <span className={`text-[10px] ${isNameValid ? "text-green-400" : "text-red-400"}`}>
                    {isNameValid ? "✓ Valid" : "Name too short"}
                  </span>
                )}
              </div>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  id="restaurantName"
                  type="text"
                  required
                  value={restaurantName}
                  onBlur={() => setTouchedName(true)}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-white/[0.04] border ${touchedName ? (isNameValid ? "border-green-500/40" : "border-red-500/40") : "border-white/[0.08]"} rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-white placeholder-white/30`}
                  placeholder="e.g. Spice Palace"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="email" className="block text-xs font-bold text-white/70 uppercase tracking-wider">
                  Owner Email Address
                </label>
                {touchedEmail && (
                  <span className={`text-[10px] ${isEmailValid ? "text-green-400" : "text-red-400"}`}>
                    {isEmailValid ? "✓ Valid" : "Invalid email"}
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onBlur={() => setTouchedEmail(true)}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-white/[0.04] border ${touchedEmail ? (isEmailValid ? "border-green-500/40" : "border-red-500/40") : "border-white/[0.08]"} rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-white placeholder-white/30`}
                  placeholder="owner@restaurant.com"
                />
              </div>
            </div>

            {/* City & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="city" className="block text-xs font-bold text-white/70 uppercase tracking-wider">
                    City
                  </label>
                  {touchedCity && (
                    <span className={`text-[10px] ${isCityValid ? "text-green-400" : "text-red-400"}`}>
                      {isCityValid ? "✓" : "Required"}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <select
                    id="city"
                    required
                    value={city}
                    onBlur={() => setTouchedCity(true)}
                    onChange={(e) => setCity(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-[#0f1422] border ${touchedCity ? (isCityValid ? "border-green-500/40" : "border-red-500/40") : "border-white/[0.08]"} rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-white appearance-none`}
                  >
                    <option value="" className="text-white/30">Select City</option>
                    {indianCities.map((c) => (
                      <option key={c} value={c} className="bg-[#0A0F1C] text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="phone" className="block text-xs font-bold text-white/70 uppercase tracking-wider">
                    WhatsApp Number
                  </label>
                  {touchedPhone && (
                    <span className={`text-[10px] ${isPhoneValid ? "text-green-400" : "text-red-400"}`}>
                      {isPhoneValid ? "✓ Valid" : "10 digits"}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onBlur={() => setTouchedPhone(true)}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-white/[0.04] border ${touchedPhone ? (isPhoneValid ? "border-green-500/40" : "border-red-500/40") : "border-white/[0.08]"} rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-white placeholder-white/30`}
                    placeholder="98765 43210"
                  />
                </div>
              </div>
            </div>

            {/* Password Input & Inline Checklist */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs font-bold text-white/70 uppercase tracking-wider">
                  Password
                </label>
                {touchedPassword && (
                  <span className={`text-[10px] ${isPasswordValid ? "text-green-400" : "text-red-400"}`}>
                    {isPasswordValid ? "✓ Strong" : "Weak"}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onBlur={() => setTouchedPassword(true)}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-white/[0.04] border ${touchedPassword ? (isPasswordValid ? "border-green-500/40" : "border-red-500/40") : "border-white/[0.08]"} rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-white placeholder-white/30`}
                  placeholder="••••••••"
                />
              </div>

              {/* Password strength checklist visual feedback */}
              <div className="mt-2.5 grid grid-cols-3 gap-1 text-[9px] text-white/40 font-semibold tracking-wider uppercase">
                <div className={`flex items-center gap-1 transition-colors ${hasMinLength ? "text-green-400" : ""}`}>
                  <Check className="w-2.5 h-2.5 shrink-0" />
                  <span>8+ Chars</span>
                </div>
                <div className={`flex items-center gap-1 transition-colors ${hasUppercase ? "text-green-400" : ""}`}>
                  <Check className="w-2.5 h-2.5 shrink-0" />
                  <span>1 Uppercase</span>
                </div>
                <div className={`flex items-center gap-1 transition-colors ${hasNumber ? "text-green-400" : ""}`}>
                  <Check className="w-2.5 h-2.5 shrink-0" />
                  <span>1 Number</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-4 py-3.5 bg-green-600 hover:bg-green-500 disabled:bg-green-850 disabled:text-white/40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-green-900/30 hover:shadow-green-800/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Registering...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2 text-xs">
              <span className="text-white/50">Already registered? </span>
              <Link href="/auth?mode=login" className="font-bold text-green-400 hover:underline">
                Sign in
              </Link>
            </div>

            <p className="text-[10px] text-white/40 text-center leading-normal pt-2">
              We'll never spam you. By signing up you agree to our <Link href="#" className="underline hover:text-white">Privacy Policy</Link> and <Link href="#" className="underline hover:text-white">Terms of Service</Link>.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
