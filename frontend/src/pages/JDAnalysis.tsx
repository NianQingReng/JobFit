import { useEffect, useState } from 'react'
import { FileText, Send, Trash2, BarChart3, Loader2, Sparkles, CheckCircle2, XCircle, AlertCircle, Target, TrendingUp } from 'lucide-react'
import { jdApi, userApi, resumeApi } from '../api'
import type { JD, MatchResult, User } from '../types'

export default function JDAnalysis() {
  const [jds, setJds] = useState<JD[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [rawText, setRawText] = useState('')
  const [title, setTitle] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [selectedJdId, setSelectedJdId] = useState<number | null>(null)
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [matchLoading, setMatchLoading] = useState(false)
  const [expandedJd, setExpandedJd] = useState<number | null>(null)

  useEffect(() => {
    jdApi.list().then(setJds)
    userApi.list().then(data => {
      setUsers(data)
      if (data.length > 0) setSelectedUserId(data[0].id)
    })
  }, [])

  async function handleSubmit() {
    if (!rawText.trim()) return
    setLoading(true)
    try {
      const jd = await jdApi.create({ title: title || '未命名JD', company: '', raw_text: rawText })
      setJds(prev => [jd, ...prev])
      setRawText('')
      setTitle('')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: number) {
    await jdApi.delete(id)
    setJds(prev => prev.filter(j => j.id !== id))
    if (selectedJdId === id) {
      setSelectedJdId(null)
      setMatchResult(null)
    }
  }

  async function handleMatch(jdId: number) {
    if (!selectedUserId) return
    setMatchLoading(true)
    setSelectedJdId(jdId)
    try {
      const result = await jdApi.match(selectedUserId, jdId)
      setMatchResult(result)
    } finally {
      setMatchLoading(false)
    }
  }

  async function handleGenerateResume(jdId: number) {
    if (!selectedUserId) return
    await resumeApi.generate(selectedUserId, jdId)
  }

  function toggleExpand(jdId: number) {
    setExpandedJd(prev => prev === jdId ? null : jdId)
  }

  const selectedJd = jds.find(j => j.id === selectedJdId)

  return (
    <div className="animate-fade-in-up">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">JD 智能分析</h1>
          <p className="text-sm text-gray-500">粘贴职位描述，AI 自动解析并匹配你的能力</p>
        </div>
      </div>

      {/* Input form - 参考 Jobscan/Kickresume 的输入区设计 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">输入职位描述</h2>
        </div>
        <div className="mb-3">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="职位名称（例如：高级前端工程师）"
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
        </div>
        <textarea
          value={rawText}
          onChange={e => setRawText(e.target.value)}
          placeholder="在此粘贴职位描述 (JD) 文本...&#10;&#10;支持粘贴完整的岗位要求、职责描述等内容"
          className="w-full border border-gray-200 rounded-xl p-3 text-sm h-40 resize-none mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
        />
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">选择用户：</span>
            <select
              value={selectedUserId ?? ''}
              onChange={e => setSelectedUserId(Number(e.target.value))}
              className="border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {users.map(u => <option key={u.id} value={u.id}>{u.name || `用户 #${u.id}`}</option>)}
            </select>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || !rawText.trim()}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? '解析中...' : 'AI 解析 JD'}
          </button>
        </div>
      </div>

      {/* Match result - 参考 Jobscan 的匹配报告设计 */}
      {matchResult && selectedJd && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 animate-scale-in">
          {/* Score header - 参考 Jobscan 的大数字分数显示 */}
          <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-gray-700" />
                <h2 className="font-semibold text-gray-900 text-lg">匹配分析报告</h2>
              </div>
              <p className="text-sm text-gray-500">{selectedJd.title || '未命名JD'}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Score gauge */}
              <div className="text-center">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke={matchResult.score > 60 ? '#059669' : matchResult.score > 30 ? '#d97706' : '#dc2626'}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(matchResult.score / 100) * 264} 264`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl font-bold ${
                      matchResult.score > 60 ? 'text-emerald-600' : matchResult.score > 30 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {matchResult.score}%
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">匹配度</p>
              </div>
              <button
                onClick={() => handleGenerateResume(selectedJd.id)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:from-purple-700 hover:to-purple-600 transition-all shadow-lg shadow-purple-200 active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4" /> 生成简历
              </button>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-1" />
              <div className="text-2xl font-bold text-emerald-700">{matchResult.matched_items.length}</div>
              <div className="text-xs text-emerald-600 font-medium">匹配项</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <XCircle className="w-5 h-5 text-red-600 mb-1" />
              <div className="text-2xl font-bold text-red-700">{matchResult.missing_items.length}</div>
              <div className="text-xs text-red-600 font-medium">缺失项</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <AlertCircle className="w-5 h-5 text-amber-600 mb-1" />
              <div className="text-2xl font-bold text-amber-700">{matchResult.optimizable_items.length}</div>
              <div className="text-xs text-amber-600 font-medium">可优化</div>
            </div>
          </div>

          {/* Matched items - green tags like Jobscan */}
          {matchResult.matched_items.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-emerald-700 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> 已匹配项
              </h3>
              <div className="flex flex-wrap gap-2">
                {matchResult.matched_items.map((item, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-200">
                    {item.item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing items - red tags like Jobscan */}
          {matchResult.missing_items.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" /> 缺失项
              </h3>
              <div className="flex flex-wrap gap-2">
                {matchResult.missing_items.map((item, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1.5 rounded-full text-xs font-medium border border-red-200">
                    {item.item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {matchResult.suggestions && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <h3 className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> 优化建议
              </h3>
              <p className="text-sm text-blue-800 whitespace-pre-line leading-relaxed">{matchResult.suggestions}</p>
            </div>
          )}
        </div>
      )}

      {/* History list */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">历史 JD 记录</h2>
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{jds.length} 条</span>
        </div>
        {jds.map(jd => (
          <div key={jd.id} className="border-b border-gray-50 last:border-0">
            <div
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => toggleExpand(jd.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${expandedJd === jd.id ? 'bg-blue-500' : 'bg-gray-300'}`} />
                <div>
                  <span className="font-medium text-gray-800 text-sm">{jd.title || '未命名JD'}</span>
                  <span className="text-xs text-gray-400 ml-3">{new Date(jd.created_at).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={e => { e.stopPropagation(); handleMatch(jd.id) }}
                  disabled={matchLoading || !selectedUserId}
                  className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3.5 py-2 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  {matchLoading && selectedJdId === jd.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <BarChart3 className="w-3.5 h-3.5" />
                  )}
                  匹配分析
                </button>
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(jd.id) }}
                  className="text-gray-300 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {expandedJd === jd.id && (
              <div className="px-6 pb-4 animate-fade-in-up">
                <pre className="text-xs text-gray-600 bg-gray-50 rounded-xl p-4 max-h-48 overflow-auto whitespace-pre-wrap leading-relaxed">{jd.raw_text}</pre>
                {jd.parsed_requirements && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span>解析要求：{jd.parsed_requirements}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {jds.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm mb-1">暂无 JD 记录</p>
            <p className="text-gray-300 text-xs">在上方粘贴职位描述开始分析</p>
          </div>
        )}
      </div>
    </div>
  )
}
