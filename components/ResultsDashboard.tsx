"use client"

import { useAnalysisStore } from "@/store/useAnalysisStore"
import { OverviewTab } from "./OverviewTab"
import { ResumeTab } from "./ResumeTab"
import { InterviewTab } from "./InterviewTab"
import { ImprovementTab } from "./ImprovementTab"
import { RotateCcw, BarChart2, FileText, MessageSquare, TrendingUp, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

const TABS = [
  { key: "overview", label: "Overview", icon: BarChart2 },
  { key: "resume", label: "ATS Resume", icon: FileText },
  { key: "interview", label: "Interview Prep", icon: MessageSquare },
  { key: "improvement", label: "Growth Plan", icon: TrendingUp },
]

export function ResultsDashboard() {
  const { result, activeResultTab, setActiveResultTab, reanalyze, reset } = useAnalysisStore()
  if (!result) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Analysis Complete</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {result.candidateProfile.name} → {result.jobProfile.jobTitle}
            {result.jobProfile.company ? ` at ${result.jobProfile.company}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Re-analyze: keeps profile + resume, just re-enter JD */}
          <button
            onClick={reanalyze}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-900/40 hover:bg-blue-800/50 border border-blue-700/40 text-blue-300 rounded-lg text-sm transition-all"
            title="Keep your profile & resume, just change the job description"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Apply to Another Job
          </button>
          {/* Full reset: goes back to beginning */}
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-sm transition-all"
            title="Start completely fresh"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Start Over
          </button>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 bg-slate-800/80 border border-white/5 rounded-xl p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveResultTab(key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-medium transition-all",
              activeResultTab === key
                ? "bg-slate-600/80 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeResultTab === "overview" && <OverviewTab result={result} />}
        {activeResultTab === "resume" && <ResumeTab resume={result.optimizedResume} />}
        {activeResultTab === "interview" && <InterviewTab result={result} />}
        {activeResultTab === "improvement" && <ImprovementTab result={result} />}
      </div>
    </div>
  )
}
