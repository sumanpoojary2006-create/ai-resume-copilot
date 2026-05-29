"use client"

import { PDFDownloadLink } from "@react-pdf/renderer"
import { ResumePDF } from "./ResumePDF"
import { ResumeSection } from "@/lib/types"
import { Download } from "lucide-react"

interface DownloadPDFButtonProps {
  resume: ResumeSection
}

export default function DownloadPDFButton({ resume }: { resume: ResumeSection }) {
  return (
    <PDFDownloadLink
      document={<ResumePDF resume={resume} />}
      fileName={`${resume.name.replace(/\s+/g, "_")}_ATS_Resume.pdf`}
    >
      {({ loading }) => (
        <button
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-all disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {loading ? "Generating..." : "Download PDF"}
        </button>
      )}
    </PDFDownloadLink>
  )
}
