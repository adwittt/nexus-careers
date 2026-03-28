import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, User, Briefcase } from 'lucide-react'

/**
 * Top navigation bar — matches the mockup: "Nexus Careers | Home Jobs Companies [Login]"
 */
export default function Navbar() {
  const { user, logout, getDashboardPath } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div className="w-7 h-7 bg-blue-700 rounded-md flex items-center justify-center">
              <Briefcase size={15} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-base">
              <span className="text-blue-700">Nexus</span> Careers
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-6">
            <Link to="/"     className="text-sm text-gray-600 hover:text-blue-700 transition-colors font-medium no-underline">
              Home
            </Link>
            <Link to="/jobs" className="text-sm text-gray-600 hover:text-blue-700 transition-colors font-medium no-underline">
              Jobs
            </Link>
            <Link to="/jobs" className="text-sm text-gray-600 hover:text-blue-700 transition-colors font-medium no-underline">
              Companies
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                {/* Dashboard link */}
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-700 font-medium no-underline"
                >
                  <User size={15} />
                  <span>{user.name?.split(' ')[0]}</span>
                  <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded font-semibold">
                    {user.role === 'JOB_SEEKER' ? 'Seeker' : user.role === 'RECRUITER' ? 'Recruiter' : 'Admin'}
                  </span>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors border-0 cursor-pointer"
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
