import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Briefcase } from 'lucide-react'
import { login } from '../services/api'
import { useAuth } from '../context/AuthContext'
import VerifyOtpModal from '../components/VerifyOtpModal'
import { useToast } from '../core/ToastContext'

/**
 * Login page — matches Image 6 (right panel) mockup exactly.
 */
export default function LoginPage() {
  const [form, setForm]         = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [showOtp, setShowOtp]   = useState(false)

  const { loginUser, getDashboardPath } = useAuth()
  const { addToast } = useToast()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || null

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(form)
      const { accessToken, ...userData } = res.data
      loginUser(userData, accessToken)
      // Redirect to original destination or role dashboard
      const dest = from || (userData.role === 'JOB_SEEKER'
        ? '/dashboard/seeker'
        : userData.role === 'RECRUITER'
        ? '/dashboard/recruiter'
        : '/dashboard/admin')
      navigate(dest, { replace: true })
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid email or password'
      setError(msg)
      addToast(msg, 'error')
      if (msg.toLowerCase().includes('verify your email')) {
        setShowOtp(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors flex items-center justify-center px-4 py-12">
      {showOtp && (
        <VerifyOtpModal
          email={form.email}
          onClose={() => setShowOtp(false)}
          onSuccess={(data) => {
            const { accessToken, ...userData } = data
            loginUser(userData, accessToken)
            const dest = from || (userData.role === 'JOB_SEEKER'
              ? '/dashboard/seeker'
              : userData.role === 'RECRUITER'
              ? '/dashboard/recruiter'
              : '/dashboard/admin')
            navigate(dest, { replace: true })
          }}
        />
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg w-full max-w-sm p-8 border border-transparent dark:border-slate-700">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center shadow-md">
            <Briefcase size={16} className="text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">Login</h2>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email Address</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              className="input-field"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="input-field pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 bg-transparent border-0 cursor-pointer p-0"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="flex justify-end mt-1">
              <Link to="/forgot-password" size="xs" className="text-xs text-blue-600 dark:text-blue-400 hover:underline bg-transparent border-0 cursor-pointer p-0 font-medium no-underline">
                Forgot Password?
              </Link>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-sm mt-2 disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Register link */}
        <p className="text-center text-xs text-gray-500 dark:text-slate-400 mt-4">
          New User?{' '}
          <Link to="/register" className="text-blue-600 dark:text-blue-400 font-medium hover:underline no-underline">
            Register Here.
          </Link>
        </p>

        {/* OR divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
          <span className="text-xs text-gray-400 dark:text-slate-500">OR</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
        </div>

        {/* Social login buttons */}
        <div className="flex gap-3">
          <a href="http://localhost:8081/oauth2/authorization/google" className="flex-1 flex items-center justify-center gap-2 border border-gray-200 dark:border-slate-700 rounded-lg py-2.5 text-xs text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer bg-white dark:bg-slate-800 no-underline">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </a>
          <a href="http://localhost:8081/oauth2/authorization/linkedin" className="flex-1 flex items-center justify-center gap-2 border border-gray-200 dark:border-slate-700 rounded-lg py-2.5 text-xs text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer bg-white dark:bg-slate-800 no-underline">
            <svg className="w-3.5 h-3.5" fill="#0077B5" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  )
}
