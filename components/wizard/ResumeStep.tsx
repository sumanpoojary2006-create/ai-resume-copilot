"use client"

import { useRef } from "react"
import { useAnalysisStore } from "@/store/useAnalysisStore"
import { ArrowRight, ArrowLeft, Upload, FileText, X, AlignLeft } from "lucide-react"
import { cn } from "@/lib/utils"

export function ResumeStep() {
  const { resumeText, resumeFile, profile, setResumeText, setResumeFile, setStep } = useAnalysisStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const hasContent = resumeText.trim().length > 50 || !!resumeFile

  const handleFile = (file: File) => {
    if (file.type === "application/pdf" || file.name.endsWith(".pdf") || file.name.endsWith(".txt")) {
      setResumeFile(file)
      setResumeText("")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 pb-2">
        <h2 className="text-2xl font-bold text-white">Add your resume</h2>
        <p className="text-slate-400 text-sm">
          Paste your resume text or upload a PDF — we'll use it for the analysis
        </p>
      </div>

      {/* Mode toggle cards */}
      {!resumeFile && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => { setResumeFile(null) }}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
              !resumeFile
                ? "border-blue-500 bg-blue-950/30 text-blue-300"
                : "border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600"
            )}
          >
            <AlignLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Paste Text</span>
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600 hover:text-slate-200 transition-all"
          >
            <Upload className="w-5 h-5" />
            <span className="text-sm font-medium">Upload PDF</span>
          </button>
        </div>
      )}

      {/* File uploaded state */}
      {resumeFile ? (
        <div
          className="border-2 border-emerald-500/50 bg-emerald-950/20 rounded-xl p-5 flex items-center gap-4"
        >
          <div className="w-10 h-10 bg-emerald-900/50 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">{resumeFile.name}</p>
            <p className="text-slate-500 text-xs mt-0.5">{(resumeFile.size / 1024).toFixed(1)} KB · PDF ready to analyze</p>
          </div>
          <button
            onClick={() => { setResumeFile(null) }}
            className="text-slate-500 hover:text-red-400 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <textarea
            value={resumeText}
            onChange={(e) => {
              setResumeText(e.target.value)
              e.target.style.height = "auto"
              e.target.style.height = Math.min(e.target.scrollHeight, 500) + "px"
            }}
            placeholder={`Paste your full resume here...\n\nInclude:\n• Work experience with dates\n• Education\n• Skills and tools\n• Projects and achievements`}
            rows={6}
            style={{ minHeight: "140px", maxHeight: "500px" }}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 resize-none transition-all leading-relaxed overflow-y-auto"
          />
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="border border-dashed border-slate-700 hover:border-blue-500/50 rounded-xl p-4 text-center cursor-pointer transition-all group"
          >
            <p className="text-slate-600 text-xs group-hover:text-slate-400 transition-colors">
              Or drag & drop a PDF / click to browse
            </p>
          </div>
        </>
      )}

      <input ref={fileRef} type="file" accept=".pdf,.txt" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />

      {/* Tip */}
      <div className="flex gap-2 p-3 bg-amber-950/20 border border-amber-800/30 rounded-xl">
        <span className="text-amber-400 text-xs">💡</span>
        <p className="text-amber-200/70 text-xs">
          The more detailed your resume, the better the analysis. Include bullet points with numbers and outcomes.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep("profile")}
          className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl flex items-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={() => setStep("job")}
          disabled={!hasContent}
          className={cn(
            "flex-1 py-3.5 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all",
            hasContent
              ? "bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-900/30"
              : "bg-slate-800 text-slate-500 cursor-not-allowed"
          )}
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
