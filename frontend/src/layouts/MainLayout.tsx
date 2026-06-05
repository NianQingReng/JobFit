import { Link, Outlet, useLocation } from 'react-router-dom'
import { Briefcase, FileText, Home, User, BarChart3, Sparkles, ChevronRight } from 'lucide-react'

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/profile', label: '个人信息', icon: User },
  { path: '/jd-analysis', label: 'JD分析', icon: FileText },
  { path: '/resumes', label: '简历管理', icon: Briefcase },
]

export default function MainLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shrink-0">
        {/* Brand */}
        <div className="p-6 border-b border-gray-50">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-200 group-hover:shadow-blue-300 transition-shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-gray-900 block leading-tight">JobFit</span>
              <span className="text-[11px] text-gray-400 tracking-wide">智能简历工坊</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-semibold shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${active ? 'text-blue-600' : ''}`} />
                {item.label}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-blue-400" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-5 border-t border-gray-50">
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            v1.0 · AI 驱动
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
