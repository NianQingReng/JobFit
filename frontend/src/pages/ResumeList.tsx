import { useEffect, useRef, useState } from 'react'
import { Briefcase, Download, Eye, Trash2, RefreshCw, Sparkles, Wand2, Copy, CheckCircle2, X } from 'lucide-react'
import { resumeApi, userApi, jdApi } from '../api'
import type { Resume, ResumeContent, User, JD } from '../types'
import { templates } from '../components/templates'
import { downloadPDF } from '../utils/pdf'

export default function ResumeList() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [jds, setJds] = useState<JD[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [selectedJdId, setSelectedJdId] = useState<number | null>(null)
  const [previewResume, setPreviewResume] = useState<ResumeContent | null>(null)
  const [previewTitle, setPreviewTitle] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id)
  const previewRef = useRef<HTMLDivElement>(null)
  const [generating, setGenerating] = useState(false)

  // Rewrite feature state
  const [rewriteModalOpen, setRewriteModalOpen] = useState(false)
  const [rewriteInput, setRewriteInput] = useState('')
  const [rewriteKeywords, setRewriteKeywords] = useState('')
  const [rewriteVersions, setRewriteVersions] = useState<string[]>([])
  const [rewriteLoading, setRewriteLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  useEffect(() => {
    load()
    userApi.list().then(data => {
      setUsers(data)
      if (data.length > 0) setSelectedUserId(data[0].id)
    })
    jdApi.list().then(setJds)
  }, [])

  async function load() {
    const data = await resumeApi.list()
    setResumes(data)
  }

  async function handleGenerate() {
    if (!selectedUserId || !selectedJdId) return
    setGenerating(true)
    try {
      await resumeApi.generate(selectedUserId, selectedJdId)
      load()
    } finally {
      setGenerating(false)
    }
  }

  async function handleDelete(id: number) {
    await resumeApi.delete(id)
    load()
  }

  function handlePreview(resume: Resume) {
    setSelectedTemplate(templates[0].id)
    try {
      const content = JSON.parse(resume.content)
      setPreviewResume(content)
      setPreviewTitle(resume.title)
    } catch {
      setPreviewResume(null)
    }
  }

  async function handleDownload() {
    if (!previewRef.current || !previewResume) return
    const el = previewRef.current
    await downloadPDF(el, `${previewTitle || 'resume'}.pdf`)
  }

  // Rewrite handlers
  async function handleRewrite() {
    if (!rewriteInput.trim()) return
    setRewriteLoading(true)
    try {
      const keywords = rewriteKeywords.split(/[,，\s]+/).filter(Boolean)
      const result = await resumeApi.rewrite(rewriteInput, keywords)
      setRewriteVersions(result.versions)
    } finally {
      setRewriteLoading(false)
    }
  }

  function handleCopyVersion(index: number) {
    navigator.clipboard.writeText(rewriteVersions[index])
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const PreviewTemplate = templates.find(t => t.id === selectedTemplate) ?? templates[0]

  return (
    <div className="animate-fade-in-up">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-200">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">简历管理</h1>
          <p className="text-sm text-gray-500">管理所有生成的简历，多模板切换，随时导出</p>
        </div>
      </div>

      {/* Action cards row - 参考 Kickresume/Teal 的双卡片设计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {/* Generate resume card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            生成新简历
          </h2>
          <div className="space-y-3">
            <select
              value={selectedUserId ?? ''}
              onChange={e => setSelectedUserId(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="">选择用户</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name || `用户 #${u.id}`}</option>)}
            </select>
            <select
              value={selectedJdId ?? ''}
              onChange={e => setSelectedJdId(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="">选择 JD</option>
              {jds.map(jd => <option key={jd.id} value={jd.id}>{jd.title || `JD #${jd.id}`}</option>)}
            </select>
            <button
              onClick={handleGenerate}
              disabled={!selectedUserId || !selectedJdId || generating}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:from-purple-700 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-200 active:scale-[0.98]"
            >
              {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? '生成中...' : 'AI 生成简历'}
            </button>
          </div>
        </div>

        {/* Rewrite experience card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-pink-600" />
            经历重写助手
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            基于 JD 关键词，以 STAR 格式重写工作经历，提供多个优化版本供选择
          </p>
          <button
            onClick={() => setRewriteModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-pink-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:from-pink-700 hover:to-pink-600 transition-all shadow-lg shadow-pink-200 active:scale-[0.98]"
          >
            <Wand2 className="w-4 h-4" /> 开始重写经历
          </button>
        </div>
      </div>

      {/* Resume list */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">简历列表</h2>
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{resumes.length} 份</span>
        </div>
        {resumes.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {resumes.map(resume => (
              <div key={resume.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Briefcase className="w-4.5 h-4.5 text-purple-600" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-800 text-sm block">{resume.title}</span>
                    <span className="text-xs text-gray-400">{new Date(resume.updated_at).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePreview(resume)}
                    className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-3.5 py-2 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> 预览
                  </button>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm mb-1">暂无简历</p>
            <p className="text-gray-300 text-xs">选择用户和 JD 后生成第一份简历</p>
          </div>
        )}
      </div>

      {/* Preview modal - 参考 Enhancv 的实时预览设计 */}
      {previewResume && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-scale-in" onClick={() => setPreviewResume(null)}>
          <div className="bg-white rounded-2xl max-w-5xl w-full mx-4 max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Toolbar */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0 rounded-t-2xl">
              <div className="flex items-center gap-4">
                <h2 className="font-semibold text-gray-900">{previewTitle}</h2>
                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                  {templates.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                      className={`px-3.5 py-1.5 text-xs rounded-lg transition-all ${
                        selectedTemplate === t.id
                          ? 'bg-white text-gray-900 shadow-sm font-semibold'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      title={t.description}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-all active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" /> 下载 PDF
                </button>
                <button
                  onClick={() => setPreviewResume(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {/* Preview content */}
            <div className="flex-1 overflow-auto bg-gray-100 p-8 rounded-b-2xl">
              <div className="mx-auto shadow-2xl rounded-lg overflow-hidden" style={{ width: '210mm' }}>
                <div ref={previewRef}>
                  <PreviewTemplate.component data={previewResume} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rewrite modal */}
      {rewriteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-scale-in" onClick={() => setRewriteModalOpen(false)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                  <Wand2 className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">经历重写助手</h2>
                  <p className="text-xs text-gray-500">基于 JD 关键词，STAR 格式重写工作经历</p>
                </div>
              </div>
              <button onClick={() => { setRewriteModalOpen(false); setRewriteVersions([]) }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {/* Input section */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">原始经历描述</label>
                  <textarea
                    value={rewriteInput}
                    onChange={e => setRewriteInput(e.target.value)}
                    placeholder="在此粘贴你的原始工作经历描述...&#10;&#10;例如：负责公司前端项目开发，使用React编写页面"
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">JD 关键词（逗号分隔）</label>
                  <input
                    value={rewriteKeywords}
                    onChange={e => setRewriteKeywords(e.target.value)}
                    placeholder="例如：React, TypeScript, 性能优化, 团队管理"
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 transition-all"
                  />
                </div>
                <button
                  onClick={handleRewrite}
                  disabled={rewriteLoading || !rewriteInput.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-pink-500 text-white px-5 py-3 rounded-xl text-sm font-medium hover:from-pink-700 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-pink-200 active:scale-[0.98]"
                >
                  {rewriteLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  {rewriteLoading ? 'AI 重写中...' : 'AI 重写经历'}
                </button>
              </div>

              {/* Results - 参考 Enhancv 的多版本对比设计 */}
              {rewriteVersions.length > 0 && (
                <div className="space-y-4 animate-fade-in-up">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Sparkles className="w-4 h-4 text-pink-500" />
                    <span>AI 为您生成了 <strong className="text-gray-700">{rewriteVersions.length}</strong> 个优化版本：</span>
                  </div>
                  {rewriteVersions.map((version, i) => (
                    <div key={i} className="group relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100 hover:border-pink-200 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md">
                          版本 {i + 1}
                        </span>
                        <button
                          onClick={() => handleCopyVersion(i)}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-pink-600 transition-colors"
                        >
                          {copiedIndex === i ? (
                            <><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> 已复制</>
                          ) : (
                            <><Copy className="w-3.5 h-3.5" /> 复制</>
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{version}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
