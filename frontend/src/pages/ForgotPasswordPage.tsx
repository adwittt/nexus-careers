import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { forgotPassword } from '../services/api'

/**
 * Forgot Password Page with Dark Mode and premium UI.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const res = await forgotPassword({ email })
      setMessage(res.data.message || 'If that email exists, a reset link has been sent.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center px-4 py-12 transition-colors">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-10 border border-gray-100 dark:border-slate-700 animate-in zoom-in-95 duration-500">
        
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-700 dark:bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20 transform -rotate-3 transition-transform hover:rotate-0">
            <Briefcase size={28} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Forgot Password?</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-3 font-medium">Enter your email and we'll send you a recovery link</p>
        </div>

        {message && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 text-green-700 dark:text-green-400 p-4 rounded-2xl mb-6 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle size={18} className="flex-shrink-0" />
            <span className="font-bold">{message}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 text-red-700 dark:text-red-400 p-4 rounded-2xl mb-6 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="font-bold">{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <label className="block text-[10px] uppercase font-black text-gray-500 dark:text-slate-400 tracking-widest mb-2 pl-1">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-900/50 dark:text-white border border-transparent dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-4 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-3 border-0 cursor-pointer active:scale-[0.98]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending Link…
              </>
            ) : (
              'Send Recovery Link'
            )}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-gray-100 dark:border-slate-700">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 no-underline transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
