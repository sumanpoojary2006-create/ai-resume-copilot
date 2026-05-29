import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse")

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const resumeText = formData.get("resumeText") as string
    const resumeFile = formData.get("resumeFile") as File | null

    let text = resumeText

    if (resumeFile && resumeFile.size > 0) {
      const bytes = await resumeFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      if (resumeFile.name.toLowerCase().endsWith(".pdf")) {
        const data = await pdfParse(buffer)
        text = data.text
      } else {
        text = buffer.toString("utf-8")
      }
    }

    if (!text || text.trim().length < 20) {
      return NextResponse.json({ error: "Resume too short" }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 })

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const prompt = `Extract structured information from this resume. Return ONLY valid JSON, no markdown.

{
  "name": "full name",
  "currentRole": "current or most recent job title",
  "experience": "one of: 0–1 years (Fresher), 1–3 years, 3–5 years, 5–8 years, 8–12 years, 12+ years",
  "location": "city and country if present, else empty string",
  "linkedin": "linkedin URL if present, else empty string",
  "skills": ["array", "of", "technical", "skills"],
  "summary": "2-3 sentence professional summary based on the resume",
  "education": "highest degree and institution",
  "keyAchievements": ["top 3 achievements from resume"]
}

RESUME:
${text.slice(0, 8000)}`

    const result = await model.generateContent(prompt)
    const raw = result.response.text().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    const extracted = JSON.parse(raw)

    return NextResponse.json({ ...extracted, resumeText: text })
  } catch (err) {
    console.error("Extract error:", err)
    const msg = err instanceof Error ? err.message : "Extraction failed"
    // Quota / key errors — return friendly message
    if (msg.includes("429") || msg.toLowerCase().includes("quota")) {
      return NextResponse.json({ error: "Gemini API quota exceeded. Please wait and try again." }, { status: 500 })
    }
    return NextResponse.json({ error: msg.slice(0, 200) }, { status: 500 })
  }
}
