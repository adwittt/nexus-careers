import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, IndianRupee, Clock, Building2, Trash2, AlertCircle } from 'lucide-react'
import { withdrawApplication } from '../services/api'
import StatusBadge from './StatusBadge'

const COMPANY_COLORS = {
  Google:    { bg: '#4285F4', letter: 'G' },
  Amazon:    { bg: '#FF9900', letter: 'A' },
  Microsoft: { bg: '#00A4EF', letter: 'M' },
  Meta:      { bg: '#1877F2', letter: 'M' },
  Apple:     { bg: '#555555', letter: 'A' },
  Netflix:   { bg: '#E50914', letter: 'N' },
  Infosys:   { bg: '#007CC3', letter: 'I' },
  Wipro:     { bg: '#45108A', letter: 'W' },
  TCS:       { bg: '#000080', letter: 'T' },
}

/**
 * Reusable job card — used on search page and homepage.
 */
export default function JobCard({ job, application, onWithdraw, onApply, showApply = false }) {
  const navigate = useNavigate()
  const company = COMPANY_COLORS[job.companyName]

  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  const handleWithdrawClick = (e: any) => {
    e.stopPropagation()
    setShowWithdrawConfirm(true)
  }

  const handleConfirmWithdraw = async () => {
    setIsWithdrawing(true)
    try {
      await withdrawApplication(application.id)
      if (onWithdraw) onWithdraw()
    } catch (err) {
      alert("Failed to withdraw application.")
    } finally {
      setIsWithdrawing(false)
      setShowWithdrawConfirm(false)
    }
  }

  const handleCancelWithdraw = (e: any) => {
    e.stopPropagation()
    setShowWithdrawConfirm(false)
  }

  const user = JSON.parse(localStorage.getItem('nexus_user') || '{}')
  const isSeeker = user?.role === 'JOB_SEEKER'
  const isExpired = job.applicationDeadline && new Date(job.applicationDeadline) < new Date()

  const renderApplyButton = () => {
    if (!showApply || !isSeeker) return null

    if (application) {
      if (application.status === 'REJECTED') return null
      return (
        <button
          onClick={handleWithdrawClick}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 border border-red-500/20 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
        >
          <Trash2 size={16} />
          Withdraw
        </button>
      )
    }

    if (isExpired) {
      return (
        <button
          disabled
          className="bg-gray-300 dark:bg-slate-700 text-gray-500 dark:text-slate-400 py-1.5 px-3 rounded-xl font-bold cursor-not-allowed uppercase text-xs tracking-wider"
        >
          Closed
        </button>
      )
    }

    return (
      <button
        onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${job.id}/apply`) }}
        className="btn-primary py-1.5 px-3"
      >
        Apply Now
      </button>
    )
  }

  return (
    <div
      className="group relative bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-[1.5rem] border border-gray-200 dark:border-slate-800/80 shadow-sm p-6 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-300 dark:hover:border-blue-500/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
      onClick={() => navigate(`/jobs/${job.id}`)}
    >
      {/* Decorative hover glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg border border-white/20 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300"
            style={{ background: company?.bg ? `linear-gradient(135deg, ${company.bg}, ${company.bg}cc)` : 'linear-gradient(135deg, #6b7280, #4b5563)' }}
          >
            {company?.letter || job.companyName?.[0]?.toUpperCase() || '?'}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-gray-900 dark:text-white text-lg leading-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-500 dark:text-slate-400 font-medium text-sm flex items-center gap-1.5">
                <Building2 size={14} className="text-gray-400 dark:text-slate-500" />
                {job.companyName}
              </p>
              {application && <StatusBadge status={application.status} />}
            </div>
          </div>
        </div>
      </div>

      {/* Meta info tags */}
      <div className="flex flex-wrap items-center gap-2 mt-5 text-sm font-semibold text-gray-600 dark:text-slate-300">
        <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-slate-700/50">
          <MapPin size={14} className="text-blue-500 dark:text-blue-400" />
          {job.location}
        </span>
        <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-slate-700/50">
          <IndianRupee size={14} className="text-green-600 dark:text-green-500" />
          {job.salary}
        </span>
        {job.experience && (
          <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-slate-700/50">
            <Clock size={14} className="text-orange-500 dark:text-orange-400" />
            {job.experience}
          </span>
        )}
        {job.applicationDeadline && (
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${
            isExpired
              ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50'
              : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/50'
          }`}>
            Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Description excerpt */}
      {job.description && (
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-4 line-clamp-2 leading-relaxed font-medium">
          {job.description}
        </p>
      )}

      {/* Footer */}
      <div className="mt-auto pt-5 border-t border-gray-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/50 shadow-sm">
          {job.jobType?.replace('_', '-') || 'Full-time'}
        </span>
        <div className="flex flex-wrap gap-2 sm:gap-3 text-sm">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${job.id}`) }}
            className="text-white font-bold bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors px-3 sm:px-4 py-2 rounded-xl border-0 cursor-pointer shadow-lg shadow-blue-500/20 text-xs sm:text-sm"
          >
            View Details &rsaquo;
          </button>
          {renderApplyButton()}
        </div>
      </div>

      {/* Withdraw Confirmation Modal */}
      {showWithdrawConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={handleCancelWithdraw}
        >
          <div 
            className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl transform transition-all"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 border border-red-200 dark:border-red-800/50">
                <AlertCircle size={32} className="text-red-500 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Withdraw Application?</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-8 font-medium">
                Are you sure you want to withdraw your application for <span className="font-bold text-gray-800 dark:text-slate-200">{job.title}</span> at {job.companyName}? This action cannot be undone.
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={handleCancelWithdraw}
                  disabled={isWithdrawing}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold text-sm transition-colors cursor-pointer border-0 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmWithdraw}
                  disabled={isWithdrawing}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors cursor-pointer border-0 shadow-lg shadow-red-500/20 disabled:opacity-50"
                >
                  {isWithdrawing ? 'Withdrawing...' : 'Yes, Withdraw'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
