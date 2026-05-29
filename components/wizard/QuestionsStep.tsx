"use client"

import { useState } from "react"
import { useAnalysisStore } from "@/store/useAnalysisStore"
import { ArrowRight, ArrowLeft, HelpCircle, Check, HelpCircle as HelpIcon, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const PREDEFINED_QUESTIONS = [
  {
    id: "atsMatch",
    title: "ATS & Keyword Match",
    description: "Am I passing automated screening filters? What crucial keywords are missing?",
    questionText: "How well does my resume match the target job description (ATS Match)? What crucial keywords are missing?",
  },
  {
    id: "skillGaps",
    title: "Detailed Skill Gap Analysis",
    description: "What technical skills, tools, or certifications am I lacking for this role?",
    questionText: "What specific technical skills, tools, or certifications should I address next to qualify for this role?",
  },
  {
    id: "resumeRewrite",
    title: "Resume Impact & Bullet Rewrite",
    description: "How can I rewrite my experience bullets to show measurable outcomes?",
    questionText: "How can I rewrite my work experience bullet points to have maximum impact and show measurable outcomes?",
  },
  {
    id: "interviewPrep",
    title: "Interview Readiness & Prep",
    description: "What are the hardest questions recruiters will ask me based on my resume?",
    questionText: "What are the hardest technical and behavioral interview questions for this role, and how should I prep?",
  },
  {
    id: "recruiterConcerns",
    title: "Recruiter Flags & Gaps",
    description: "What warning signs (employment gaps, short tenures) might a recruiter flag?",
    questionText: "What warning signs or recruiter flags might my work history raise, and how can I mitigate them?",
  },
]

export function QuestionsStep() {
  const { selectedQuestions, setSelectedQuestions, customQuestion, setCustomQuestion, setStep } = useAnalysisStore()
  const [selectedIds, setSelectedIds] = useState<string[]>(
    PREDEFINED_QUESTIONS.filter((q) => selectedQuestions.includes(q.questionText)).map((q) => q.id)
  )
  const [customText, setCustomText] = useState(customQuestion)

  const toggleQuestion = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleNext = () => {
    // Map selected IDs to actual question texts
    const mappedTexts = PREDEFINED_QUESTIONS.filter((q) => selectedIds.includes(q.id)).map(
      (q) => q.questionText
    )
    setSelectedQuestions(mappedTexts)
    setCustomQuestion(customText)
    setStep("profile")
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-white leading-snug">
          What questions should we answer?
        </h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Select the core topics you want the AI Co-Pilot to evaluate. We will answer these questions dynamically inside your final dashboard.
        </p>
      </div>

      {/* Predefined Questions Grid */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
          Select Focus Areas (Choose all that apply)
        </label>
        <div className="grid grid-cols-1 gap-3">
          {PREDEFINED_QUESTIONS.map((q) => {
            const active = selectedIds.includes(q.id)
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => toggleQuestion(q.id)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border flex gap-4 items-center justify-between transition-all duration-300",
                  active
                    ? "bg-blue-950/40 border-blue-500/80 text-blue-300 shadow-md shadow-blue-500/5"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700/80 hover:bg-slate-900/60"
                )}
              >
                <div className="flex gap-3 items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-300",
                      active
                        ? "bg-blue-600/20 border-blue-500/50 text-blue-400"
                        : "bg-slate-950 border-slate-800 text-slate-600"
                    )}
                  >
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={cn("text-sm font-bold transition-colors", active ? "text-white" : "text-slate-300")}>
                      {q.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-tight">{q.description}</p>
                  </div>
                </div>
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300",
                    active ? "bg-blue-600 border-blue-500 text-white" : "border-slate-800 bg-slate-950"
                  )}
                >
                  {active && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Custom Questions Section */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <HelpIcon className="w-3.5 h-3.5 text-slate-500" />
          Add Custom Career Question <span className="text-slate-600 font-normal lowercase">(optional)</span>
        </label>
        <textarea
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="e.g., 'I want to pivot from a frontend developer to a machine learning engineer. How does my experience map to this new target?'"
          rows={3}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 resize-none transition-all duration-200"
        />
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-slate-900/60 p-2 rounded-lg border border-slate-800/40">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Gemini AI will explicitly address this specific question in a dedicated Q&A section in your results!</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => setStep("signup")}
          className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 font-medium rounded-xl flex items-center gap-2 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-blue-900/30 hover:scale-[1.01]"
        >
          Configure Profile
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
