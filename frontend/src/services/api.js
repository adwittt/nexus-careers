import axios from 'axios'

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
  (config) => {
    const token = localStorage.getItem('nexus_token')
    if (token) {
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
    if (error.response?.status === 401) {
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

export const register = (data) => api.post('/api/auth/register', data)
export const login = (data) => api.post('/api/auth/login', data)
export const forgotPassword = (data) => api.post('/api/auth/forgot-password', data)
export const resetPassword = (data) => api.post('/api/auth/reset-password', data)
export const getUserProfile = (userId) =>
  api.get('/api/auth/me', { params: { userId } })

// ════════════════════════════════════════════════════════════════════════════
// JOB SERVICE — /api/jobs
// ════════════════════════════════════════════════════════════════════════════

export const getAllJobs = () => api.get('/api/jobs')
export const getJobById = (id) => api.get(`/api/jobs/${id}`)
export const searchJobs = (params) => api.get('/api/jobs/search', { params })
export const createJob = (data) => api.post('/api/jobs', data)
export const updateJob = (id, data) => api.put(`/api/jobs/${id}`, data)
export const deleteJob = (id) => api.delete(`/api/jobs/${id}`)
export const getRecruiterJobs = (recruiterId) =>
  api.get(`/api/jobs/recruiter/${recruiterId}`)
export const getAllJobsAdmin = () => api.get('/api/jobs/admin/all')

// ════════════════════════════════════════════════════════════════════════════
// APPLICATION SERVICE — /api/applications
// ════════════════════════════════════════════════════════════════════════════

export const uploadResume = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/api/applications/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
export const applyForJob = (data) => api.post('/api/applications', data)
export const getMyApplications = () => api.get('/api/applications/user')
export const getJobApplications = (jobId) =>
  api.get(`/api/applications/job/${jobId}`)
export const getApplicationById = (id) => api.get(`/api/applications/${id}`)
export const updateApplicationStatus = (id, status, recruiterNotes = '') =>
  api.put(`/api/applications/${id}/status`, { status, recruiterNotes })
export const withdrawApplication = (id) => api.delete(`/api/applications/${id}`)
export const getApplicationStats = () => api.get('/api/applications/stats')

// ════════════════════════════════════════════════════════════════════════════
// ADMIN SERVICE — /api/admin
// ════════════════════════════════════════════════════════════════════════════

export const getAdminUsers = () => api.get('/api/admin/users')
export const getAdminJobs = () => api.get('/api/admin/jobs')
export const getAdminReports = () => api.get('/api/admin/reports')
export const toggleUserStatus = (userId) =>
  api.put(`/api/admin/users/${userId}/toggle`)

export default api
