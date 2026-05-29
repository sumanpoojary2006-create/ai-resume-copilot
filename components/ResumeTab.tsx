"use client"

import { useState } from "react"
import { ResumeSection } from "@/lib/types"
import { Copy, Check, X } from "lucide-react"
import dynamic from "next/dynamic"
import { useAnalysisStore } from "@/store/useAnalysisStore"

const DownloadPDFButton = dynamic(
  () => import("./DownloadPDFButton"),
  { ssr: false }
)

export function ResumeTab({ resume }: { resume: ResumeSection }) {
  const [copied, setCopied] = useState(false)
  const { result, removeKeywordFromResume } = useAnalysisStore()

  // Track which skills were originally there vs user-added
  // We compare against what Gemini originally generated (before user additions)
  // A skill is "user added" if it appears in skills but was in missingKeywords
  const originalMissingKeywords = result
    ? [...(result.missingKeywords || []), ...resume.skills.filter(s =>
        result.missingKeywords?.includes(s)
      )]
    : []
  const userAddedSkills = resume.skills.filter(s =>
    result?.optimizedResume?.skills?.includes(s) && originalMissingKeywords.includes(s)
  )

  const resumeText = `${resume.name}
${resume.contact}

PROFESSIONAL SUMMARY
${resume.summary}

EXPERIENCE
${resume.experience.map(e => `${e.title} | ${e.company} | ${e.duration}\n${e.bullets.map(b => `• ${b}`).join("\n")}`).join("\n\n")}

SKILLS
${resume.skills.join(" • ")}

EDUCATION
${resume.education.map(e => `${e.degree} | ${e.institution} | ${e.year}`).join("\n")}

${resume.certifications.length ? `CERTIFICATIONS\n${resume.certifications.map(c => `• ${c}`).join("\n")}` : ""}

${resume.projects.length ? `PROJECTS\n${resume.projects.map(p => `${p.name}: ${p.description}\nTech: ${p.technologies.join(", ")}`).join("\n\n")}` : ""}
`.trim()

  const handleCopy = () => {
    navigator.clipboard.writeText(resumeText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-all"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy Text"}
        </button>
        <DownloadPDFButton resume={resume} />
      </div>

      {/* Resume Preview */}
      <div className="bg-white text-slate-900 rounded-2xl p-8 shadow-xl">
        {/* Header */}
        <div className="border-b-2 border-slate-800 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-slate-800">{resume.name}</h1>
          <p className="text-slate-500 text-sm mt-1">{resume.contact}</p>
        </div>

        {/* Summary */}
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-700 border-b border-blue-200 pb-1 mb-2">
            Professional Summary
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">{resume.summary}</p>
        </section>

        {/* Experience */}
        {resume.experience.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-700 border-b border-blue-200 pb-1 mb-3">
              Experience
            </h2>
            <div className="space-y-4">
              {resume.experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{exp.title}</h3>
                      <p className="text-slate-500 text-xs">{exp.company}</p>
                    </div>
                    <span className="text-slate-400 text-xs whitespace-nowrap">{exp.duration}</span>
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {exp.bullets.map((b, j) => (
                      <li key={j} className="text-sm text-slate-700 flex gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        <section className="mb-5">
          <div className="flex items-center justify-between border-b border-blue-200 pb-1 mb-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-700">Skills</h2>
            {userAddedSkills.length > 0 && (
              <span className="text-[10px] text-emerald-600 font-medium">
                ✓ {userAddedSkills.length} ATS keyword{userAddedSkills.length > 1 ? "s" : ""} added
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {resume.skills.map((s, i) => {
              const isAdded = userAddedSkills.includes(s)
              return isAdded ? (
                <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs border border-emerald-200 font-medium">
                  ✦ {s}
                  <button
                    onClick={() => removeKeywordFromResume(s)}
                    className="text-emerald-400 hover:text-red-500 transition-colors ml-0.5"
                    title="Remove from resume"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ) : (
                <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs border border-blue-100">
                  {s}
                </span>
              )
            })}
          </div>
        </section>

        {/* Education */}
        {resume.education.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-700 border-b border-blue-200 pb-1 mb-2">
              Education
            </h2>
            {resume.education.map((edu, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="font-semibold text-slate-800">{edu.degree}</span>
                <span className="text-slate-500 text-xs">{edu.institution} • {edu.year}</span>
              </div>
            ))}
          </section>
        )}

        {/* Certifications */}
        {resume.certifications.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-700 border-b border-blue-200 pb-1 mb-2">
              Certifications
            </h2>
            <ul className="space-y-1">
              {resume.certifications.map((c, i) => (
                <li key={i} className="text-sm text-slate-700 flex gap-2">
                  <span className="text-blue-500">•</span>{c}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Projects */}
        {resume.projects.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-700 border-b border-blue-200 pb-1 mb-3">
              Projects
            </h2>
            <div className="space-y-3">
              {resume.projects.map((p, i) => (
                <div key={i}>
                  <h3 className="font-bold text-slate-800 text-sm">{p.name}</h3>
                  <p className="text-sm text-slate-600 mt-0.5">{p.description}</p>
                  <p className="text-xs text-blue-600 mt-1">{p.technologies.join(" • ")}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
