"use client"

import { useState } from "react"
import { useAnalysisStore } from "@/store/useAnalysisStore"
import { loadSkills } from "@/lib/profileStorage"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Zap, Building2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const EXAMPLES = [
  "Software Engineer at Google",
  "Product Manager at Stripe",
  "Data Scientist at OpenAI",
  "Frontend Developer at Figma",
]

const STAGES = [
  "Parsing your resume...",
  "Extracting job requirements...",
  "Matching skills & keywords...",
  "Calculating ATS score...",
  "Rewriting resume bullets...",
  "Generating interview questions...",
  "Building your growth plan...",
]

export function JobStep() {
  const {
    jobDescription, setJobDescription, setStep,
    setResult, setError, resumeText, resumeFile,
    profile, selectedQuestions, customQuestion, error,
  } = useAnalysisStore()

  const [analyzing, setAnalyzing] = useState(false)
  const [stageIdx, setStageIdx] = useState(0)
  const [progress, setProgress] = useState(0)

  const MIN_CHARS = 20
  const charCount = jobDescription.trim().length
  const canSubmit = charCount >= MIN_CHARS

  const handleAnalyze = async () => {
    setAnalyzing(true)
    setError(null)
    setStageIdx(0)
    setProgress(0)

    // Progress animation
    let p = 0
    const progressInterval = setInterval(() => {
      p = Math.min(p + 1.2, 90)
      setProgress(p)
    }, 300)

    // Stage cycling
    let s = 0
    const stageInterval = setInterval(() => {
      s = Math.min(s + 1, STAGES.length - 1)
      setStageIdx(s)
    }, 3500)

    const formData = new FormData()
    if (resumeFile) {
      formData.append("resumeFile", resumeFile)
      formData.append("resumeText", "")
    } else {
      formData.append("resumeText", resumeText)
    }
    const skills = loadSkills()
    formData.append("name", profile.name)
    formData.append("currentRole", profile.currentRole)
    formData.append("experience", profile.experience)
    formData.append("location", profile.location)
    formData.append("linkedin", profile.linkedin)
    formData.append("skills", skills.join(", "))
    formData.append("selectedQuestions", JSON.stringify(selectedQuestions))
    formData.append("customQuestion", customQuestion)
    formData.append("jobDescription", jobDescription)

    try {
      const res = await fetch("/api/analyze", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Analysis failed")

      clearInterval(progressInterval)
      clearInterval(stageInterval)
      setProgress(100)
      setStageIdx(STAGES.length - 1)

      // Save to Supabase if logged in
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from("analyses").insert({
          user_id: user.id,
          job_title: data.jobProfile?.jobTitle || jobDescription.slice(0, 80),
          company: data.jobProfile?.company || "",
          final_score: data.scores?.finalScore || 0,
          job_description: jobDescription,
          resume_text: resumeText || "",
          result: data,
        })
      }

      await new Promise(r => setTimeout(r, 600)) // brief pause at 100%
      setResult(data)
    } catch (err) {
      clearInterval(progressInterval)
      clearInterval(stageInterval)
      setAnalyzing(false)
      setError(err instanceof Error ? err.message : "Something went wrong")
    }
  }

  // Full-screen loading overlay
  if (analyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-8">
        {/* Animated orb */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-blue-500/40">
            <div className="w-14 h-14 rounded-full bg-slate-950/70 flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-400 animate-pulse" />
            </div>
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping" />
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-white">Gemini AI is analyzing</h3>
          <p className="text-slate-400 text-sm">This takes about 15–30 seconds</p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-sm space-y-2">
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-600">
            <span>{STAGES[stageIdx]}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Stage checklist */}
        <div className="w-full max-w-sm space-y-2">
          {STAGES.map((stage, i) => (
            <div key={i} className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-300",
              i < stageIdx ? "text-slate-500 opacity-50" :
              i === stageIdx ? "bg-blue-950/40 border border-blue-800/40 text-blue-300" :
              "text-slate-700"
            )}>
              <span className="text-base shrink-0">
                {i < stageIdx ? "✓" : i === stageIdx ? "⟳" : "○"}
              </span>
              {stage}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 pb-2">
        <h2 className="text-2xl font-bold text-white">Target job description</h2>
        <p className="text-slate-400 text-sm">
          Paste the full job posting — the more detail, the better your ATS score
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {EXAMPLES.map((e) => (
          <span key={e} className="flex items-center gap-1 px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-400">
            <Building2 className="w-3 h-3" />
            {e}
          </span>
        ))}
      </div>

      <textarea
        value={jobDescription}
        onChange={(e) => {
          setJobDescription(e.target.value)
          e.target.style.height = "auto"
          e.target.style.height = Math.min(e.target.scrollHeight, 480) + "px"
        }}
        placeholder={`Paste the full job description here...\n\nInclude everything:\n• Job title and company\n• Responsibilities\n• Required skills and qualifications\n• Preferred qualifications\n• Any tech stack mentioned`}
        rows={6}
        style={{ minHeight: "140px", maxHeight: "480px" }}
        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 resize-none transition-all leading-relaxed overflow-y-auto"
      />

      <div className="flex justify-between items-center -mt-4">
        <span className="text-xs text-slate-600">
          {charCount < MIN_CHARS ? `${MIN_CHARS - charCount} more characters needed` : "✓ Ready to analyze"}
        </span>
        <span className={cn("text-xs", charCount >= MIN_CHARS ? "text-emerald-500" : "text-slate-600")}>
          {charCount} chars
        </span>
      </div>

      {error && (
        <div className="p-3 bg-red-900/30 border border-red-700/40 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      )}

      {canSubmit && (
        <div className="flex items-center gap-2 p-3 bg-blue-950/30 border border-blue-800/30 rounded-xl">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
          <p className="text-blue-300 text-xs">
            Ready to analyze — Gemini AI will score your match, rewrite your resume, and prep your interviews.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setStep("resume")}
          className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl flex items-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleAnalyze}
          disabled={!canSubmit}
          className={cn(
            "flex-1 py-3.5 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all",
            canSubmit
              ? "bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-900/30"
              : "bg-slate-800 text-slate-500 cursor-not-allowed"
          )}
        >
          <Zap className="w-4 h-4" />
          Analyze with AI
        </button>
      </div>
    </div>
  )
}
