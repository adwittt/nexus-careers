import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, ArrowRight, Briefcase, Users, TrendingUp } from 'lucide-react'
import { getAllJobs } from '../services/api'
import JobCard from '../components/JobCard'

const COMPANY_COLORS = {
  Google:    { bg: '#4285F4', letter: 'G' },
  Amazon:    { bg: '#FF9900', letter: 'A' },
  Microsoft: { bg: '#00A4EF', letter: 'M' },
  Meta:      { bg: '#1877F2', letter: 'F' },
}

/**
 * Landing page — matches mockup Image 5:
 * Hero with search bar + Featured Jobs grid with Browse All button
 */
export default function HomePage() {
  const [title, setTitle]         = useState('')
  const [location, setLocation]   = useState('')
  const [featuredJobs, setFeaturedJobs] = useState([])
  const [loading, setLoading]     = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getAllJobs()
      .then(r => setFeaturedJobs((r.data || []).slice(0, 3)))
      .catch(() => setFeaturedJobs([]))
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (title)    params.set('title', title)
    if (location) params.set('location', location)
    navigate(`/jobs?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-blue-700 dark:bg-slate-900 transition-colors">

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <div className="px-4 pt-16 pb-12 text-center bg-blue-700 dark:bg-slate-900">
        <h1 className="text-white dark:text-slate-100 text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
          Find Your Dream Job Today
        </h1>
        <p className="text-blue-200 dark:text-slate-400 text-base mb-10">
          Thousands of jobs from top companies. One search away.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch}
          className="flex flex-col sm:flex-row items-center gap-2 max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-xl p-2 shadow-xl border border-transparent dark:border-slate-700"
        >
          <div className="flex items-center gap-2 flex-1 px-3 w-full">
            <Search size={16} className="text-gray-400" />
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Job Title or Skill"
              className="w-full text-sm text-gray-800 dark:text-slate-100 focus:outline-none bg-transparent"
            />
          </div>

          <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 hidden sm:block" />

          <div className="flex items-center gap-2 flex-1 px-3 w-full">
            <MapPin size={16} className="text-gray-400" />
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Location"
              className="w-full text-sm text-gray-800 dark:text-slate-100 focus:outline-none bg-transparent"
            />
          </div>

          <button type="submit" className="btn-primary w-full sm:w-auto px-6 py-2.5 text-sm rounded-lg flex-shrink-0">
            Search
          </button>
        </form>

        {/* Quick stats */}
        <div className="flex items-center justify-center gap-8 mt-10 text-blue-200 dark:text-slate-400 text-sm">
          <span className="flex items-center gap-1.5"><Briefcase size={14}/> 10,000+ Jobs</span>
          <span className="flex items-center gap-1.5"><Users size={14}/> 5,000+ Companies</span>
          <span className="flex items-center gap-1.5"><TrendingUp size={14}/> 50,000+ Hires</span>
        </div>
      </div>

      {/* ── Featured Jobs ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-t-3xl px-4 sm:px-8 pt-8 pb-16 min-h-96 border-t border-gray-100 dark:border-slate-700/50">
        <div className="max-w-5xl mx-auto">

          {/* Header row */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Featured Jobs</h2>
            <button
              onClick={() => navigate('/jobs')}
              className="btn-green text-sm py-2 px-4 flex items-center gap-1.5"
            >
              Browse All Jobs
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Job grid — 3 columns like mockup */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="bg-gray-100 dark:bg-slate-700 rounded-xl h-40 animate-pulse" />
              ))}
            </div>
          ) : featuredJobs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Briefcase size={40} className="mx-auto mb-3 opacity-50" />
              <p>No jobs yet. <button onClick={() => navigate('/register')} className="text-blue-600 underline bg-transparent border-0 cursor-pointer">Post the first one!</button></p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredJobs.map(job => {
                const co = COMPANY_COLORS[job.companyName]
                return (
                  <div
                    key={job.id}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="border border-gray-100 dark:border-slate-700 rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900 transition-all bg-white dark:bg-slate-800"
                  >
                    {/* Top row: logo + checkbox (matching mockup) */}
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base"
                        style={{ background: co?.bg || '#6b7280' }}
                      >
                        {co?.letter || job.companyName?.[0] || '?'}
                      </div>
                      <div className="w-5 h-5 rounded border-2 border-blue-500 bg-blue-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">{job.title}</h3>
                    <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">{job.companyName}</p>
                    <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                      <MapPin size={10} /> {job.location}
                    </p>
                    <p className="text-gray-500 dark:text-slate-400 text-xs mt-1">
                      Salary - {job.salary}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
