"use client"

import { useState } from "react"
import { AnalysisResult } from "@/lib/types"
import { ScoreGauge } from "./ScoreGauge"
import { ScoreBar } from "./ScoreBar"
import { CheckCircle, XCircle, AlertTriangle, Tag, Sparkles, Plus, Check } from "lucide-react"
import { useAnalysisStore } from "@/store/useAnalysisStore"

export function OverviewTab({ result }: { result: AnalysisResult }) {
  const { addKeywordToResume, setActiveResultTab } = useAnalysisStore()
  const [addedKeys, setAddedKeys] = useState<string[]>([])

  const handleAddKeyword = (keyword: string) => {
    addKeywordToResume(keyword)
    setAddedKeys(prev => [...prev, keyword])
  }

  const {
    scores,
    strengths,
    weaknesses,
    missingSkills,
    missingKeywords,
    recruiterConcerns,
    candidateProfile,
    jobProfile,
    customQuestionsAnswers,
  } = result

  return (
    <div className="space-y-6">
      {/* AI Onboarding Q&A */}
      {customQuestionsAnswers && customQuestionsAnswers.length > 0 && (
        <div className="bg-gradient-to-br from-blue-950/40 to-indigo-950/20 rounded-2xl p-6 border border-blue-500/20 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse shrink-0" />
            <h3 className="font-extrabold text-white text-base tracking-tight">AI Co-Pilot Custom Q&A Answers</h3>
          </div>

          <div className="space-y-4">
            {customQuestionsAnswers.map((qa, i) => (
              <div key={i} className="bg-slate-950/60 rounded-xl p-4 border border-white/[0.04] space-y-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center shrink-0 mt-0.5 text-blue-400 font-bold text-[10px]">
                    Q
                  </div>
                  <p className="text-sm font-bold text-slate-200">{qa.question}</p>
                </div>
                <div className="flex items-start gap-2.5 pt-1.5 border-t border-white/[0.03]">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400 font-bold text-[10px]">
                    A
                  </div>
                  <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {qa.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hero Score */}
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <ScoreGauge score={scores.finalScore} />
          <div className="flex-1 space-y-1">
            <h2 className="text-xl font-bold text-white">
              {candidateProfile.name} → {jobProfile.jobTitle}
            </h2>
            <p className="text-slate-400 text-sm">{jobProfile.company} • {jobProfile.seniorityLevel}</p>
            <div className="mt-4 space-y-3">
              <ScoreBar label="Skill Match" score={scores.skillMatch} weight="40%" />
              <ScoreBar label="Experience Match" score={scores.experienceMatch} weight="25%" />
              <ScoreBar label="ATS Keywords" score={scores.atsKeywordMatch} weight="15%" />
              <ScoreBar label="Domain Match" score={scores.domainMatch} weight="10%" />
              <ScoreBar label="Education Match" score={scores.educationMatch} weight="10%" />
            </div>
          </div>
        </div>
      </div>

      {/* 3 column cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Strengths */}
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-emerald-400 text-sm uppercase tracking-wide">Strengths</h3>
          </div>
          <ul className="space-y-2">
            {strengths.map((s, i) => (
              <li key={i} className="text-slate-300 text-sm flex gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="w-4 h-4 text-red-400" />
            <h3 className="font-semibold text-red-400 text-sm uppercase tracking-wide">Gaps</h3>
          </div>
          <ul className="space-y-2">
            {weaknesses.map((w, i) => (
              <li key={i} className="text-slate-300 text-sm flex gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                {w}
              </li>
            ))}
          </ul>
        </div>

        {/* Recruiter Concerns */}
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <h3 className="font-semibold text-yellow-400 text-sm uppercase tracking-wide">Recruiter Flags</h3>
          </div>
          <ul className="space-y-2">
            {recruiterConcerns.map((c, i) => (
              <li key={i} className="text-slate-300 text-sm flex gap-2">
                <span className="text-yellow-500 mt-0.5">•</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Missing Skills & Keywords */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Missing Skills */}
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
          <h3 className="font-semibold text-slate-300 text-sm uppercase tracking-wide mb-3">Missing Skills</h3>
          <div className="flex flex-wrap gap-2">
            {missingSkills.map((s, i) => {
              const added = addedKeys.includes(s)
              return (
                <button
                  key={i}
                  onClick={() => !added && handleAddKeyword(s)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border transition-all ${
                    added
                      ? "bg-emerald-900/30 text-emerald-300 border-emerald-700/40 cursor-default"
                      : "bg-red-900/30 text-red-300 border-red-800/40 hover:bg-red-800/40 hover:border-red-600/60"
                  }`}
                >
                  {added ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                  {s}
                </button>
              )
            })}
          </div>
          {missingSkills.length > 0 && (
            <p className="text-xs text-slate-600 mt-3">Click any skill to add it to your resume</p>
          )}
        </div>

        {/* Missing ATS Keywords */}
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-400" />
              <h3 className="font-semibold text-slate-300 text-sm uppercase tracking-wide">Missing ATS Keywords</h3>
            </div>
            {addedKeys.length > 0 && (
              <button
                onClick={() => setActiveResultTab("resume")}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                {addedKeys.length} added · View resume →
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {missingKeywords.map((k, i) => {
              const added = addedKeys.includes(k)
              return (
                <button
                  key={i}
                  onClick={() => !added && handleAddKeyword(k)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border transition-all ${
                    added
                      ? "bg-emerald-900/30 text-emerald-300 border-emerald-700/40 cursor-default"
                      : "bg-blue-900/30 text-blue-300 border-blue-800/40 hover:bg-blue-800/40 hover:border-blue-600/60"
                  }`}
                >
                  {added ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                  {k}
                </button>
              )
            })}
          </div>
          {missingKeywords.length > 0 && (
            <p className="text-xs text-slate-600 mt-3">Click any keyword to inject it into your resume skills</p>
          )}
        </div>
      </div>

      {/* Added keywords summary banner */}
      {addedKeys.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-900/50 rounded-lg flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-emerald-300 font-semibold text-sm">
                {addedKeys.length} keyword{addedKeys.length > 1 ? "s" : ""} added to your resume
              </p>
              <p className="text-slate-500 text-xs mt-0.5">{addedKeys.join(" · ")}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveResultTab("resume")}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-all"
          >
            View Resume →
          </button>
        </div>
      )}
    </div>
  )
}
