import { create } from "zustand"
import { AnalysisResult } from "@/lib/types"

export type WizardStep = "signup" | "questions" | "profile" | "resume" | "job" | "analyzing" | "results"

export interface UserProfile {
  name: string
  email: string
  password?: string
  currentRole: string
  experience: string
  location: string
  linkedin: string
}

interface AnalysisStore {
  step: WizardStep
  profile: UserProfile
  selectedQuestions: string[]
  customQuestion: string
  resumeText: string
  resumeFile: File | null
  jobDescription: string
  result: AnalysisResult | null
  error: string | null
  activeResultTab: string

  setStep: (step: WizardStep) => void
  setProfile: (profile: Partial<UserProfile>) => void
  setSelectedQuestions: (questions: string[]) => void
  setCustomQuestion: (question: string) => void
  setResumeText: (text: string) => void
  setResumeFile: (file: File | null) => void
  setJobDescription: (jd: string) => void
  setResult: (result: AnalysisResult) => void
  setError: (error: string | null) => void
  setActiveResultTab: (tab: string) => void
  reset: () => void
}

const defaultProfile: UserProfile = {
  name: "",
  email: "",
  password: "",
  currentRole: "",
  experience: "",
  location: "",
  linkedin: "",
}

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  step: "signup",
  profile: defaultProfile,
  selectedQuestions: [],
  customQuestion: "",
  resumeText: "",
  resumeFile: null,
  jobDescription: "",
  result: null,
  error: null,
  activeResultTab: "overview",

  setStep: (step) => set({ step }),
  setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
  setSelectedQuestions: (selectedQuestions) => set({ selectedQuestions }),
  setCustomQuestion: (customQuestion) => set({ customQuestion }),
  setResumeText: (resumeText) => set({ resumeText }),
  setResumeFile: (resumeFile) => set({ resumeFile }),
  setJobDescription: (jobDescription) => set({ jobDescription }),
  setResult: (result) => set({ result, error: null, step: "results" }),
  setError: (error) => set({ error, step: "job" }),
  setActiveResultTab: (activeResultTab) => set({ activeResultTab }),
  reset: () => set({
    step: "signup",
    profile: defaultProfile,
    selectedQuestions: [],
    customQuestion: "",
    resumeText: "",
    resumeFile: null,
    jobDescription: "",
    result: null,
    error: null,
    activeResultTab: "overview"
  }),
}))
