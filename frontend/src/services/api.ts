import axios, { InternalAxiosRequestConfig } from 'axios'

export interface User {
  id: string | number;
  email: string;
  role: 'JOB_SEEKER' | 'RECRUITER' | 'ADMIN';
  name?: string;
  phone?: string;
}

/**
 * Central Axios instance.
 * - In development: Vite proxies /api → http://localhost:8085 (api-gateway)
 * - In Docker:      Nginx proxies /api → http://api-gateway:8085
 * Using a relative baseURL works transparently in both environments.
 */
const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor: attach JWT ──────────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('nexus_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: handle 401 globally ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login on 401 if it's NOT an auth-related request
    const isAuthRequest = error.config?.url?.includes('/api/auth/')
    
    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('nexus_token')
      localStorage.removeItem('nexus_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ════════════════════════════════════════════════════════════════════════════
// AUTH SERVICE — /api/auth
// ════════════════════════════════════════════════════════════════════════════

export const register = (data: any) => api.post('/api/auth/register', data)
export const login = (data: any) => api.post('/api/auth/login', data)
export const verifyOtp = (data: any) => api.post('/api/auth/verify-otp', data)
export const sendOtp = (data: any) => api.post('/api/auth/send-otp', data)
export const forgotPassword = (data: any) => api.post('/api/auth/forgot-password', data)
export const resetPassword = (data: any) => api.post('/api/auth/reset-password', data)
export const getProfile = (userId: string | number) => api.get(`/api/auth/me?userId=${userId}`)
export const updateProfile = (userId: string | number, data: any) => api.put(`/api/auth/profile?userId=${userId}`, data)
export const getAllUsersAdmin = () => api.get('/api/auth/admin/users')
export const toggleUserStatusAdmin = (id: string | number) => api.put(`/api/auth/admin/users/${id}/toggle`)
export const getUserProfile = (userId: string | number) =>
  api.get('/api/auth/me', { params: { userId } })

// ════════════════════════════════════════════════════════════════════════════
// JOB SERVICE — /api/jobs
// ════════════════════════════════════════════════════════════════════════════

export const getAllJobs = () => api.get('/api/jobs')
export const getJobById = (id: string | number) => api.get(`/api/jobs/${id}`)
export const searchJobs = (params: any) => api.get('/api/jobs/search', { params })
export const createJob = (data: any) => api.post('/api/jobs', data)
export const updateJob = (id: string | number, data: any) => api.put(`/api/jobs/${id}`, data)
export const deleteJob = (id: string | number) => api.delete(`/api/jobs/${id}`)
export const getRecruiterJobs = (recruiterId: string | number) =>
  api.get(`/api/jobs/recruiter/${recruiterId}`)
export const getAllJobsAdmin = () => api.get('/api/jobs/admin/all')

// ════════════════════════════════════════════════════════════════════════════
// APPLICATION SERVICE — /api/applications
// ════════════════════════════════════════════════════════════════════════════

export const uploadResume = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/api/applications/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
export const applyForJob = (data: any) => api.post('/api/applications', data)
export const getMyApplications = () => api.get('/api/applications/user')
export const getJobApplications = (jobId: string | number) =>
  api.get(`/api/applications/job/${jobId}`)
export const getApplicationById = (id: string | number) => api.get(`/api/applications/${id}`)
export const updateApplicationStatus = (id: string | number, status: string, recruiterNotes = '') =>
  api.put(`/api/applications/${id}/status`, { status, recruiterNotes })
export const withdrawApplication = (id: string | number) => api.delete(`/api/applications/${id}`)
export const getApplicationStats = () => api.get('/api/applications/stats')
export const getRecruiterStats = (jobIds: (string | number)[]) => api.post('/api/applications/stats/recruiter', jobIds)

// ════════════════════════════════════════════════════════════════════════════
// ADMIN SERVICE — /api/admin
// ════════════════════════════════════════════════════════════════════════════

export const getAdminUsers = () => api.get('/api/admin/users')
export const getAdminJobs = () => api.get('/api/admin/jobs')
export const getAdminReports = () => api.get('/api/admin/reports')
export const toggleUserStatus = (userId: string | number) =>
  api.put(`/api/admin/users/${userId}/toggle`)

export default api
