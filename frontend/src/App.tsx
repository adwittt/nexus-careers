import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

import React, { Suspense } from 'react'
import Footer from './components/Footer'

// Lazy loaded Pages
const HomePage           = React.lazy(() => import('./pages/HomePage'))
const LoginPage          = React.lazy(() => import('./pages/LoginPage'))
const RegisterPage       = React.lazy(() => import('./pages/RegisterPage'))
const JobSearchPage      = React.lazy(() => import('./pages/JobSearchPage'))
const JobDetailPage      = React.lazy(() => import('./pages/JobDetailPage'))
const ApplyJobPage       = React.lazy(() => import('./pages/ApplyJobPage'))
const JobSeekerDashboard = React.lazy(() => import('./pages/JobSeekerDashboard'))
const RecruiterDashboard = React.lazy(() => import('./pages/RecruiterDashboard'))
const AdminDashboard     = React.lazy(() => import('./pages/AdminDashboard'))

const ForgotPasswordPage    = React.lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage     = React.lazy(() => import('./pages/ResetPasswordPage'))
const OAuth2RedirectHandler = React.lazy(() => import('./pages/OAuth2RedirectHandler'))
const Profile               = React.lazy(() => import('./pages/Profile'))

// Loading Fallback Component
const PageLoader = () => (
  <div className="flex justify-center items-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
)

function AppRoutes() {
  const { user } = useAuth()

  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          <Suspense fallback={<PageLoader />}>
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

            <Route path="/dashboard/admin" element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Global Protected: Profile (available to all roles) */}
            <Route path="/profile" element={
              <ProtectedRoute roles={['JOB_SEEKER', 'RECRUITER', 'ADMIN']}>
                <Profile />
              </ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
        <Footer />
      </div>
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
