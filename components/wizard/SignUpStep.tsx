"use client"

import { useState } from "react"
import { useAnalysisStore } from "@/store/useAnalysisStore"
import { saveProfile, saveResumeText } from "@/lib/profileStorage"
import { saveSession } from "@/lib/session"
import { supabase } from "@/lib/supabase"
import { ArrowRight, User, Mail, Phone, Shield, CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const PHONE_REGEX = /^\+?[0-9]{7,15}$/

export function SignUpStep() {
  const { profile, setProfile, setSkills, setStep, setResumeText } = useAnalysisStore()
  const [isSignUp, setIsSignUp] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState("")

  const validate = () => {
    const e: Record<string, string> = {}
    if (isSignUp && !profile.name.trim()) e.name = "Full name is required"
    if (isSignUp && (!profile.email.trim() || !/\S+@\S+\.\S+/.test(profile.email))) e.email = "Valid email required"
    if (!profile.phone.trim() || !PHONE_REGEX.test(profile.phone.trim())) e.phone = "Valid phone number required"
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const eList = validate()
    if (Object.keys(eList).length) { setErrors(eList); return }
    setLoading(true)
    setAuthError("")
    const phone = profile.phone.trim()

    try {
      const { data: existing } = await supabase.from("profiles").select("*").eq("phone", phone).maybeSingle()

      if (isSignUp) {
        if (existing) { setAuthError("Phone number already registered. Sign in instead."); setLoading(false); return }
        const { data: created, error } = await supabase.from("profiles").insert({
          email: profile.email,
          name: profile.name,
          phone,
          role: "",
          experience: "",
          location: "",
          linkedin: "",
          skills: [],
        }).select("*").single()
        if (error) throw error
        if (created) saveSession(created.id)
      } else {
        if (!existing) { setAuthError("No account found with that phone number. Sign up instead."); setLoading(false); return }
        saveSession(existing.id)
        const p = {
          name: existing.name, email: existing.email, phone: existing.phone,
          currentRole: existing.role, experience: existing.experience,
          location: existing.location, linkedin: existing.linkedin,
          summary: existing.summary ?? "", education: existing.education ?? "",
          keyAchievements: existing.key_achievements ?? [],
        }
        setProfile(p)
        if (existing.skills?.length) setSkills(existing.skills)
        const savedResume = existing.resume_text ?? ""
        if (savedResume) { setResumeText(savedResume); saveResumeText(savedResume) }
        saveProfile({ ...profile, ...p })
        // Returning user: skip straight to the step they left off at instead of
        // making them re-upload their resume every time.
        if (existing.role && savedResume) { setStep("job"); return }
        if (existing.role || savedResume) { setStep("resume"); return }
        setStep("resume")
        return
      }
      saveProfile({ ...profile, phone })
      setStep("resume")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong"
      setAuthError(msg)
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
          {isSignUp ? "Get hyper-personalized resume analysis tailored to your career goals" : "Enter your phone number to access your saved profile"}
        </p>
      </div>

      {authError && (
        <div className="p-3 bg-red-900/30 border border-red-700/40 rounded-xl text-red-300 text-sm text-center">{authError}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
        {isSignUp && (
          <>
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
          </>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number
          </label>
          <input type="tel" value={profile.phone}
            onChange={(e) => { setProfile({ phone: e.target.value }); setErrors(p => ({ ...p, phone: "" })) }}
            placeholder="+1 555 123 4567"
            className={cn("w-full bg-slate-950 border rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 transition-all",
              errors.phone ? "border-red-500/60 focus:ring-red-500/30" : "border-slate-800 focus:ring-blue-500/30 focus:border-blue-500/60")} />
          {errors.phone && <p className="text-xs text-red-400">{errors.phone}</p>}
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
            <p className="text-xs font-semibold text-slate-200">No Password Needed</p>
            <p className="text-[10px] text-slate-500">Sign in anytime with your phone number</p>
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
