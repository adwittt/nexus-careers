import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, IndianRupee, Clock, Briefcase, ArrowLeft, Building2, CheckCircle, Trash2, AlertCircle } from 'lucide-react'
import { getJobById, getMyApplications, withdrawApplication } from '../services/api'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'

const COMPANY_COLORS = {
  Google:    '#4285F4', Amazon: '#FF9900', Microsoft: '#00A4EF',
  Meta:      '#1877F2', Apple: '#555555',  Netflix:   '#E50914',
  Infosys:   '#007CC3', Wipro: '#45108A',  TCS:       '#000080',
}

const InfoCell = ({ label, value, border }) => (
  <div className={`p-4 sm:p-6 ${border ? 'border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-slate-800/80' : ''}`}>
    <div className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">{label}</div>
    <div className="text-gray-900 dark:text-white font-bold text-base sm:text-lg">{value}</div>
  </div>
)

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
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)

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

  const handleWithdrawClick = (e) => {
    e.stopPropagation()
    setShowWithdrawConfirm(true)
  }

  const handleConfirmWithdraw = async () => {
    setIsWithdrawing(true)
    try {
      await withdrawApplication(application.id)
      navigate('/dashboard/seeker')
    } catch (err) {
      alert("Failed to withdraw application.")
    } finally {
      setIsWithdrawing(false)
      setShowWithdrawConfirm(false)
    }
  }

  const handleCancelWithdraw = (e) => {
    e.stopPropagation()
    setShowWithdrawConfirm(false)
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#020817] transition-colors py-12 px-4 relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <div className="max-w-4xl mx-auto z-10 relative">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white mb-8 bg-white dark:bg-slate-900/50 backdrop-blur-sm border border-gray-200 dark:border-slate-800 px-4 py-2 rounded-xl cursor-pointer transition-all shadow-sm group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to results
        </button>

        {/* Main card */}
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl sm:rounded-[2rem] shadow-xl border border-gray-200 dark:border-slate-800/80 p-5 sm:p-8 md:p-12 relative overflow-hidden">
          {/* Subtle top border glow inside card */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

          {/* Header row */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black flex-shrink-0 shadow-lg border border-white/20"
                style={{ background: logoColor !== '#6b7280' ? `linear-gradient(135deg, ${logoColor}, ${logoColor}cc)` : 'linear-gradient(135deg, #6b7280, #4b5563)' }}
              >
                {job.companyName?.[0] || '?'}
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">{job.title}</h1>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-gray-600 dark:text-slate-300 text-base font-bold flex items-center gap-1.5">
                    <Building2 size={16} className="text-gray-400 dark:text-slate-500" />
                    {job.companyName}
                  </span>
                  {application && (
                    <StatusBadge status={application.status} />
                  )}
                </div>
              </div>
            </div>

            {/* Action Button Top */}
            <div className="flex-shrink-0 w-full md:w-auto mt-4 md:mt-0">
              {user?.role === 'JOB_SEEKER' ? (
                application ? (
                  application.status !== 'REJECTED' && (
                    <button
                      onClick={handleWithdrawClick}
                      className="w-full md:w-auto flex items-center justify-center gap-2 text-sm py-3 px-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border border-red-200 dark:border-red-800/50 cursor-pointer font-bold shadow-sm"
                    >
                      <Trash2 size={16} />
                      Withdraw
                    </button>
                  )
                ) : (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) ? (
                  <button disabled className="w-full md:w-auto bg-gray-300 dark:bg-slate-700 text-gray-500 dark:text-slate-400 px-8 py-3.5 rounded-xl font-bold text-sm lg:text-base border-0 cursor-not-allowed uppercase tracking-wider">
                    Closed
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/jobs/${id}/apply`)}
                    className="w-full md:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm lg:text-base hover:bg-blue-700 transition-all cursor-pointer border-0 shadow-lg shadow-blue-500/20 hover:-translate-y-0.5"
                  >
                    Apply Now
                  </button>
                )
              ) : !user && (
                (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) ? (
                  <button disabled className="w-full md:w-auto bg-gray-300 dark:bg-slate-700 text-gray-500 dark:text-slate-400 px-8 py-3.5 rounded-xl font-bold text-sm lg:text-base border-0 cursor-not-allowed uppercase tracking-wider">
                    Closed
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full md:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm lg:text-base hover:bg-blue-700 transition-all cursor-pointer border-0 shadow-lg shadow-blue-500/20 hover:-translate-y-0.5"
                  >
                    Login to Apply
                  </button>
                )
              )}
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border border-gray-200 dark:border-slate-800/80 rounded-2xl overflow-hidden mb-8 shadow-sm">
            <InfoCell
              label="Location"
              value={<span className="flex items-center gap-2"><MapPin size={16} className="text-blue-500"/>{job.location}</span>}
            />
            <InfoCell
              label="Salary"
              value={<span className="flex items-center gap-2"><IndianRupee size={16} className="text-green-500"/>{job.salary || 'Not disclosed'}</span>}
              border
            />
            <InfoCell
              label="Experience"
              value={<span className="flex items-center gap-2"><Clock size={16} className="text-orange-500"/>{job.experience || 'Any'}</span>}
              border
            />
          </div>

          {/* Job Type badge */}
          {job.jobType && (
            <div className="flex flex-wrap items-center gap-3 mb-10 pb-6 border-b border-gray-100 dark:border-slate-800/80">
              <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-bold uppercase tracking-wider px-4 py-1.5 rounded-lg flex items-center gap-2 border border-blue-100 dark:border-blue-800/50 shadow-sm">
                <Briefcase size={14} />
                {job.jobType.replace('_', '-')}
              </span>
              {(job.postedAt || job.createdAt) && (
                <span className="text-sm font-medium text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/80 px-4 py-1.5 rounded-lg border border-gray-100 dark:border-slate-800">
                  Posted {new Date(job.postedAt || job.createdAt).toLocaleDateString()}
                </span>
              )}
              {job.applicationDeadline && (
                <span className={`text-sm font-bold px-4 py-1.5 rounded-lg border ${
                  new Date(job.applicationDeadline) < new Date() 
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50' 
                    : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/50'
                }`}>
                  Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                </span>
              )}
            </div>
          )}

          {/* Required Skills */}
          {job.requiredSkills?.length > 0 && (
            <section className="mb-10">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4 flex items-center gap-2"><CheckCircle size={18} className="text-blue-500"/> Required Skills & Qualifications</h3>
              <div className="flex flex-wrap gap-2.5">
                {job.requiredSkills.map((skill, i) => (
                  <span key={i} className="bg-white dark:bg-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-800 dark:text-slate-200 text-sm font-semibold px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Job Description */}
          <section>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Role Description</h3>
            <div className="text-base text-gray-600 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-wrap transition-colors">
              {job.description || 'No description provided.'}
            </div>
          </section>

          {/* CTA Footer */}
          {(!application && (!user || user?.role === 'JOB_SEEKER')) && (
            <div className="mt-12 pt-10 border-t border-gray-100 dark:border-slate-800/80 flex justify-center">
              {(job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) ? (
                <button disabled className="bg-gray-300 dark:bg-slate-700 text-gray-500 dark:text-slate-400 px-16 py-4 rounded-xl text-lg font-black border-0 cursor-not-allowed uppercase tracking-wider">
                  Applications Closed
                </button>
              ) : (
                <button
                  onClick={() => user ? navigate(`/jobs/${id}/apply`) : navigate('/login')}
                  className="bg-blue-600 text-white px-16 py-4 rounded-xl text-lg font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-1 cursor-pointer border-0"
                >
                  {user ? 'Apply Now' : 'Login to Apply'}
                </button>
              )}
            </div>
          )}
        </div>

      {/* Withdraw Confirmation Modal */}
      {showWithdrawConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md"
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
    </div>
  )
}


