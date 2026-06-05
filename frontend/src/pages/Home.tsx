import { Link } from 'react-router-dom'
import { ArrowRight, FileText, User, BarChart3, Briefcase, Pencil, Layers, Sparkles, Target, Shield, Zap } from 'lucide-react'

const features = [
  {
    to: '/profile',
    icon: User,
    title: '用户信息管理',
    desc: '结构化存储个人教育、工作经历、技能和证书信息，支持简历导入自动填充',
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    to: '/jd-analysis',
    icon: FileText,
    title: 'JD 智能解析',
    desc: '粘贴职位描述文本，AI 自动提取硬性要求、技能关键词和职责描述',
    color: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    to: '/jd-analysis',
    icon: BarChart3,
    title: '匹配度分析',
    desc: '量化对比你的能力与岗位要求，展示匹配项、缺失项和优化建议',
    color: 'from-violet-500 to-violet-600',
    bg: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
  {
    to: '/resumes',
    icon: Briefcase,
    title: '简历生成',
    desc: '根据匹配结果自动生成定制化简历，多模板可选，ATS 兼容优化',
    color: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
  {
    to: '/resumes',
    icon: Pencil,
    title: '经历重写助手',
    desc: '基于 JD 关键词，以 STAR 格式重写工作经历，提供多种优化版本',
    color: 'from-pink-500 to-pink-600',
    bg: 'bg-pink-50',
    iconColor: 'text-pink-600',
  },
  {
    to: '/resumes',
    icon: Layers,
    title: '多版本管理',
    desc: '针对不同岗位保存多个简历版本，随时切换编辑和导出',
    color: 'from-teal-500 to-teal-600',
    bg: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
]

const steps = [
  { step: '01', title: '完善个人信息', desc: '填写教育背景、工作经历和技能专长，或直接上传已有简历导入', color: 'bg-blue-600' },
  { step: '02', title: '粘贴目标 JD', desc: '输入你感兴趣的职位描述，AI 自动解析关键要求', color: 'bg-emerald-600' },
  { step: '03', title: '查看匹配分析', desc: '获取匹配度评分和能力差距清单，明确优化方向', color: 'bg-violet-600' },
  { step: '04', title: '生成定制简历', desc: '一键生成针对性的专业简历，多模板风格即时切换', color: 'bg-orange-600' },
]

const stats = [
  { value: '智能匹配', label: 'AI 精准分析 JD 关键词', icon: Target },
  { value: 'ATS 优化', label: '简历格式兼容筛选系统', icon: Shield },
  { value: '即刻生成', label: '一键生成定制化简历', icon: Zap },
]

export default function Home() {
  return (
    <div>
      {/* Hero Section - 参考 Resumatic/Teal 的设计风格 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-1 mb-12">
        <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-12 md:p-16 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-blue-300" />
              <span className="text-sm text-blue-200 font-medium">AI 驱动的智能简历优化平台</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4 tracking-tight">
              告别海投简历
              <br />
              <span className="bg-gradient-to-r from-blue-300 via-blue-200 to-purple-200 bg-clip-text text-transparent">
                用 AI 精准匹配每个岗位
              </span>
            </h1>

            <p className="text-lg text-blue-200/80 max-w-xl mb-8 leading-relaxed">
              分析你的能力与目标岗位 JD 的匹配度，自动生成针对性强的定制化简历，
              智能重写经历突出岗位关键词，让每一次投递都命中靶心。
            </p>

            <div className="flex items-center gap-4">
              <Link
                to="/jd-analysis"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-7 py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.98]"
              >
                开始分析 JD <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/80 px-7 py-3.5 rounded-xl font-medium hover:bg-white/20 transition-all border border-white/10"
              >
                填写个人信息
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex items-center gap-6">
              {stats.map((s) => {
                const Icon = s.icon
                return (
                  <div key={s.label} className="flex items-center gap-2 text-blue-300/70">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{s.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Feature cards - 参考 Kickresume/职徒简历 的卡片设计 */}
      <div className="mb-14">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">全方位求职工具箱</h2>
          <p className="text-gray-500 mt-2">从信息管理到简历生成，全流程 AI 赋能</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <Link
                key={f.title}
                to={f.to}
                className="group bg-white rounded-2xl p-6 border border-gray-100 hover-lift transition-all hover:border-transparent hover:shadow-lg relative overflow-hidden"
              >
                {/* Hover gradient accent */}
                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-[0.02] transition-opacity`} />
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${f.iconColor}`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-sm text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-all translate-x-[-8px] group-hover:translate-x-0">
                  立即使用 <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* How it works - 参考 Zety/Enhancv 的工作流设计 */}
      <div className="bg-white rounded-2xl p-10 border border-gray-100 mb-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">四步轻松搞定</h2>
          <p className="text-gray-500 mt-2">只需几分钟，打造高匹配度简历</p>
        </div>
        <div className="flex flex-col md:flex-row items-start justify-center gap-8">
          {steps.map((s, idx) => (
            <div key={s.step} className="flex-1 text-center group">
              <div className="relative inline-flex mb-4">
                <div className={`w-14 h-14 ${s.color} rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform`}>
                  <span className="text-white font-bold text-lg">{s.step}</span>
                </div>
                {/* Connector line */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-14 w-[calc(100%-56px)] h-0.5 bg-gradient-to-r from-blue-200 to-gray-200">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2">
                      <ArrowRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
