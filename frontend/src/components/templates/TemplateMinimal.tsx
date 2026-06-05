import type { ResumeContent } from '../../types'

export const minimalPrintStyles = `
  .template-minimal { font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; }
`

export default function TemplateMinimal({ data }: { data: ResumeContent }) {
  const p = data.personal
  return (
    <div className="template-minimal bg-white" style={{ width: '210mm', minHeight: '297mm', padding: '22mm 24mm' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 style={{ fontSize: '30pt', fontWeight: 300, color: '#111827', letterSpacing: '2pt', marginBottom: '8pt' }}>
          {p.name}
        </h1>
        <p style={{ fontSize: '11pt', color: '#6b7280', marginBottom: '4pt' }}>{p.title}</p>
        <div style={{ fontSize: '9.5pt', color: '#9ca3af', display: 'flex', gap: '12pt' }}>
          {[p.phone, p.email].filter(Boolean).map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-7">
          <p style={{ fontSize: '10pt', color: '#4b5563', lineHeight: 1.8, fontStyle: 'italic' }}>
            {data.summary}
          </p>
        </div>
      )}

      {/* Work Experience */}
      {data.work_experience.length > 0 && (
        <div className="mb-7">
          <SectionLabel text="工作经验" />
          {data.work_experience.map((exp, i) => (
            <div key={i} className="mb-5">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2pt' }}>
                <span style={{ fontWeight: 600, fontSize: '10.5pt', color: '#111827' }}>{exp.position}</span>
                <span style={{ fontSize: '9pt', color: '#9ca3af' }}>{exp.start_date} ~ {exp.end_date || '至今'}</span>
              </div>
              <p style={{ fontSize: '9.5pt', color: '#6b7280', marginBottom: '5pt', fontWeight: 500 }}>{exp.company}</p>
              <p style={{ fontSize: '9.5pt', color: '#4b5563', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{exp.description}</p>
              {exp.achievements && (
                <p style={{ fontSize: '9.5pt', color: '#374151', marginTop: '3pt', whiteSpace: 'pre-line', lineHeight: 1.7 }}>
                  {exp.achievements}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div className="mb-7">
          <SectionLabel text="项目经历" />
          {data.projects.map((proj, i) => (
            <div key={i} className="mb-5">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2pt' }}>
                <span style={{ fontWeight: 600, fontSize: '10.5pt', color: '#111827' }}>{proj.project_name}</span>
                <span style={{ fontSize: '9pt', color: '#9ca3af' }}>{proj.start_date} ~ {proj.end_date || '至今'}</span>
              </div>
              <p style={{ fontSize: '9.5pt', color: '#6b7280', marginBottom: '5pt', fontWeight: 500 }}>
                {proj.role}{proj.tech_stack ? ` · ${proj.tech_stack}` : ''}
              </p>
              <p style={{ fontSize: '9.5pt', color: '#4b5563', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{proj.description}</p>
              {proj.achievements && (
                <p style={{ fontSize: '9.5pt', color: '#374151', marginTop: '3pt', whiteSpace: 'pre-line', lineHeight: 1.7 }}>
                  {proj.achievements}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className="mb-7">
          <SectionLabel text="教育背景" />
          {data.education.map((edu, i) => (
            <div key={i} className="mb-3">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '10pt', fontWeight: 500, color: '#111827' }}>{edu.school}</span>
                <span style={{ fontSize: '9pt', color: '#9ca3af' }}>{edu.start_date} ~ {edu.end_date}</span>
              </div>
              <p style={{ fontSize: '9.5pt', color: '#6b7280' }}>{edu.major} · {edu.degree}</p>
            </div>
          ))}
        </div>
      )}

      {/* Skills + Certificates row */}
      <div style={{ display: 'flex', gap: '24pt' }}>
        {data.skills.length > 0 && (
          <div className="flex-1">
            <SectionLabel text="技能" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4pt 8pt' }}>
              {data.skills.map((s, i) => (
                <span key={i} style={{ fontSize: '9.5pt', color: '#374151' }}>
                  {s.name}{s.level ? ` · ${s.level}` : ''}
                  {i < data.skills.length - 1 ? ' ／' : ''}
                </span>
              ))}
            </div>
          </div>
        )}
        {data.certificates.length > 0 && (
          <div className="flex-1">
            <SectionLabel text="证书" />
            {data.certificates.map((c, i) => (
              <p key={i} style={{ fontSize: '9.5pt', color: '#374151', marginBottom: '2pt' }}>
                {c.name}{c.issuer ? ` — ${c.issuer}` : ''}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{
      fontSize: '8pt', fontWeight: 600, color: '#9ca3af',
      textTransform: 'uppercase', letterSpacing: '2pt',
      marginBottom: '8pt',
    }}>
      {text}
    </div>
  )
}
