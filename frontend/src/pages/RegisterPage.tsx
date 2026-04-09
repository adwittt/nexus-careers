import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Briefcase } from 'lucide-react'
import { register } from '../services/api'
import { useAuth } from '../context/AuthContext'
import VerifyOtpModal from '../components/VerifyOtpModal'
import Field from '../components/Field'

/**
 * Registration page — matches Image 6 (left panel) mockup:
 * Full Name, Email, Password, Confirm Password, Phone, Job Seeker / Recruiter toggle
 */
export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', role: 'JOB_SEEKER', companyName: ''
  })
  const [showPass, setShowPass]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [fieldErrors, setFieldErrors] = useState<any>({})
  const [showOtp, setShowOtp]         = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const validate = () => {
    const errs: any = {}
    
    if (!form.name.trim()) {
      errs.name = 'Name is required'
    } else if (/\d/.test(form.name)) {
      errs.name = 'Name cannot contain numbers'
    }
    
    if (!form.email.trim()) {
      errs.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Invalid email format'
    }
    
    if (form.password.length < 6) errs.password = 'Min 6 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    
    if (form.phone) {
      if (/[a-zA-Z]/.test(form.phone)) {
        errs.phone = 'Phone cannot contain letters'
      } else if (!/^\+?[\d\s-]{7,15}$/.test(form.phone)) {
        errs.phone = 'Invalid phone number format'
      }
    }
    
    if (form.role === 'RECRUITER' && !form.companyName.trim()) errs.companyName = 'Company name is required'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const errs = validate()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }

    setLoading(true)
    try {
      const payload = { 
        name: form.name, email: form.email, password: form.password, 
        role: form.role, phone: form.phone, companyName: form.role === 'RECRUITER' ? form.companyName : undefined 
      }
      await register(payload)
      setRegisteredEmail(form.email)
      setShowOtp(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full m-0 p-0 overflow-hidden bg-white dark:bg-[#020817]">
      
      {showOtp && (
        <div className="absolute z-50 inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
          <VerifyOtpModal
            email={registeredEmail}
            onClose={() => setShowOtp(false)}
            onSuccess={(data: any) => {
              const { accessToken, ...userData } = data
              loginUser(userData, accessToken)
              const dest = userData.role === 'JOB_SEEKER' ? '/dashboard/seeker' : '/dashboard/recruiter'
              navigate(dest, { replace: true })
            }}
          />
        </div>
      )}

      {/* Left Side: About the Website */}
      <div className="hidden lg:flex flex-col justify-center relative w-[45%] xl:w-1/2 min-h-full bg-slate-900 border-r border-slate-800/80 overflow-hidden px-12 xl:px-24">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-[#020817] z-0"></div>
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
            Start your<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">journey.</span>
          </h1>
          <p className="text-lg xl:text-xl text-slate-400 font-medium mb-12 leading-relaxed">
            Create an account to discover incredible opportunities, match with top global companies, and accelerate your path to success.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
              <div className="w-12 h-12 mt-1 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 flex-shrink-0 text-2xl">🚀</div>
              <div>
                <h3 className="font-bold text-white text-lg mb-1">Launch your career immediately</h3>
                <p className="text-sm text-slate-400 font-medium">Build your profile once and get matched instantly.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
              <div className="w-12 h-12 mt-1 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 flex-shrink-0 text-2xl">🤝</div>
              <div>
                <h3 className="font-bold text-white text-lg mb-1">Connect with global companies</h3>
                <p className="text-sm text-slate-400 font-medium">Access our exclusive network of premium employers directly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-[55%] xl:w-1/2 flex items-center justify-center p-6 sm:p-10 xl:p-16 overflow-y-auto">
        <div className="w-full max-w-lg relative z-10 py-10">
          
          <div className="mb-10 text-center lg:text-left">
            {/* Mobile Header hidden on large */}
            <div className="lg:hidden flex justify-center items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Briefcase className="text-white" size={24} />
              </div>
              <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Nexus<span className="text-blue-600 dark:text-blue-400">Careers</span></span>
            </div>

            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Create an account</h2>
            <p className="text-gray-500 dark:text-slate-400 font-medium">Join us today to accelerate your growth.</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-6 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Full Name</label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`w-full px-4 py-3.5 bg-gray-50 dark:bg-slate-900/50 border ${fieldErrors.name ? 'border-red-500' : 'border-gray-200 dark:border-slate-800'} rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white font-medium`}
                />
                {fieldErrors.name && <p className="text-red-500 text-xs mt-1 absolute">{fieldErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Email Address</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className={`w-full px-4 py-3.5 bg-gray-50 dark:bg-slate-900/50 border ${fieldErrors.email ? 'border-red-500' : 'border-gray-200 dark:border-slate-800'} rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white font-medium`}
                />
                {fieldErrors.email && <p className="text-red-500 text-xs mt-1 absolute">{fieldErrors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3.5 bg-gray-50 dark:bg-slate-900/50 border ${fieldErrors.password ? 'border-red-500' : 'border-gray-200 dark:border-slate-800'} rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white font-medium pr-10`}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-red-500 text-xs mt-1 absolute">{fieldErrors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3.5 bg-gray-50 dark:bg-slate-900/50 border ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-200 dark:border-slate-800'} rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white font-medium pr-10`}
                  />
                  <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1 absolute">{fieldErrors.confirmPassword}</p>}
              </div>
            </div>

            <div className="pt-1">
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Phone Number</label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className={`w-full px-4 py-3.5 bg-gray-50 dark:bg-slate-900/50 border ${fieldErrors.phone ? 'border-red-500' : 'border-gray-200 dark:border-slate-800'} rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white font-medium`}
              />
              {fieldErrors.phone && <p className="text-red-500 text-xs mt-1 absolute">{fieldErrors.phone}</p>}
            </div>

            {/* Role toggle */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Account Type</label>
              <div className="flex gap-3">
                {[
                  { value: 'JOB_SEEKER', label: 'Job Seeker' },
                  { value: 'RECRUITER',  label: 'Recruiter' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setForm(prev => ({ ...prev, role: opt.value }))
                      setFieldErrors(prev => ({ ...prev, companyName: '' }))
                    }}
                    className={`flex-1 py-3.5 px-4 rounded-xl text-sm font-bold border transition-all flex items-center justify-center gap-2 ${
                      form.role === opt.value
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-600 dark:border-blue-500 shadow-sm'
                        : 'bg-white dark:bg-slate-900/50 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.role === opt.value ? 'border-blue-600 dark:border-blue-400' : 'border-gray-300 dark:border-slate-600'}`}>
                      {form.role === opt.value && <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>}
                    </div>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {form.role === 'RECRUITER' && (
              <div className="pt-2 animate-fade-in">
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Company Name <span className="text-red-500">*</span></label>
                <input
                  name="companyName"
                  type="text"
                  value={form.companyName}
                  onChange={handleChange}
                  placeholder="Acme Corp."
                  className={`w-full px-4 py-3.5 bg-gray-50 dark:bg-slate-900/50 border ${(fieldErrors as any).companyName ? 'border-red-500' : 'border-gray-200 dark:border-slate-800'} rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white font-medium`}
                />
                {(fieldErrors as any).companyName && <p className="text-red-500 text-xs mt-1 absolute">{(fieldErrors as any).companyName}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-sm mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:shadow-none"
            >
              {loading ? 'Processing...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-8 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition-colors">
              Log in instead
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}
