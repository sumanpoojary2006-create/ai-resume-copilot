"use client"

import { useState, useEffect } from "react"
import { useAnalysisStore } from "@/store/useAnalysisStore"
import { saveProfile, saveSkills } from "@/lib/profileStorage"
import { supabase } from "@/lib/supabase"
import { ArrowRight, ArrowLeft, MapPin, Link2, Plus, X, Briefcase, Clock, User, Mail, Sparkles, Edit3 } from "lucide-react"
import { cn } from "@/lib/utils"

const EXPERIENCE_OPTIONS = [
  "0–1 years (Fresher)", "1–3 years", "3–5 years",
  "5–8 years", "8–12 years", "12+ years",
]

const SKILL_SUGGESTIONS = [
  "Python", "JavaScript", "TypeScript", "React", "Node.js", "SQL", "AWS", "Docker",
  "Machine Learning", "Data Analysis", "Project Management", "Agile", "Git", "REST APIs",
  "Java", "Go", "Kubernetes", "PostgreSQL", "MongoDB", "Figma",
]

export function ProfileStep() {
  const { profile, setProfile, skills: storeSkills, setSkills, setStep } = useAnalysisStore()
  const [skills, setLocalSkills] = useState<string[]>(storeSkills || [])
  const [skillInput, setSkillInput] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (storeSkills.length) setLocalSkills(storeSkills)
  }, [storeSkills])

  const addSkill = (s: string) => {
    const t = s.trim()
    if (t && !skills.includes(t)) setLocalSkills([...skills, t])
    setSkillInput("")
  }
  const removeSkill = (s: string) => setLocalSkills(skills.filter(x => x !== s))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!profile.name.trim()) e.name = "Name is required"
    if (!profile.currentRole.trim()) e.currentRole = "Current role is required"
    if (!profile.experience) e.experience = "Experience level is required"
    return e
  }

  const handleNext = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)

    setSkills(skills)
    saveProfile({ ...profile })
    saveSkills(skills)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id, email: profile.email, name: profile.name,
        role: profile.currentRole, experience: profile.experience,
        location: profile.location, linkedin: profile.linkedin, skills,
      })
    }
    setSaving(false)
    setStep("job")
  }

  const field = (id: keyof typeof profile, label: string, placeholder: string, Icon: React.ElementType, type = "text") => (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" /> {label}
      </label>
      <input type={type} value={(profile[id] as string) || ""}
        onChange={(e) => { setProfile({ [id]: e.target.value }); setErrors(p => ({ ...p, [id]: "" })) }}
        placeholder={placeholder}
        className={cn("w-full bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 transition-all",
          errors[id] ? "border-red-500/60 focus:ring-red-500/30" : "border-slate-800 focus:ring-blue-500/30 focus:border-blue-500/60"
        )}
      />
      {errors[id] && <p className="text-xs text-red-400">{errors[id]}</p>}
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Review your profile</h2>
          <p className="text-slate-400 text-sm mt-0.5">Auto-filled from resume — edit anything that's wrong</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-950/30 border border-blue-800/30 px-2.5 py-1 rounded-lg">
          <Edit3 className="w-3 h-3" /> Editable
        </div>
      </div>

      {/* Summary card if extracted */}
      {profile.summary && (
        <div className="p-4 bg-slate-800/40 border border-slate-700/40 rounded-xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" /> AI-Generated Summary
          </p>
          <p className="text-slate-300 text-sm leading-relaxed">{profile.summary}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field("name", "Full Name", "John Doe", User)}
        {field("email", "Email", "john@example.com", Mail, "email")}
        {field("currentRole", "Current/Target Role", "e.g. Software Engineer", Briefcase)}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Experience
          </label>
          <select value={profile.experience}
            onChange={(e) => { setProfile({ experience: e.target.value }); setErrors(p => ({ ...p, experience: "" })) }}
            className={cn("w-full bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer",
              errors.experience ? "border-red-500/60 focus:ring-red-500/30" : "border-slate-800 focus:ring-blue-500/30 focus:border-blue-500/60"
            )}>
            <option value="">Select level</option>
            {EXPERIENCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          {errors.experience && <p className="text-xs text-red-400">{errors.experience}</p>}
        </div>
        {field("location", "Location (optional)", "San Francisco, CA", MapPin)}
        {field("linkedin", "LinkedIn (optional)", "linkedin.com/in/username", Link2)}
      </div>

      {/* Education if extracted */}
      {profile.education && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Education</label>
          <input type="text" value={profile.education}
            onChange={(e) => setProfile({ education: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 transition-all"
          />
        </div>
      )}

      {/* Key Achievements */}
      {profile.keyAchievements && profile.keyAchievements.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" /> Key Achievements (from resume)
          </label>
          <div className="space-y-1.5">
            {profile.keyAchievements.map((a, i) => (
              <div key={i} className="flex gap-2 items-start p-2.5 bg-slate-800/40 rounded-lg">
                <span className="text-amber-400 text-xs mt-0.5">★</span>
                <p className="text-slate-300 text-xs leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Skills {skills.length > 0 && <span className="text-blue-400 normal-case font-normal ml-1">({skills.length} extracted)</span>}
        </label>
        <div className="flex gap-2">
          <input type="text" value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput) } }}
            placeholder="Add a skill..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 transition-all"
          />
          <button type="button" onClick={() => addSkill(skillInput)}
            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-all">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skills.map(s => (
              <span key={s} className="flex items-center gap-1 px-2.5 py-1 bg-blue-900/30 border border-blue-700/40 text-blue-300 rounded-lg text-xs">
                {s}
                <button onClick={() => removeSkill(s)} className="hover:text-white transition-colors ml-0.5"><X className="w-2.5 h-2.5" /></button>
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-1.5">
          {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 10).map(s => (
            <button key={s} type="button" onClick={() => addSkill(s)}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg text-xs transition-all">
              + {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={() => setStep("resume")}
          className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl flex items-center gap-2 transition-all">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={handleNext} disabled={saving}
          className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/30">
          {saving ? "Saving..." : "Save & Continue"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
