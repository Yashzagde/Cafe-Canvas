import React, { useState } from 'react'
import { Eye, EyeOff, AlertCircle, Coffee } from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'

export function LoginScreen() {
  const { signIn } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      const res = await signIn(email, password)
      if (res.error) {
        // Humanized errors for wrong credentials or network drops
        if (res.error.includes('Invalid login credentials')) {
          setErrorMsg('Incorrect email or password. Please verify and try again.')
        } else if (res.error.includes('fetch')) {
          setErrorMsg('Network connectivity error. Please check your internet connection.')
        } else {
          setErrorMsg(res.error)
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateAccount = () => {
    window.electronAPI.openExternal('https://cafecanvas.bar/sign-up')
  }

  return (
    <div className="flex h-full w-full font-body select-none">
      {/* Left Pane: Branding & Art */}
      <div className="hidden md:flex md:w-1/2 bg-canvas-terracotta relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Dynamic Abstract Art Grid background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-[-50px] left-[-50px] w-[300px] h-[300px] rounded-full bg-canvas-gold"></div>
          <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-canvas-gold"></div>
          <div className="absolute top-1/2 left-1/4 w-[150px] h-[150px] rotate-45 border-4 border-white"></div>
        </div>

        {/* Brand Moment */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-canvas-cream text-canvas-terracotta rounded-lg flex items-center justify-center shadow-lg border border-canvas-cream/20">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-wide">Cafe Canvas</h1>
            <p className="text-[10px] text-canvas-cream/60 tracking-wider uppercase">Enterprise Restaurant OS</p>
          </div>
        </div>

        <div className="space-y-4 max-w-sm z-10">
          <h2 className="font-display text-4xl font-bold leading-tight text-canvas-cream">
            Manage your cafe, <br />your way.
          </h2>
          <p className="text-sm text-canvas-cream/80 leading-relaxed font-medium">
            Access live orders, branch logistics, staff schedules, and settings instantly in a highly-responsive desktop experience.
          </p>
        </div>

        <div className="text-[10px] text-canvas-cream/50 z-10 font-bold tracking-widest uppercase">
          Powered by Supabase & Electron
        </div>
      </div>

      {/* Right Pane: Login Form */}
      <div className="w-full md:w-1/2 bg-canvas-cream flex flex-col justify-between p-12 overflow-y-auto">
        <div className="my-auto max-w-md w-full mx-auto space-y-8">
          <div className="space-y-2">
            <h3 className="font-display text-3xl font-extrabold text-canvas-brown">
              Welcome Back
            </h3>
            <p className="text-sm text-canvas-brown_mid font-medium">
              Enter your credentials to manage your store dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="p-3 bg-canvas-coral/15 border border-canvas-coral/25 rounded-lg flex items-start gap-2.5 text-xs text-canvas-error">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-canvas-coral" />
                <span className="font-bold">{errorMsg}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-canvas-brown uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@aether-cafe.com"
                className="w-full px-4 py-3 rounded-lg border border-canvas-border bg-white text-sm text-canvas-brown focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20 outline-none transition-all placeholder-canvas-brown_light font-semibold"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-canvas-brown uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => window.electronAPI.openExternal('https://cafecanvas.bar/forgot-password')}
                  className="text-xs font-bold text-canvas-brown_mid hover:text-canvas-terracotta hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-10 rounded-lg border border-canvas-border bg-white text-sm text-canvas-brown focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20 outline-none transition-all placeholder-canvas-brown_light font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-canvas-brown_light hover:text-canvas-gold transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-canvas-border text-canvas-terracotta focus:ring-canvas-terracotta/30"
                />
                <span className="text-xs font-bold text-canvas-brown_mid">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-lg bg-canvas-terracotta hover:bg-canvas-terra_light active:bg-canvas-terra_dark text-white font-bold text-sm shadow-md shadow-canvas-terracotta/10 transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="space-y-4">
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-canvas-border"></div>
              <span className="flex-shrink mx-4 text-xs font-bold text-canvas-brown_light uppercase tracking-wider">
                New to Cafe Canvas?
              </span>
              <div className="flex-grow border-t border-canvas-border"></div>
            </div>

            <button
              onClick={handleCreateAccount}
              className="w-full py-3 px-4 rounded-lg border border-canvas-border bg-white hover:bg-canvas-surface/20 text-canvas-brown_mid font-bold text-sm transition-colors focus:outline-none"
            >
              Create Merchant Account
            </button>
          </div>
        </div>

        <div className="text-center text-[10px] text-canvas-brown_light font-semibold">
          Cafe Canvas © {new Date().getFullYear()} · Desktop Application v1.0.0
        </div>
      </div>
    </div>
  )
}
