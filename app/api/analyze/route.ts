import { NextRequest, NextResponse } from "next/server"
import { analyzeResume } from "@/lib/llm"
import { friendlyLlmError } from "@/lib/groq"
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
    return NextResponse.json(
      { error: friendlyLlmError(err) },
      { status: 500 }
    )
  }
}
