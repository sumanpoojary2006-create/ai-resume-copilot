import { create } from "zustand"
import { AnalysisResult } from "@/lib/types"

export type WizardStep = "signup" | "resume" | "profile" | "job" | "analyzing" | "results"

export interface UserProfile {
  name: string
  email: string
  password?: string
  currentRole: string
  experience: string
  location: string
  linkedin: string
  summary?: string
  education?: string
  keyAchievements?: string[]
}

interface AnalysisStore {
  step: WizardStep
  profile: UserProfile
  skills: string[]
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
  setSkills: (skills: string[]) => void
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
  name: "", email: "", password: "", currentRole: "",
  experience: "", location: "", linkedin: "", summary: "",
  education: "", keyAchievements: [],
}

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  step: "signup",
  profile: defaultProfile,
  skills: [],
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
  setSkills: (skills) => set({ skills }),
  setSelectedQuestions: (selectedQuestions) => set({ selectedQuestions }),
  setCustomQuestion: (customQuestion) => set({ customQuestion }),
  setResumeText: (resumeText) => set({ resumeText }),
  setResumeFile: (resumeFile) => set({ resumeFile }),
  setJobDescription: (jobDescription) => set({ jobDescription }),
  setResult: (result) => set({ result, error: null, step: "results" }),
  setError: (error) => set({ error, step: "job" }),
  setActiveResultTab: (activeResultTab) => set({ activeResultTab }),
  reset: () => set({
    step: "signup", profile: defaultProfile, skills: [], selectedQuestions: [],
    customQuestion: "", resumeText: "", resumeFile: null, jobDescription: "",
    result: null, error: null, activeResultTab: "overview"
  }),
}))
