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
  const [fieldErrors, setFieldErrors] = useState({})
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
    if (!form.name.trim())   errs.name = 'Name is required'
    if (!form.email.trim())  errs.email = 'Email is required'
    if (form.password.length < 6) errs.password = 'Min 6 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors flex items-center justify-center px-4 py-12">
      {showOtp && (
        <VerifyOtpModal
          email={registeredEmail}
          onClose={() => setShowOtp(false)}
          onSuccess={(data) => {
            const { accessToken, ...userData } = data
            loginUser(userData, accessToken)
            const dest = userData.role === 'JOB_SEEKER' ? '/dashboard/seeker' : '/dashboard/recruiter'
            navigate(dest, { replace: true })
          }}
        />
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg w-full max-w-sm p-8 border border-transparent dark:border-slate-700">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center shadow-md">
            <Briefcase size={16} className="text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">Register</h2>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="Full Name"        name="name"            placeholder="Full Name"        value={form.name}            onChange={handleChange} error={fieldErrors.name} />
          <Field label="Email Address"    name="email"           placeholder="Email Address"    value={form.email}           onChange={handleChange} error={fieldErrors.email}           type="email" />
          <Field label="Password"         name="password"        placeholder="Password"         value={form.password}        onChange={handleChange} error={fieldErrors.password}        type={showPass    ? 'text' : 'password'} right={() => setShowPass(p => !p)}    rightIcon={showPass    ? <EyeOff size={16}/> : <Eye size={16}/>} />
          <Field label="Confirm Password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} error={fieldErrors.confirmPassword} type={showConfirm ? 'text' : 'password'} right={() => setShowConfirm(p => !p)} rightIcon={showConfirm ? <EyeOff size={16}/> : <Eye size={16}/>} />
          <Field label="Phone Number"     name="phone"           placeholder="Phone Number"     value={form.phone}           onChange={handleChange} error={fieldErrors.phone}           type="tel" />

          {/* Role toggle */}
          <div>
            <div className="flex gap-2 mt-1">
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
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
                    form.role === opt.value
                      ? 'bg-blue-700 text-white border-blue-700'
                      : 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-slate-600 hover:border-blue-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {form.role === 'RECRUITER' && (
            <Field label="Company Name" name="companyName" placeholder="Company Name" value={form.companyName} onChange={handleChange} error={(fieldErrors as any).companyName} />
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-sm mt-2 disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 dark:text-slate-400 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline no-underline">Login.</Link>
        </p>
      </div>
    </div>
  )
}
