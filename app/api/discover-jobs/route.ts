import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(req: NextRequest) {
  try {
    const { resumeText, profile } = await req.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 })

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      // @ts-expect-error - google search tool
      tools: [{ googleSearch: {} }],
    })

    const prompt = `Based on this candidate profile, research and find the best matching job opportunities available right now in 2025.

Candidate:
- Name: ${profile.name}
- Current Role: ${profile.currentRole}
- Experience: ${profile.experience}
- Skills: ${profile.skills?.join(", ")}
- Location: ${profile.location || "Open to remote"}

Resume Summary:
${resumeText?.slice(0, 2000) || "Not provided"}

Search for real current job openings that match this profile. Return ONLY valid JSON, no markdown:
{
  "jobs": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, Country or Remote",
      "matchScore": 85,
      "whyMatch": "2 sentence explanation of why this matches",
      "keyRequirements": ["req1", "req2", "req3"],
      "salaryRange": "estimated range if known",
      "jobType": "Full-time / Remote / Hybrid",
      "applyUrl": "URL if found"
    }
  ],
  "searchSummary": "Brief paragraph about the job market for this profile"
}`

    const result = await model.generateContent(prompt)
    const raw = result.response.text().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()

    try {
      const data = JSON.parse(raw)
      return NextResponse.json(data)
    } catch {
      // If JSON parse fails, return structured fallback
      return NextResponse.json({
        jobs: [],
        searchSummary: raw.slice(0, 500),
        error: "Could not parse job results"
      })
    }
  } catch (err) {
    console.error("Job discovery error:", err)
    return NextResponse.json({ error: "Job discovery failed" }, { status: 500 })
  }
}
