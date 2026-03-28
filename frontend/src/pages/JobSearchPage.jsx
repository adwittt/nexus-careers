import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, Search } from 'lucide-react'
import { searchJobs, getAllJobs } from '../services/api'
import JobCard from '../components/JobCard'

const JOB_TYPES = ['FULL_TIME', 'REMOTE', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']

/**
 * Job Search Page — matches Image 1 & 2 mockup:
 * Left filter sidebar | Right results list with pagination
 */
export default function JobSearchPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [jobs, setJobs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const perPage = 10

  // Filter state — seeded from URL params
  const [filters, setFilters] = useState({
    title:    searchParams.get('title')    || '',
    location: searchParams.get('location') || '',
    jobType:  searchParams.get('jobType')  || '',
    experience: '',
  })

  // Expanded filter sections
  const [expanded, setExpanded] = useState({
    title: true, location: true, experience: true, jobType: true
  })

  useEffect(() => { loadJobs() }, [])

  const loadJobs = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.title)      params.title      = filters.title
      if (filters.location)   params.location   = filters.location
      if (filters.jobType)    params.jobType    = filters.jobType
      if (filters.experience) params.experience = filters.experience

      const res = Object.keys(params).length
        ? await searchJobs(params)
        : await getAllJobs()

      const data = res.data || []
      setJobs(data)
      setTotal(data.length)
      setPage(1)
    } catch {
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (key) =>
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

  const toggleJobType = (type) =>
    setFilters(prev => ({ ...prev, jobType: prev.jobType === type ? '' : type }))

  const paginated = jobs.slice((page - 1) * perPage, page * perPage)
  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="min-h-screen bg-blue-700">
      <div className="max-w-6xl mx-auto px-4 py-6">

        <div className="flex gap-5">

          {/* ── Filter Sidebar ───────────────────────────────────────────── */}
          <aside className="w-56 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
                <SlidersHorizontal size={15} className="text-blue-600" />
                Filter by
              </h3>

              {/* Title filter */}
              <FilterSection
                label="Title" open={expanded.title}
                onToggle={() => toggleSection('title')}
              >
                <input
                  value={filters.title}
                  onChange={e => setFilters(p => ({ ...p, title: e.target.value }))}
                  placeholder="Title"
                  className="input-field text-xs py-2"
                />
              </FilterSection>

              {/* Location filter */}
              <FilterSection
                label="Location" open={expanded.location}
                onToggle={() => toggleSection('location')}
              >
                <input
                  value={filters.location}
                  onChange={e => setFilters(p => ({ ...p, location: e.target.value }))}
                  placeholder="Location"
                  className="input-field text-xs py-2"
                />
              </FilterSection>

              {/* Experience filter */}
              <FilterSection
                label="Experience" open={expanded.experience}
                onToggle={() => toggleSection('experience')}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{filters.experience || '0'} LPA</span>
                    <span>3–5 Years</span>
                  </div>
                  <input
                    type="range" min="0" max="20" step="1"
                    value={filters.experience || 0}
                    onChange={e => setFilters(p => ({ ...p, experience: e.target.value }))}
                    className="w-full accent-blue-600"
                  />
                </div>
              </FilterSection>

              {/* Job Type filter */}
              <FilterSection
                label="Job Type" open={expanded.jobType}
                onToggle={() => toggleSection('jobType')}
              >
                <div className="space-y-2">
                  {JOB_TYPES.map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.jobType === type}
                        onChange={() => toggleJobType(type)}
                        className="accent-blue-600 w-3.5 h-3.5"
                      />
                      <span className="text-xs text-gray-700">
                        {type === 'FULL_TIME' ? 'Full-time'
                          : type === 'PART_TIME' ? 'Part-time'
                          : type.charAt(0) + type.slice(1).toLowerCase()}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Apply / Clear */}
              <button
                onClick={loadJobs}
                className="btn-primary w-full text-xs py-2 mt-3"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  setFilters({ title: '', location: '', jobType: '', experience: '' })
                  getAllJobs().then(r => { setJobs(r.data || []); setTotal((r.data||[]).length) })
                }}
                className="w-full text-xs text-gray-500 hover:text-gray-700 mt-1.5 bg-transparent border-0 cursor-pointer py-1"
              >
                Clear all
              </button>
            </div>
          </aside>

          {/* ── Results Panel ────────────────────────────────────────────── */}
          <main className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-5">

              {/* Header row */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-gray-900 text-base">Search Results</h2>
                  {!loading && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <input type="checkbox" defaultChecked className="accent-blue-600 w-3 h-3" />
                      <span className="text-xs text-gray-500">{total} results</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-xs text-gray-500 hover:text-blue-600 bg-transparent border-0 cursor-pointer flex items-center gap-1">
                    Sort results <span className="text-gray-400">↓</span>
                  </button>
                </div>
              </div>

              {/* Job list */}
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-36 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : paginated.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Search size={36} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No jobs found. Try adjusting your filters.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paginated.map(job => (
                    <JobCard key={job.id} job={job} showApply />
                  ))}
                </div>
              )}

              {/* Pagination — matches mockup */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-6 pt-4 border-t border-gray-100">
                  <PagBtn label="‹" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} />
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                    <PagBtn key={p} label={p} onClick={() => setPage(p)} active={page===p} />
                  ))}
                  {totalPages > 5 && <span className="text-gray-400 text-sm">…</span>}
                  <PagBtn label="›" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function FilterSection({ label, open, onToggle, children }) {
  return (
    <div className="mb-4 border-b border-gray-100 pb-3">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-xs font-semibold text-gray-700 mb-2 bg-transparent border-0 cursor-pointer"
      >
        {label}
        <span className="text-gray-400">{open ? '∧' : '∨'}</span>
      </button>
      {open && children}
    </div>
  )
}

function PagBtn({ label, onClick, active, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-7 h-7 text-xs rounded flex items-center justify-center border transition-colors cursor-pointer
        ${active   ? 'bg-blue-700 text-white border-blue-700'
        : disabled ? 'text-gray-300 border-gray-200 cursor-not-allowed'
        :            'text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600 bg-white'}`}
    >
      {label}
    </button>
  )
}
