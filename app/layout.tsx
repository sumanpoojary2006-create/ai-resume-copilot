import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ResumePilot AI — Get Shortlisted Every Time",
  description: "AI-powered resume optimization engine. Score your resume against any job description, get an ATS-optimized resume, and interview prep — powered by Gemini 2.0 Flash.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full antialiased`}>{children}</body>
    </html>
  )
}
