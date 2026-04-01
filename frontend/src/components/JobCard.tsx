import { useNavigate } from 'react-router-dom'
import { MapPin, IndianRupee, Clock, Building2, Trash2 } from 'lucide-react'
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

  const handleWithdraw = async (e) => {
    e.stopPropagation()
    if (window.confirm("Are you sure you want to withdraw this application?")) {
      try {
        await withdrawApplication(application.id)
        if (onWithdraw) onWithdraw()
      } catch (err) {
        alert("Failed to withdraw application.")
      }
    }
  }

  const user = JSON.parse(localStorage.getItem('nexus_user') || '{}')
  const isSeeker = user?.role === 'JOB_SEEKER'

  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900 transition-all duration-200 cursor-pointer"
      onClick={() => navigate(`/jobs/${job.id}`)}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Company logo */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm"
            style={{ background: company?.bg || '#6b7280' }}
          >
            {company?.letter || job.companyName?.[0]?.toUpperCase() || '?'}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight truncate">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-gray-500 dark:text-slate-400 text-xs flex items-center gap-1">
                <Building2 size={11} />
                {job.companyName}
              </p>
              {application && (
                <StatusBadge status={application.status} />
              )}
            </div>
          </div>
        </div>

        {/* Company name pill */}
        <span className="text-xs text-gray-400 dark:text-slate-500 font-medium flex-shrink-0">{job.companyName}</span>
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-3 mt-3 text-xs text-gray-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <MapPin size={11} className="text-blue-500 dark:text-blue-400" />
          {job.location}
        </span>
        <span className="flex items-center gap-1">
          <IndianRupee size={11} className="text-green-600 dark:text-green-500" />
          {job.salary}
        </span>
        {job.experience && (
          <span className="flex items-center gap-1">
            <Clock size={11} className="text-orange-500 dark:text-orange-400" />
            {job.experience}
          </span>
        )}
      </div>

      {/* Description excerpt */}
      {job.description && (
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
          {job.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 dark:border-slate-700/50">
        <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
          {job.jobType?.replace('_', '-') || 'Full-time'}
        </span>
        <div className="flex gap-2 text-xs">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${job.id}`) }}
            className="text-blue-700 dark:text-blue-400 font-semibold hover:underline bg-transparent border-0 cursor-pointer"
          >
            View Detail &rsaquo;
          </button>
          
          {showApply && isSeeker && (
            application ? (
              application.status !== 'REJECTED' && (
                <button
                  onClick={handleWithdraw}
                  className="flex items-center gap-1.5 py-1.5 px-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border-0 cursor-pointer font-medium"
                >
                  <Trash2 size={13} />
                  Withdraw
                </button>
              )
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${job.id}/apply`) }}
                className="btn-primary py-1.5 px-3"
              >
                Apply Now
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
