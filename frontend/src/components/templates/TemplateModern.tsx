import type { ResumeContent } from '../../types'

export const modernPrintStyles = `
  .template-modern { font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; }
  .template-modern .sidebar { background: #1e3a5f; }
`

export default function TemplateModern({ data }: { data: ResumeContent }) {
  const p = data.personal
  return (
    <div className="template-modern flex bg-white" style={{ width: '210mm', minHeight: '297mm' }}>
      {/* Left Sidebar */}
      <div className="sidebar" style={{
        width: '75mm', background: '#1e3a5f', color: 'white', padding: '12mm 8mm',
        display: 'flex', flexDirection: 'column', gap: '8mm'
      }}>
        {/* Name & Title */}
        <div>
          <h1 style={{ fontSize: '22pt', fontWeight: 700, marginBottom: '4pt', lineHeight: 1.2 }}>{p.name}</h1>
          <p style={{ fontSize: '10pt', color: '#93c5fd', fontWeight: 500 }}>{p.title}</p>
        </div>

        {/* Contact */}
        <div>
          <h3 style={sidebarTitle}>联系方式</h3>
          {[p.phone, p.email].filter(Boolean).map((line, i) => (
            <p key={i} style={{ fontSize: '9pt', color: '#cbd5e1', marginBottom: '2pt' }}>{line}</p>
          ))}
        </div>

        {/* Skills */}
        {data.skills.length > 0 && (
          <div>
            <h3 style={sidebarTitle}>专业技能</h3>
            {data.skills.map((s, i) => (
              <div key={i} style={{ marginBottom: '5pt' }}>
                <p style={{ fontSize: '9.5pt', color: 'white', marginBottom: '2pt' }}>
                  {s.name}{s.level ? ` — ${s.level}` : ''}
                </p>
                <div style={{ height: '4pt', background: 'rgba(255,255,255,0.2)', borderRadius: '2pt' }}>
                  <div style={{
                    width: skillLevelWidth(s.level), height: '100%',
                    background: '#60a5fa', borderRadius: '2pt'
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certificates */}
        {data.certificates.length > 0 && (
          <div>
            <h3 style={sidebarTitle}>证书</h3>
            {data.certificates.map((c, i) => (
              <p key={i} style={{ fontSize: '9pt', color: '#cbd5e1', marginBottom: '6pt' }}>
                <span style={{ color: 'white' }}>{c.name}</span>
                {c.issuer && <><br />{c.issuer}</>}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Right Content */}
      <div style={{ flex: 1, padding: '12mm 10mm' }}>
        {/* Summary */}
        {data.summary && (
          <div className="mb-6">
            <h2 style={mainSectionTitle}>个人简介</h2>
            <p style={{ fontSize: '10pt', color: '#374151', lineHeight: 1.7 }}>{data.summary}</p>
          </div>
        )}

        {/* Work Experience */}
        {data.work_experience.length > 0 && (
          <div className="mb-6">
            <h2 style={mainSectionTitle}>工作经历</h2>
            {data.work_experience.map((exp, i) => (
              <div key={i} className="mb-4">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 600, fontSize: '11pt', color: '#1e3a5f' }}>{exp.company}</span>
                  <span style={{ fontSize: '9.5pt', color: '#6b7280' }}>{exp.position}</span>
                </div>
                <p style={{ fontSize: '9pt', color: '#9ca3af', marginBottom: '3pt' }}>
                  {exp.start_date} ~ {exp.end_date || '至今'}
                </p>
                <p style={{ fontSize: '10pt', color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{exp.description}</p>
                {exp.achievements && (
                  <p style={{ fontSize: '10pt', color: '#4b5563', marginTop: '3pt', whiteSpace: 'pre-line' }}>
                    <span style={{ fontWeight: 500 }}>成果：</span>{exp.achievements}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <div className="mb-6">
            <h2 style={mainSectionTitle}>项目经历</h2>
            {data.projects.map((proj, i) => (
              <div key={i} className="mb-4">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 600, fontSize: '11pt', color: '#1e3a5f' }}>{proj.project_name}</span>
                  <span style={{ fontSize: '9.5pt', color: '#6b7280' }}>{proj.role}</span>
                </div>
                <p style={{ fontSize: '9pt', color: '#9ca3af', marginBottom: '3pt' }}>
                  {proj.start_date} ~ {proj.end_date || '至今'}
                  {proj.tech_stack ? ` | ${proj.tech_stack}` : ''}
                </p>
                <p style={{ fontSize: '10pt', color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{proj.description}</p>
                {proj.achievements && (
                  <p style={{ fontSize: '10pt', color: '#4b5563', marginTop: '3pt', whiteSpace: 'pre-line' }}>
                    <span style={{ fontWeight: 500 }}>成果：</span>{proj.achievements}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div>
            <h2 style={mainSectionTitle}>教育经历</h2>
            {data.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: '6pt' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <span style={{ fontSize: '10.5pt', fontWeight: 600, color: '#1e3a5f' }}>{edu.school}</span>
                    <span style={{ fontSize: '10pt', color: '#6b7280', marginLeft: '6pt' }}>{edu.major}</span>
                  </div>
                  <span style={{ fontSize: '9pt', color: '#9ca3af' }}>{edu.degree}</span>
                </div>
                <p style={{ fontSize: '9pt', color: '#9ca3af', marginTop: '1pt' }}>{edu.start_date} ~ {edu.end_date}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function skillLevelWidth(level?: string): string {
  switch (level?.toLowerCase()) {
    case '精通': case 'advanced': case 'expert': return '90%'
    case '熟练': case 'intermediate': case ' proficient': return '65%'
    case '中等': case 'medium': return '45%'
    case '了解': case 'beginner': return '25%'
    default: return '50%'
  }
}

const sidebarTitle: React.CSSProperties = {
  fontSize: '10pt', fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: '1pt',
  borderBottom: '1px solid rgba(255,255,255,0.3)',
  paddingBottom: '3pt', marginBottom: '5pt',
}

const mainSectionTitle: React.CSSProperties = {
  fontSize: '12pt', fontWeight: 700, color: '#1e3a5f',
  borderBottom: '2px solid #1e3a5f',
  paddingBottom: '3pt', marginBottom: '8pt',
}
