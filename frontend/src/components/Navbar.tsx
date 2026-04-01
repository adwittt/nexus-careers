import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { LogOut, User, Briefcase, Sun, Moon } from 'lucide-react'

/**
 * Top navigation bar — matches the mockup: "Nexus Careers | Home Jobs Companies [Login]"
 */
export default function Navbar() {
  const { user, logout, getDashboardPath } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div className="w-7 h-7 bg-blue-700 rounded-md flex items-center justify-center">
              <Briefcase size={15} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-base">
              <span className="text-blue-700">Nexus</span> Careers
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-6 mr-2">
              <Link to="/"     className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 transition-colors font-medium no-underline">
                Home
              </Link>
              <Link to="/jobs" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 transition-colors font-medium no-underline">
                Jobs
              </Link>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 transition-all border-0 cursor-pointer"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 font-medium no-underline border-r border-gray-200 dark:border-slate-800 pr-3 mr-1"
                >
                  <Briefcase size={15} />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 font-medium no-underline"
                >
                  <User size={15} />
                  <span>{user.name?.split(' ')[0]}</span>
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    {user.role === 'JOB_SEEKER' ? 'Seeker' : user.role === 'RECRUITER' ? 'Recruiter' : 'Admin'}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors border-0 cursor-pointer"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login">
                <button className="btn-primary text-sm py-2 px-4">
                  Login
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
