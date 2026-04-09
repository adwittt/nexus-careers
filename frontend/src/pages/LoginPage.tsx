import React, { useState } from 'react'
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    <div className="flex min-h-[calc(100vh-64px)] w-full m-0 p-0 overflow-hidden bg-white dark:bg-[#020817]">
      
      {showOtp && (
        <div className="absolute z-50 inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
          <VerifyOtpModal
            email={form.email}
            onClose={() => setShowOtp(false)}
            onSuccess={(data: any) => {
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
        </div>
      )}

      {/* Left Side: About the Website */}
      <div className="hidden lg:flex flex-col justify-center relative w-1/2 min-h-full bg-slate-900 border-r border-slate-800/80 overflow-hidden px-14 xl:px-24">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#020817] via-slate-900 to-indigo-950 z-0"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc2MCcgaGVpZ2h0PSc2MCc+PGNpcmNsZSBjeD0nMzAnIGN5PSczMCcgcj0nMScgZmlsbD0nIzRmNDY1YycvPjwvc3ZnPg==')] opacity-20 z-0"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none translate-x-1/4 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none -translate-x-1/4 translate-y-1/4"></div>

        <div className="relative z-10 w-full max-w-lg text-white">
          <div className="inline-flex items-center gap-3.5 mb-14">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg border border-white/20">
              <Briefcase className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black tracking-tight">Nexus<span className="text-blue-500">Careers</span></span>
          </div>

          <h1 className="text-5xl xl:text-6xl font-black leading-[1.1] mb-6 tracking-tight">
            Your career,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">elevated.</span>
          </h1>
          <p className="text-lg xl:text-xl text-slate-400 font-medium mb-12 leading-relaxed">
            Sign in to access your personalized dashboard, track active applications, and stay connected with top companies worldwide.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
              <div className="w-12 h-12 mt-1 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 flex-shrink-0 text-2xl">🎯</div>
              <div>
                <h3 className="font-bold text-white text-lg mb-1">Smart Matchmaking</h3>
                <p className="text-sm text-slate-400 font-medium">Our AI algorithms connect you with roles securely tailored exactly to your skills.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
              <div className="w-12 h-12 mt-1 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 flex-shrink-0 text-2xl">📈</div>
              <div>
                <h3 className="font-bold text-white text-lg mb-1">Real-Time Insights</h3>
                <p className="text-sm text-slate-400 font-medium">See how you rank among other candidates and companies instantly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 xl:p-16 relative">
        <div className="w-full max-w-sm relative z-10">
          
          <div className="mb-10 text-center lg:text-left">
            {/* Mobile Header hidden on large */}
            <div className="lg:hidden flex justify-center items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Briefcase className="text-white" size={24} />
              </div>
              <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Nexus<span className="text-blue-600 dark:text-blue-400">Careers</span></span>
            </div>

            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Welcome Back!</h2>
            <p className="text-gray-500 dark:text-slate-400 font-medium">Log in to your account.</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-6 font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <a href="http://localhost:8081/oauth2/authorization/google" className="flex items-center justify-center gap-2 border border-gray-200 dark:border-slate-800 rounded-xl py-3 text-sm font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors bg-white dark:bg-slate-900">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </a>
            <a href="http://localhost:8081/oauth2/authorization/linkedin" className="flex items-center justify-center gap-2 border border-gray-200 dark:border-slate-800 rounded-xl py-3 text-sm font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors bg-white dark:bg-slate-900">
              <svg className="w-4 h-4" fill="#0077B5" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </a>
          </div>

          <div className="relative flex items-center mb-6">
            <div className="flex-grow border-t border-gray-200 dark:border-slate-800"></div>
            <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Or login with email</span>
            <div className="flex-grow border-t border-gray-200 dark:border-slate-800"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Email Address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@company.com"
                required
                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 font-bold">Forgot Password?</Link>
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white font-medium pr-10"
                />
                <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-sm mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-60"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-8 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition-colors">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
