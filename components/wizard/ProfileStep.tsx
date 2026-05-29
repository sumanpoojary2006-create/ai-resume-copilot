"use client"

import { useState, useEffect } from "react"
import { useAnalysisStore } from "@/store/useAnalysisStore"
import { loadSkills } from "@/lib/profileStorage"
import { ArrowRight, ArrowLeft, MapPin, Link2, Plus, X, Briefcase, Clock } from "lucide-react"
import { saveProfile, saveSkills } from "@/lib/profileStorage"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

const EXPERIENCE_OPTIONS = [
  "0–1 years (Fresher)",
  "1–3 years",
  "3–5 years",
  "5–8 years",
  "8–12 years",
  "12+ years",
]

const SKILL_SUGGESTIONS = [
  "Python", "JavaScript", "TypeScript", "React", "Node.js", "SQL", "AWS", "Docker",
  "Machine Learning", "Data Analysis", "Project Management", "Agile", "Git", "REST APIs",
  "Java", "Go", "Kubernetes", "PostgreSQL", "MongoDB", "Figma",
]

export function ProfileStep() {
  const { profile, setProfile, setStep } = useAnalysisStore()
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const saved = loadSkills()
    if (saved.length) setSkills(saved)
  }, [])

  const addSkill = (s: string) => {
    const trimmed = s.trim()
    if (trimmed && !skills.includes(trimmed)) setSkills([...skills, trimmed])
    setSkillInput("")
  }

  const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!profile.currentRole.trim()) e.currentRole = "Current or Target role is required"
    if (!profile.experience) e.experience = "Please select experience level"
    return e
  }

  const handleNext = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    saveProfile({ ...profile })
    saveSkills(skills)

    // Sync to Supabase if logged in
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
        email: profile.email,
        name: profile.name,
        role: profile.currentRole,
        experience: profile.experience,
        location: profile.location,
        linkedin: profile.linkedin,
        skills,
      })
    }
    setStep("resume")
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-white leading-snug">Configure your profile</h2>
        <p className="text-slate-400 text-sm">Provide details to help Gemini AI contextualize your background</p>
      </div>

      {/* Role & Experience */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            Target Job Title / Current Title
          </label>
          <input
            type="text"
            value={profile.currentRole}
            onChange={(e) => {
              setProfile({ currentRole: e.target.value })
              setErrors((prev) => ({ ...prev, currentRole: "" }))
            }}
            placeholder="e.g. Software Engineer"
            className={cn(
              "w-full bg-slate-950 border rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 transition-all duration-200",
              errors.currentRole
                ? "border-red-500/60 focus:ring-red-500/30"
                : "border-slate-800 focus:ring-blue-500/30 focus:border-blue-500/60"
            )}
          />
          {errors.currentRole && <p className="text-xs text-red-400">{errors.currentRole}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Years of Experience
          </label>
          <div className="relative">
            <select
              value={profile.experience}
              onChange={(e) => {
                setProfile({ experience: e.target.value })
                setErrors((prev) => ({ ...prev, experience: "" }))
              }}
              className={cn(
                "w-full bg-slate-950 border rounded-xl px-4 py-3.5 text-sm text-slate-100 focus:outline-none focus:ring-2 transition-all duration-200 cursor-pointer appearance-none",
                errors.experience
                  ? "border-red-500/60 focus:ring-red-500/30"
                  : "border-slate-800 focus:ring-blue-500/30 focus:border-blue-500/60"
              )}
            >
              <option value="" className="bg-slate-950">Select experience level</option>
              {EXPERIENCE_OPTIONS.map((o) => (
                <option key={o} value={o} className="bg-slate-950">{o}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <Plus className="w-3.5 h-3.5 rotate-45" />
            </div>
          </div>
          {errors.experience && <p className="text-xs text-red-400">{errors.experience}</p>}
        </div>
      </div>

      {/* Location & LinkedIn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            Location <span className="text-slate-500 font-normal lowercase">(optional)</span>
          </label>
          <input
            type="text"
            value={profile.location}
            onChange={(e) => setProfile({ location: e.target.value })}
            placeholder="e.g. San Francisco, CA"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 transition-all duration-200"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-slate-400" />
            LinkedIn URL <span className="text-slate-500 font-normal lowercase">(optional)</span>
          </label>
          <input
            type="text"
            value={profile.linkedin}
            onChange={(e) => setProfile({ linkedin: e.target.value })}
            placeholder="linkedin.com/in/username"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 transition-all duration-200"
          />
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          Key Skills <span className="text-slate-500 font-normal lowercase">(optional — add to build context)</span>
        </label>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addSkill(skillInput)
              }
            }}
            placeholder="Type a skill and press Enter"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 transition-all duration-200"
          />
          <button
            type="button"
            onClick={() => addSkill(skillInput)}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200 transition-all border border-slate-700/50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Added skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span
                key={s}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-950/40 border border-blue-800/40 text-blue-400 rounded-lg text-xs font-medium"
              >
                {s}
                <button type="button" onClick={() => removeSkill(s)} className="hover:text-white transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Suggestions */}
        <div>
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">Quick add suggestions:</p>
          <div className="flex flex-wrap gap-1.5">
            {SKILL_SUGGESTIONS.filter((s) => !skills.includes(s))
              .slice(0, 12)
              .map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addSkill(s)}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg text-xs transition-all duration-200"
                >
                  + {s}
                </button>
              ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={() => setStep("questions")}
          className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 font-medium rounded-xl flex items-center gap-2 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-blue-900/30 hover:scale-[1.01]"
        >
          Continue to Resume
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
