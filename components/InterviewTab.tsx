"use client"

import { useState } from "react"
import { AnalysisResult } from "@/lib/types"
import { ChevronDown, Code2, Users, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

function AccordionItem({ question, index }: { question: string; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-slate-700/50 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-slate-800/50 hover:bg-slate-700/50 transition-all"
      >
        <span className="text-sm text-slate-200 font-medium">
          <span className="text-slate-500 mr-2">Q{index + 1}.</span>
          {question}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform shrink-0 ml-2", open && "rotate-180")} />
      </button>
      {open && (
        <div className="px-4 py-3 bg-slate-900/50 border-t border-slate-700/50">
          <p className="text-slate-400 text-sm italic">
            Prepare a structured answer using the STAR method (Situation, Task, Action, Result) where applicable.
            Focus on concrete examples from your experience that demonstrate this competency.
          </p>
        </div>
      )}
    </div>
  )
}

export function InterviewTab({ result }: { result: AnalysisResult }) {
  const { interviewQuestions } = result

  return (
    <div className="space-y-6">
      {/* Technical */}
      <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-blue-900/40 rounded-lg">
            <Code2 className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="font-semibold text-slate-200">Technical Questions</h3>
        </div>
        <div className="space-y-2">
          {interviewQuestions.technical.map((q, i) => (
            <AccordionItem key={i} question={q} index={i} />
          ))}
        </div>
      </div>

      {/* Behavioral */}
      <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-violet-900/40 rounded-lg">
            <Users className="w-4 h-4 text-violet-400" />
          </div>
          <h3 className="font-semibold text-slate-200">Behavioral Questions</h3>
        </div>
        <div className="space-y-2">
          {interviewQuestions.behavioral.map((q, i) => (
            <AccordionItem key={i} question={q} index={i} />
          ))}
        </div>
      </div>

      {/* Areas to prep */}
      <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-amber-900/40 rounded-lg">
            <BookOpen className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="font-semibold text-slate-200">Key Areas to Prepare</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-2">
          {interviewQuestions.areasToPrep.map((area, i) => (
            <div key={i} className="flex gap-2 items-start p-3 bg-amber-900/10 border border-amber-800/30 rounded-lg">
              <span className="text-amber-400 text-xs font-bold mt-0.5">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-slate-300 text-sm">{area}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
