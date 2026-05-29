import { NextRequest, NextResponse } from "next/server"
import { analyzeResume } from "@/lib/gemini"
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse")

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const resumeText = formData.get("resumeText") as string
    const jobDescription = formData.get("jobDescription") as string
    const resumeFile = formData.get("resumeFile") as File | null

    const name = (formData.get("name") as string) || ""
    const currentRole = (formData.get("currentRole") as string) || ""
    const experience = (formData.get("experience") as string) || ""
    const location = (formData.get("location") as string) || ""
    const linkedin = (formData.get("linkedin") as string) || ""
    const skills = (formData.get("skills") as string) || ""
    const customQuestion = (formData.get("customQuestion") as string) || ""

    let selectedQuestions: string[] = []
    const selectedQuestionsRaw = formData.get("selectedQuestions") as string
    if (selectedQuestionsRaw) {
      try {
        selectedQuestions = JSON.parse(selectedQuestionsRaw)
      } catch {}
    }

    let finalResumeText = resumeText

    if (resumeFile && resumeFile.size > 0) {
      const bytes = await resumeFile.arrayBuffer()
      const buffer = Buffer.from(bytes)

      if (resumeFile.name.toLowerCase().endsWith(".pdf")) {
        const data = await pdfParse(buffer)
        finalResumeText = data.text
      } else {
        finalResumeText = buffer.toString("utf-8")
      }
    }

    if (!finalResumeText || finalResumeText.trim().length < 20) {
      return NextResponse.json({ error: "Resume text is too short or empty" }, { status: 400 })
    }

    if (!jobDescription || jobDescription.trim().length < 20) {
      return NextResponse.json({ error: "Job description is too short or empty" }, { status: 400 })
    }

    const result = await analyzeResume(
      finalResumeText.trim(),
      jobDescription.trim(),
      { name, currentRole, experience, location, linkedin, skills },
      selectedQuestions,
      customQuestion
    )
    return NextResponse.json(result)
  } catch (err) {
    console.error("Analysis error:", err)
    const raw = err instanceof Error ? err.message : "Analysis failed"
    let friendly = raw

    if (raw.includes("429") || raw.toLowerCase().includes("quota") || raw.toLowerCase().includes("too many requests")) {
      friendly = "Gemini API quota exceeded. Your free tier limit has been reached. Please wait a few minutes and try again, or get a new API key from aistudio.google.com/apikey."
    } else if (raw.includes("API_KEY") || raw.includes("api key") || raw.toLowerCase().includes("invalid key")) {
      friendly = "Invalid Gemini API key. Please check your .env.local file and make sure the key starts with 'AIza'."
    } else if (raw.includes("GEMINI_API_KEY not configured")) {
      friendly = "Gemini API key is not set. Add GEMINI_API_KEY=your_key to your .env.local file."
    } else if (raw.length > 300) {
      friendly = "Analysis failed. Please try again in a moment."
    }

    return NextResponse.json(
      { error: friendly },
      { status: 500 }
    )
  }
}
