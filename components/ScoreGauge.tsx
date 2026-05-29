"use client"

import { getScoreColor, getScoreLabel } from "@/lib/utils"

export function ScoreGauge({ score }: { score: number }) {
  const radius = 80
  const stroke = 10
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (score / 100) * circumference

  const color =
    score >= 80 ? "#34d399" : score >= 60 ? "#fbbf24" : "#f87171"

  return (
    <div className="flex flex-col items-center gap-2">
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="#1e293b"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset, transition: "stroke-dashoffset 1s ease", transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeLinecap="round"
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy=".3em"
          fontSize="22"
          fontWeight="bold"
          fill={color}
        >
          {score}%
        </text>
      </svg>
      <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
        {getScoreLabel(score)}
      </span>
    </div>
  )
}
