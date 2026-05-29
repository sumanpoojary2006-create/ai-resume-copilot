import { GoogleGenerativeAI } from "@google/generative-ai"
import { AnalysisResult } from "./types"

const SYSTEM_PROMPT = `You are an expert AI Career Optimization Engine. Analyze the candidate resume and job description provided, then return a comprehensive analysis as valid JSON.

Your response must be ONLY valid JSON matching this exact structure (no markdown, no explanation):
{
  "candidateProfile": {
    "name": "string",
    "currentRole": "string",
    "totalExperience": "string",
    "education": ["string"],
    "technicalSkills": ["string"],
    "tools": ["string"],
    "certifications": ["string"],
    "projects": ["string"],
    "domainExpertise": ["string"],
    "leadershipExperience": ["string"],
    "achievements": ["string"],
    "industries": ["string"]
  },
  "jobProfile": {
    "company": "string",
    "jobTitle": "string",
    "requiredSkills": ["string"],
    "preferredSkills": ["string"],
    "responsibilities": ["string"],
    "experienceRequired": "string",
    "educationRequired": "string",
    "atsKeywords": ["string"],
    "domain": "string",
    "seniorityLevel": "string"
  },
  "scores": {
    "skillMatch": 0-100,
    "experienceMatch": 0-100,
    "domainMatch": 0-100,
    "educationMatch": 0-100,
    "atsKeywordMatch": 0-100,
    "finalScore": 0-100
  },
  "strengths": ["string"],
  "weaknesses": ["string"],
  "missingSkills": ["string"],
  "missingKeywords": ["string"],
  "recruiterConcerns": ["string"],
  "optimizedResume": {
    "name": "string",
    "contact": "string",
    "summary": "2-3 sentence ATS-optimized professional summary",
    "experience": [
      {
        "title": "string",
        "company": "string",
        "duration": "string",
        "bullets": ["string - use action verbs and measurable outcomes"]
      }
    ],
    "skills": ["string - ordered by JD relevance"],
    "education": [
      {
        "degree": "string",
        "institution": "string",
        "year": "string"
      }
    ],
    "certifications": ["string"],
    "projects": [
      {
        "name": "string",
        "description": "string",
        "technologies": ["string"]
      }
    ]
  },
  "interviewQuestions": {
    "technical": ["string"],
    "behavioral": ["string"],
    "areasToPrep": ["string"]
  },
  "improvementPlan": {
    "immediate": ["string"],
    "mediumTerm": ["string"],
    "longTerm": ["string"]
  },
  "customQuestionsAnswers": [
    {
      "question": "string - the question text",
      "answer": "string - a detailed answer tailored to the candidate resume and target job"
    }
  ]
}

Rules:
- Final Score = (skillMatch * 0.40) + (experienceMatch * 0.25) + (atsKeywordMatch * 0.15) + (domainMatch * 0.10) + (educationMatch * 0.10)
- Do NOT fabricate skills, achievements, or experience not present in the resume
- Rewrite bullet points to be more impactful using STAR format where possible
- Include measurable outcomes if they exist in the original
- Order skills by relevance to the JD
- ATS keywords should naturally appear in the resume text
- Generate exactly 5 technical and 5 behavioral interview questions`

export async function analyzeResume(
  resumeText: string,
  jobDescription: string,
  profileContext: {
    name: string
    currentRole: string
    experience: string
    location: string
    linkedin: string
    skills: string
  },
  selectedQuestions: string[],
  customQuestion: string
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured")

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

  const onboardingQuestionsPrompt = [
    ...selectedQuestions,
    ...(customQuestion ? [customQuestion] : [])
  ]

  const prompt = `${SYSTEM_PROMPT}

---CANDIDATE INFORMATION---
Name: ${profileContext.name}
Current Role/Target Role: ${profileContext.currentRole}
Experience Level: ${profileContext.experience}
Location: ${profileContext.location}
LinkedIn: ${profileContext.linkedin}
Key Skills Provided: ${profileContext.skills}

---RESUME TEXT---
${resumeText}

---JOB DESCRIPTION---
${jobDescription}

---ONBOARDING QUESTIONS TO ANSWER DIRECTLY---
The user has specifically asked to get these questions answered in the analysis.
Please provide thorough, actionable, highly tailored advice for each:
${onboardingQuestionsPrompt.map((q, idx) => `Question ${idx + 1}: ${q}`).join("\n")}

You MUST populate the "customQuestionsAnswers" array with an entry for each of these questions.`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()

  try {
    return JSON.parse(cleaned) as AnalysisResult
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0]) as AnalysisResult
    throw new Error("Failed to parse Gemini response as JSON")
  }
}
