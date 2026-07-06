// Groq (OpenAI-compatible) LLM client. Free tier, fast Llama inference.
// Swapped in to replace Google Gemini — see routes under app/api/*.
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

export const GROQ_MODEL = "llama-3.3-70b-versatile"

interface GenerateOptions {
  system?: string
  maxTokens?: number
  temperature?: number
}

/**
 * Run a JSON-mode chat completion and return the raw JSON string content.
 * Groq's JSON mode requires the word "json" to appear in the prompt/messages,
 * which every caller's prompt already satisfies.
 */
export async function generateJSON(prompt: string, opts: GenerateOptions = {}): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error("GROQ_API_KEY not configured")

  const messages: { role: "system" | "user"; content: string }[] = []
  if (opts.system) messages.push({ role: "system", content: opts.system })
  messages.push({ role: "user", content: prompt })

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: GROQ_MODEL,
      response_format: { type: "json_object" },
      temperature: opts.temperature ?? 0.4,
      max_tokens: opts.maxTokens ?? 4096,
      messages,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    // Surface Groq's status + message so route handlers can map it to a
    // friendly error (401 = bad key, 429 = rate limit, etc.)
    throw new Error(`Groq ${res.status}: ${body.slice(0, 300)}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error("Groq returned an empty response")
  return content as string
}

/** Map an LLM error to a short, user-facing message. */
export function friendlyLlmError(err: unknown): string {
  const raw = err instanceof Error ? err.message : "Something went wrong"
  const low = raw.toLowerCase()
  if (raw.includes("GROQ_API_KEY not configured")) {
    return "Groq API key is not set. Add GROQ_API_KEY to your .env.local file."
  }
  if (raw.includes("401") || low.includes("invalid api key") || low.includes("invalid_api_key")) {
    return "Invalid Groq API key. Check GROQ_API_KEY in .env.local (get one free at console.groq.com/keys)."
  }
  if (raw.includes("429") || low.includes("rate limit") || low.includes("rate_limit")) {
    return "Groq rate limit reached. Please wait a minute and try again."
  }
  return raw.length > 200 ? raw.slice(0, 200) + "…" : raw
}
