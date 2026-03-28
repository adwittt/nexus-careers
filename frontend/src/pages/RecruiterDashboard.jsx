import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Briefcase, Users, Eye, Trash2, Edit,
  ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, MapPin
} from 'lucide-react'
import {
  getRecruiterJobs, createJob, deleteJob,
  getJobApplications, updateApplicationStatus
} from '../services/api'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'

const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'REMOTE', 'CONTRACT', 'INTERNSHIP']

const EMPTY_FORM = {
  title: '', companyName: '', location: '', salary: '',
  experience: '', description: '', requiredSkills: '',
  jobType: 'FULL_TIME'
}

/**
 * Recruiter Dashboard — Post jobs, view applicants, update application status.
 */
export default function RecruiterDashboard() {
  const { user }               = useAuth()
  const navigate               = useNavigate()
  const [jobs, setJobs]        = useState([])
  const [loading, setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]        = useState(EMPTY_FORM)
  const [saving, setSaving]    = useState(false)
  const [formError, setFormError] = useState('')

  // Applicants drawer
  const [selectedJob, setSelectedJob]     = useState(null)
  const [applicants, setApplicants]       = useState([])
  const [loadingApps, setLoadingApps]     = useState(false)
  const [expandedJob, setExpandedJob]     = useState(null)

  useEffect(() => { loadJobs() }, [])

  const loadJobs = async () => {
    setLoading(true)
    try {
      const res = await getRecruiterJobs(user.userId)
      setJobs(res.data || [])
    } catch { setJobs([]) }
    finally { setLoading(false) }
  }

  const handleCreateJob = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.title || !form.companyName || !form.location) {
      setFormError('Title, Company and Location are required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        requiredSkills: form.requiredSkills
          ? form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
          : []
      }
      await createJob(payload)
      setForm(EMPTY_FORM)
      setShowForm(false)
      await loadJobs()
    } catch (e) {
      setFormError(e.response?.data?.message || 'Failed to create job')
    } finally { setSaving(false) }
  }

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Remove this job listing?')) return
    try {
      await deleteJob(jobId)
      setJobs(prev => prev.filter(j => j.id !== jobId))
    } catch (e) {
      alert(e.response?.data?.message || 'Could not delete job')
    }
  }

  const toggleApplicants = async (job) => {
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

  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus)
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a))
    } catch (e) {
      alert(e.response?.data?.message || 'Could not update status')
    }
  }

  const totalApps = jobs.reduce((sum, j) => sum + (j.applicationCount || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-blue-700 text-white px-4 py-8">
        <div className="max-w-6xl mx-auto flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Recruiter Dashboard</h1>
            <p className="text-blue-200 mt-1 text-sm">Welcome, {user?.name} — manage your job listings</p>
          </div>
          <button
            onClick={() => setShowForm(f => !f)}
            className="flex items-center gap-2 bg-white text-blue-700 font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-blue-50 transition-colors border-0 cursor-pointer"
          >
            <Plus size={16} />
            Post New Job
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-500">Active Jobs</p>
            <p className="text-3xl font-extrabold text-blue-700 mt-1">{jobs.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-500">Total Applicants</p>
            <p className="text-3xl font-extrabold text-green-600 mt-1">{applicants.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-500">Shortlisted</p>
            <p className="text-3xl font-extrabold text-orange-500 mt-1">
              {applicants.filter(a => a.status === 'SHORTLISTED').length}
            </p>
          </div>
        </div>

        {/* ── Post Job Form ────────────────────────────────────────────── */}
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
              <Plus size={16} className="text-blue-600" /> Post a New Job
            </h2>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateJob}>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Job Title *" value={form.title}
                  onChange={v => setForm(p => ({ ...p, title: v }))} placeholder="e.g. Software Engineer" />
                <FormField label="Company Name *" value={form.companyName}
                  onChange={v => setForm(p => ({ ...p, companyName: v }))} placeholder="e.g. Google" />
                <FormField label="Location *" value={form.location}
                  onChange={v => setForm(p => ({ ...p, location: v }))} placeholder="e.g. Bangalore" />
                <FormField label="Salary" value={form.salary}
                  onChange={v => setForm(p => ({ ...p, salary: v }))} placeholder="e.g. 15 LPA or 41-55 LPA" />
                <FormField label="Experience" value={form.experience}
                  onChange={v => setForm(p => ({ ...p, experience: v }))} placeholder="e.g. 3-5 Years" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                  <select
                    value={form.jobType}
                    onChange={e => setForm(p => ({ ...p, jobType: e.target.value }))}
                    className="input-field"
                  >
                    {JOB_TYPES.map(t => (
                      <option key={t} value={t}>
                        {t === 'FULL_TIME' ? 'Full-time' : t === 'PART_TIME' ? 'Part-time' : t.charAt(0) + t.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills (comma separated)</label>
                  <input
                    value={form.requiredSkills}
                    onChange={e => setForm(p => ({ ...p, requiredSkills: e.target.value }))}
                    placeholder="Java, Spring Boot, Microservices"
                    className="input-field"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
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
                <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
                  {saving ? 'Posting…' : 'Post Job'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFormError('') }}
                  className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Job Listings ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Briefcase size={16} className="text-blue-600" />
              Your Job Listings
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                {jobs.length}
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Briefcase size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No jobs posted yet</p>
              <button onClick={() => setShowForm(true)} className="btn-primary text-sm mt-4 px-6">
                Post Your First Job
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {jobs.map(job => (
                <div key={job.id}>
                  {/* Job row */}
                  <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 text-sm">{job.title}</h3>
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            {job.jobType?.replace('_','-')}
                          </span>
                          {job.isActive === false && (
                            <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">Closed</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>{job.companyName}</span>
                          <span className="flex items-center gap-0.5"><MapPin size={11}/> {job.location}</span>
                          <span>{job.salary}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—'}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => navigate(`/jobs/${job.id}`)}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline bg-transparent border-0 cursor-pointer"
                        >
                          <Eye size={13}/> View
                        </button>
                        <button
                          onClick={() => toggleApplicants(job)}
                          className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg border-0 cursor-pointer transition-colors"
                        >
                          <Users size={13}/> Applicants
                          {expandedJob === job.id ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer"
                        >
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Applicants drawer */}
                  {expandedJob === job.id && (
                    <div className="bg-blue-50 border-t border-blue-100 px-6 py-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Users size={14} className="text-blue-600"/>
                        Applicants for "{job.title}"
                        <span className="text-xs bg-blue-200 text-blue-700 px-1.5 py-0.5 rounded-full">
                          {loadingApps ? '…' : applicants.length}
                        </span>
                      </h4>

                      {loadingApps ? (
                        <div className="space-y-2">
                          {[1,2].map(i => <div key={i} className="h-14 bg-blue-100 rounded-lg animate-pulse"/>)}
                        </div>
                      ) : applicants.length === 0 ? (
                        <p className="text-xs text-gray-400 py-4 text-center">No applicants yet</p>
                      ) : (
                        <div className="space-y-2">
                          {applicants.map(app => (
                            <div key={app.id} className="bg-white rounded-lg px-4 py-3 flex items-center justify-between gap-3 shadow-sm">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800">{app.applicantName}</p>
                                <p className="text-xs text-gray-500">{app.applicantEmail}</p>
                                {app.coverLetter && (
                                  <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                                    "{app.coverLetter}"
                                  </p>
                                )}
                                {app.resumeUrl && (
                                  <a
                                    href={app.resumeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline mt-1 inline-flex items-center gap-1 font-medium"
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
                                    className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-2.5 py-1.5 rounded-lg border-0 cursor-pointer flex items-center gap-1"
                                  >
                                    <Clock size={11}/> Review
                                  </button>
                                )}
                                {app.status === 'UNDER_REVIEW' && (
                                  <>
                                    <button
                                      onClick={() => handleStatusUpdate(app.id, 'SHORTLISTED')}
                                      className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2.5 py-1.5 rounded-lg border-0 cursor-pointer flex items-center gap-1"
                                    >
                                      <CheckCircle size={11}/> Shortlist
                                    </button>
                                    <button
                                      onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                                      className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2.5 py-1.5 rounded-lg border-0 cursor-pointer flex items-center gap-1"
                                    >
                                      <XCircle size={11}/> Reject
                                    </button>
                                  </>
                                )}
                                {app.status === 'SHORTLISTED' && (
                                  <button
                                    onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                                    className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2.5 py-1.5 rounded-lg border-0 cursor-pointer flex items-center gap-1"
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

function FormField({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="input-field"
      />
    </div>
  )
}
