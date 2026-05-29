"use client"

import { WizardStep, UserProfile } from "@/store/useAnalysisStore"
import { FileText, BarChart2, MessageSquare, TrendingUp, CheckCircle, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const STEP_META: Record<string, { headline: string; sub: string; features: { icon: React.ElementType; label: string; desc: string }[] }> = {
  signup: {
    headline: "Land your dream job faster.",
    sub: "Our AI engine scores your resume against any JD, rewrites it for ATS, and prepares you for interviews — in under 30 seconds.",
    features: [
      { icon: BarChart2, label: "ATS Match Score", desc: "Know exactly where you stand before applying" },
      { icon: FileText, label: "Optimized Resume", desc: "AI-rewritten bullets, ordered by JD relevance" },
      { icon: MessageSquare, label: "Interview Prep", desc: "10 tailored questions for your exact role" },
      { icon: TrendingUp, label: "Growth Plan", desc: "Immediate, mid & long-term career actions" },
    ],
  },
  profile: {
    headline: "Build your profile once.",
    sub: "We save your details so you never have to re-enter them. Switch jobs, update your target role, and re-analyze in seconds.",
    features: [
      { icon: CheckCircle, label: "Saved locally", desc: "Profile stored in your browser — no account needed" },
      { icon: Sparkles, label: "Skills context", desc: "Your skills help Gemini AI score you more accurately" },
      { icon: TrendingUp, label: "Return visits", desc: "Skip setup on your next visit — jump straight to analysis" },
      { icon: BarChart2, label: "Personalized", desc: "Analysis tailored to your experience level & domain" },
    ],
  },
  resume: {
    headline: "Your raw resume, refined by AI.",
    sub: "Paste or upload your existing resume. Gemini will rewrite every bullet point to maximize your ATS score for the job you're targeting.",
    features: [
      { icon: FileText, label: "PDF or text", desc: "Supports PDF upload or plain text paste" },
      { icon: Sparkles, label: "Bullet rewrites", desc: "Action verbs, measurable outcomes, ATS keywords" },
      { icon: BarChart2, label: "Keyword injection", desc: "Missing JD keywords woven in naturally" },
      { icon: CheckCircle, label: "100% truthful", desc: "We never fabricate experience or achievements" },
    ],
  },
  job: {
    headline: "Target the right role, precisely.",
    sub: "Paste the full job posting — responsibilities, requirements, nice-to-haves. The more detail you give, the higher your ATS match score.",
    features: [
      { icon: BarChart2, label: "Skill gap analysis", desc: "See exactly what's missing vs. what you have" },
      { icon: FileText, label: "ATS keywords", desc: "Every required keyword extracted and matched" },
      { icon: MessageSquare, label: "Recruiter view", desc: "Know what concerns a recruiter might flag" },
      { icon: TrendingUp, label: "Score breakdown", desc: "5 individual scores with weighted final approval %" },
    ],
  },
}

interface WizardSidebarProps {
  step: WizardStep
  profile: UserProfile
}

export function WizardSidebar({ step, profile }: WizardSidebarProps) {
  const meta = STEP_META[step] ?? STEP_META.signup

  return (
    <aside className="hidden lg:flex w-[420px] shrink-0 flex-col bg-gradient-to-b from-slate-900 to-[#080d1a] border-r border-white/[0.06] px-10 py-10">
      {/* Greeting */}
      {profile.name && step !== "signup" && (
        <div className="mb-8 flex items-center gap-3 px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-xl">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{profile.name}</p>
            <p className="text-xs text-slate-500">{profile.currentRole} · {profile.experience}</p>
          </div>
        </div>
      )}

      {/* Headline */}
      <div className="mb-8">
        <h2 className="text-2xl font-black text-white leading-snug mb-3">
          {meta.headline}
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed">{meta.sub}</p>
      </div>

      {/* Features */}
      <div className="space-y-4">
        {meta.features.map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-950/60 border border-blue-900/40 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <Icon className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom badge */}
      <div className="mt-auto pt-10">
        <div className={cn(
          "rounded-2xl p-5 border",
          step === "signup" || step === "profile"
            ? "bg-gradient-to-br from-blue-950/40 to-violet-950/40 border-blue-900/30"
            : "bg-gradient-to-br from-emerald-950/40 to-blue-950/40 border-emerald-900/30"
        )}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
            {step === "signup" || step === "profile" ? "Free · No sign-up" : "Powered by"}
          </p>
          <p className="text-white font-bold text-lg">
            {step === "signup" || step === "profile" ? "Unlimited Analyses" : "Gemini 2.0 Flash"}
          </p>
          <p className="text-slate-500 text-xs mt-1">
            {step === "signup" || step === "profile"
              ? "1,500 analyses/day · 1M token context"
              : "State-of-the-art AI · 1M token context window"}
          </p>
        </div>
      </div>
    </aside>
  )
}
