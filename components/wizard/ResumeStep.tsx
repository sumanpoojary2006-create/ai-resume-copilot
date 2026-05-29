"use client"

import { useRef, useState } from "react"
import { useAnalysisStore } from "@/store/useAnalysisStore"
import { ArrowRight, Upload, FileText, X, AlignLeft, Sparkles, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function ResumeStep() {
  const { resumeText, resumeFile, setResumeText, setResumeFile, setStep, setProfile, setSkills } = useAnalysisStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [extracting, setExtracting] = useState(false)
  const [extracted, setExtracted] = useState(false)
  const [extractError, setExtractError] = useState("")
  const hasContent = resumeText.trim().length > 50 || !!resumeFile

  const handleFile = (file: File) => {
    if (file.type === "application/pdf" || file.name.endsWith(".pdf") || file.name.endsWith(".txt")) {
      setResumeFile(file)
      setResumeText("")
      setExtracted(false)
    }
  }

  const handleExtract = async () => {
    setExtracting(true)
    setExtractError("")
    const formData = new FormData()
    if (resumeFile) {
      formData.append("resumeFile", resumeFile)
    } else {
      formData.append("resumeText", resumeText)
    }

    try {
      const res = await fetch("/api/extract-profile", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`)

      setProfile({
        name: data.name || "",
        currentRole: data.currentRole || "",
        experience: data.experience || "",
        location: data.location || "",
        linkedin: data.linkedin || "",
        summary: data.summary || "",
        education: data.education || "",
        keyAchievements: data.keyAchievements || [],
      })
      if (data.skills?.length) setSkills(data.skills)
      if (data.resumeText) setResumeText(data.resumeText)
      setExtracted(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not extract profile"
      setExtractError(msg)
    } finally {
      setExtracting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold text-white">Upload your resume</h2>
        <p className="text-slate-400 text-sm">We'll auto-extract your profile — no manual typing needed</p>
      </div>

      {/* Upload area */}
      {!resumeFile ? (
        <div className="space-y-3">
          <div
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-blue-500/60 rounded-2xl p-10 text-center cursor-pointer transition-all group"
          >
            <Upload className="w-10 h-10 text-slate-600 group-hover:text-blue-400 mx-auto mb-3 transition-colors" />
            <p className="text-slate-300 font-semibold">Drop your resume here</p>
            <p className="text-slate-500 text-sm mt-1">PDF or TXT · click to browse</p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-900/40 px-3 text-xs text-slate-500">or paste text</span>
            </div>
          </div>

          <textarea
            value={resumeText}
            onChange={(e) => { setResumeText(e.target.value); setExtracted(false); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 400) + "px" }}
            placeholder="Paste your resume text here..."
            rows={5}
            style={{ minHeight: "120px", maxHeight: "400px" }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 resize-none transition-all"
          />
        </div>
      ) : (
        <div className="border-2 border-emerald-500/40 bg-emerald-950/20 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-900/50 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{resumeFile.name}</p>
            <p className="text-slate-500 text-xs mt-0.5">{(resumeFile.size / 1024).toFixed(1)} KB · Ready</p>
          </div>
          <button onClick={() => { setResumeFile(null); setExtracted(false) }} className="text-slate-500 hover:text-red-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <input ref={fileRef} type="file" accept=".pdf,.txt" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />

      {extractError && (
        <p className="text-xs text-red-400 text-center">{extractError}</p>
      )}

      {/* Extract button */}
      {hasContent && !extracted && (
        <button
          onClick={handleExtract}
          disabled={extracting}
          className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
        >
          {extracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {extracting ? "Extracting your profile..." : "Auto-Extract Profile with AI"}
        </button>
      )}

      {/* Extracted success */}
      {extracted && (
        <div className="flex items-center gap-3 p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl">
          <span className="text-emerald-400 text-xl">✓</span>
          <div>
            <p className="text-emerald-300 font-semibold text-sm">Profile extracted successfully!</p>
            <p className="text-slate-500 text-xs mt-0.5">Name, role, skills and achievements auto-filled. Review on the next step.</p>
          </div>
        </div>
      )}

      <button
        onClick={() => setStep("profile")}
        disabled={!hasContent}
        className={cn(
          "w-full py-4 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all",
          hasContent
            ? "bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-900/30"
            : "bg-slate-800 text-slate-500 cursor-not-allowed"
        )}
      >
        {extracted ? "Review & Edit Profile" : "Continue Without Extraction"}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}
