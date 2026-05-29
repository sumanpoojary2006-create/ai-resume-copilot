"use client"

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer"
import { ResumeSection } from "@/lib/types"

Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff" },
  ],
})

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 48,
    color: "#1a1a2e",
  },
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#0f3460",
    marginBottom: 2,
  },
  contact: {
    fontSize: 9,
    color: "#555",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0f3460",
    textTransform: "uppercase",
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#0f3460",
    borderBottomStyle: "solid",
    paddingBottom: 2,
    marginBottom: 6,
    marginTop: 12,
  },
  summary: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#333",
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#16213e",
  },
  jobMeta: {
    fontSize: 9,
    color: "#666",
    marginBottom: 3,
  },
  bullet: {
    fontSize: 9.5,
    color: "#333",
    marginBottom: 2,
    paddingLeft: 12,
  },
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 2,
  },
  skill: {
    fontSize: 9,
    backgroundColor: "#e8f4fd",
    color: "#0f3460",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  eduRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  eduDegree: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  eduMeta: {
    fontSize: 9,
    color: "#666",
  },
  projectName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 1,
  },
  projectDesc: {
    fontSize: 9.5,
    color: "#444",
    marginBottom: 2,
  },
  techTag: {
    fontSize: 8.5,
    color: "#0f3460",
  },
})

export function ResumePDF({ resume }: { resume: ResumeSection }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{resume.name}</Text>
        <Text style={styles.contact}>{resume.contact}</Text>

        <Text style={styles.sectionTitle}>Professional Summary</Text>
        <Text style={styles.summary}>{resume.summary}</Text>

        {resume.experience.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Experience</Text>
            {resume.experience.map((exp, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <Text style={styles.jobTitle}>{exp.title}</Text>
                <Text style={styles.jobMeta}>{exp.company} • {exp.duration}</Text>
                {exp.bullets.map((b, j) => (
                  <Text key={j} style={styles.bullet}>• {b}</Text>
                ))}
              </View>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skillsRow}>
          {resume.skills.map((s, i) => (
            <Text key={i} style={styles.skill}>{s}</Text>
          ))}
        </View>

        {resume.education.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Education</Text>
            {resume.education.map((edu, i) => (
              <View key={i} style={styles.eduRow}>
                <Text style={styles.eduDegree}>{edu.degree}</Text>
                <Text style={styles.eduMeta}>{edu.institution} • {edu.year}</Text>
              </View>
            ))}
          </>
        )}

        {resume.certifications.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {resume.certifications.map((c, i) => (
              <Text key={i} style={styles.bullet}>• {c}</Text>
            ))}
          </>
        )}

        {resume.projects.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Projects</Text>
            {resume.projects.map((p, i) => (
              <View key={i} style={{ marginBottom: 6 }}>
                <Text style={styles.projectName}>{p.name}</Text>
                <Text style={styles.projectDesc}>{p.description}</Text>
                <Text style={styles.techTag}>{p.technologies.join(" • ")}</Text>
              </View>
            ))}
          </>
        )}
      </Page>
    </Document>
  )
}
