import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

// Pages
import HomePage           from './pages/HomePage'
import LoginPage          from './pages/LoginPage'
import RegisterPage       from './pages/RegisterPage'
import JobSearchPage      from './pages/JobSearchPage'
import JobDetailPage      from './pages/JobDetailPage'
import ApplyJobPage       from './pages/ApplyJobPage'
import JobSeekerDashboard from './pages/JobSeekerDashboard'
import RecruiterDashboard from './pages/RecruiterDashboard'
import AdminDashboard     from './pages/AdminDashboard'

import ForgotPasswordPage    from './pages/ForgotPasswordPage'
import ResetPasswordPage     from './pages/ResetPasswordPage'
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler'

function AppRoutes() {
  const { user } = useAuth()

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/"         element={<HomePage />} />
        <Route path="/jobs"     element={<JobSearchPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />

        {/* Auth routes — redirect if already logged in */}
        <Route path="/login"    element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

        {/* Protected: Job Seeker */}
        <Route path="/jobs/:id/apply" element={
          <ProtectedRoute roles={['JOB_SEEKER']}>
            <ApplyJobPage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/seeker" element={
          <ProtectedRoute roles={['JOB_SEEKER']}>
            <JobSeekerDashboard />
          </ProtectedRoute>
        } />

        {/* Protected: Recruiter */}
        <Route path="/dashboard/recruiter" element={
          <ProtectedRoute roles={['RECRUITER']}>
            <RecruiterDashboard />
          </ProtectedRoute>
        } />

        {/* Protected: Admin */}
        <Route path="/dashboard/admin" element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
