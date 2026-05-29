"use client"

import { getScoreBg, getScoreColor } from "@/lib/utils"

interface ScoreBarProps {
  label: string
  score: number
  weight: string
}

export function ScoreBar({ label, score, weight }: ScoreBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-xs">{weight}</span>
          <span className={`font-bold ${getScoreColor(score)}`}>{score}</span>
        </div>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${getScoreBg(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}
