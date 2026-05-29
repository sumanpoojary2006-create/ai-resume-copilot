"use client"

import { useState } from "react"
import { useAnalysisStore } from "@/store/useAnalysisStore"
import { saveProfile } from "@/lib/profileStorage"
import { ArrowRight, User, Mail, Briefcase, Clock, Shield, Zap, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

const EXPERIENCE_OPTIONS = [
  "0–1 years (Fresher)",
  "1–3 years",
  "3–5 years",
  "5–8 years",
  "8–12 years",
  "12+ years",
]

const PERKS = [
  { icon: Zap, text: "Analysis in under 30 seconds" },
  { icon: Shield, text: "No data stored on servers — 100% local" },
  { icon: RefreshCw, text: "Re-analyze any time, unlimited" },
]

export function WelcomeStep() {
  const { profile, setProfile, setStep } = useAnalysisStore()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!profile.name.trim()) e.name = "Name is required"
    if (!profile.email.trim() || !/\S+@\S+\.\S+/.test(profile.email)) e.email = "Valid email required"
    if (!profile.currentRole.trim()) e.currentRole = "Current role is required"
    if (!profile.experience) e.experience = "Please select experience level"
    return e
  }

  const handleNext = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    saveProfile(profile)
    setStep("profile")
  }

  const field = (
    id: keyof typeof profile,
    label: string,
    placeholder: string,
    Icon: React.ElementType,
    type = "text"
  ) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-slate-500" />
        {label}
      </label>
      <input
        type={type}
        value={profile[id]}
        onChange={(e) => { setProfile({ [id]: e.target.value }); setErrors((prev) => ({ ...prev, [id]: "" })) }}
        placeholder={placeholder}
        onKeyDown={(e) => e.key === "Enter" && handleNext()}
        className={cn(
          "w-full bg-slate-800/60 border rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 transition-all",
          errors[id]
            ? "border-red-500/60 focus:ring-red-500/30"
            : "border-slate-700/80 focus:ring-blue-500/30 focus:border-blue-500/60"
        )}
      />
      {errors[id] && <p className="text-xs text-red-400 mt-1">{errors[id]}</p>}
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Create your account</h2>
        <p className="text-slate-400 text-sm mt-1">Tell us a bit about yourself to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {field("name", "Full Name", "John Doe", User)}
        {field("email", "Email Address", "john@example.com", Mail, "email")}
        {field("currentRole", "Current Job Title", "e.g. Software Engineer", Briefcase)}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Years of Experience
          </label>
          <select
            value={profile.experience}
            onChange={(e) => { setProfile({ experience: e.target.value }); setErrors((prev) => ({ ...prev, experience: "" })) }}
            className={cn(
              "w-full bg-slate-800/60 border rounded-xl px-4 py-3.5 text-sm text-slate-100 focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer",
              errors.experience
                ? "border-red-500/60 focus:ring-red-500/30"
                : "border-slate-700/80 focus:ring-blue-500/30 focus:border-blue-500/60"
            )}
          >
            <option value="">Select experience level</option>
            {EXPERIENCE_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          {errors.experience && <p className="text-xs text-red-400 mt-1">{errors.experience}</p>}
        </div>
      </div>

      {/* Perks */}
      <div className="grid grid-cols-3 gap-3">
        {PERKS.map(({ icon: Icon, text }) => (
          <div key={text} className="flex flex-col items-center gap-2 p-3 bg-slate-800/40 border border-slate-700/40 rounded-xl text-center">
            <Icon className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-slate-400 leading-tight">{text}</p>
          </div>
        ))}
      </div>

      <button
        onClick={handleNext}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/30 text-base"
      >
        Continue — Set up profile
        <ArrowRight className="w-4 h-4" />
      </button>

      <p className="text-center text-xs text-slate-600">
        Your data stays in your browser · No account creation · No emails
      </p>
    </div>
  )
}
