import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Briefcase } from 'lucide-react'
import { resetPassword } from '../services/api'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token) {
      setError('No reset token found in URL.')
      return
    }
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const res = await resetPassword({ token, newPassword })
      setMessage(res.data.message || 'Password successfully reset.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
            <Briefcase size={16} className="text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Reset Password</h2>
        {message && <div className="bg-green-50 text-green-700 p-3 rounded mb-4 text-sm">{message}</div>}
        {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
              minLength={6}
              className="input-field"
            />
          </div>
          <button type="submit" disabled={loading || !token} className="btn-primary w-full py-3 text-sm mt-2 disabled:opacity-60">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-blue-600 hover:underline">Go to Login</Link>
        </div>
      </div>
    </div>
  )
}
