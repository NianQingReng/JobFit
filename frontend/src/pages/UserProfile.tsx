import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Plus, Trash2, Save, User, Upload, Loader2, CheckCircle, AlertTriangle, Sparkles, Circle, CircleCheck, GraduationCap, Briefcase, Wrench, Award, Code2, ChevronDown, X, Eye, EyeOff } from 'lucide-react'
import { userApi } from '../api'
import type { User as UserType, ResumeContent } from '../types'
import { templates, getTemplate } from '../components/templates'

// --- Toast notification system ---
interface Toast { id: number; message: string; type: 'success' | 'error' | 'info' }
let toastId = 0
function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const toast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500)
  }, [])
  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])
  return { toasts, toast, dismiss }
}

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-sm animate-fade-in-up ${
            t.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : t.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
          style={{ minWidth: 200, maxWidth: 360 }}
        >
          {t.type === 'success' && <CheckCircle className="w-4 h-4 shrink-0" />}
          <span className="text-sm font-medium flex-1">{t.message}</span>
          <button onClick={() => dismiss(t.id)} className="opacity-50 hover:opacity-100 transition-opacity">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}

export default function UserProfile() {
  const [users, setUsers] = useState<UserType[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [form, setForm] = useState({
    name: '', phone: '', email: '', title: '', summary: '',
  })
  const [loading, setLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toasts, toast, dismiss } = useToast()

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    const data = await userApi.list()
    setUsers(data)
    if (data.length > 0 && !selectedId) {
      setSelectedId(data[0].id)
      const u = data[0]
      setForm({ name: u.name, phone: u.phone, email: u.email, title: u.title, summary: u.summary })
    }
  }

  async function refreshCurrentUser() {
    if (!selectedId) return
    const id = selectedId
    const u = await userApi.get(id)
    setForm({ name: u.name, phone: u.phone, email: u.email, title: u.title, summary: u.summary })
  }

  async function handleSelect(id: number) {
    setSelectedId(id)
    const u = await userApi.get(id)
    setForm({ name: u.name, phone: u.phone, email: u.email, title: u.title, summary: u.summary })
  }

  async function handleSave() {
    if (!selectedId) return
    setSaving(true)
    try {
      await userApi.update(selectedId, form)
      loadUsers()
      toast('基本信息已保存', 'success')
    } catch {
      toast('保存失败，请重试', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleCreate() {
    setLoading(true)
    try {
      const u = await userApi.create({ name: '新用户' })
      setSelectedId(u.id)
      setForm({ name: u.name, phone: u.phone, email: u.email, title: u.title, summary: u.summary })
      loadUsers()
      toast('新用户已创建', 'success')
    } catch {
      toast('创建失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!selectedId) return
    if (!confirm(`确认删除用户「${form.name || `用户 #${selectedId}`}」吗？该用户的所有数据将被永久删除。`)) return
    try {
      await userApi.delete(selectedId)
      setSelectedId(null)
      setForm({ name: '', phone: '', email: '', title: '', summary: '' })
      loadUsers()
      toast('用户已删除', 'info')
    } catch {
      toast('删除失败', 'error')
    }
  }

  function handleSubSectionChange(msg?: string) {
    loadUsers()
    setRefreshKey(k => k + 1)
    if (msg) toast(msg, 'success')
  }

  const currentUser = users.find(u => u.id === selectedId)
  const completeness = currentUser ? calcCompleteness(currentUser) : { score: 0, items: [] as CompletenessItem[], label: '' }

  const resumeContent = useMemo(() => {
    if (!currentUser) return null
    return toResumeContent(currentUser, form)
  }, [currentUser, form])

  const PreviewComponent = resumeContent ? getTemplate(selectedTemplate).component : null

  function renderPreview() {
    if (!resumeContent || !PreviewComponent) return null
    return (
      <div>
        {/* Template selector */}
        <div className="flex gap-2 mb-4">
          {templates.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplate(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedTemplate === t.id
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
        {/* A4 preview scaled to fit */}
        <div className="flex justify-center">
          <div style={{ width: 397, overflow: 'hidden' }}>
            <div style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: '210mm' }}>
              <PreviewComponent data={resumeContent} />
            </div>
          </div>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-3">
          {templates.find(t => t.id === selectedTemplate)?.description}
        </p>
      </div>
    )
  }

  return (
    <>
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      <div className="animate-fade-in-up">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-200">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">个人信息管理</h1>
              <p className="text-sm text-gray-500">维护你的个人信息，信息越完整匹配越精准</p>
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-200 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {loading ? '创建中...' : '新建用户'}
          </button>
        </div>

        {/* User tabs */}
        {users.length > 0 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {users.map(u => (
              <button
                key={u.id}
                onClick={() => handleSelect(u.id)}
                className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                  selectedId === u.id
                    ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium shadow-sm'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                {u.name || `用户 #${u.id}`}
              </button>
            ))}
          </div>
        )}

        {selectedId && currentUser ? (
          <div className="xl:grid xl:grid-cols-[1fr_440px] xl:gap-6">
            {/* Left: Form content */}
            <div className="space-y-6">
              {/* Profile completeness */}
              <CompletenessCard completeness={completeness} />

              {/* Upload resume section */}
              <UploadResumeSection userId={selectedId} onExtracted={() => {
                loadUsers()
                refreshCurrentUser()
                setRefreshKey(k => k + 1)
                toast('简历信息已提取并填充', 'success')
              }} toast={toast} />

              {/* Basic info */}
              <CollapsibleSection title="基本信息" icon={User} defaultOpen>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <FormField label="姓名" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="你的全名" />
                  <FormField label="目标职位" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="例如：高级前端工程师" />
                  <FormField label="手机" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="手机号码" />
                  <FormField label="邮箱" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="电子邮箱" />
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">个人简介</label>
                  <textarea
                    value={form.summary}
                    onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                    placeholder="简要介绍你自己，突出核心竞争力和职业目标..."
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-lg shadow-emerald-200 active:scale-[0.98] disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? '保存中...' : '保存信息'}
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 text-red-500 border border-red-200 px-4 py-2.5 rounded-xl text-sm hover:bg-red-50 transition-all"
                  >
                    <AlertTriangle className="w-4 h-4" /> 删除用户
                  </button>
                </div>
              </CollapsibleSection>

              {/* Sub sections */}
              <WorkExperienceSection userId={selectedId} refreshKey={refreshKey} onAction={msg => handleSubSectionChange(msg)} />
              <EducationSection userId={selectedId} refreshKey={refreshKey} onAction={msg => handleSubSectionChange(msg)} />
              <SkillSection userId={selectedId} refreshKey={refreshKey} onAction={msg => handleSubSectionChange(msg)} />
              <ProjectExperienceSection userId={selectedId} refreshKey={refreshKey} onAction={msg => handleSubSectionChange(msg)} />
              <CertificateSection userId={selectedId} refreshKey={refreshKey} onAction={msg => handleSubSectionChange(msg)} />
            </div>

            {/* Right: Desktop resume preview */}
            <div className="hidden xl:block">
              <div className="sticky top-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 9h18" /><path d="M9 21V9" />
                      </svg>
                      简历预览
                    </h3>
                  </div>
                  <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
                    {renderPreview()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : users.length === 0 ? (
          <EmptyState onCreate={handleCreate} loading={loading} />
        ) : null}
      </div>

      {/* Mobile: Floating preview button + overlay */}
      {selectedId && currentUser && (
        <>
          <button
            onClick={() => setPreviewOpen(true)}
            className="xl:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-full shadow-lg shadow-blue-300 flex items-center justify-center active:scale-95 transition-transform z-50"
            aria-label="预览简历"
          >
            <Eye className="w-6 h-6" />
          </button>

          {previewOpen && (
            <div className="xl:hidden fixed inset-0 z-[60] flex flex-col bg-white animate-fade-in-up">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-10">
                <h3 className="font-semibold text-gray-900">简历预览</h3>
                <button onClick={() => setPreviewOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                {renderPreview()}
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}

// --- ResumeContent conversion ---
function toResumeContent(u: UserType, form: { name: string; phone: string; email: string; title: string; summary: string }): ResumeContent {
  return {
    personal: {
      name: form.name || u.name,
      phone: form.phone || u.phone,
      email: form.email || u.email,
      title: form.title || u.title,
    },
    summary: form.summary || u.summary,
    education: (u.educations || []).map(e => ({
      school: e.school,
      degree: e.degree,
      major: e.major,
      start_date: e.start_date,
      end_date: e.end_date || '',
    })),
    work_experience: (u.work_experiences || []).map(w => ({
      company: w.company,
      position: w.position,
      start_date: w.start_date,
      end_date: w.end_date || '',
      description: w.description,
      achievements: w.achievements,
    })),
    projects: (u.project_experiences || []).map(p => ({
      project_name: p.project_name,
      role: p.role,
      start_date: p.start_date,
      end_date: p.end_date || '',
      description: p.description,
      achievements: p.achievements,
      tech_stack: p.tech_stack,
    })),
    skills: (u.skills || []).map(s => ({
      name: s.name,
      level: s.level,
    })),
    certificates: (u.certificates || []).map(c => ({
      name: c.name,
      issuer: c.issuer,
    })),
  }
}

// --- Completeness ---
interface CompletenessItem { label: string; done: boolean }

function calcCompleteness(u: UserType): { score: number; items: CompletenessItem[]; label: string } {
  const items = [
    { label: '基本资料', done: !!(u.name && u.phone && u.email) },
    { label: '目标职位', done: !!u.title },
    { label: '个人简介', done: !!u.summary },
    { label: '工作经历', done: (u.work_experiences?.length ?? 0) > 0 },
    { label: '项目经历', done: (u.project_experiences?.length ?? 0) > 0 },
    { label: '教育经历', done: (u.educations?.length ?? 0) > 0 },
    { label: '专业技能', done: (u.skills?.length ?? 0) > 0 },
    { label: '证书', done: (u.certificates?.length ?? 0) > 0 },
  ]
  const done = items.filter(i => i.done).length
  const score = Math.round((done / items.length) * 100)
  const label = score >= 80 ? '优秀' : score >= 50 ? '待完善' : '需补充'
  return { score, items, label }
}

function CompletenessCard({ completeness }: { completeness: { score: number; items: CompletenessItem[]; label: string } }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">资料完整度</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            completeness.score >= 80 ? 'bg-emerald-50 text-emerald-700' : completeness.score >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
          }`}>
            {completeness.label}
          </span>
          <span className={`text-sm font-semibold ${
            completeness.score >= 80 ? 'text-emerald-600' : completeness.score >= 50 ? 'text-amber-600' : 'text-red-600'
          }`}>
            {completeness.score}%
          </span>
        </div>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            completeness.score >= 80 ? 'bg-emerald-500' : completeness.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${completeness.score}%` }}
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {completeness.items.map(item => (
          <div key={item.label} className="flex items-center gap-2 text-xs">
            {item.done ? (
              <CircleCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-gray-300 shrink-0" />
            )}
            <span className={item.done ? 'text-gray-700' : 'text-gray-400'}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Empty state ---
function EmptyState({ onCreate, loading }: { onCreate: () => void; loading: boolean }) {
  return (
    <div className="text-center py-20 animate-fade-in-up">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center mx-auto mb-5 shadow-sm">
        <User className="w-10 h-10 text-blue-300" />
      </div>
      <h3 className="text-lg font-semibold text-gray-400 mb-2">暂无用户数据</h3>
      <p className="text-gray-300 text-sm mb-6">创建用户后即可开始管理个人信息</p>
      <button
        onClick={onCreate}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-xl text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-200 disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        {loading ? '创建中...' : '创建新用户'}
      </button>
    </div>
  )
}

// --- Collapsible section wrapper ---
function CollapsibleSection({ title, icon: Icon, defaultOpen, children }: { title: string; icon?: React.ComponentType<{ className?: string }>; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen ?? true)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          {Icon && <Icon className="w-4.5 h-4.5 text-blue-600" />}
          {title}
        </h2>
        <ChevronDown className={`w-4.5 h-4.5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 pb-6">
          {children}
        </div>
      </div>
    </div>
  )
}

// --- Form field ---
function FormField({ label, value, onChange, placeholder, autoFocus }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; autoFocus?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
      />
    </div>
  )
}

// --- Upload resume ---
function UploadResumeSection({ userId, onExtracted, toast }: { userId: number; onExtracted: () => void; toast?: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{
    name: string; phone: string; email: string; skills: string[]; summary: string;
    educations?: Array<{ school: string; major: string; degree: string; start_date: string; end_date: string }>;
    work_experiences?: Array<{ company: string; position: string; description: string }>;
    certificates?: Array<{ name: string }>;
  } | null>(null)
  const [dragOver, setDragOver] = useState(false)

  async function handleFile(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ext || !['pdf', 'docx', 'doc'].includes(ext)) {
      toast?.('仅支持 PDF 和 Word 文档格式', 'error')
      return
    }
    setUploading(true)
    setResult(null)
    try {
      const res = await userApi.uploadResume(userId, file)
      if (res.ok) {
        setResult(res.extracted)
        toast?.('简历解析成功！信息已自动填充', 'success')
        onExtracted()
      } else {
        toast?.(res.detail || '解析失败', 'error')
      }
    } catch {
      toast?.('上传失败，请重试', 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <CollapsibleSection title="导入已有简历" icon={Upload}>
      <p className="text-sm text-gray-500 mb-4">上传已有简历（PDF/Word），自动提取信息填充到下方表单，省去手动录入</p>
      <label
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${
          dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
        }`}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
      >
        {uploading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">正在解析...</span>
          </div>
        ) : result ? (
          <div className="text-center">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm text-emerald-600 font-semibold mb-2">提取成功</p>
            <div className="text-xs text-gray-500 space-y-1 text-left max-w-xs mx-auto">
              {result.name && <p>姓名：{result.name}</p>}
              {result.phone && <p>电话：{result.phone}</p>}
              {result.email && <p>邮箱：{result.email}</p>}
              {result.skills.length > 0 && <p>技能：{result.skills.slice(0, 6).join(', ')}{result.skills.length > 6 ? '...' : ''}</p>}
              {result.educations?.[0]?.school && <p>学校：{result.educations[0].school}</p>}
              {result.educations?.[0]?.major && <p>专业：{result.educations[0].major}</p>}
              {result.work_experiences && result.work_experiences.length > 0 && <p>工作经历：{result.work_experiences.length} 条</p>}
              {result.projects && result.projects.length > 0 && <p>项目经历：{result.projects.length} 条</p>}
              {result.certificates && result.certificates.length > 0 && <p>证书：{result.certificates.length} 项</p>}
            </div>
            <p className="text-[10px] text-emerald-400 mt-2">信息已自动填入下方表单</p>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">点击选择文件或拖拽简历到此处</p>
            <p className="text-xs text-gray-400 mt-1">支持 PDF、Word 格式</p>
          </div>
        )}
        <input type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} disabled={uploading} />
      </label>
    </CollapsibleSection>
  )
}

// --- FormSection (unchanged container for non-collapsible sections) ---
function FormSection({ title, icon: Icon, children }: { title: string; icon?: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
        {Icon && <Icon className="w-4.5 h-4.5 text-blue-600" />}
        {title}
      </h2>
      {children}
    </div>
  )
}

// --- Animated list wrapper for item add/remove ---
function AnimatedList({ children }: { children: React.ReactNode }) {
  return <div className="stagger-children">{children}</div>
}

// --- Work Experience ---
function WorkExperienceSection({ userId, refreshKey, onAction }: { userId: number; refreshKey?: number; onAction?: (msg: string) => void }) {
  const [items, setItems] = useState<any[]>([])
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    userApi.get(userId).then(u => setItems(u.work_experiences || []))
  }, [userId, refreshKey])

  async function add() {
    const item = await userApi.addWorkExp(userId, {
      company: '', position: '', start_date: '2020-01-01', end_date: null, description: '', achievements: '',
    })
    setItems(prev => [...prev, item])
    onAction?.('工作经历已添加')
    setTimeout(() => {
      listRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  async function remove(id: number) {
    await userApi.deleteWorkExp(id)
    setItems(prev => prev.filter(i => i.id !== id))
    onAction?.('工作经历已删除')
  }

  return (
    <CollapsibleSection title="工作经历" icon={Briefcase}>
      {items.length > 0 ? (
        <div ref={listRef} className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-all animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <FormField label="公司" value={item.company} onChange={v => setItem(item.id, 'company', v)} placeholder="公司名称" />
                <FormField label="职位" value={item.position} onChange={v => setItem(item.id, 'position', v)} placeholder="职位名称" />
              </div>
              <textarea
                placeholder="工作描述 - 描述你的主要职责和日常工作内容"
                value={item.description}
                onChange={e => setItem(item.id, 'description', e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm mb-2 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
              <textarea
                placeholder="成果/成就 - 用量化数据体现你的贡献（例如：提升效率30%，带领5人团队）"
                value={item.achievements}
                onChange={e => setItem(item.id, 'achievements', e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm mb-3 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
              <button onClick={() => remove(item.id)} className="text-red-500 text-xs flex items-center gap-1 hover:text-red-600 transition-colors">
                <Trash2 className="w-3 h-3" /> 删除该项
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptySectionHint label="暂无工作经历，点击下方按钮添加" />
      )}
      <button onClick={add} className="mt-4 text-blue-600 text-sm flex items-center gap-1.5 font-medium hover:text-blue-700 transition-colors">
        <Plus className="w-4 h-4" /> 添加工作经历
      </button>
    </CollapsibleSection>
  )

  async function setItem(id: number, field: string, value: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
    const item = items.find(i => i.id === id)
    if (item) {
      await userApi.updateWorkExp(id, { ...item, [field]: value })
    }
  }
}

// --- Education ---
function EducationSection({ userId, refreshKey, onAction }: { userId: number; refreshKey?: number; onAction?: (msg: string) => void }) {
  const [items, setItems] = useState<any[]>([])
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    userApi.get(userId).then(u => setItems(u.educations || []))
  }, [userId, refreshKey])

  async function add() {
    const item = await userApi.addEducation(userId, {
      school: '', degree: '', major: '', start_date: '2020-09-01', end_date: '2024-07-01',
    })
    setItems(prev => [...prev, item])
    onAction?.('教育经历已添加')
    setTimeout(() => {
      listRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  async function remove(id: number) {
    await userApi.deleteEducation(id)
    setItems(prev => prev.filter(i => i.id !== id))
    onAction?.('教育经历已删除')
  }

  return (
    <CollapsibleSection title="教育经历" icon={GraduationCap}>
      {items.length > 0 ? (
        <div ref={listRef} className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-all animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField label="学校" value={item.school} onChange={v => setItems(prev => prev.map(i => i.id === item.id ? { ...i, school: v } : i))} placeholder="学校名称" />
                <FormField label="学位" value={item.degree} onChange={v => setItems(prev => prev.map(i => i.id === item.id ? { ...i, degree: v } : i))} placeholder="本科/硕士/博士" />
                <FormField label="专业" value={item.major} onChange={v => setItems(prev => prev.map(i => i.id === item.id ? { ...i, major: v } : i))} placeholder="专业名称" />
                <button onClick={() => remove(item.id)} className="self-end flex items-center gap-1 text-red-500 text-xs hover:text-red-600 transition-colors mb-2">
                  <Trash2 className="w-3 h-3" /> 删除
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptySectionHint label="暂无教育经历，点击下方按钮添加" />
      )}
      <button onClick={add} className="mt-4 text-blue-600 text-sm flex items-center gap-1.5 font-medium hover:text-blue-700 transition-colors">
        <Plus className="w-4 h-4" /> 添加教育经历
      </button>
    </CollapsibleSection>
  )
}

// --- Skills ---
function SkillSection({ userId, refreshKey, onAction }: { userId: number; refreshKey?: number; onAction?: (msg: string) => void }) {
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    userApi.get(userId).then(u => setItems(u.skills || []))
  }, [userId, refreshKey])

  async function add() {
    const item = await userApi.addSkill(userId, { name: '新技能', level: '中等' })
    setItems(prev => [...prev, item])
    onAction?.('技能已添加')
  }

  async function remove(id: number) {
    await userApi.deleteSkill(id)
    setItems(prev => prev.filter(i => i.id !== id))
    onAction?.('技能已删除')
  }

  return (
    <CollapsibleSection title="专业技能" icon={Wrench}>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-4">
          {items.map(item => (
            <span key={item.id} className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3.5 py-2 rounded-full text-sm font-medium border border-blue-100 animate-scale-in">
              {item.name}
              <button onClick={() => remove(item.id)} className="text-blue-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <EmptySectionHint label="暂无技能，点击下方按钮添加" />
      )}
      <button onClick={add} className="text-blue-600 text-sm flex items-center gap-1.5 font-medium hover:text-blue-700 transition-colors">
        <Plus className="w-4 h-4" /> 添加技能
      </button>
    </CollapsibleSection>
  )
}

// --- Project Experience ---
function ProjectExperienceSection({ userId, refreshKey, onAction }: { userId: number; refreshKey?: number; onAction?: (msg: string) => void }) {
  const [items, setItems] = useState<any[]>([])
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    userApi.get(userId).then(u => setItems(u.project_experiences || []))
  }, [userId, refreshKey])

  async function add() {
    const item = await userApi.addProject(userId, {
      project_name: '新项目', role: '', start_date: '2024-01-01', end_date: null,
      description: '', achievements: '', tech_stack: '',
    })
    setItems(prev => [...prev, item])
    onAction?.('项目经历已添加')
    setTimeout(() => {
      listRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  async function remove(id: number) {
    await userApi.deleteProject(id)
    setItems(prev => prev.filter(i => i.id !== id))
    onAction?.('项目经历已删除')
  }

  return (
    <CollapsibleSection title="项目经历" icon={Code2}>
      {items.length > 0 ? (
        <div ref={listRef} className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-all animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <FormField label="项目名称" value={item.project_name} onChange={v => setItem(item.id, 'project_name', v)} placeholder="项目名称" />
                <FormField label="担任角色" value={item.role} onChange={v => setItem(item.id, 'role', v)} placeholder="例如：项目负责人 / 核心开发者" />
              </div>
              <div className="mb-3">
                <FormField label="技术栈" value={item.tech_stack} onChange={v => setItem(item.id, 'tech_stack', v)} placeholder="例如：React, TypeScript, Node.js, PostgreSQL" />
              </div>
              <textarea
                placeholder="项目描述 - 项目的背景、目标和你的主要贡献"
                value={item.description}
                onChange={e => setItem(item.id, 'description', e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm mb-2 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
              <textarea
                placeholder="项目成果 - 用量化数据体现项目成效（例如：日活增长50%，服务1000+用户）"
                value={item.achievements}
                onChange={e => setItem(item.id, 'achievements', e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm mb-3 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
              <button onClick={() => remove(item.id)} className="text-red-500 text-xs flex items-center gap-1 hover:text-red-600 transition-colors">
                <Trash2 className="w-3 h-3" /> 删除该项
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptySectionHint label="暂无项目经历，点击下方按钮添加" />
      )}
      <button onClick={add} className="mt-4 text-blue-600 text-sm flex items-center gap-1.5 font-medium hover:text-blue-700 transition-colors">
        <Plus className="w-4 h-4" /> 添加项目经历
      </button>
    </CollapsibleSection>
  )

  async function setItem(id: number, field: string, value: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
    const item = items.find(i => i.id === id)
    if (item) {
      await userApi.updateProject(id, { ...item, [field]: value })
    }
  }
}

// --- Certificate ---
function CertificateSection({ userId, refreshKey, onAction }: { userId: number; refreshKey?: number; onAction?: (msg: string) => void }) {
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    userApi.get(userId).then(u => setItems(u.certificates || []))
  }, [userId, refreshKey])

  async function add() {
    const item = await userApi.addCertificate(userId, { name: '新证书', issuer: '' })
    setItems(prev => [...prev, item])
    onAction?.('证书已添加')
  }

  async function remove(id: number) {
    await userApi.deleteCertificate(id)
    setItems(prev => prev.filter(i => i.id !== id))
    onAction?.('证书已删除')
  }

  return (
    <CollapsibleSection title="证书" icon={Award}>
      {items.length > 0 ? (
        <div className="space-y-2 mb-4">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between border border-gray-100 rounded-xl p-3.5 hover:border-gray-200 transition-all animate-scale-in">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Award className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-sm text-gray-700 font-medium">{item.name}</span>
              </div>
              <button onClick={() => remove(item.id)} className="text-red-500 text-xs hover:text-red-600 transition-colors flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> 删除
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptySectionHint label="暂无证书，点击下方按钮添加" />
      )}
      <button onClick={add} className="mt-4 text-blue-600 text-sm flex items-center gap-1.5 font-medium hover:text-blue-700 transition-colors">
        <Plus className="w-4 h-4" /> 添加证书
      </button>
    </CollapsibleSection>
  )
}

// --- Empty section hint ---
function EmptySectionHint({ label }: { label: string }) {
  return (
    <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
      {label}
    </div>
  )
}
