import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Briefcase, Search, Clock, CheckCircle2, XCircle,
  AlertCircle, TrendingUp, FileText, Eye
} from 'lucide-react'
import { getMyApplications, withdrawApplication } from '../services/api'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'

/**
 * Job Seeker Dashboard — shows application tracking, stats, quick actions.
 */
export default function JobSeekerDashboard() {
  const { user }             = useAuth()
  const navigate             = useNavigate()
  const [apps, setApps]      = useState([])
  const [loading, setLoading] = useState(true)
  const [withdrawing, setWithdrawing] = useState(null)

  useEffect(() => { loadApplications() }, [])

  const loadApplications = async () => {
    setLoading(true)
    try {
      const res = await getMyApplications()
      setApps(res.data || [])
    } catch {
      setApps([])
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Withdraw this application?')) return
    setWithdrawing(appId)
    try {
      await withdrawApplication(appId)
      setApps(prev => prev.filter(a => a.id !== appId))
    } catch (e) {
      alert(e.response?.data?.message || 'Could not withdraw application')
    } finally {
      setWithdrawing(null)
    }
  }

  // Stat counts
  const counts = {
    total:       apps.length,
    applied:     apps.filter(a => a.status === 'APPLIED').length,
    underReview: apps.filter(a => a.status === 'UNDER_REVIEW').length,
    shortlisted: apps.filter(a => a.status === 'SHORTLISTED').length,
    rejected:    apps.filter(a => a.status === 'REJECTED').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="bg-blue-700 text-white px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-blue-200 mt-1 text-sm">
            Track your applications and discover new opportunities
          </p>
          <button
            onClick={() => navigate('/jobs')}
            className="mt-4 flex items-center gap-2 bg-white text-blue-700 font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-blue-50 transition-colors border-0 cursor-pointer"
          >
            <Search size={15} /> Find New Jobs
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── Stats Row ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          <StatCard icon={<Briefcase size={18} className="text-blue-600" />}
            label="Total Applied" value={counts.total} color="blue" />
          <StatCard icon={<Clock size={18} className="text-yellow-500" />}
            label="Applied" value={counts.applied} color="yellow" />
          <StatCard icon={<AlertCircle size={18} className="text-orange-500" />}
            label="Under Review" value={counts.underReview} color="orange" />
          <StatCard icon={<CheckCircle2 size={18} className="text-green-600" />}
            label="Shortlisted" value={counts.shortlisted} color="green" />
          <StatCard icon={<XCircle size={18} className="text-red-500" />}
            label="Rejected" value={counts.rejected} color="red" />
        </div>

        {/* ── Application Progress Bar ─────────────────────────────────── */}
        {counts.total > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-600" />
              Application Pipeline
            </h2>
            <div className="flex rounded-full overflow-hidden h-4">
              {counts.applied > 0 && (
                <div className="bg-blue-400" style={{ width: `${(counts.applied/counts.total)*100}%` }} title={`Applied: ${counts.applied}`} />
              )}
              {counts.underReview > 0 && (
                <div className="bg-yellow-400" style={{ width: `${(counts.underReview/counts.total)*100}%` }} title={`Under Review: ${counts.underReview}`} />
              )}
              {counts.shortlisted > 0 && (
                <div className="bg-green-500" style={{ width: `${(counts.shortlisted/counts.total)*100}%` }} title={`Shortlisted: ${counts.shortlisted}`} />
              )}
              {counts.rejected > 0 && (
                <div className="bg-red-400" style={{ width: `${(counts.rejected/counts.total)*100}%` }} title={`Rejected: ${counts.rejected}`} />
              )}
            </div>
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block"/>Applied</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"/>Under Review</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"/>Shortlisted</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block"/>Rejected</span>
            </div>
          </div>
        )}

        {/* ── Application List ─────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <FileText size={16} className="text-blue-600" />
              My Applications
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                {counts.total}
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : apps.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Briefcase size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No applications yet</p>
              <p className="text-xs mt-1">Start applying to track your progress here</p>
              <button
                onClick={() => navigate('/jobs')}
                className="btn-primary text-sm mt-4 px-6"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {apps.map(app => (
                <div key={app.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 text-sm">{app.jobTitle}</h3>
                        <StatusBadge status={app.status} />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{app.companyName}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        }) : '—'}
                      </p>
                      {app.recruiterNotes && (
                        <p className="text-xs text-blue-600 mt-1 bg-blue-50 px-2 py-1 rounded">
                          💬 {app.recruiterNotes}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => navigate(`/jobs/${app.jobId}`)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline bg-transparent border-0 cursor-pointer"
                      >
                        <Eye size={13} /> View Job
                      </button>
                      {(app.status === 'APPLIED' || app.status === 'UNDER_REVIEW') && (
                        <button
                          onClick={() => handleWithdraw(app.id)}
                          disabled={withdrawing === app.id}
                          className="text-xs text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer disabled:opacity-50"
                        >
                          {withdrawing === app.id ? 'Withdrawing…' : 'Withdraw'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status progress trail */}
                  <StatusTrail status={app.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color }) {
  const bg = { blue: 'bg-blue-50', yellow: 'bg-yellow-50', orange: 'bg-orange-50', green: 'bg-green-50', red: 'bg-red-50' }
  return (
    <div className={`${bg[color]} rounded-xl p-4 flex flex-col gap-2`}>
      <div className="flex items-center justify-between">
        {icon}
        <span className="text-2xl font-extrabold text-gray-800">{value}</span>
      </div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
    </div>
  )
}

function StatusTrail({ status }) {
  const steps = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED']
  const currentIdx = steps.indexOf(status)
  const isRejected = status === 'REJECTED'

  return (
    <div className="flex items-center gap-0 mt-3">
      {steps.map((step, i) => {
        const reached  = isRejected ? i === 0 : i <= currentIdx
        const isCurrent = i === currentIdx && !isRejected
        const label  = step === 'UNDER_REVIEW' ? 'Review' : step === 'SHORTLISTED' ? 'Shortlisted' : 'Applied'

        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full border-2 transition-colors ${
                isCurrent ? 'bg-blue-600 border-blue-600'
                : reached  ? 'bg-blue-400 border-blue-400'
                :            'bg-gray-200 border-gray-300'
              }`} />
              <span className={`text-[10px] mt-0.5 font-medium ${
                isCurrent ? 'text-blue-600' : reached ? 'text-gray-500' : 'text-gray-300'
              }`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mb-3.5 ${reached && i < currentIdx ? 'bg-blue-400' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
      {isRejected && (
        <span className="text-xs text-red-500 font-semibold ml-2">— Rejected</span>
      )}
    </div>
  )
}
