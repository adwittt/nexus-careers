import { useState } from 'react'
import { verifyOtp, sendOtp } from '../services/api'
import { CheckCircle, XCircle } from 'lucide-react'

export default function VerifyOtpModal({ email, onClose, onSuccess }) {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleVerify = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await verifyOtp({ email, otp })
      if (onSuccess) onSuccess(res.data)
    } catch(err) {
      setError(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      setLoading(true)
      setError('')
      setMsg('')
      const res = await sendOtp({ email })
      setMsg(res.data?.message || 'OTP resent')
    } catch(err) {
      setError(err.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 border-0 bg-transparent cursor-pointer">
          <XCircle />
        </button>
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Verify Email</h2>
          <p className="text-sm text-gray-500 mt-2">Enter the 6-digit code sent to <br/><span className="font-medium text-gray-800">{email}</span></p>
        </div>

        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
        {msg && <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">{msg}</div>}

        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          className="input-field text-center text-2xl tracking-widest font-mono mb-4 py-3"
        />

        <button 
          onClick={handleVerify} 
          disabled={loading || otp.length < 6}
          className="btn-primary w-full py-3 mb-4 rounded-xl font-medium"
        >
          {loading ? 'Verifying...' : 'Verify & Login'}
        </button>

        <p className="text-center text-sm text-gray-500">
          Didn't receive it?{' '}
          <button onClick={handleResend} disabled={loading} className="text-blue-600 font-medium hover:underline bg-transparent border-0 cursor-pointer">
            Resend
          </button>
        </p>
      </div>
    </div>
  )
}
