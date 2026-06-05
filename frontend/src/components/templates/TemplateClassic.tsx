import type { ResumeContent } from '../../types'

export const classicPrintStyles = `
  .template-classic { font-family: 'Times New Roman', Times, serif; }
`

export default function TemplateClassic({ data }: { data: ResumeContent }) {
  const p = data.personal
  return (
    <div className="template-classic bg-white" style={{ width: '210mm', minHeight: '297mm', padding: '20mm 25mm' }}>
      {/* Header */}
      <div className="text-center mb-6">
        <h1 style={{ fontSize: '28pt', fontWeight: 700, color: '#1a1a1a', marginBottom: '4pt' }}>{p.name}</h1>
        <p style={{ fontSize: '14pt', color: '#2563eb', fontWeight: 500, marginBottom: '6pt' }}>{p.title}</p>
        <p style={{ fontSize: '10pt', color: '#6b7280' }}>
          {[p.phone, p.email].filter(Boolean).join(' | ')}
        </p>
      </div>

      <hr style={{ border: 'none', borderTop: '1.5px solid #2563eb', marginBottom: '14pt' }} />

      {/* Summary */}
      {data.summary && (
        <div className="mb-5">
          <h2 style={sectionTitle}>个人简介</h2>
          <p style={{ fontSize: '10.5pt', color: '#374151', lineHeight: 1.6 }}>{data.summary}</p>
        </div>
      )}

      {/* Work Experience */}
      {data.work_experience.length > 0 && (
        <div className="mb-5">
          <h2 style={sectionTitle}>工作经历</h2>
          {data.work_experience.map((exp, i) => (
            <div key={i} className="mb-3">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 600, fontSize: '11pt', color: '#1a1a1a' }}>{exp.company}</span>
                <span style={{ fontSize: '9.5pt', color: '#6b7280' }}>{exp.position}</span>
              </div>
              <p style={{ fontSize: '9.5pt', color: '#9ca3af', marginBottom: '4pt' }}>
                {exp.start_date} ~ {exp.end_date || '至今'}
              </p>
              <p style={{ fontSize: '10pt', color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{exp.description}</p>
              {exp.achievements && (
                <p style={{ fontSize: '10pt', color: '#4b5563', marginTop: '3pt', whiteSpace: 'pre-line' }}>
                  <span style={{ fontWeight: 500 }}>主要成果：</span>{exp.achievements}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className="mb-5">
          <h2 style={sectionTitle}>教育经历</h2>
          {data.education.map((edu, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6pt' }}>
              <div>
                <span style={{ fontSize: '10.5pt', fontWeight: 500, color: '#1a1a1a' }}>{edu.school}</span>
                <span style={{ fontSize: '10pt', color: '#6b7280', marginLeft: '6pt' }}>{edu.major}</span>
              </div>
              <span style={{ fontSize: '9.5pt', color: '#9ca3af' }}>{edu.degree} | {edu.start_date}~{edu.end_date}</span>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div className="mb-5">
          <h2 style={sectionTitle}>项目经历</h2>
          {data.projects.map((proj, i) => (
            <div key={i} className="mb-3">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 600, fontSize: '11pt', color: '#1a1a1a' }}>{proj.project_name}</span>
                <span style={{ fontSize: '9.5pt', color: '#6b7280' }}>{proj.role}</span>
              </div>
              <p style={{ fontSize: '9.5pt', color: '#9ca3af', marginBottom: '4pt' }}>
                {proj.start_date} ~ {proj.end_date || '至今'}
                {proj.tech_stack ? ` | ${proj.tech_stack}` : ''}
              </p>
              <p style={{ fontSize: '10pt', color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{proj.description}</p>
              {proj.achievements && (
                <p style={{ fontSize: '10pt', color: '#4b5563', marginTop: '3pt', whiteSpace: 'pre-line' }}>
                  <span style={{ fontWeight: 500 }}>项目成果：</span>{proj.achievements}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div className="mb-5">
          <h2 style={sectionTitle}>专业技能</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6pt' }}>
            {data.skills.map((s, i) => (
              <span key={i} style={{
                fontSize: '9.5pt', color: '#1e40af', background: '#eff6ff',
                padding: '2pt 10pt', borderRadius: '12pt'
              }}>
                {s.name}{s.level ? ` - ${s.level}` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Certificates */}
      {data.certificates.length > 0 && (
        <div>
          <h2 style={sectionTitle}>证书</h2>
          {data.certificates.map((c, i) => (
            <div key={i} style={{ fontSize: '10pt', color: '#374151', marginBottom: '4pt' }}>
              {c.name}{c.issuer ? ` — ${c.issuer}` : ''}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const sectionTitle: React.CSSProperties = {
  fontSize: '13pt',
  fontWeight: 700,
  color: '#1a1a1a',
  borderBottom: '1px solid #d1d5db',
  paddingBottom: '4pt',
  marginBottom: '10pt',
  textTransform: 'uppercase',
  letterSpacing: '0.5pt',
}
