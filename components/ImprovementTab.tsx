"use client"

import { useState } from "react"
import { AnalysisResult } from "@/lib/types"
import { Zap, TrendingUp, Target } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { key: "immediate", label: "Immediate", icon: Zap, color: "emerald" },
  { key: "mediumTerm", label: "3–6 Months", icon: TrendingUp, color: "blue" },
  { key: "longTerm", label: "Long Term", icon: Target, color: "violet" },
] as const

const colorMap = {
  emerald: {
    active: "bg-emerald-600 text-white",
    dot: "bg-emerald-400",
    card: "bg-emerald-900/10 border-emerald-800/30",
    text: "text-emerald-300",
  },
  blue: {
    active: "bg-blue-600 text-white",
    dot: "bg-blue-400",
    card: "bg-blue-900/10 border-blue-800/30",
    text: "text-blue-300",
  },
  violet: {
    active: "bg-violet-600 text-white",
    dot: "bg-violet-400",
    card: "bg-violet-900/10 border-violet-800/30",
    text: "text-violet-300",
  },
}

export function ImprovementTab({ result }: { result: AnalysisResult }) {
  const [activeTab, setActiveTab] = useState<"immediate" | "mediumTerm" | "longTerm">("immediate")
  const { improvementPlan } = result

  const items = improvementPlan[activeTab]
  const config = colorMap[tabs.find(t => t.key === activeTab)!.color]

  return (
    <div className="space-y-5">
      {/* Tab switcher */}
      <div className="flex gap-2 bg-slate-800 rounded-xl p-1.5">
        {tabs.map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all",
              activeTab === key
                ? colorMap[color].active
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className={cn("flex gap-3 items-start p-4 rounded-xl border", config.card)}
          >
            <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", config.dot)} />
            <p className={cn("text-sm", config.text)}>{item}</p>
          </div>
        ))}
      </div>

      {/* Context note */}
      <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
        <p className="text-slate-500 text-xs">
          {activeTab === "immediate" && "These actions can be taken right now before applying. They require no new skills — just better presentation of existing experience."}
          {activeTab === "mediumTerm" && "These improvements will significantly boost your profile for this type of role over 3–6 months of consistent effort."}
          {activeTab === "longTerm" && "Strategic career moves and skill development that position you for senior roles and higher compensation bands."}
        </p>
      </div>
    </div>
  )
}
