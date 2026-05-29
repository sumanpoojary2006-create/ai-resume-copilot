"use client"

import { useEffect, useState } from "react"

const STAGES = [
  { label: "Parsing your resume...", duration: 2000 },
  { label: "Extracting job requirements...", duration: 2000 },
  { label: "Matching skills & keywords...", duration: 3000 },
  { label: "Calculating ATS score...", duration: 2000 },
  { label: "Rewriting resume bullets...", duration: 3000 },
  { label: "Generating interview questions...", duration: 2000 },
  { label: "Building your growth plan...", duration: 2000 },
]

export function AnalyzingStep() {
  const [stageIdx, setStageIdx] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let elapsed = 0
    const total = STAGES.reduce((s, x) => s + x.duration, 0)
    let current = 0

    const advance = () => {
      if (current >= STAGES.length - 1) return
      current++
      setStageIdx(current)
    }

    let accumulated = 0
    const timers = STAGES.map((s, i) => {
      accumulated += s.duration
      return setTimeout(() => advance(), accumulated)
    })

    const tick = setInterval(() => {
      elapsed += 100
      setProgress(Math.min((elapsed / total) * 100, 95))
    }, 100)

    return () => {
      timers.forEach(clearTimeout)
      clearInterval(tick)
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8">
      {/* Animated orb */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center animate-pulse">
          <div className="w-16 h-16 rounded-full bg-slate-950/60 flex items-center justify-center">
            <span className="text-2xl">⚡</span>
          </div>
        </div>
        <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping" />
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-white">Gemini AI is analyzing your profile</h2>
        <p className="text-slate-400 text-sm">This usually takes 15–30 seconds</p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm space-y-2">
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-xs text-slate-500">{Math.round(progress)}%</p>
      </div>

      {/* Stage list */}
      <div className="w-full max-w-sm space-y-2">
        {STAGES.map((s, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 ${
              i < stageIdx
                ? "opacity-40"
                : i === stageIdx
                ? "bg-blue-950/40 border border-blue-800/40"
                : "opacity-20"
            }`}
          >
            <span className="text-sm">
              {i < stageIdx ? "✓" : i === stageIdx ? "⟳" : "○"}
            </span>
            <span className={`text-sm ${i === stageIdx ? "text-blue-300" : "text-slate-400"}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
