import { useNavigate } from 'react-router-dom'
import { MapPin, IndianRupee, Clock, Building2 } from 'lucide-react'

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
export default function JobCard({ job, onApply, showApply = false }) {
  const navigate = useNavigate()
  const company = COMPANY_COLORS[job.companyName]

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-blue-100 transition-all duration-200 cursor-pointer"
      onClick={() => navigate(`/jobs/${job.id}`)}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Company logo */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
            style={{ background: company?.bg || '#6b7280' }}
          >
            {company?.letter || job.companyName?.[0]?.toUpperCase() || '?'}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
              {job.title}
            </h3>
            <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
              <Building2 size={11} />
              {job.companyName}
            </p>
          </div>
        </div>

        {/* Company name pill (right side like mockup) */}
        <span className="text-xs text-gray-400 font-medium flex-shrink-0">{job.companyName}</span>
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <MapPin size={11} className="text-blue-500" />
          {job.location}
        </span>
        <span className="flex items-center gap-1">
          <IndianRupee size={11} className="text-green-600" />
          {job.salary}
        </span>
        {job.experience && (
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {job.experience}
          </span>
        )}
      </div>

      {/* Description excerpt */}
      {job.description && (
        <p className="text-xs text-gray-500 mt-2.5 line-clamp-2 leading-relaxed">
          {job.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
          {job.jobType?.replace('_', '-') || 'Full-time'}
        </span>
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${job.id}`) }}
            className="text-xs text-blue-700 font-semibold hover:underline bg-transparent border-0 cursor-pointer"
          >
            View Detail &rsaquo;
          </button>
          {showApply && onApply && (
            <button
              onClick={(e) => { e.stopPropagation(); onApply(job.id) }}
              className="btn-primary text-xs py-1.5 px-3"
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
