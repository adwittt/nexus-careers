import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface User {
  id: string | number;
  email: string;
  role: 'JOB_SEEKER' | 'RECRUITER' | 'ADMIN';
  name?: string;
  userId?: string | number;
  companyName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginUser: (userData: User, token: string) => void;
  logout: () => void;
  getDashboardPath: () => string;
}

const AuthContext = createContext<AuthContextType | null>(null)

/**
 * AuthProvider wraps the app and provides user state + auth actions.
 * Persists user data in localStorage between sessions.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // On mount, restore user from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nexus_user')
      const token  = localStorage.getItem('nexus_token')
      if (stored && token) {
        setUser(JSON.parse(stored))
      }
    } catch {
      localStorage.clear()
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Called after successful login/register.
   * Saves token and user to localStorage.
   */
  const loginUser = (userData: User, token: string) => {
    localStorage.setItem('nexus_token', token)
    localStorage.setItem('nexus_user', JSON.stringify(userData))
    setUser(userData)
  }

  /**
   * Clear auth state and localStorage.
   */
  const logout = () => {
    localStorage.removeItem('nexus_token')
    localStorage.removeItem('nexus_user')
    setUser(null)
  }

  /**
   * Get dashboard path for current role.
   */
  const getDashboardPath = () => {
    if (!user) return '/'
    switch (user.role) {
      case 'JOB_SEEKER': return '/dashboard/seeker'
      case 'RECRUITER':  return '/dashboard/recruiter'
      case 'ADMIN':      return '/dashboard/admin'
      default:           return '/'
    }
  }

  return (
    <AuthContext.Provider value={{ user, loginUser, logout, loading, getDashboardPath }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
