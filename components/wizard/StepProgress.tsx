"use client"

import { useAnalysisStore } from "@/store/useAnalysisStore"
import { Check } from "lucide-react"

export default function StepProgress() {
  const step = useAnalysisStore((state) => state.step)

  const steps = [
    { id: "signup", label: "Account" },
    { id: "questions", label: "Goals" },
    { id: "profile", label: "Profile" },
    { id: "resume", label: "Resume" },
    { id: "job", label: "Job" },
    { id: "analyzing", label: "Analysis" },
  ]

  const currentIndex = steps.findIndex((s) => s.id === step)

  // Hide progress on results page
  if (step === "results") return null

  return (
    <div className="w-full max-w-3xl mx-auto mb-12">
      <div className="relative">
        {/* Progress Bar Background */}
        <div className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 bg-gray-800 rounded-full overflow-hidden">
          {/* Active Progress */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-in-out"
            style={{
              width: `${(Math.max(0, currentIndex) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((s, index) => {
            const isCompleted = index < currentIndex
            const isCurrent = index === currentIndex

            return (
              <div key={s.id} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative z-10 ${
                    isCompleted
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 border-transparent text-white"
                      : isCurrent
                        ? "bg-gray-900 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                        : "bg-gray-900 border-gray-700 text-gray-500"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <span
                  className={`mt-3 text-xs font-medium absolute -bottom-6 whitespace-nowrap transition-colors duration-300 ${
                    isCurrent ? "text-purple-400" : isCompleted ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
