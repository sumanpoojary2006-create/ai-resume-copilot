"use client"

import { useState } from "react"
import { useAnalysisStore } from "@/store/useAnalysisStore"
import { saveProfile } from "@/lib/profileStorage"
import { supabase } from "@/lib/supabase"
import { ArrowRight, User, Mail, Lock, Shield, CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function SignUpStep() {
  const { profile, setProfile, setStep } = useAnalysisStore()
  const [isSignUp, setIsSignUp] = useState(true)
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState("")

  const validate = () => {
    const e: Record<string, string> = {}
    if (isSignUp && !profile.name.trim()) e.name = "Full name is required"
    if (!profile.email.trim() || !/\S+@\S+\.\S+/.test(profile.email)) e.email = "Valid email required"
    if (!password || password.length < 6) e.password = "Password must be at least 6 characters"
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const eList = validate()
    if (Object.keys(eList).length) { setErrors(eList); return }
    setLoading(true)
    setAuthError("")

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: profile.email,
          password,
          options: { data: { name: profile.name } },
        })
        if (error) throw error
        if (data.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            email: profile.email,
            name: profile.name,
            role: "",
            experience: "",
            location: "",
            linkedin: "",
            skills: [],
          })
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: profile.email, password })
        if (error) throw error
        if (data.user) {
          const { data: profileData } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()
          if (profileData) {
            const p = { name: profileData.name, email: profileData.email, currentRole: profileData.role, experience: profileData.experience, location: profileData.location, linkedin: profileData.linkedin }
            setProfile(p)
            saveProfile(p)
            if (profileData.role) { setStep("resume"); return }
          }
        }
      }
      saveProfile({ ...profile })
      setStep("resume")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed"
      if (msg.includes("already registered")) setAuthError("Email already registered. Sign in instead.")
      else if (msg.includes("Invalid login")) setAuthError("Incorrect email or password.")
      else setAuthError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
          ⚡ Co-Pilot Onboarding
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          {isSignUp ? "Create your account" : "Welcome back"}
        </h2>
        <p className="text-slate-400 text-sm max-w-sm mx-auto">
          {isSignUp ? "Get hyper-personalized resume analysis tailored to your career goals" : "Sign in to access your saved profile and analysis history"}
        </p>
      </div>

      {authError && (
        <div className="p-3 bg-red-900/30 border border-red-700/40 rounded-xl text-red-300 text-sm text-center">{authError}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
        {isSignUp && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" /> Full Name
            </label>
            <input type="text" value={profile.name}
              onChange={(e) => { setProfile({ name: e.target.value }); setErrors(p => ({ ...p, name: "" })) }}
              placeholder="e.g. John Doe"
              className={cn("w-full bg-slate-950 border rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 transition-all",
                errors.name ? "border-red-500/60 focus:ring-red-500/30" : "border-slate-800 focus:ring-blue-500/30 focus:border-blue-500/60")} />
            {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
          </label>
          <input type="email" value={profile.email}
            onChange={(e) => { setProfile({ email: e.target.value }); setErrors(p => ({ ...p, email: "" })) }}
            placeholder="john@example.com"
            className={cn("w-full bg-slate-950 border rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 transition-all",
              errors.email ? "border-red-500/60 focus:ring-red-500/30" : "border-slate-800 focus:ring-blue-500/30 focus:border-blue-500/60")} />
          {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" /> Password
          </label>
          <input type="password" value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })) }}
            placeholder="••••••••"
            className={cn("w-full bg-slate-950 border rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 transition-all",
              errors.password ? "border-red-500/60 focus:ring-red-500/30" : "border-slate-800 focus:ring-blue-500/30 focus:border-blue-500/60")} />
          {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-4 mt-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/40">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          {loading ? "Please wait..." : isSignUp ? "Get Started" : "Sign In"}
        </button>

        <div className="text-center">
          <button type="button" onClick={() => { setIsSignUp(!isSignUp); setErrors({}); setAuthError("") }}
            className="text-xs text-blue-400 hover:underline hover:text-blue-300 transition-colors">
            {isSignUp ? "Already have an account? Sign in" : "New to ResumePilot? Create an account"}
          </button>
        </div>
      </form>

      <div className="pt-4 border-t border-slate-900 grid grid-cols-2 gap-4 max-w-md mx-auto">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-slate-200">Supabase Auth</p>
            <p className="text-[10px] text-slate-500">Secure, encrypted authentication</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-slate-200">Analysis History</p>
            <p className="text-[10px] text-slate-500">All analyses saved to cloud</p>
          </div>
        </div>
      </div>
    </div>
  )
}
