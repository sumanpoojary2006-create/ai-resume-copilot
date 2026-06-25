"use client"

import { useState } from "react"
import { useAnalysisStore } from "@/store/useAnalysisStore"
import { loadSession } from "@/lib/session"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Zap, Sparkles, Search, FileText, ExternalLink, Loader2, Star } from "lucide-react"
import { cn } from "@/lib/utils"

const STAGES = [
  "Parsing your resume...",
  "Extracting job requirements...",
  "Matching skills & keywords...",
  "Calculating ATS score...",
  "Rewriting resume bullets...",
  "Generating interview questions...",
  "Building your growth plan...",
]

interface DiscoveredJob {
  title: string
  company: string
  location: string
  matchScore: number
  whyMatch: string
  keyRequirements: string[]
  salaryRange: string
  jobType: string
  applyUrl: string
}

export function JobStep() {
  const { jobDescription, setJobDescription, setStep, setResult, setError,
    resumeText, resumeFile, profile, skills, selectedQuestions, customQuestion, error } = useAnalysisStore()

  const [mode, setMode] = useState<"manual" | "discover">("manual")
  const [analyzing, setAnalyzing] = useState(false)
  const [discovering, setDiscovering] = useState(false)
  const [discoverError, setDiscoverError] = useState("")
  const [stageIdx, setStageIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [discoveredJobs, setDiscoveredJobs] = useState<DiscoveredJob[]>([])
  const [searchSummary, setSearchSummary] = useState("")
  const [selectedJob, setSelectedJob] = useState<DiscoveredJob | null>(null)

  const MIN_CHARS = 20
  const charCount = jobDescription.trim().length
  const canSubmit = mode === "discover" ? !!selectedJob : charCount >= MIN_CHARS

  const handleDiscover = async () => {
    setDiscovering(true)
    setDiscoverError("")
    setDiscoveredJobs([])
    setSearchSummary("")
    try {
      const res = await fetch("/api/discover-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, profile: { ...profile, skills } })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Discovery failed")
      setDiscoveredJobs(data.jobs || [])
      setSearchSummary(data.searchSummary || "")
    } catch (err) {
      setDiscoverError(err instanceof Error ? err.message : "Job discovery failed")
    } finally {
      setDiscovering(false)
    }
  }

  const handleSelectJob = (job: DiscoveredJob) => {
    setSelectedJob(job)
    const jd = `${job.title} at ${job.company}\nLocation: ${job.location}\nType: ${job.jobType}\nSalary: ${job.salaryRange}\n\nKey Requirements:\n${job.keyRequirements.map(r => `• ${r}`).join("\n")}\n\nWhy this matches: ${job.whyMatch}`
    setJobDescription(jd)
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    setError(null)
    setStageIdx(0)
    setProgress(0)

    let p = 0
    const progressInterval = setInterval(() => { p = Math.min(p + 1.2, 90); setProgress(p) }, 300)
    let s = 0
    const stageInterval = setInterval(() => { s = Math.min(s + 1, STAGES.length - 1); setStageIdx(s) }, 3500)

    const formData = new FormData()
    if (resumeFile) { formData.append("resumeFile", resumeFile); formData.append("resumeText", "") }
    else { formData.append("resumeText", resumeText) }
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

      clearInterval(progressInterval); clearInterval(stageInterval)
      setProgress(100); setStageIdx(STAGES.length - 1)

      const userId = loadSession()
      if (userId) {
        await supabase.from("analyses").insert({
          user_id: userId,
          job_title: data.jobProfile?.jobTitle || jobDescription.slice(0, 80),
          company: data.jobProfile?.company || (selectedJob?.company || ""),
          final_score: data.scores?.finalScore || 0,
          job_description: jobDescription,
          resume_text: resumeText || "",
          result: data,
        })
      }

      await new Promise(r => setTimeout(r, 600))
      setResult(data)
    } catch (err) {
      clearInterval(progressInterval); clearInterval(stageInterval)
      setAnalyzing(false)
      setError(err instanceof Error ? err.message : "Something went wrong")
    }
  }

  // Loading overlay
  if (analyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-8">
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
          <p className="text-slate-400 text-sm">Crafting your personalized report...</p>
        </div>
        <div className="w-full max-w-sm space-y-2">
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-xs text-slate-600">
            <span>{STAGES[stageIdx]}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
        <div className="w-full max-w-sm space-y-2">
          {STAGES.map((stage, i) => (
            <div key={i} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
              i < stageIdx ? "text-slate-500 opacity-50" :
              i === stageIdx ? "bg-blue-950/40 border border-blue-800/40 text-blue-300" : "text-slate-700")}>
              <span className="shrink-0">{i < stageIdx ? "✓" : i === stageIdx ? "⟳" : "○"}</span>
              {stage}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-bold text-white">Target job</h2>
        <p className="text-slate-400 text-sm">Paste a JD manually or let AI discover the best matches for you</p>
      </div>

      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/60">
        <button onClick={() => setMode("manual")}
          className={cn("flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all",
            mode === "manual" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200")}>
          <FileText className="w-4 h-4" /> Paste Job Description
        </button>
        <button onClick={() => { setMode("discover"); if (!discoveredJobs.length) handleDiscover() }}
          className={cn("flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all",
            mode === "discover" ? "bg-violet-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200")}>
          <Search className="w-4 h-4" />
          {discovering ? "Searching..." : "AI Job Discovery"}
        </button>
      </div>

      {/* Manual mode */}
      {mode === "manual" && (
        <div className="space-y-3">
          <textarea value={jobDescription}
            onChange={(e) => { setJobDescription(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 400) + "px" }}
            placeholder={`Paste the full job description here...\n\nInclude:\n• Job title and company\n• Responsibilities\n• Required skills\n• Preferred qualifications`}
            rows={8} style={{ minHeight: "180px", maxHeight: "400px" }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 resize-none transition-all"
          />
          <div className="flex justify-between text-xs">
            <span className={charCount >= MIN_CHARS ? "text-emerald-500" : "text-slate-600"}>
              {charCount >= MIN_CHARS ? "✓ Ready to analyze" : `${MIN_CHARS - charCount} more chars needed`}
            </span>
            <span className="text-slate-600">{charCount} chars</span>
          </div>
        </div>
      )}

      {/* Discovery mode */}
      {mode === "discover" && (
        <div className="space-y-3">
          {discovering && (
            <div className="flex flex-col items-center py-8 gap-3">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
              <p className="text-slate-400 text-sm">Finding best job matches for your profile...</p>
              <p className="text-slate-600 text-xs">This takes 10–15 seconds</p>
            </div>
          )}

          {discoverError && !discovering && (
            <div className="p-3 bg-red-900/30 border border-red-700/40 rounded-xl text-red-300 text-sm">
              {discoverError}
              <button onClick={handleDiscover} className="block mt-2 text-xs text-red-400 underline hover:text-red-300">
                Try again
              </button>
            </div>
          )}

          {!discovering && !discoverError && discoveredJobs.length === 0 && (
            <div className="text-center py-6">
              <button onClick={handleDiscover}
                className="flex items-center gap-2 mx-auto px-5 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-medium transition-all">
                <Search className="w-4 h-4" /> Search for Jobs
              </button>
              <p className="text-slate-600 text-xs mt-2">AI will suggest best roles based on your resume</p>
            </div>
          )}

          {searchSummary && !discovering && (
            <div className="p-3 bg-slate-800/40 border border-slate-700/30 rounded-xl">
              <p className="text-xs text-slate-400 leading-relaxed">{searchSummary}</p>
            </div>
          )}

          {discoveredJobs.length > 0 && !discovering && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{discoveredJobs.length} Jobs Found</p>
                <button onClick={handleDiscover} className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
                  <Search className="w-3 h-3" /> Refresh
                </button>
              </div>
              {discoveredJobs.map((job, i) => (
                <div key={i}
                  onClick={() => handleSelectJob(job)}
                  className={cn("p-4 rounded-xl border cursor-pointer transition-all",
                    selectedJob?.title === job.title && selectedJob?.company === job.company
                      ? "bg-violet-950/40 border-violet-500/60"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-600")}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-white font-semibold text-sm">{job.title}</h4>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-bold",
                          job.matchScore >= 80 ? "bg-emerald-900/40 text-emerald-400" :
                          job.matchScore >= 60 ? "bg-yellow-900/40 text-yellow-400" : "bg-red-900/40 text-red-400")}>
                          {job.matchScore}% match
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mt-0.5">{job.company} · {job.location} · {job.jobType}</p>
                      {job.salaryRange && <p className="text-emerald-400 text-xs mt-0.5 font-medium">{job.salaryRange}</p>}
                      <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">{job.whyMatch}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.keyRequirements?.slice(0, 3).map((r, j) => (
                          <span key={j} className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full">{r}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      {job.applyUrl && (
                        <a href={job.applyUrl} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all">
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </a>
                      )}
                      {selectedJob?.title === job.title && (
                        <div className="p-1.5 bg-violet-600 rounded-lg">
                          <Star className="w-3.5 h-3.5 text-white fill-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-900/30 border border-red-700/40 rounded-xl text-red-300 text-sm">{error}</div>
      )}

      {canSubmit && (
        <div className="flex items-center gap-2 p-3 bg-blue-950/30 border border-blue-800/30 rounded-xl">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
          <p className="text-blue-300 text-xs">
            {mode === "discover" && selectedJob
              ? `Selected: ${selectedJob.title} at ${selectedJob.company} · Ready for detailed analysis`
              : "Ready to analyze — Gemini AI will generate your full personalized report"}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={() => setStep("profile")}
          className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl flex items-center gap-2 transition-all">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={handleAnalyze} disabled={!canSubmit}
          className={cn("flex-1 py-3.5 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all",
            canSubmit
              ? "bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-900/30"
              : "bg-slate-800 text-slate-500 cursor-not-allowed")}>
          <Zap className="w-4 h-4" />
          {mode === "discover" && selectedJob ? `Analyze: ${selectedJob.title}` : "Analyze with AI"}
        </button>
      </div>
    </div>
  )
}
