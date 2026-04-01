import { useState, useEffect, useMemo, ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, Search, Briefcase, TrendingUp } from 'lucide-react'
import { getAllJobs, getMyApplications } from '../services/api'
import JobCard from '../components/JobCard'

const JOB_TYPES = ['FULL_TIME', 'REMOTE', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']

// ── Predefined filter options ───────────────────────────────────────────────

const EXPERIENCE_OPTIONS = [
  { label: 'Any Experience', value: 0 },
  { label: '0 – Fresher',   value: 0.1 },
  { label: '1+ Year',       value: 1 },
  { label: '2+ Years',      value: 2 },
  { label: '3+ Years',      value: 3 },
  { label: '4+ Years',      value: 4 },
  { label: '5+ Years',      value: 5 },
  { label: '7+ Years',      value: 7 },
  { label: '10+ Years',     value: 10 },
]

const SALARY_OPTIONS = [
  { label: 'Any Salary',  value: 0 },
  { label: '₹3 LPA+',    value: 3 },
  { label: '₹5 LPA+',    value: 5 },
  { label: '₹8 LPA+',    value: 8 },
  { label: '₹10 LPA+',   value: 10 },
  { label: '₹15 LPA+',   value: 15 },
  { label: '₹20 LPA+',   value: 20 },
  { label: '₹30 LPA+',   value: 30 },
  { label: '₹50 LPA+',   value: 50 },
  { label: '₹1 Cr+',     value: 100 },
]

// ── Helpers: extract numeric values from freeform strings ───────────────────

/**
 * Parse experience string → number of years.
 * Handles: "5+ years", "01", "2", "3-5 years", "Junior", "Senior", "Fresher"
 */
function parseExperienceYears(raw: string | null | undefined): number {
  if (!raw) return 0
  const s = raw.toString().trim().toLowerCase()

  // Keywords
  if (s.includes('fresher') || s.includes('entry') || s === '0') return 0

  // Extract first number (handles "5+ years", "3-5 years", "01", "2")
  const match = s.match(/(\d+\.?\d*)/)
  if (match) return parseFloat(match[1])

  // Keyword-based fallback
  if (s.includes('senior') || s.includes('lead')) return 5
  if (s.includes('mid') || s.includes('intermediate')) return 3
  if (s.includes('junior')) return 1

  return 0
}

/**
 * Parse salary string → number in LPA (lakhs per annum).
 * Handles: "15 lpa", "120k", "1cr", "150k", "₹50,000/month", "15", "5-10 LPA"
 */
function parseSalaryLPA(raw: string | null | undefined): number {
  if (!raw) return 0
  const s = raw.toString().trim().toLowerCase().replace(/,/g, '').replace(/₹/g, '')

  // Extract first number
  const match = s.match(/(\d+\.?\d*)/)
  if (!match) return 0

  let num = parseFloat(match[1])

  // Determine unit multiplier
  if (s.includes('cr') || s.includes('crore')) {
    num = num * 100  // 1 cr = 100 LPA
  } else if (s.includes('lpa') || s.includes('lakh') || s.includes('lac')) {
    // already in LPA
  } else if (s.includes('k')) {
    // "120k" means 1,20,000 = 1.2 LPA (annual)
    num = num * 1000 / 100000   // k = thousands → LPA
  } else if (s.includes('month') || s.includes('pm') || s.includes('/m')) {
    // monthly salary → annual LPA
    num = (num * 12) / 100000
  } else {
    // Bare number: if small (< 200), assume LPA. If large, assume raw annual.
    if (num >= 1000) {
      num = num / 100000  // raw annual → LPA
    }
    // else treat as LPA already
  }

  return num
}

// ── Main Component ──────────────────────────────────────────────────────────

interface FilterState {
  title: string
  location: string
  jobType: string
  minExperience: number
  minSalary: number
}

export default function JobSearchPage() {
  const [searchParams] = useSearchParams()

  const [allJobs, setAllJobs]     = useState<any[]>([])
  const [userApps, setUserApps]   = useState<Record<string, any>>({})
  const [loading, setLoading]     = useState(true)
  const [page, setPage]           = useState(1)
  const perPage = 10

  const user = JSON.parse(localStorage.getItem('nexus_user') || '{}')
  const isSeeker = user?.role === 'JOB_SEEKER'

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    title:         searchParams.get('title')    || '',
    location:      searchParams.get('location') || '',
    jobType:       searchParams.get('jobType')  || '',
    minExperience: 0,
    minSalary:     0,
  })

  // Expanded filter sections
  const [expanded, setExpanded] = useState({
    title: true, location: true, experience: true, salary: true, jobType: true
  })

  useEffect(() => { loadJobs() }, [])

  const loadJobs = async () => {
    setLoading(true)
    try {
      if (isSeeker) {
        try {
          const appRes = await getMyApplications()
          const appMap: Record<string, any> = {}
          appRes.data?.forEach((app: any) => { appMap[app.jobId] = app })
          setUserApps(appMap)
        } catch (e) {
          console.error("Failed to fetch applications:", e)
        }
      }

      const res = await getAllJobs()
      setAllJobs(res.data || [])
      setPage(1)
    } catch {
      setAllJobs([])
    } finally {
      setLoading(false)
    }
  }

  // ── Smart client-side filtering ─────────────────────────────────────────
  const filteredJobs = useMemo(() => {
    return allJobs.filter((job: any) => {
      // Title filter (text match)
      if (filters.title) {
        const titleMatch = job.title?.toLowerCase().includes(filters.title.toLowerCase())
        if (!titleMatch) return false
      }

      // Location filter (text match)
      if (filters.location) {
        const locMatch = job.location?.toLowerCase().includes(filters.location.toLowerCase())
        if (!locMatch) return false
      }

      // Job type filter
      if (filters.jobType) {
        if (job.jobType !== filters.jobType) return false
      }

      // Experience filter: show jobs where required experience >= user's selected minimum
      // Logic: if user selects "4+ years", show jobs requiring 4+ years of experience
      // Also show jobs with no experience listed (they might be open to all)
      if (filters.minExperience > 0) {
        const jobExp = parseExperienceYears(job.experience)
        // If job has no experience field, be inclusive and show it
        if (job.experience && jobExp < filters.minExperience) return false
      }

      // Salary filter: show jobs where salary >= user's selected minimum
      // Logic: if user selects "₹10 LPA+", show jobs paying 10 LPA or more
      if (filters.minSalary > 0) {
        const jobSalary = parseSalaryLPA(job.salary)
        // If job has no salary listed, be inclusive
        if (job.salary && jobSalary < filters.minSalary) return false
      }

      return true
    })
  }, [allJobs, filters])

  const total = filteredJobs.length
  const paginated = filteredJobs.slice((page - 1) * perPage, page * perPage)
  const totalPages = Math.ceil(total / perPage)

  const toggleSection = (key: string) =>
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

  const toggleJobType = (type: string) =>
    setFilters(prev => ({ ...prev, jobType: prev.jobType === type ? '' : type }))

  const clearFilters = () => {
    setFilters({ title: '', location: '', jobType: '', minExperience: 0, minSalary: 0 })
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-blue-700 dark:bg-slate-900 transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-6">

        <div className="flex gap-5">

          {/* ── Filter Sidebar ───────────────────────────────────────────── */}
          <aside className="w-56 flex-shrink-0">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-transparent dark:border-slate-700">
              <h3 className="font-bold text-gray-800 dark:text-white text-sm mb-4 flex items-center gap-2">
                <SlidersHorizontal size={15} className="text-blue-600 dark:text-blue-400" />
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
                  placeholder="Search by title..."
                  className="input-field text-xs py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
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
                  placeholder="Search by location..."
                  className="input-field text-xs py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </FilterSection>

              {/* Salary filter — dropdown with >= logic */}
              <FilterSection
                label={<span className="flex items-center gap-1.5"><TrendingUp size={11} className="text-green-500" /> Min. Salary</span>}
                open={expanded.salary}
                onToggle={() => toggleSection('salary')}
              >
                <select
                  value={filters.minSalary}
                  onChange={e => {
                    setFilters(p => ({ ...p, minSalary: parseFloat(e.target.value) }))
                    setPage(1)
                  }}
                  className="input-field text-xs py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white cursor-pointer"
                >
                  {SALARY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {filters.minSalary > 0 && (
                  <p className="text-[10px] text-green-600 dark:text-green-400 mt-1.5 flex items-center gap-1">
                    ✓ Showing jobs paying ≥ ₹{filters.minSalary} LPA
                  </p>
                )}
              </FilterSection>

              {/* Experience filter — dropdown with >= logic */}
              <FilterSection
                label={<span className="flex items-center gap-1.5"><Briefcase size={11} className="text-orange-500" /> Min. Experience</span>}
                open={expanded.experience}
                onToggle={() => toggleSection('experience')}
              >
                <select
                  value={filters.minExperience}
                  onChange={e => {
                    setFilters(p => ({ ...p, minExperience: parseFloat(e.target.value) }))
                    setPage(1)
                  }}
                  className="input-field text-xs py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white cursor-pointer"
                >
                  {EXPERIENCE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {filters.minExperience > 0 && (
                  <p className="text-[10px] text-orange-600 dark:text-orange-400 mt-1.5 flex items-center gap-1">
                    ✓ Showing jobs requiring ≥ {filters.minExperience} year{filters.minExperience !== 1 ? 's' : ''}
                  </p>
                )}
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
                        onChange={() => { toggleJobType(type); setPage(1) }}
                        className="accent-blue-600 w-3.5 h-3.5"
                      />
                      <span className="text-xs text-gray-700 dark:text-slate-300 transition-colors">
                        {type === 'FULL_TIME' ? 'Full-time'
                          : type === 'PART_TIME' ? 'Part-time'
                          : type.charAt(0) + type.slice(1).toLowerCase()}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Clear */}
              <button
                onClick={clearFilters}
                className="w-full text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 mt-1.5 bg-transparent border-0 cursor-pointer py-1 transition-colors"
              >
                Clear all
              </button>
            </div>
          </aside>

          {/* ── Results Panel ────────────────────────────────────────────── */}
          <main className="flex-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 border border-transparent dark:border-slate-700">

              {/* Header row */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white text-base">Search Results</h2>
                  {!loading && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <input type="checkbox" defaultChecked className="accent-blue-600 w-3 h-3" />
                      <span className="text-xs text-gray-500 dark:text-slate-400">{total} results</span>
                      {(filters.minExperience > 0 || filters.minSalary > 0) && (
                        <span className="text-xs text-blue-500 dark:text-blue-400 ml-1">
                          (filtered from {allJobs.length})
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-xs text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-transparent border-0 cursor-pointer flex items-center gap-1 transition-colors">
                    Sort results <span className="text-gray-400">↓</span>
                  </button>
                </div>
              </div>

              {/* Job list */}
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-36 bg-gray-100 dark:bg-slate-700 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : paginated.length === 0 ? (
                <div className="text-center py-16 text-gray-400 dark:text-slate-500">
                  <Search size={36} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No jobs found. Try adjusting your filters.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paginated.map((job: any) => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      application={userApps[job.id]} 
                      onWithdraw={() => loadJobs()}
                      showApply 
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-6 pt-4 border-t border-gray-100">
                  <PagBtn label="‹" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} />
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                    <PagBtn key={p} label={String(p)} onClick={() => setPage(p)} active={page===p} />
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

interface FilterSectionProps {
  label: ReactNode
  open: boolean
  onToggle: () => void
  children: ReactNode
}

function FilterSection({ label, open, onToggle, children }: FilterSectionProps) {
  return (
    <div className="mb-4 border-b border-gray-100 dark:border-slate-700/50 pb-3">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2 bg-transparent border-0 cursor-pointer transition-colors"
      >
        {label}
        <span className="text-gray-400 dark:text-slate-500">{open ? '∧' : '∨'}</span>
      </button>
      {open && children}
    </div>
  )
}

interface PagBtnProps {
  label: string
  onClick: () => void
  active?: boolean
  disabled?: boolean
}

function PagBtn({ label, onClick, active, disabled }: PagBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-7 h-7 text-xs rounded flex items-center justify-center border transition-colors cursor-pointer
        ${active   ? 'bg-blue-700 text-white border-blue-700 shadow-md'
        : disabled ? 'text-gray-300 dark:text-slate-600 border-gray-200 dark:border-slate-700 cursor-not-allowed'
        :            'text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-800 shadow-sm'}`}
    >
      {label}
    </button>
  )
}
