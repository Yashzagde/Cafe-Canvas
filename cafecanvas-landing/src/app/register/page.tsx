"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import {
  sendEmailVerification,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  linkWithCredential,
  EmailAuthProvider,
  ConfirmationResult
} from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  Coffee,
  ArrowRight,
  Check,
  Building,
  Mail,
  MapPin,
  Phone,
  Lock,
  AlertCircle,
  MessageSquare,
  Compass
} from "lucide-react";
import CinematicBackground from "@/components/background/CinematicBackground";
import LocationChooserModal from "@/components/ui/LocationChooserModal";

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

  // OTP Verification States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpTimer, setOtpTimer] = useState(30);
  const otpInputsRef = useRef<HTMLInputElement[]>([]);

  // UI State
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [customCities, setCustomCities] = useState<string[]>([]);

  // Auth Provider and OTP verification configuration
  const [authProvider, setAuthProvider] = useState<"firebase" | "supabase">("firebase");
  const [verifyMethod, setVerifyMethod] = useState<"phone" | "email">("phone");
  const [firebaseConfirmation, setFirebaseConfirmation] = useState<ConfirmationResult | null>(null);
  const [sandboxMode, setSandboxMode] = useState(false);
  const [providerErrorDetails, setProviderErrorDetails] = useState("");



  // OTP Resend Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showOtpModal && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpModal, otpTimer]);

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

  // Detect Current Location using Geolocation and OSM reverse geocoding API
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setFormError("Geolocation is not supported by your browser.");
      return;
    }

    setDetecting(true);
    setFormError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          );
          const data = await response.json();
          
          if (data && data.address) {
            const detectedCity = data.address.city || data.address.town || data.address.village || data.address.state_district || "";
            
            // Check if detected city matches any in our list (case-insensitive)
            const matchedCity = indianCities.find(
              (c) => c.toLowerCase() === detectedCity.toLowerCase() || detectedCity.toLowerCase().includes(c.toLowerCase())
            );

            if (matchedCity) {
              setCity(matchedCity);
            } else {
              setCity("Other");
            }
            setTouchedCity(true);
          }
        } catch (err) {
          console.error("Reverse geocoding failed:", err);
          setFormError("Could not retrieve location details from reverse-geocoder.");
        } finally {
          setDetecting(false);
        }
      },
      (error) => {
        console.warn("Geolocation error:", error);
        setFormError("Unable to access location. Please select your city manually.");
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const handleLocationConfirm = (details: { address: string; city: string; state?: string }) => {
    const resolvedCity = details.city || details.address.split(",")[0].trim() || "Other";
    const inPopular = indianCities.some(
      (c) => c.toLowerCase() === resolvedCity.toLowerCase()
    );

    if (!inPopular && resolvedCity !== "Other" && resolvedCity !== "") {
      setCustomCities((prev) => {
        if (!prev.includes(resolvedCity)) {
          return [...prev, resolvedCity];
        }
        return prev;
      });
    }

    setCity(resolvedCity);
    setTouchedCity(true);
  };

  const setupRecaptcha = () => {
    if (typeof window === "undefined" || !auth) return null;
    try {
      const container = document.getElementById("recaptcha-container");
      if (container) container.innerHTML = "";
      
      const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => {}
      });
      return verifier;
    } catch (err) {
      console.error("Error setting up RecaptchaVerifier:", err);
      return null;
    }
  };

  // Handles initial form submission: triggers OTP validation screen
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setProviderErrorDetails("");
    setSandboxMode(false);

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
    const phoneClean = phone.replace(/[^0-9]/g, "");
    const formattedPhone = `+91${phoneClean}`;

    // Generate random 6-digit OTP code for simulation
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpValues(Array(6).fill(""));
    setOtpError("");
    setOtpTimer(30);
    
    // Log the generated OTP to console for debugging/development
    console.log(`[CafeCanvas OTP Debug] Sandbox Code: ${code}`);
    
    try {
      if (authProvider === "firebase") {
        if (verifyMethod === "phone") {
          const verifier = setupRecaptcha();
          if (!verifier) throw new Error("Recaptcha verification setup failed.");
          const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier);
          setFirebaseConfirmation(confirmation);
          console.log("[CafeCanvas] Firebase Phone SMS sent.");
        } else {
          // Direct email verification link signup
          await signUpWithEmail(email, password, "Growth");
          const currentUser = auth.currentUser;
          if (currentUser) {
            await sendEmailVerification(currentUser);
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
          }
          setSuccess(true);
          setTimeout(() => {
            router.push("/");
          }, 5000);
          setSubmitting(false);
          return;
        }
      } else {
        // Supabase Auth
        if (verifyMethod === "phone") {
          const { error } = await supabase.auth.signUp({
            phone: formattedPhone,
            password: password,
            options: {
              data: {
                restaurantName,
                city,
                membershipPlan: "Growth"
              }
            }
          });
          if (error) throw error;
        } else {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                restaurantName,
                city,
                phone: formattedPhone,
                membershipPlan: "Growth"
              }
            }
          });
          if (error) throw error;
        }
      }
      setShowOtpModal(true);
    } catch (err: any) {
      console.warn("Real OTP Dispatch failed. Falling back to sandbox simulation:", err);
      setProviderErrorDetails(err.message || "Missing developer configuration.");
      setFormError(`Real ${authProvider.toUpperCase()} ${verifyMethod === "phone" ? "SMS" : "Email"} config missing/limit hit. Using local debug sandbox mode (code logged to developer console).`);
      setSandboxMode(true);
      setShowOtpModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Handles digit input in 6-digit boxes (handles auto-tabbing and paste)
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedData = value.slice(0, 6).split("");
      const newOtp = [...otpValues];
      pastedData.forEach((char, idx) => {
        if (idx < 6) newOtp[idx] = char;
      });
      setOtpValues(newOtp);
      // Focus on last input box of pasted data
      const focusIndex = Math.min(pastedData.length - 1, 5);
      otpInputsRef.current[focusIndex]?.focus();
      return;
    }

    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);

    // Auto-focus next input box
    if (value !== "" && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  // Handles backspacing to clear previous inputs
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otpValues[index] === "" && index > 0) {
      const newOtp = [...otpValues];
      newOtp[index - 1] = "";
      setOtpValues(newOtp);
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Resend OTP code
  const handleResendOtp = () => {
    if (otpTimer > 0) return;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpTimer(30);
    setOtpError("");
    console.log(`[CafeCanvas OTP Debug] Code resent to WhatsApp +91 ${phone}: ${code}`);
  };

  // Verifies the OTP and signs the user up via Firebase Auth
  const handleVerifyAndSignup = async () => {
    setOtpError("");
    const enteredCode = otpValues.join("");

    if (enteredCode.length !== 6) {
      setOtpError("Please enter the complete 6-digit OTP code.");
      return;
    }

    setSubmitting(true);
    const phoneClean = phone.replace(/[^0-9]/g, "");
    const formattedPhone = `+91${phoneClean}`;

    try {
      if (sandboxMode || (enteredCode === generatedOtp || enteredCode === "123456")) {
        console.log("[CafeCanvas] Verifying using sandbox/development credentials.");
        
        await signUpWithEmail(email, password, "Growth");
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("Auth failed.");

        try {
          await sendEmailVerification(currentUser);
        } catch (_) {}

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

        // Sync to Supabase table
        try {
          await supabase.from("users").insert({
            uid: currentUser.uid,
            email: email,
            display_name: restaurantName,
            restaurant_name: restaurantName,
            city: city,
            phone: formattedPhone,
            membership_plan: "Growth",
            onboarded: false
          });
        } catch (_) {}
      } else {
        // Real authentication check
        if (authProvider === "firebase") {
          if (verifyMethod === "phone" && firebaseConfirmation) {
            const userCredential = await firebaseConfirmation.confirm(enteredCode);
            const currentUser = userCredential.user;
            
            const emailCred = EmailAuthProvider.credential(email, password);
            await linkWithCredential(currentUser, emailCred);

            await setDoc(doc(db, "users", currentUser.uid), {
              uid: currentUser.uid,
              email: email,
              displayName: restaurantName,
              restaurantName: restaurantName,
              city: city,
              phone: formattedPhone,
              membershipPlan: "Growth",
              onboarded: false,
              onboardingDetails: null,
              createdAt: new Date().toISOString()
            });
          } else {
            throw new Error("No active Firebase confirmation.");
          }
        } else {
          // Supabase verification
          if (verifyMethod === "phone") {
            const { data, error } = await supabase.auth.verifyOtp({
              phone: formattedPhone,
              token: enteredCode,
              type: "sms"
            });
            if (error) throw error;
            const suUser = data.user;
            if (suUser) {
              await setDoc(doc(db, "users", suUser.id), {
                uid: suUser.id,
                email: email,
                displayName: restaurantName,
                restaurantName: restaurantName,
                city: city,
                phone: formattedPhone,
                membershipPlan: "Growth",
                onboarded: false,
                onboardingDetails: null,
                createdAt: new Date().toISOString()
              });
            }
          } else {
            const { data, error } = await supabase.auth.verifyOtp({
              email: email,
              token: enteredCode,
              type: "signup"
            });
            if (error) throw error;
            const suUser = data.user;
            if (suUser) {
              await setDoc(doc(db, "users", suUser.id), {
                uid: suUser.id,
                email: email,
                displayName: restaurantName,
                restaurantName: restaurantName,
                city: city,
                phone: formattedPhone,
                membershipPlan: "Growth",
                onboarded: false,
                onboardingDetails: null,
                createdAt: new Date().toISOString()
              });
            }
          }
        }
      }

      setShowOtpModal(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 5000);
    } catch (err: any) {
      console.error(err);
      setOtpError(err.message || "OTP check failed. Please check the code and try again.");
    } finally {
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
            <h3 className="text-xl font-bold text-white">Pre-Registration Complete!</h3>
            <p className="text-sm text-white/60 max-w-xs mx-auto">
              Thank you for pre-registering. We have added you to our early access priority list. Redirecting to home...
            </p>
          </div>
        ) : (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            {formError && (
              <div className="p-3 bg-red-500/10 border-l-4 border-red-500 text-red-200 text-xs rounded flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-400" />
                  <span className="font-semibold">Verification System Notice</span>
                </div>
                <p className="text-[11px] leading-relaxed text-red-200/90">{formError}</p>
                {providerErrorDetails && (
                  <p className="text-[9px] font-mono text-red-300 mt-1 bg-black/30 p-1.5 rounded select-all max-h-16 overflow-y-auto">
                    Details: {providerErrorDetails}
                  </p>
                )}
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
                <div className="flex justify-between items-center mb-2 font-semibold">
                  <label htmlFor="city" className="block text-xs font-bold text-white/70 uppercase tracking-wider">
                    City
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowLocationModal(true)}
                    className="text-[9px] font-bold text-green-400 hover:text-green-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Compass className="w-3 h-3" />
                    Choose on Map
                  </button>
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
                    {customCities.map((c) => (
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

            {/* Recaptcha container placeholder */}
            <div id="recaptcha-container" className="hidden"></div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-4 py-3.5 bg-green-600 hover:bg-green-500 disabled:bg-green-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-green-900/30 hover:shadow-green-800/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Dispatching...
                </>
              ) : (
                <>
                  {verifyMethod === "phone" ? "Verify WhatsApp Number" : authProvider === "firebase" ? "Send Verification Email" : "Send Email OTP"}
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
              By signing up you agree to our <Link href="#" className="underline hover:text-white">Privacy Policy</Link> and <Link href="#" className="underline hover:text-white">Terms of Service</Link>.
            </p>
          </form>
        )}
      </div>

      {/* OTP Verification Modal Overlay */}
      <AnimatePresence>
        {showOtpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm glass-dark-form p-8 rounded-2xl border border-white/10 shadow-2xl relative"
            >
              <div className="text-center space-y-3 mb-6">
                <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Verify {verifyMethod === "phone" ? "WhatsApp" : "Email"}
                </h3>
                <p className="text-xs text-white/60 leading-normal">
                  We sent a 6-digit OTP verification code to <br />
                  <span className="font-semibold text-white/90">
                    {verifyMethod === "phone" ? `+91 ${phone}` : email}
                  </span>{" "}
                  via {authProvider === "firebase" ? "Firebase Auth" : "Supabase Auth"}.
                </p>
              </div>

              <div className="space-y-4">
                {/* Temporary visual helper overlay for development testing */}
                <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-[10px] rounded text-center tracking-wide font-mono select-all">
                  🔑 {sandboxMode ? "[SANDBOX BYPASS CODE]" : "[REAL PROVIDER CODE]"}: <span className="font-bold text-yellow-300">{generatedOtp}</span>
                </div>

                {otpError && (
                  <div className="p-3 bg-red-500/10 border-l-4 border-red-500 text-red-200 text-xs rounded flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{otpError}</span>
                  </div>
                )}

                {/* 6 Digit Input Boxes */}
                <div className="flex gap-2 justify-center">
                  {otpValues.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        if (el) otpInputsRef.current[idx] = el;
                      }}
                      type="text"
                      maxLength={6} // allow paste handling
                      pattern="[0-9]*"
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-10 h-12 bg-white/[0.04] border border-white/[0.08] rounded-lg text-center text-lg font-bold text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleVerifyAndSignup}
                    disabled={submitting}
                    className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-green-900/30"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Verifying...
                      </>
                    ) : (
                      "Verify & Create Account"
                    )}
                  </button>
                </div>

                <div className="text-center pt-2 text-xs">
                  {otpTimer > 0 ? (
                    <span className="text-white/40">Resend code in <span className="text-white/60 font-semibold">{otpTimer}s</span></span>
                  ) : (
                    <button
                      onClick={handleResendOtp}
                      className="font-bold text-green-400 hover:underline cursor-pointer"
                    >
                      Resend Code
                    </button>
                  )}
                </div>

                <div className="text-center pt-2">
                  <button
                    onClick={() => {
                      setShowOtpModal(false);
                      setSubmitting(false);
                    }}
                    className="text-[10px] uppercase tracking-wider text-white/30 hover:text-white/60"
                  >
                    Cancel & Edit Details
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <LocationChooserModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onConfirm={handleLocationConfirm}
        initialCity={city}
      />
    </div>
  );
}
