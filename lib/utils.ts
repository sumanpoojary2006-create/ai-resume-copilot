import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400"
  if (score >= 60) return "text-yellow-400"
  return "text-red-400"
}

export function getScoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-400"
  if (score >= 60) return "bg-yellow-400"
  return "bg-red-400"
}

export function getScoreLabel(score: number): string {
  if (score >= 85) return "Excellent Match"
  if (score >= 70) return "Strong Match"
  if (score >= 55) return "Moderate Match"
  if (score >= 40) return "Weak Match"
  return "Poor Match"
}
