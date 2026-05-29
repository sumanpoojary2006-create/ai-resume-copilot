import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(req: NextRequest) {
  try {
    const { resumeText, profile } = await req.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 })

    const genAI = new GoogleGenerativeAI(apiKey)

    // Try with Google Search grounding first, fall back to plain Gemini
    let result
    try {
      const modelWithSearch = genAI.getGenerativeModel({
        model: "gemini-3.5-flash",
        // @ts-expect-error - google search tool
        tools: [{ googleSearch: {} }],
      })
      result = await modelWithSearch.generateContent(buildPrompt(profile, resumeText))
    } catch {
      // Fall back to plain model without search grounding
      const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" })
      result = await model.generateContent(buildPrompt(profile, resumeText))
    }

    const raw = result.response.text().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()

    // Find JSON in the response
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ jobs: [], searchSummary: raw.slice(0, 300) })
    }

    const data = JSON.parse(jsonMatch[0])
    return NextResponse.json(data)
  } catch (err) {
    console.error("Job discovery error:", err)
    const msg = err instanceof Error ? err.message : "Job discovery failed"
    if (msg.includes("429") || msg.toLowerCase().includes("quota")) {
      return NextResponse.json({ error: "Gemini API quota exceeded. Please wait and try again." }, { status: 500 })
    }
    return NextResponse.json({ error: msg.slice(0, 200) }, { status: 500 })
  }
}

function buildPrompt(profile: { name: string; currentRole: string; experience: string; skills?: string[]; location?: string }, resumeText: string) {
  return `You are a job market expert. Based on this candidate profile, suggest the 5 best matching job roles available in the current market (2025).

Candidate:
- Current Role: ${profile.currentRole}
- Experience: ${profile.experience}
- Skills: ${profile.skills?.join(", ") || "Not specified"}
- Location: ${profile.location || "Open to remote"}

Resume Summary:
${resumeText?.slice(0, 1500) || "Not provided"}

Return ONLY this JSON structure, no markdown:
{
  "jobs": [
    {
      "title": "Job Title",
      "company": "Company Name (real company hiring for this type of role)",
      "location": "City, Country or Remote",
      "matchScore": 85,
      "whyMatch": "2 sentence explanation of why this matches the candidate",
      "keyRequirements": ["requirement 1", "requirement 2", "requirement 3"],
      "salaryRange": "e.g. $80,000 - $120,000/year",
      "jobType": "Full-time / Remote / Hybrid",
      "applyUrl": "https://linkedin.com/jobs or https://careers.company.com"
    }
  ],
  "searchSummary": "2-3 sentences about the job market outlook for this candidate"
}`
}
