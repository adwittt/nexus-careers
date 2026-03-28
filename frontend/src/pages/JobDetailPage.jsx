import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, IndianRupee, Clock, Briefcase, ArrowLeft, Building2, CheckCircle } from 'lucide-react'
import { getJobById } from '../services/api'
import { useAuth } from '../context/AuthContext'

const COMPANY_COLORS = {
  Google:    '#4285F4', Amazon: '#FF9900', Microsoft: '#00A4EF',
  Meta:      '#1877F2', Apple: '#555555',  Netflix:   '#E50914',
  Infosys:   '#007CC3', Wipro: '#45108A',  TCS:       '#000080',
}

/**
 * Job Detail Page — matches Image 3 mockup:
 * Title + company, info grid (Location/Salary/Experience), Required Skills list, Job Description
 */
export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [job, setJob]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    getJobById(id)
      .then(r => setJob(r.data))
      .catch(() => setError('Job not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error || !job) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <p className="text-gray-500">{error || 'Job not found.'}</p>
      <button onClick={() => navigate('/jobs')} className="btn-primary">Back to Jobs</button>
    </div>
  )

  const logoColor = COMPANY_COLORS[job.companyName] || '#6b7280'

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-5 bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={15} /> Back to results
        </button>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* Header: title + Apply button */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">{job.title}</h1>

              {/* Company row with logo */}
              <div className="flex items-center gap-2 mt-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: logoColor }}
                >
                  {job.companyName?.[0] || '?'}
                </div>
                <span className="text-gray-600 text-sm font-medium">{job.companyName}</span>
              </div>
            </div>

            {/* Apply Now — only for JOB_SEEKER */}
            {user?.role === 'JOB_SEEKER' ? (
              <button
                onClick={() => navigate(`/jobs/${id}/apply`)}
                className="btn-primary flex-shrink-0 px-6 py-2.5 text-sm"
              >
                Apply Now
              </button>
            ) : !user ? (
              <button
                onClick={() => navigate('/login')}
                className="btn-primary flex-shrink-0 px-6 py-2.5 text-sm"
              >
                Login to Apply
              </button>
            ) : null}
          </div>

          {/* Info grid — Location | Salary | Experience */}
          <div className="grid grid-cols-3 gap-0 border border-gray-200 rounded-xl overflow-hidden mb-6">
            <InfoCell
              label="Location"
              value={<span className="flex items-center gap-1"><MapPin size={13} className="text-blue-500"/>{job.location}</span>}
            />
            <InfoCell
              label="Salary"
              value={<span className="flex items-center gap-1"><IndianRupee size={13} className="text-green-600"/>{job.salary || 'Not disclosed'}</span>}
              border
            />
            <InfoCell
              label="Experience"
              value={<span className="flex items-center gap-1"><Clock size={13} className="text-orange-500"/>{job.experience || 'Any'}</span>}
              border
            />
          </div>

          {/* Job Type badge */}
          {job.jobType && (
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <Briefcase size={11} />
                {job.jobType.replace('_', '-')}
              </span>
              {job.postedAt && (
                <span className="text-xs text-gray-400">
                  Posted {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
          )}

          {/* Required Skills */}
          {job.requiredSkills?.length > 0 && (
            <section className="mb-6">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Required Skills</h3>
              <ul className="space-y-1.5">
                {job.requiredSkills.map((skill, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle size={13} className="text-blue-500 flex-shrink-0" />
                    {skill}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Divider */}
          <div className="border-t border-gray-100 my-6" />

          {/* Job Description */}
          <section>
            <h3 className="font-bold text-gray-900 text-sm mb-3">Job Description</h3>
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {job.description || 'No description provided.'}
            </div>
          </section>

          {/* Bottom Apply CTA */}
          {user?.role === 'JOB_SEEKER' && (
            <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => navigate(`/jobs/${id}/apply`)}
                className="btn-primary px-8 py-3 text-sm"
              >
                Apply Now
              </button>
              <button
                onClick={() => navigate('/jobs')}
                className="btn-secondary px-6 py-3 text-sm"
              >
                Back to Search
              </button>
            </div>
          )}
        </div>

        {/* Similar jobs hint */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Looking for similar roles?{' '}
          <button
            onClick={() => navigate(`/jobs?title=${encodeURIComponent(job.title)}`)}
            className="text-blue-600 hover:underline bg-transparent border-0 cursor-pointer"
          >
            Search "{job.title}" jobs
          </button>
        </p>
      </div>
    </div>
  )
}

function InfoCell({ label, value, border }) {
  return (
    <div className={`px-5 py-4 ${border ? 'border-l border-gray-200' : ''}`}>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  )
}
