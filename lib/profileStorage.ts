import { UserProfile } from "@/store/useAnalysisStore"

const KEY = "rp_profile"

export function saveProfile(profile: UserProfile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile))
  } catch {}
}

export function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearProfile() {
  try {
    localStorage.removeItem(KEY)
    localStorage.removeItem("rp_skills")
    localStorage.removeItem("rp_resume")
    sessionStorage.removeItem("rp_skills")
  } catch {}
}

export function saveResumeText(text: string) {
  try {
    localStorage.setItem("rp_resume", text)
  } catch {}
}

export function loadResumeText(): string {
  try {
    return localStorage.getItem("rp_resume") ?? ""
  } catch {
    return ""
  }
}

export function saveSkills(skills: string[]) {
  try {
    localStorage.setItem("rp_skills", JSON.stringify(skills))
  } catch {}
}

export function loadSkills(): string[] {
  try {
    const raw = localStorage.getItem("rp_skills")
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
