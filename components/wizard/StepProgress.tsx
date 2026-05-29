"use client"

import { useAnalysisStore } from "@/store/useAnalysisStore"
import { Check } from "lucide-react"

const STEPS = [
  { id: "signup", label: "Account" },
  { id: "resume", label: "Resume" },
  { id: "profile", label: "Profile" },
  { id: "job", label: "Job" },
]

export default function StepProgress() {
  const step = useAnalysisStore((s) => s.step)
  const currentIndex = STEPS.findIndex(s => s.id === step)
  if (step === "results" || step === "analyzing") return null

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative flex justify-between items-center">
        <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-800 -z-10" />
        <div className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-violet-500 -z-10 transition-all duration-500"
          style={{ width: `${(Math.max(0, currentIndex) / (STEPS.length - 1)) * 100}%` }} />

        {STEPS.map((s, i) => {
          const done = i < currentIndex
          const active = i === currentIndex
          return (
            <div key={s.id} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${
                done ? "bg-gradient-to-br from-blue-500 to-violet-600 border-transparent text-white"
                : active ? "bg-slate-900 border-violet-500 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                : "bg-slate-900 border-slate-700 text-slate-500"}`}>
                {done ? <Check className="w-5 h-5" /> : <span className="text-sm font-semibold">{i + 1}</span>}
              </div>
              <span className={`text-xs font-medium absolute -bottom-5 whitespace-nowrap ${
                active ? "text-violet-400" : done ? "text-slate-300" : "text-slate-600"}`}>
                {s.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
