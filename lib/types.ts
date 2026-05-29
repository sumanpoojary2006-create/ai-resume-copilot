export interface CandidateProfile {
  name: string
  currentRole: string
  totalExperience: string
  education: string[]
  technicalSkills: string[]
  tools: string[]
  certifications: string[]
  projects: string[]
  domainExpertise: string[]
  leadershipExperience: string[]
  achievements: string[]
  industries: string[]
}

export interface JobProfile {
  company: string
  jobTitle: string
  requiredSkills: string[]
  preferredSkills: string[]
  responsibilities: string[]
  experienceRequired: string
  educationRequired: string
  atsKeywords: string[]
  domain: string
  seniorityLevel: string
}

export interface ScoreBreakdown {
  skillMatch: number
  experienceMatch: number
  domainMatch: number
  educationMatch: number
  atsKeywordMatch: number
  finalScore: number
}

export interface ResumeSection {
  name: string
  contact: string
  summary: string
  experience: ExperienceItem[]
  skills: string[]
  education: EducationItem[]
  certifications: string[]
  projects: ProjectItem[]
}

export interface ExperienceItem {
  title: string
  company: string
  duration: string
  bullets: string[]
}

export interface EducationItem {
  degree: string
  institution: string
  year: string
}

export interface ProjectItem {
  name: string
  description: string
  technologies: string[]
}

export interface QuestionAnswer {
  question: string
  answer: string
}

export interface AnalysisResult {
  candidateProfile: CandidateProfile
  jobProfile: JobProfile
  scores: ScoreBreakdown
  strengths: string[]
  weaknesses: string[]
  missingSkills: string[]
  missingKeywords: string[]
  recruiterConcerns: string[]
  optimizedResume: ResumeSection
  interviewQuestions: {
    technical: string[]
    behavioral: string[]
    areasToPrep: string[]
  }
  improvementPlan: {
    immediate: string[]
    mediumTerm: string[]
    longTerm: string[]
  }
  customQuestionsAnswers?: QuestionAnswer[]
}
