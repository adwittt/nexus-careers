import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, IndianRupee, Clock, Briefcase, ArrowLeft, Building2, CheckCircle, Trash2 } from 'lucide-react'
import { getJobById, getMyApplications, withdrawApplication } from '../services/api'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'

const COMPANY_COLORS = {
  Google:    '#4285F4', Amazon: '#FF9900', Microsoft: '#00A4EF',
  Meta:      '#1877F2', Apple: '#555555',  Netflix:   '#E50914',
  Infosys:   '#007CC3', Wipro: '#45108A',  TCS:       '#000080',
}

/**
 * Job Detail Page — matches Image 3 mockup with Dark Mode support
 */
export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [job, setJob]                 = useState(null)
  const [application, setApplication] = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      const jobRes = await getJobById(id)
      setJob(jobRes.data)

      if (user?.role === 'JOB_SEEKER') {
        const appsRes = await getMyApplications()
        const myApp = appsRes.data?.find(a => a.jobId === Number(id))
        setApplication(myApp)
      }
    } catch (err) {
      setError('Job not found.')
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (window.confirm("Are you sure you want to withdraw this application?")) {
      try {
        await withdrawApplication(application.id)
        setApplication(null)
      } catch (err) {
        alert("Failed to withdraw.")
      }
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error || !job) return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col items-center justify-center gap-4">
      <p className="text-gray-500 dark:text-slate-400">{error || 'Job not found.'}</p>
      <button onClick={() => navigate('/jobs')} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Back to Jobs</button>
    </div>
  )

  const logoColor = COMPANY_COLORS[job.companyName] || '#6b7280'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-5 bg-transparent border-0 cursor-pointer transition-colors"
        >
          <ArrowLeft size={15} /> Back to results
        </button>

        {/* Main card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">

          {/* Header row */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                style={{ background: logoColor }}
              >
                {job.companyName?.[0] || '?'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{job.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-gray-600 dark:text-slate-400 text-sm font-medium">{job.companyName}</span>
                  {application && (
                    <StatusBadge status={application.status} />
                  )}
                </div>
              </div>
            </div>

            {/* Action Button Top */}
            <div className="flex-shrink-0">
              {user?.role === 'JOB_SEEKER' ? (
                application ? (
                  application.status !== 'REJECTED' && (
                    <button
                      onClick={handleWithdraw}
                      className="flex items-center gap-1.5 text-sm py-2.5 px-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border-0 cursor-pointer font-medium"
                    >
                      <Trash2 size={15} />
                      Withdraw
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => navigate(`/jobs/${id}/apply`)}
                    className="bg-blue-600 text-white px-8 py-2.5 rounded-lg text-sm hover:bg-blue-700 transition-colors cursor-pointer border-0 shadow-sm"
                  >
                    Apply Now
                  </button>
                )
              ) : !user && (
                <button
                  onClick={() => navigate('/login')}
                  className="bg-blue-600 text-white px-8 py-2.5 rounded-lg text-sm hover:bg-blue-700 transition-colors cursor-pointer border-0"
                >
                  Login to Apply
                </button>
              )}
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-3 gap-0 border border-gray-100 dark:border-slate-700 rounded-xl overflow-hidden mb-6">
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
            <div className="flex items-center gap-3 mb-8">
              <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <Briefcase size={11} />
                {job.jobType.replace('_', '-')}
              </span>
              {(job.postedAt || job.createdAt) && (
                <span className="text-xs text-gray-400 dark:text-slate-500 transition-colors">
                  Posted {new Date(job.postedAt || job.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          )}

          {/* Required Skills */}
          {job.requiredSkills?.length > 0 && (
            <section className="mb-8">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill, i) => (
                  <span key={i} className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Job Description */}
          <section>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4">Job Description</h3>
            <div className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap transition-colors">
              {job.description || 'No description provided.'}
            </div>
          </section>

          {/* CTA Footer */}
          {user?.role === 'JOB_SEEKER' && !application && (
            <div className="mt-10 pt-8 border-t border-gray-100 dark:border-slate-700 flex justify-center">
               <button
                onClick={() => navigate(`/jobs/${id}/apply`)}
                className="bg-blue-600 text-white px-12 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none cursor-pointer border-0"
              >
                Apply Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoCell({ label, value, border }: any) {
  return (
    <div className={`px-5 py-4 ${border ? 'border-l border-gray-100 dark:border-slate-700' : ''} bg-gray-50/50 dark:bg-slate-800/50`}>
      <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-wider font-bold mb-1">{label}</p>
      <div className="text-sm font-semibold text-gray-900 dark:text-white">{value}</div>
    </div>
  )
}
