import { useEffect, useState } from 'react'
import { Plus, Trash2, Save, User, Upload, Loader2, CheckCircle, AlertTriangle, Sparkles, Circle, CircleCheck, GraduationCap, Briefcase, Wrench, Award, Code2 } from 'lucide-react'
import { userApi } from '../api'
import type { User as UserType } from '../types'

export default function UserProfile() {
  const [users, setUsers] = useState<UserType[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [form, setForm] = useState({
    name: '', phone: '', email: '', title: '', summary: '',
  })
  const [loading, setLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)  // 上传简历后递增，触发子组件刷新

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    const data = await userApi.list()
    setUsers(data)
    if (data.length > 0 && !selectedId) {
      setSelectedId(data[0].id)
      setForm({ name: data[0].name, phone: data[0].phone, email: data[0].email, title: data[0].title, summary: data[0].summary })
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
    if (selectedId) {
      await userApi.update(selectedId, form)
      loadUsers()
    }
  }

  async function handleCreate() {
    setLoading(true)
    const u = await userApi.create({ name: '新用户' })
    setLoading(false)
    setSelectedId(u.id)
    setForm({ name: u.name, phone: u.phone, email: u.email, title: u.title, summary: u.summary })
    loadUsers()
  }

  async function handleDelete() {
    if (!selectedId) return
    if (!confirm(`确认删除用户「${form.name || `用户 #${selectedId}`}」吗？该用户的所有数据将被永久删除。`)) return
    await userApi.delete(selectedId)
    setSelectedId(null)
    setForm({ name: '', phone: '', email: '', title: '', summary: '' })
    loadUsers()
  }

  // 完整度计算 - 参考 LinkedIn/职徒简历的 profile strength 概念
  const currentUser = users.find(u => u.id === selectedId)
  const completeness = currentUser ? calcCompleteness(currentUser) : { score: 0, items: [] as CompletenessItem[], label: '' }

  return (
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
          <Plus className="w-4 h-4" /> 新建用户
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

      {selectedId && currentUser && (
        <div className="space-y-6">
          {/* Profile completeness - 参考 LinkedIn profile strength */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-gray-900">资料完整度</h2>
              </div>
              <span className={`text-sm font-semibold ${
                completeness.score >= 80 ? 'text-emerald-600' : completeness.score >= 50 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {completeness.score}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  completeness.score >= 80 ? 'bg-emerald-500' : completeness.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${completeness.score}%` }}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {completeness.items.map((item) => (
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

          {/* Upload resume section */}
          <UploadResumeSection userId={selectedId} onExtracted={() => {
            loadUsers()
            refreshCurrentUser()
            setRefreshKey(k => k + 1)  // 通知子组件刷新数据
          }} />

          {/* Basic info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <User className="w-4.5 h-4.5 text-blue-600" />
              基本信息
            </h2>
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
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-lg shadow-emerald-200 active:scale-[0.98]"
              >
                <Save className="w-4 h-4" /> 保存信息
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 text-red-500 border border-red-200 px-4 py-2.5 rounded-xl text-sm hover:bg-red-50 transition-all"
              >
                <AlertTriangle className="w-4 h-4" /> 删除用户
              </button>
            </div>
          </div>

          {/* Sub sections */}
          <WorkExperienceSection userId={selectedId} refreshKey={refreshKey} />
          <EducationSection userId={selectedId} refreshKey={refreshKey} />
          <SkillSection userId={selectedId} refreshKey={refreshKey} />
          <ProjectExperienceSection userId={selectedId} refreshKey={refreshKey} />
          <CertificateSection userId={selectedId} refreshKey={refreshKey} />
        </div>
      )}

      {users.length === 0 && (
        <div className="text-center py-20">
          <User className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">暂无用户数据</p>
          <p className="text-gray-300 text-sm mb-6">创建用户后即可开始管理个人信息</p>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-xl text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-200"
          >
            <Plus className="w-4 h-4" /> 创建新用户
          </button>
        </div>
      )}
    </div>
  )
}

// --- Completeness calculation ---
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

// --- Upload resume section ---
function UploadResumeSection({ userId, onExtracted }: { userId: number; onExtracted: () => void }) {
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
      alert('仅支持 PDF 和 Word 文档格式')
      return
    }
    setUploading(true)
    setResult(null)
    try {
      const res = await userApi.uploadResume(userId, file)
      if (res.ok) {
        setResult(res.extracted)
        onExtracted()
      } else {
        alert(res.detail || '解析失败')
      }
    } catch {
      alert('上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <Upload className="w-5 h-5 text-blue-600" />
        <h2 className="font-semibold text-gray-900">导入已有简历</h2>
      </div>
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
    </div>
  )
}

// --- Reusable components ---
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

function FormField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
      />
    </div>
  )
}

// --- Work Experience ---
function WorkExperienceSection({ userId, refreshKey }: { userId: number; refreshKey?: number }) {
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    userApi.get(userId).then(u => setItems(u.work_experiences || []))
  }, [userId, refreshKey])

  async function add() {
    const item = await userApi.addWorkExp(userId, {
      company: '', position: '', start_date: '2020-01-01', end_date: null, description: '', achievements: '',
    })
    setItems(prev => [...prev, item])
  }

  async function remove(id: number) {
    await userApi.deleteWorkExp(id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <FormSection title="工作经历" icon={Briefcase}>
      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-all">
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
        <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
          暂无工作经历，点击下方按钮添加
        </div>
      )}
      <button onClick={add} className="mt-4 text-blue-600 text-sm flex items-center gap-1.5 font-medium hover:text-blue-700 transition-colors">
        <Plus className="w-4 h-4" /> 添加工作经历
      </button>
    </FormSection>
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
function EducationSection({ userId, refreshKey }: { userId: number; refreshKey?: number }) {
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    userApi.get(userId).then(u => setItems(u.educations || []))
  }, [userId, refreshKey])

  async function add() {
    const item = await userApi.addEducation(userId, {
      school: '', degree: '', major: '', start_date: '2020-09-01', end_date: '2024-07-01',
    })
    setItems(prev => [...prev, item])
  }

  async function remove(id: number) {
    await userApi.deleteEducation(id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <FormSection title="教育经历" icon={GraduationCap}>
      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-all">
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
        <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
          暂无教育经历，点击下方按钮添加
        </div>
      )}
      <button onClick={add} className="mt-4 text-blue-600 text-sm flex items-center gap-1.5 font-medium hover:text-blue-700 transition-colors">
        <Plus className="w-4 h-4" /> 添加教育经历
      </button>
    </FormSection>
  )
}

// --- Skills ---
function SkillSection({ userId, refreshKey }: { userId: number; refreshKey?: number }) {
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    userApi.get(userId).then(u => setItems(u.skills || []))
  }, [userId, refreshKey])

  async function add() {
    const item = await userApi.addSkill(userId, { name: '新技能', level: '中等' })
    setItems(prev => [...prev, item])
  }

  async function remove(id: number) {
    await userApi.deleteSkill(id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <FormSection title="专业技能" icon={Wrench}>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-4">
          {items.map(item => (
            <span key={item.id} className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3.5 py-2 rounded-full text-sm font-medium border border-blue-100">
              {item.name}
              <button onClick={() => remove(item.id)} className="text-blue-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl mb-4">
          暂无技能，点击下方按钮添加
        </div>
      )}
      <button onClick={add} className="text-blue-600 text-sm flex items-center gap-1.5 font-medium hover:text-blue-700 transition-colors">
        <Plus className="w-4 h-4" /> 添加技能
      </button>
    </FormSection>
  )
}

// --- Certificates ---
function ProjectExperienceSection({ userId, refreshKey }: { userId: number; refreshKey?: number }) {
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    userApi.get(userId).then(u => setItems(u.project_experiences || []))
  }, [userId, refreshKey])

  async function add() {
    const item = await userApi.addProject(userId, {
      project_name: '新项目', role: '', start_date: '2024-01-01', end_date: null,
      description: '', achievements: '', tech_stack: '',
    })
    setItems(prev => [...prev, item])
  }

  async function remove(id: number) {
    await userApi.deleteProject(id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <FormSection title="项目经历" icon={Code2}>
      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-all">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <ProjectField label="项目名称" value={item.project_name} onChange={v => setItem(item.id, 'project_name', v)} placeholder="项目名称" />
                <ProjectField label="担任角色" value={item.role} onChange={v => setItem(item.id, 'role', v)} placeholder="例如：项目负责人 / 核心开发者" />
              </div>
              <div className="mb-3">
                <ProjectField label="技术栈" value={item.tech_stack} onChange={v => setItem(item.id, 'tech_stack', v)} placeholder="例如：React, TypeScript, Node.js, PostgreSQL" />
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
        <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
          暂无项目经历，点击下方按钮添加
        </div>
      )}
      <button onClick={add} className="mt-4 text-blue-600 text-sm flex items-center gap-1.5 font-medium hover:text-blue-700 transition-colors">
        <Plus className="w-4 h-4" /> 添加项目经历
      </button>
    </FormSection>
  )

  async function setItem(id: number, field: string, value: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
    const item = items.find(i => i.id === id)
    if (item) {
      await userApi.updateProject(id, { ...item, [field]: value })
    }
  }
}

function ProjectField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
      />
    </div>
  )
}

function CertificateSection({ userId, refreshKey }: { userId: number; refreshKey?: number }) {
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    userApi.get(userId).then(u => setItems(u.certificates || []))
  }, [userId, refreshKey])

  async function add() {
    const item = await userApi.addCertificate(userId, { name: '新证书', issuer: '' })
    setItems(prev => [...prev, item])
  }

  async function remove(id: number) {
    await userApi.deleteCertificate(id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <FormSection title="证书" icon={Award}>
      {items.length > 0 ? (
        <div className="space-y-2 mb-4">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between border border-gray-100 rounded-xl p-3.5 hover:border-gray-200 transition-all">
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
        <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl mb-4">
          暂无证书，点击下方按钮添加
        </div>
      )}
      <button onClick={add} className="text-blue-600 text-sm flex items-center gap-1.5 font-medium hover:text-blue-700 transition-colors">
        <Plus className="w-4 h-4" /> 添加证书
      </button>
    </FormSection>
  )
}
