import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Upload, Bold, Italic, Underline, Link2, List, AlignLeft, Image, CheckCircle } from 'lucide-react'
import { getJobById, applyForJob, uploadResume } from '../services/api'

/**
 * Apply Job Page — matches Image 4 mockup:
 * "Apply for Job: Software Engineer at Google."
 * Upload Resume section + rich cover letter textarea + Submit + progress steps
 */
export default function ApplyJobPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [job, setJob]               = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeUrl, setResumeUrl]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]       = useState(false)
  const [error, setError]           = useState('')

  useEffect(() => {
    getJobById(id)
      .then(r => setJob(r.data))
      .catch(() => navigate('/jobs'))
  }, [id])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB')
      return
    }
    setResumeFile(file)
    setError('')
  }

  const handleSubmit = async () => {
    if (!resumeFile && !resumeUrl) {
      setError('Please upload your resume')
      return
    }
    if (!coverLetter.trim()) {
      setError('Please write a cover letter')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      let finalResumeUrl = resumeUrl
      if (resumeFile) {
        const uploadRes = await uploadResume(resumeFile)
        finalResumeUrl = uploadRes.data.url
      }
      
      await applyForJob({
        jobId:       Number(id),
        jobTitle:    job.title,
        companyName: job.companyName,
        resumeUrl:   finalResumeUrl,
        coverLetter: coverLetter,
      })
      setSuccess(true)
      setTimeout(() => navigate('/dashboard/seeker'), 2000)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit application'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (!job) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <div className="bg-white rounded-2xl shadow-sm p-10 text-center max-w-sm">
        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
        <p className="text-sm text-gray-500">
          Your application for <strong>{job.title}</strong> at <strong>{job.companyName}</strong> has been received.
        </p>
        <p className="text-xs text-gray-400 mt-3">Redirecting to your dashboard…</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* Title */}
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Apply for Job: <span className="text-blue-700">{job.title}</span> at{' '}
            <span className="text-blue-700">{job.companyName}.</span>
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}

          {/* Upload Resume */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Resume
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 bg-gray-50">
              <input
                type="file"
                id="resume-upload"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="resume-upload"
                className="btn-primary text-sm py-2 px-5 inline-flex items-center gap-2 cursor-pointer"
              >
                <Upload size={14} />
                Choose File
              </label>

              {resumeFile ? (
                <div className="flex items-center gap-2 mt-3">
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="text-xs text-gray-600 font-medium">{resumeFile.name}</span>
                  <span className="text-xs text-gray-400">
                    ({(resumeFile.size / 1024).toFixed(0)} KB)
                  </span>
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-2">
                  PDF, DOC, DOCX — max 5MB
                </p>
              )}
            </div>
          </div>

          {/* Cover Letter with toolbar (matches Image 4) */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cover Letter
            </label>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Formatting toolbar */}
              <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50">
                {[Bold, Italic, Underline, Link2].map((Icon, i) => (
                  <button key={i} type="button"
                    className="p-1.5 rounded hover:bg-gray-200 text-gray-500 bg-transparent border-0 cursor-pointer">
                    <Icon size={13} />
                  </button>
                ))}
                <div className="w-px h-4 bg-gray-300 mx-1" />
                {[List, AlignLeft, Image].map((Icon, i) => (
                  <button key={i} type="button"
                    className="p-1.5 rounded hover:bg-gray-200 text-gray-500 bg-transparent border-0 cursor-pointer">
                    <Icon size={13} />
                  </button>
                ))}
              </div>
              {/* Textarea */}
              <textarea
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                placeholder="Write your cover letter here..."
                rows={7}
                className="w-full px-4 py-3 text-sm text-gray-800 focus:outline-none resize-none"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5 text-right">
              {coverLetter.length} characters
            </p>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-green w-full py-3.5 text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting…
              </>
            ) : (
              'Submit Application'
            )}
          </button>
        </div>

        {/* Progress steps — "Applied | Review | Shortlisted" like Image 4 */}
        <div className="mt-6 flex items-center justify-center">
          <div className="flex items-center gap-0">
            {[
              { label: 'Applied',     active: true  },
              { label: 'Review',      active: false },
              { label: 'Shortlisted', active: false },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex items-center">
                {/* Step dot + label */}
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${step.active ? 'bg-blue-700' : 'bg-gray-300'}`} />
                  <span className={`text-xs mt-1 ${step.active ? 'text-blue-700 font-semibold' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
                {/* Connector line */}
                {i < arr.length - 1 && (
                  <div className="w-20 h-px bg-gray-200 mx-1 mb-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
