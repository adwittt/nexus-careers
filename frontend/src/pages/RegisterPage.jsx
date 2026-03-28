import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Briefcase } from 'lucide-react'
import { register } from '../services/api'
import { useAuth } from '../context/AuthContext'

/**
 * Registration page — matches Image 6 (left panel) mockup:
 * Full Name, Email, Password, Confirm Password, Phone, Job Seeker / Recruiter toggle
 */
export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', role: 'JOB_SEEKER'
  })
  const [showPass, setShowPass]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim())   errs.name = 'Name is required'
    if (!form.email.trim())  errs.email = 'Email is required'
    if (form.password.length < 6) errs.password = 'Min 6 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const errs = validate()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }

    setLoading(true)
    try {
      const payload = { name: form.name, email: form.email, password: form.password, role: form.role, phone: form.phone }
      const res = await register(payload)
      const { accessToken, ...userData } = res.data
      loginUser(userData, accessToken)
      const dest = form.role === 'JOB_SEEKER' ? '/dashboard/seeker' : '/dashboard/recruiter'
      navigate(dest, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ label, name, type = 'text', placeholder, right }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          name={name}
          type={type}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder || label}
          className={`input-field ${right ? 'pr-10' : ''} ${fieldErrors[name] ? 'border-red-400' : ''}`}
        />
        {right && (
          <button type="button" onClick={right}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer p-0">
            {name === 'password'
              ? (showPass ? <EyeOff size={16}/> : <Eye size={16}/>)
              : (showConfirm ? <EyeOff size={16}/> : <Eye size={16}/>)
            }
          </button>
        )}
      </div>
      {fieldErrors[name] && <p className="text-red-500 text-xs mt-1">{fieldErrors[name]}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
            <Briefcase size={16} className="text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Register</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="Full Name"        name="name"            placeholder="Full Name" />
          <Field label="Email Address"    name="email"           type="email" placeholder="Email Address" />
          <Field label="Password"         name="password"        type={showPass    ? 'text' : 'password'} placeholder="Password"         right={() => setShowPass(p => !p)} />
          <Field label="Confirm Password" name="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="Confirm Password" right={() => setShowConfirm(p => !p)} />
          <Field label="Phone Number"     name="phone"           type="tel" placeholder="Phone Number" />

          {/* Role toggle — "Job Seeker | Recruiter" like mockup */}
          <div>
            <div className="flex gap-2 mt-1">
              {[
                { value: 'JOB_SEEKER', label: 'Job Seeker' },
                { value: 'RECRUITER',  label: 'Recruiter' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, role: opt.value }))}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
                    form.role === opt.value
                      ? 'bg-blue-700 text-white border-blue-700'
                      : 'bg-white text-blue-700 border-blue-300 hover:border-blue-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-sm mt-2 disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">Login.</Link>
        </p>
      </div>
    </div>
  )
}
