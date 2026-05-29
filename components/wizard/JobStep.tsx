"use client"

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

export function JobStep() {
  const {
    jobDescription,
    setJobDescription,
    setStep,
    setResult,
    setError,
    resumeText,
    resumeFile,
    profile,
    selectedQuestions,
    customQuestion,
    error,
  } = useAnalysisStore()

  const MIN_CHARS = 20
  const charCount = jobDescription.trim().length
  const canSubmit = charCount >= MIN_CHARS

  const handleAnalyze = async () => {
    setStep("analyzing")
    setError(null)

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

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 pb-2">
        <h2 className="text-2xl font-bold text-white">Target job description</h2>
        <p className="text-slate-400 text-sm">
          Paste the full job posting — the more detail, the better your ATS score
        </p>
      </div>

      {/* Example pills */}
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
          // Auto-grow
          e.target.style.height = "auto"
          e.target.style.height = Math.min(e.target.scrollHeight, 480) + "px"
        }}
        placeholder={`Paste the full job description here...\n\nInclude everything:\n• Job title and company\n• Responsibilities\n• Required skills and qualifications\n• Preferred qualifications\n• Any tech stack mentioned`}
        rows={6}
        style={{ minHeight: "140px", maxHeight: "480px" }}
        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 resize-none transition-all leading-relaxed overflow-y-auto"
      />

      {/* Character counter */}
      <div className="flex justify-between items-center -mt-4">
        <span className="text-xs text-slate-600">
          {charCount < MIN_CHARS
            ? `${MIN_CHARS - charCount} more characters needed`
            : "✓ Ready to analyze"}
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
