import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const userData = {
          id: payload.userId,
          userId: payload.userId,
          email: payload.sub,
          name: payload.name || '',
          role: payload.role?.replace('ROLE_', '') || 'JOB_SEEKER'
        }
        loginUser(userData, token)
        
        const dest = userData.role === 'ROLE_JOB_SEEKER' || userData.role === 'JOB_SEEKER'
          ? '/dashboard/seeker'
          : userData.role === 'ROLE_RECRUITER' || userData.role === 'RECRUITER'
          ? '/dashboard/recruiter'
          : '/dashboard/admin'
        
        navigate(dest, { replace: true })
      } catch (err) {
        console.error('Error parsing token', err)
        navigate('/login?error=InvalidToken', { replace: true })
      }
    } else {
      navigate('/login', { replace: true })
    }
  }, [token, loginUser, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-600">Processing login...</div>
    </div>
  )
}
