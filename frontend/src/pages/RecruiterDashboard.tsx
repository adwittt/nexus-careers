import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Briefcase, Users, Eye, Trash2, Edit,
  ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, MapPin, Building2, Lock
} from 'lucide-react'
import {
  getRecruiterJobs, createJob, updateJob, deleteJob,
  getJobApplications, updateApplicationStatus,
  getRecruiterStats, getUserProfile, updateProfile
} from '../services/api'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'

const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'REMOTE', 'CONTRACT', 'INTERNSHIP']

const EMPTY_FORM = {
  title: '', companyName: '', location: '', salary: '',
  experience: '', description: '', requiredSkills: '',
  jobType: 'FULL_TIME', applicationDeadline: ''
}

/**
 * Recruiter Dashboard — Post jobs, view applicants, update application status with Dark Mode.
 * Company name is auto-filled from the recruiter's profile or first job and locked afterward.
 */
export default function RecruiterDashboard() {
  const { user }               = useAuth()
  const navigate               = useNavigate()
  const [jobs, setJobs]        = useState<any[]>([])
  const [loading, setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]        = useState({...EMPTY_FORM})
  const [saving, setSaving]    = useState(false)
  const [formError, setFormError] = useState('')
  const [stats, setStats]       = useState({ total: 0, shortlisted: 0 })
  const [editingJobId, setEditingJobId] = useState<number | null>(null)

  // Company name lock: once set, the recruiter can't change it
  const [lockedCompanyName, setLockedCompanyName] = useState<string | null>(null)

  // Applicants drawer
  const [selectedJob, setSelectedJob]     = useState<any>(null)
  const [applicants, setApplicants]       = useState<any[]>([])
  const [loadingApps, setLoadingApps]     = useState(false)
  const [expandedJob, setExpandedJob]     = useState<number | null>(null)

  useEffect(() => { loadJobs() }, [])

  const loadJobs = async () => {
    setLoading(true)
    const userId = user!.userId || user!.id;
    try {
      const res = await getRecruiterJobs(userId as any)
      const jobList = res.data || []
      setJobs(jobList)

      // Determine locked company name from profile or existing jobs
      let companyFromProfile: string | null = null
      try {
        const profileRes = await getUserProfile(userId as any)
        companyFromProfile = profileRes.data?.companyName || null
      } catch {
        // Profile fetch failed, rely on jobs
      }

      if (companyFromProfile) {
        setLockedCompanyName(companyFromProfile)
        setForm(prev => ({ ...prev, companyName: companyFromProfile! }))
      } else if (jobList.length > 0) {
        // Get company name from the most recent job
        const existingCompany = jobList[0].companyName
        if (existingCompany) {
          setLockedCompanyName(existingCompany)
          setForm(prev => ({ ...prev, companyName: existingCompany }))
          // Also save it to the recruiter's profile for future
          try {
            await updateProfile(userId as any, {
              name: user!.name,
              companyName: existingCompany
            })
          } catch {
            // Non-critical, just log it
          }
        }
      }
      
      // Load total stats for all jobs
      if (jobList.length > 0) {
        const jobIds = jobList.map((j: any) => j.id)
        getRecruiterStats(jobIds)
          .then(r => {
            setStats({
              total: r.data.total || 0,
              shortlisted: r.data.shortlisted || 0
            })
          })
          .catch(e => {
            console.error('Failed to fetch recruiter stats', e)
          })
      }
    } catch { setJobs([]) }
    finally { setLoading(false) }
  }

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!form.title || !form.companyName || !form.location) {
      setFormError('Title, Company and Location are required')
      return
    }
    setSaving(true)
    try {
      let finalDeadline = form.applicationDeadline;
      if (finalDeadline && finalDeadline.length === 10) {
          finalDeadline = finalDeadline + 'T23:59:59';
      }

      const payload = {
        ...form,
        applicationDeadline: finalDeadline || null,
        requiredSkills: form.requiredSkills
          ? form.requiredSkills.split(',').map((s: string) => s.trim()).filter(Boolean)
          : []
      }

      if (editingJobId) {
        await updateJob(editingJobId, payload)
      } else {
        await createJob(payload)
      }

      // After first job is posted, lock the company name and save to profile
      if (!lockedCompanyName && form.companyName) {
        setLockedCompanyName(form.companyName)
        const userId = user!.userId || user!.id;
        try {
          await updateProfile(userId as any, {
            name: user!.name,
            companyName: form.companyName
          })
        } catch {
          // Non-critical
        }
      }

      setForm({ ...EMPTY_FORM, companyName: form.companyName })
      setEditingJobId(null)
      setShowForm(false)
      await loadJobs()
    } catch (e: any) {
      setFormError(e.response?.data?.message || 'Failed to save job')
    } finally { setSaving(false) }
  }

  const handleDeleteJob = async (jobId: number) => {
    if (!window.confirm('Remove this job listing?')) return
    try {
      await deleteJob(jobId)
      setJobs(prev => prev.filter((j: any) => j.id !== jobId))
    } catch (e: any) {
      alert(e.response?.data?.message || 'Could not delete job')
    }
  }

  const toggleApplicants = async (job: any) => {
    if (expandedJob === job.id) { setExpandedJob(null); return }
    setExpandedJob(job.id)
    setSelectedJob(job)
    setLoadingApps(true)
    try {
      const res = await getJobApplications(job.id)
      setApplicants(res.data || [])
    } catch { setApplicants([]) }
    finally { setLoadingApps(false) }
  }

  const handleStatusUpdate = async (appId: number, newStatus: string) => {
    try {
      await updateApplicationStatus(appId, newStatus)
      setApplicants(prev => prev.map((a: any) => a.id === appId ? { ...a, status: newStatus } : a))
    } catch (e: any) {
      alert(e.response?.data?.message || 'Could not update status')
    }
  }

  // Whether the company name field should be locked
  const isCompanyLocked = !!lockedCompanyName

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-blue-700 dark:bg-slate-800 text-white px-4 py-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Recruiter Dashboard</h1>
            <p className="text-blue-200 dark:text-slate-400 mt-1 text-sm transition-colors">
              Welcome, {user?.name}
              {lockedCompanyName && (
                <span className="ml-2 bg-blue-600/50 dark:bg-slate-700 text-blue-100 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs font-medium">
                  <Building2 size={11} className="inline mr-1" />
                  {lockedCompanyName}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => {
              setEditingJobId(null)
              setForm({ ...EMPTY_FORM, companyName: lockedCompanyName || '' })
              setShowForm(f => !f)
            }}
            className="flex items-center gap-2 bg-white dark:bg-blue-600 text-blue-700 dark:text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-700 transition-all border-0 cursor-pointer shadow-md"
          >
            <Plus size={16} />
            Post New Job
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 hover:shadow-md transition-all">
            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Active Jobs</p>
            <p className="text-3xl font-extrabold text-blue-700 dark:text-blue-400 mt-1 tracking-tight transition-colors">{jobs.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 hover:shadow-md transition-all">
            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Total Applicants</p>
            <p className="text-3xl font-extrabold text-green-600 dark:text-green-400 mt-1 tracking-tight transition-colors">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 hover:shadow-md transition-all">
            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Shortlisted</p>
            <p className="text-3xl font-extrabold text-orange-500 dark:text-orange-400 mt-1 tracking-tight transition-colors">
              {stats.shortlisted}
            </p>
          </div>
        </div>

        {/* ── Post Job Form ────────────────────────────────────────────── */}
        {showForm && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 mb-6">
            <h2 className="font-bold text-gray-800 dark:text-white mb-5 flex items-center gap-2">
              {editingJobId ? <Edit size={16} className="text-blue-600 dark:text-blue-400" /> : <Plus size={16} className="text-blue-600 dark:text-blue-400" />} 
              {editingJobId ? 'Edit Job' : 'Post a New Job'}
            </h2>

            {formError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveJob}>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Job Title *" value={form.title}
                  onChange={v => setForm(p => ({ ...p, title: v }))} placeholder="e.g. Software Engineer" />
                
                {/* Company Name — locked after first job */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    Company Name *
                    {isCompanyLocked && (
                      <span className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded-full font-semibold">
                        <Lock size={9} /> Locked
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.companyName}
                      onChange={e => !isCompanyLocked && setForm(p => ({ ...p, companyName: e.target.value }))}
                      readOnly={isCompanyLocked}
                      placeholder="e.g. Google"
                      className={`input-field ${isCompanyLocked
                        ? 'bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-slate-300 cursor-not-allowed border-green-200 dark:border-green-800/40'
                        : ''}`}
                    />
                    {isCompanyLocked && (
                      <Building2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 dark:text-green-400" />
                    )}
                  </div>
                  {isCompanyLocked && (
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
                      Company name is set from your profile and cannot be changed.
                    </p>
                  )}
                </div>

                <FormField label="Location *" value={form.location}
                  onChange={v => setForm(p => ({ ...p, location: v }))} placeholder="e.g. Bangalore" />
                <FormField label="Salary" value={form.salary}
                  onChange={v => setForm(p => ({ ...p, salary: v }))} placeholder="e.g. 15 LPA or 41-55 LPA" />
                <FormField label="Experience" value={form.experience}
                  onChange={v => setForm(p => ({ ...p, experience: v }))} placeholder="e.g. 3-5 Years" />
                
                <FormField label="Application Deadline (Optional)" type="date" value={form.applicationDeadline}
                  onChange={v => setForm(p => ({ ...p, applicationDeadline: v }))} placeholder="" />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Job Type</label>
                  <select
                    value={form.jobType}
                    onChange={e => setForm(p => ({ ...p, jobType: e.target.value }))}
                    className="input-field"
                  >
                    {JOB_TYPES.map(t => (
                      <option key={t} value={t} className="dark:bg-slate-800 dark:text-white">
                        {t === 'FULL_TIME' ? 'Full-time' : t === 'PART_TIME' ? 'Part-time' : t.charAt(0) + t.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Required Skills (comma separated)</label>
                  <input
                    value={form.requiredSkills}
                    onChange={e => setForm(p => ({ ...p, requiredSkills: e.target.value }))}
                    placeholder="Java, Spring Boot, Microservices"
                    className="input-field"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Job Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    rows={4}
                    placeholder="Describe the role, responsibilities, and requirements..."
                    className="input-field resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60 py-2.5 px-8">
                  {saving ? 'Saving…' : (editingJobId ? 'Save Changes' : 'Post Job')}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingJobId(null); setForm({ ...EMPTY_FORM, companyName: lockedCompanyName || '' }); setFormError('') }}
                  className="bg-transparent border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 px-6 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors uppercase font-bold text-[10px] tracking-wider cursor-pointer">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Job Listings ─────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
            <h2 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Briefcase size={16} className="text-blue-600 dark:text-blue-400" />
              Your Job Listings
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-semibold">
                {jobs.length}
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 dark:bg-slate-700 rounded-xl animate-pulse" />)}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-slate-500 transition-colors">
              <Briefcase size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No jobs posted yet</p>
              <button onClick={() => setShowForm(true)} className="btn-primary text-sm mt-4 px-6">
                Post Your First Job
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-slate-700/50 transition-colors">
              {jobs.map((job: any) => (
                <div key={job.id}>
                  {/* Job row */}
                  <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-700/20 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{job.title}</h3>
                          <span className="text-xs bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                            {job.jobType?.replace('_','-')}
                          </span>
                          {job.isActive === false && (
                            <span className="text-xs bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-300 px-2 py-0.5 rounded-full">Closed</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-slate-400 transition-colors">
                          <span className="font-semibold text-gray-700 dark:text-slate-300">{job.companyName}</span>
                          <span className="flex items-center gap-0.5"><MapPin size={11}/> {job.location}</span>
                          <span className="text-green-600 dark:text-green-400 font-medium">{job.salary}</span>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 flex items-center gap-2 transition-colors">
                          <Clock size={11}/>
                          Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—'}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => navigate(`/jobs/${job.id}`)}
                          className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline bg-transparent border-0 cursor-pointer font-medium"
                        >
                          <Eye size={13}/> View
                        </button>
                        <button
                          onClick={() => {
                            setForm({
                              title: job.title || '',
                              companyName: job.companyName || '',
                              location: job.location || '',
                              salary: job.salary || '',
                              experience: job.experience || '',
                              description: job.description || '',
                              requiredSkills: job.requiredSkills?.join(', ') || '',
                              jobType: job.jobType || 'FULL_TIME',
                              applicationDeadline: job.applicationDeadline ? job.applicationDeadline.split('T')[0] : ''
                            })
                            setEditingJobId(job.id)
                            setShowForm(true)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 bg-transparent border-0 cursor-pointer font-medium"
                        >
                          <Edit size={13}/> Edit
                        </button>
                        <button
                          onClick={() => toggleApplicants(job)}
                          className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 px-2.5 py-1.5 rounded-lg border-0 cursor-pointer transition-colors shadow-sm"
                        >
                          <Users size={13}/> Applicants
                          {expandedJob === job.id ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-transparent border-0 cursor-pointer transition-colors"
                        >
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Applicants drawer */}
                  {expandedJob === job.id && (
                    <div className="bg-blue-50/50 dark:bg-slate-900/50 border-t border-b border-blue-100 dark:border-slate-700 px-6 py-4 transition-colors">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                        <Users size={14} className="text-blue-600 dark:text-blue-400"/>
                        Applicants for "{job.title}"
                        <span className="text-[11px] bg-blue-200 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
                          {loadingApps ? '…' : applicants.length}
                        </span>
                      </h4>

                      {loadingApps ? (
                        <div className="space-y-2">
                          {[1,2].map(i => <div key={i} className="h-14 bg-blue-100/50 dark:bg-slate-800 rounded-lg animate-pulse"/>)}
                        </div>
                      ) : applicants.length === 0 ? (
                        <p className="text-xs text-gray-400 dark:text-slate-500 py-6 text-center italic">No applicants for this role yet</p>
                      ) : (
                        <div className="space-y-2">
                          {applicants.map((app: any) => (
                            <div key={app.id} className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3 flex items-center justify-between gap-3 shadow-sm border border-transparent dark:border-slate-700/50 transition-all">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-800 dark:text-white leading-tight">{app.applicantName}</p>
                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{app.applicantEmail}</p>
                                {app.coverLetter && (
                                  <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1 italic line-clamp-1">
                                    "{app.coverLetter}"
                                  </p>
                                )}
                                {app.resumeUrl && (
                                  <a
                                    href={app.resumeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1.5 inline-flex items-center gap-1 font-semibold no-underline"
                                  >
                                    <Eye size={11} /> View Resume
                                  </a>
                                )}
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                <StatusBadge status={app.status} />

                                {/* Status action buttons */}
                                {app.status === 'APPLIED' && (
                                  <button
                                    onClick={() => handleStatusUpdate(app.id, 'UNDER_REVIEW')}
                                    className="text-[10px] uppercase tracking-wider font-bold bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 px-3 py-1.5 rounded-lg border-0 cursor-pointer flex items-center gap-1 transition-colors"
                                  >
                                    <Clock size={11}/> Review
                                  </button>
                                )}
                                {app.status === 'UNDER_REVIEW' && (
                                  <>
                                    <button
                                      onClick={() => handleStatusUpdate(app.id, 'SHORTLISTED')}
                                      className="text-[10px] uppercase tracking-wider font-bold bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-lg border-0 cursor-pointer flex items-center gap-1 transition-colors"
                                    >
                                      <CheckCircle size={11}/> Shortlist
                                    </button>
                                    <button
                                      onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                                      className="text-[10px] uppercase tracking-wider font-bold bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-lg border-0 cursor-pointer flex items-center gap-1 transition-colors"
                                    >
                                      <XCircle size={11}/> Reject
                                    </button>
                                  </>
                                )}
                                {app.status === 'SHORTLISTED' && (
                                  <button
                                    onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                                    className="text-[10px] uppercase tracking-wider font-bold bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-lg border-0 cursor-pointer flex items-center gap-1 transition-colors"
                                  >
                                    <XCircle size={11}/> Reject
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface FormFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  type?: string
}

function FormField({ label, value, onChange, placeholder, type = 'text' }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{label}</label>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="input-field"
      />
    </div>
  )
}

