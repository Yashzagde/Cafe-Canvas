"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Bell, Check, AlertCircle, Sparkles, Coffee, ShieldAlert, ArrowLeft, ArrowRight, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import useThemeStore from "@/stores/themeStore";
import themesData from "../../storefront-themes/themes.json";
import { formatPrice } from "@/utils/api";
import Toast from "@/components/ui/Toast";

function DineInContent() {
  const searchParams = useSearchParams();
  const tableParam = searchParams.get("table") || "7";

  // State managers
  const activeTheme = useThemeStore((s) => s.activeTheme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const [callState, setCallState] = useState("IDLE"); // IDLE, CALLING, ACKNOWLEDGED, COOLDOWN
  const [cooldownTime, setCooldownTime] = useState(120); // 2 minutes countdown
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  // Load local cooldown status on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCooldown = localStorage.getItem("cafe_canva_staff_cooldown_end");
      if (savedCooldown) {
        const remaining = Math.round((parseInt(savedCooldown) - Date.now()) / 1000);
        if (remaining > 0) {
          setCooldownTime(remaining);
          setCallState("COOLDOWN");
        }
      }
    }
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (callState === "COOLDOWN") {
      timerRef.current = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setCallState("IDLE");
            localStorage.removeItem("cafe_canva_staff_cooldown_end");
            return 120;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  // Handle Call Staff tap action
  const handleCallStaff = async () => {
    if (callState === "COOLDOWN" || callState === "CALLING" || callState === "ACKNOWLEDGED") return;

    // Haptic feedback trigger
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(50);
    }

    setCallState("CALLING");

    // Simulate API request to backend POST /api/dine-in/call-staff
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate networking delay
      
      // Request successful
      setCallState("ACKNOWLEDGED");
      setToast({ message: "Waiter summoned! A team member is heading to Table " + tableParam + ".", type: "success" });

      // After 15 seconds, transition to 2-minute cooldown
      setTimeout(() => {
        setCallState("COOLDOWN");
        const cooldownEnd = Date.now() + 120 * 1000;
        localStorage.setItem("cafe_canva_staff_cooldown_end", cooldownEnd.toString());
      }, 15000);

    } catch (err) {
      setCallState("IDLE");
      setToast({ message: "Network connection timeout. Please try again.", type: "error" });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const activeThemeMeta = themesData.find((t) => t.id === activeTheme) || themesData[0];

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 min-h-screen transition-colors duration-500 bg-[var(--color-bg)] text-[var(--color-text)]">
        <div className="max-w-4xl mx-auto px-4 py-6">
          
          {/* Header */}
          <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4 mb-6">
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--color-primary-500)] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Live Table Session
              </span>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl leading-none mt-1">
                Dine-In Hub
              </h1>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-2 rounded-2xl text-center shadow-sm">
              <p className="text-[9px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider">Your Table</p>
              <p className="font-display font-extrabold text-lg leading-none text-[var(--color-primary-500)] mt-0.5">#{tableParam}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* THEME SELECTION PANEL (Left side) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[32px] p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 border-b border-[var(--color-border)] pb-3">
                  <div className="w-6.5 h-6.5 rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary-500)] flex items-center justify-center">
                    <Coffee className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-display font-extrabold text-sm">Theme Selection Engine</h3>
                </div>

                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mb-4">
                  Select a brand theme style from the list below to instantly re-skin the storefront layout, active typography, margins, shadows, and the **Call Staff** visual behavior in real-time:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {themesData.map((theme) => {
                    const isSelected = activeTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => setTheme(theme.id)}
                        className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all hover:scale-[1.01] active:scale-[0.98] ${
                          isSelected
                            ? "border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-500)] shadow-sm"
                            : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-text-muted)]"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-bold font-display">{theme.name}</span>
                          <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[var(--color-border)] text-[var(--color-text-muted)]">
                            {theme.tier}
                          </span>
                        </div>
                        <span className="text-[10px] opacity-75 mt-1 font-sans line-clamp-1">Mood: {theme.mood}</span>
                        
                        {/* Swatches color indicator */}
                        <div className="flex gap-1.5 mt-2">
                          <span className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block shadow-inner" style={{ backgroundColor: theme.palette.primary }} />
                          <span className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block shadow-inner" style={{ backgroundColor: theme.palette.secondary }} />
                          <span className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block shadow-inner" style={{ backgroundColor: theme.palette.bg }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mock table status & orders */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[32px] p-6 shadow-sm">
                <h3 className="font-display font-extrabold text-sm mb-3">Table Orders Status</h3>
                
                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center gap-3 bg-[var(--color-bg)] p-3 rounded-2xl border border-[var(--color-border)]">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold">Active order being prepared</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">1x Hazelnut Latte · 1x Avocado Toast Supreme</p>
                    </div>
                    <span className="font-display font-bold">{formatPrice(630)}</span>
                  </div>

                  <div className="flex items-center justify-between p-1 border-b border-[var(--color-border)]">
                    <span className="text-[var(--color-text-muted)]">Check-in time:</span>
                    <span className="font-bold">10:15 AM · 22 mins ago</span>
                  </div>

                  <div className="flex items-center justify-between p-1">
                    <span className="text-[var(--color-text-muted)]">Session Status:</span>
                    <span className="font-extrabold uppercase text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Open Table
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CALL STAFF PREVIEW DEMO PANEL (Right side) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[32px] p-6 shadow-sm text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-repeat-x flex opacity-20" style={{ backgroundImage: "linear-gradient(45deg, transparent 33.333%, var(--color-primary-500) 33.333%, var(--color-primary-500) 66.666%, transparent 66.666%), linear-gradient(-45deg, transparent 33.333%, var(--color-primary-500) 33.333%, var(--color-primary-500) 66.666%, transparent 66.666%)", backgroundSize: "6px 12px" }} />

                <h3 className="font-display font-extrabold text-sm mb-2 mt-2">Staff Call Panel</h3>
                <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed mb-6">
                  Summon a waiter directly to Table #{tableParam} by tapping the floating call button or testing the card triggers.
                </p>

                {/* Big Interactive Call Staff Button representation inside the panel */}
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="relative">
                    
                    {/* Concentric radar rings (CALLING state animation) */}
                    <AnimatePresence>
                      {callState === "CALLING" && (
                        <>
                          <motion.span
                            initial={{ scale: 1, opacity: 0.6 }}
                            animate={{ scale: 2, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                            className="absolute inset-0 rounded-full border-2 border-[var(--color-primary-500)] pointer-events-none"
                            style={{ borderColor: activeThemeMeta.callStaff.border }}
                          />
                          <motion.span
                            initial={{ scale: 1, opacity: 0.4 }}
                            animate={{ scale: 2.5, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut", delay: 0.5 }}
                            className="absolute inset-0 rounded-full border-2 border-[var(--color-primary-500)] pointer-events-none"
                            style={{ borderColor: activeThemeMeta.callStaff.border }}
                          />
                        </>
                      )}
                    </AnimatePresence>

                    {/* Main Button */}
                    <button
                      onClick={handleCallStaff}
                      disabled={callState === "COOLDOWN" || callState === "CALLING"}
                      className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-lg border-2 transition-all duration-300 ${
                        callState === "ACKNOWLEDGED"
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : callState === "COOLDOWN"
                          ? "bg-stone-100 border-stone-300 text-stone-400 cursor-not-allowed"
                          : "hover:scale-105 active:scale-95"
                      }`}
                      style={{
                        backgroundColor: callState === "IDLE" || callState === "CALLING" ? activeThemeMeta.callStaff.bg : undefined,
                        borderColor: callState === "IDLE" || callState === "CALLING" ? activeThemeMeta.callStaff.border : undefined,
                        color: callState === "IDLE" || callState === "CALLING" ? activeThemeMeta.callStaff.text : undefined,
                        boxShadow: callState === "IDLE" ? `0 8px 30px ${activeThemeMeta.callStaff.pulse}` : undefined,
                        fontFamily: activeThemeMeta.callStaff.font,
                      }}
                      id="dine-in-call-staff"
                    >
                      {callState === "CALLING" ? (
                        <div className="w-7 h-7 border-2 border-current border-t-transparent rounded-full animate-spin mb-1" />
                      ) : callState === "ACKNOWLEDGED" ? (
                        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                          <Check className="w-8 h-8 stroke-[3px] text-white" />
                        </motion.div>
                      ) : (
                        <Bell className={`w-8 h-8 ${callState === "IDLE" ? "animate-bounce duration-[3000ms]" : ""}`} />
                      )}

                      <span className="text-[9px] font-extrabold uppercase mt-1 tracking-wider leading-none">
                        {callState === "IDLE" && "Call Staff"}
                        {callState === "CALLING" && "Calling..."}
                        {callState === "ACKNOWLEDGED" && "Coming!"}
                        {callState === "COOLDOWN" && "Called"}
                      </span>
                    </button>
                  </div>

                  {/* Cooldown Timer banner */}
                  <AnimatePresence>
                    {callState === "COOLDOWN" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-stone-500 font-bold text-[10px]"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Anti-Spam Cooldown active ({formatTime(cooldownTime)})
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Acknowledged Banner */}
                  <AnimatePresence>
                    {callState === "ACKNOWLEDGED" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-6 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] leading-tight font-bold text-center"
                      >
                        <span className="block text-emerald-600 font-extrabold uppercase text-[9px] tracking-wider mb-0.5">Summons Transmitted</span>
                        Your request has been pushed to the manager's dashboard. A steward will attend shortly.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Theme details specs */}
                <div className="border-t border-[var(--color-border)] pt-4 mt-2 text-left space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)] font-bold">Theme Family:</span>
                    <span className="font-bold">{activeThemeMeta.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)] font-bold">Theme Font:</span>
                    <span className="font-bold font-display">{activeThemeMeta.typography.display}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)] font-bold">Waiter Button Style:</span>
                    <span className="font-bold font-mono">{activeThemeMeta.callStaff.style}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  );
}

export default function DineInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A1A] text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-stone-400">Loading Dine-In Session...</p>
        </div>
      </div>
    }>
      <DineInContent />
    </Suspense>
  );
}
