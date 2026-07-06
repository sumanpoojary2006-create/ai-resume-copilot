import { NextRequest, NextResponse } from "next/server"
import { generateJSON, friendlyLlmError } from "@/lib/groq"

export async function POST(req: NextRequest) {
  try {
    const { resumeText, profile } = await req.json()

    const raw = (await generateJSON(buildPrompt(profile, resumeText), { maxTokens: 2048 }))
      .replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()

    // Find JSON in the response
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ jobs: [], searchSummary: raw.slice(0, 300) })
    }

    const data = JSON.parse(jsonMatch[0])
    return NextResponse.json(data)
  } catch (err) {
    console.error("Job discovery error:", err)
    return NextResponse.json({ error: friendlyLlmError(err) }, { status: 500 })
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
