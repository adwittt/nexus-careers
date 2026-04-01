import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Upload, Bold, Italic, Underline, Link2, List, AlignLeft, Image, CheckCircle, ChevronLeft } from 'lucide-react'
import { getJobById, applyForJob, uploadResume } from '../services/api'

/**
 * Apply Job Page — with Dark Mode and premium UI.
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
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (success) return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col items-center justify-center gap-4 transition-colors">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-12 text-center max-w-md border border-gray-100 dark:border-slate-700 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Application Submitted!</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Your application for <span className="font-bold text-gray-800 dark:text-slate-200">{job.title}</span> at <span className="font-bold text-gray-800 dark:text-slate-200">{job.companyName}</span> has been received.
        </p>
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700">
          <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 dark:text-slate-500 animate-pulse">Redirecting to project dashboard…</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 transition-colors">
      <div className="max-w-2xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(`/jobs/${id}`)}
          className="mb-6 flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-transparent border-0 cursor-pointer font-bold text-xs uppercase tracking-widest"
        >
          <ChevronLeft size={16} /> Back to Job Details
        </button>

        {/* Main card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 p-8 sm:p-10 transition-all">

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
              Apply for Job: <span className="text-blue-600 dark:text-blue-400">{job.title}</span>
            </h1>
            <p className="text-gray-500 dark:text-slate-400 font-bold mt-1 uppercase tracking-wider text-[11px]">at {job.companyName}</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs font-bold px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
               {error}
            </div>
          )}

          {/* Upload Resume */}
          <div className="mb-8">
            <label className="block text-xs font-black text-gray-700 dark:text-slate-300 uppercase tracking-widest mb-3">
              Upload Resume *
            </label>
            <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              resumeFile 
                ? 'border-green-500/50 bg-green-50/10 dark:bg-green-900/5' 
                : 'border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/20 hover:border-blue-400 dark:hover:border-blue-500'
            }`}>
              <input
                type="file"
                id="resume-upload"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {!resumeFile ? (
                <label
                  htmlFor="resume-upload"
                  className="flex flex-col items-center gap-3 cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <Upload size={20} />
                  </div>
                  <div>
                    <span className="text-blue-600 dark:text-blue-400 font-black text-sm">Choose a file</span>
                    <span className="text-gray-400 dark:text-slate-500 text-xs ml-1">or drag it here</span>
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold tracking-tighter">
                    PDF, DOC, DOCX — Max limit 5MB
                  </p>
                </label>
              ) : (
                <div className="flex flex-col items-center gap-2 animate-in slide-in-from-bottom-2">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                    <CheckCircle size={20} />
                  </div>
                  <div className="font-bold text-gray-900 dark:text-white text-sm truncate max-w-full px-4">{resumeFile.name}</div>
                  <button 
                    onClick={() => setResumeFile(null)}
                    className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-2 hover:underline bg-transparent border-0 cursor-pointer"
                  >
                    Change File
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Cover Letter with toolbar (matches Image 4) */}
          <div className="mb-8">
            <label className="block text-xs font-black text-gray-700 dark:text-slate-300 uppercase tracking-widest mb-3">
              Cover Letter *
            </label>
            <div className="border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
              {/* Formatting toolbar */}
              <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/30">
                {[Bold, Italic, Underline, Link2].map((Icon, i) => (
                  <button key={i} type="button"
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 bg-transparent border-0 cursor-pointer transition-all">
                    <Icon size={14} />
                  </button>
                ))}
                <div className="w-px h-4 bg-gray-200 dark:bg-slate-700 mx-1" />
                {[List, AlignLeft, Image].map((Icon, i) => (
                  <button key={i} type="button"
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 bg-transparent border-0 cursor-pointer transition-all">
                    <Icon size={14} />
                  </button>
                ))}
              </div>
              {/* Textarea */}
              <textarea
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                placeholder="Why are you a great fit for this role? Tell us about your journey..."
                rows={8}
                className="w-full px-5 py-4 text-sm text-gray-800 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-none resize-none leading-relaxed placeholder:text-gray-300 dark:placeholder:text-slate-600"
              />
            </div>
            <div className="flex justify-between items-center mt-2.5 px-1">
               <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase">Tips: Be concise and highlight results.</span>
               <span className="text-[10px] text-gray-400 dark:text-slate-500 font-black uppercase tabular-nums">
                {coverLetter.length} chars
              </span>
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-4 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-green-500/20 disabled:opacity-50 flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] border-0 cursor-pointer"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing…
              </>
            ) : (
              'Submit Application'
            )}
          </button>
        </div>

        {/* Progress steps — "Applied | Review | Shortlisted" like Image 4 */}
        <div className="mt-10 mb-6 flex flex-col items-center gap-4">
           <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Application Progress Path</p>
           <div className="flex items-center gap-0">
            {[
              { label: 'Applied',     active: true  },
              { label: 'Review',      active: false },
              { label: 'Shortlisted', active: false },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex items-center">
                {/* Step dot + label */}
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full border-4 transition-all duration-500 ${
                    step.active 
                      ? 'bg-blue-600 border-blue-100 dark:border-blue-900/30 shadow-[0_0_10px_rgba(37,99,235,0.4)]' 
                      : 'bg-gray-200 dark:bg-slate-800 border-transparent dark:border-slate-700'
                  }`} />
                  <span className={`text-[10px] mt-2 uppercase font-black tracking-tight ${step.active ? 'text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-400 dark:text-slate-600'}`}>
                    {step.label}
                  </span>
                </div>
                {/* Connector line */}
                {i < arr.length - 1 && (
                  <div className="w-16 sm:w-24 h-0.5 bg-gray-200 dark:bg-slate-700 mx-1 mb-6" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
