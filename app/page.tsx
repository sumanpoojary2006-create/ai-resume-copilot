"use client"

import { useEffect, useState } from "react"
import { useAnalysisStore } from "@/store/useAnalysisStore"
import { loadProfile, clearProfile, loadSkills } from "@/lib/profileStorage"
import { loadSession, clearSession } from "@/lib/session"
import { supabase } from "@/lib/supabase"
import StepProgress from "@/components/wizard/StepProgress"
import { SignUpStep } from "@/components/wizard/SignUpStep"
import { ProfileStep } from "@/components/wizard/ProfileStep"
import { ResumeStep } from "@/components/wizard/ResumeStep"
import { JobStep } from "@/components/wizard/JobStep"
import { ResultsDashboard } from "@/components/ResultsDashboard"
import { Zap, LogOut, ShieldCheck } from "lucide-react"

export default function Home() {
  const { step, reset, setStep, setProfile, setSkills, profile } = useAnalysisStore()
  const [hydrated, setHydrated] = useState(false)
  const isResults = step === "results"

  useEffect(() => {
    const init = async () => {
      const userId = loadSession()
      if (userId) {
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle()
        if (profileData) {
          setProfile({ name: profileData.name, email: profileData.email, phone: profileData.phone, currentRole: profileData.role, experience: profileData.experience, location: profileData.location, linkedin: profileData.linkedin })
          if (profileData.skills?.length) setSkills(profileData.skills)
          setStep("resume")
          setHydrated(true)
          return
        }
      }
      const saved = loadProfile()
      if (saved?.name) {
        setProfile(saved)
        const savedSkills = loadSkills()
        if (savedSkills.length) setSkills(savedSkills)
        setStep("resume")
      }
      setHydrated(true)
    }
    init()
  }, [])

  const handleReset = async () => {
    clearSession()
    clearProfile()
    reset()
  }

  if (!hydrated) return null

  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-100 flex flex-col overflow-x-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Nav */}
      <nav className="shrink-0 border-b border-white/[0.04] bg-[#030712]/50 backdrop-blur-md px-6 py-4 z-20 sticky top-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={handleReset} className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="font-extrabold text-white tracking-tight text-base">ResumePilot</span>
              <span className="text-[9px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">AI Resume Co-Pilot</span>
            </div>
          </button>
          <div className="flex items-center gap-4">
            {profile.name && step !== "signup" && (
              <div className="flex items-center gap-2.5 bg-slate-900/60 border border-white/[0.06] py-1 px-3 rounded-full">
                <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-slate-300 font-semibold hidden sm:block">{profile.name}</span>
                {profile.currentRole && <>
                  <span className="text-slate-700 hidden sm:block">|</span>
                  <span className="text-[10px] text-slate-400 hidden sm:block">{profile.currentRole}</span>
                </>}
              </div>
            )}
            {profile.name && (
              <button onClick={handleReset} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors font-medium">
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:block">Sign out</span>
              </button>
            )}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Secure
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col py-10 px-4 sm:px-6 lg:px-8 z-10 pb-16">
        {isResults ? (
          <div className="max-w-5xl w-full mx-auto">
            <ResultsDashboard />
          </div>
        ) : (
          <div className="max-w-2xl w-full mx-auto flex flex-col">
            {step !== "analyzing" && (
              <div className="mb-6">
                <StepProgress />
              </div>
            )}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/35 to-transparent" />
              <div className="relative">
                {step === "signup" && <SignUpStep />}
                {step === "resume" && <ResumeStep />}
                {step === "profile" && <ProfileStep />}
                {step === "job" && <JobStep />}
              </div>
            </div>
            {step !== "signup" && (
              <div className="mt-6 grid grid-cols-3 gap-4 max-w-lg mx-auto w-full">
                {[
                  { title: "Gemini AI", desc: "Elite analysis" },
                  { title: "ATS Optimized", desc: "Pass recruiter filters" },
                  { title: "Supabase Secured", desc: "Data encrypted" },
                ].map(({ title, desc }) => (
                  <div key={title} className="text-center">
                    <p className="text-xs font-bold text-slate-300">{title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="shrink-0 py-4 border-t border-white/[0.02] text-center text-xs text-slate-600">
        <p>© 2026 ResumePilot AI · Gemini 2.0 Flash · Next.js 16 · Supabase</p>
      </footer>
    </div>
  )
}
