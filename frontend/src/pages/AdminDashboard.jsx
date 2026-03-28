import { useState, useEffect } from 'react'
import { Users, Briefcase, FileText, TrendingUp, ToggleLeft, ToggleRight, Search, Shield } from 'lucide-react'
import { getAdminUsers, getAdminJobs, getAdminReports, toggleUserStatus } from '../services/api'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'

const TABS = ['Overview', 'Users', 'Jobs', 'Reports']

/**
 * Admin Dashboard — full platform management:
 * Overview stats | User management | Job monitoring | Analytics reports
 */
export default function AdminDashboard() {
  const { user }            = useAuth()
  const [tab, setTab]       = useState('Overview')
  const [users, setUsers]   = useState([])
  const [jobs, setJobs]     = useState([])
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [jobSearch, setJobSearch]   = useState('')
  const [togglingUser, setTogglingUser] = useState(null)

  useEffect(() => { loadData() }, [tab])

  const loadData = async () => {
    setLoading(true)
    try {
      if (tab === 'Overview' || tab === 'Reports') {
        const r = await getAdminReports()
        setReport(r.data)
      }
      if (tab === 'Users') {
        const r = await getAdminUsers()
        setUsers(r.data || [])
      }
      if (tab === 'Jobs') {
        const r = await getAdminJobs()
        setJobs(r.data || [])
      }
    } catch {
      // Services may not be up — show empty state
    } finally { setLoading(false) }
  }

  const handleToggleUser = async (userId) => {
    setTogglingUser(userId)
    try {
      await toggleUserStatus(userId)
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, active: !u.active } : u
      ))
    } catch (e) {
      alert(e.response?.data?.message || 'Could not toggle user')
    } finally { setTogglingUser(null) }
  }

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role?.toLowerCase().includes(userSearch.toLowerCase())
  )

  const filteredJobs = jobs.filter(j =>
    j.title?.toLowerCase().includes(jobSearch.toLowerCase()) ||
    j.companyName?.toLowerCase().includes(jobSearch.toLowerCase()) ||
    j.location?.toLowerCase().includes(jobSearch.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-blue-700 text-white px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <Shield size={22} />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-blue-200 text-sm">Full platform control — {user?.name}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── Tabs ────────────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-100 shadow-sm p-1.5 mb-6 w-fit">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all border-0 cursor-pointer ${
                tab === t
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 bg-transparent'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ─────────────────────────────────────────────── */}
        {tab === 'Overview' && (
          <div>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse"/>)}
              </div>
            ) : (
              <>
                {/* Stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <OverviewCard
                    icon={<Users size={22} className="text-blue-600"/>}
                    label="Total Users" value={report?.totalUsers ?? '—'}
                    sub={`${report?.jobSeekers ?? 0} seekers · ${report?.recruiters ?? 0} recruiters`}
                    bg="bg-blue-50"
                  />
                  <OverviewCard
                    icon={<Briefcase size={22} className="text-green-600"/>}
                    label="Active Jobs" value={report?.activeJobs ?? '—'}
                    sub={`${report?.totalJobs ?? 0} total posted`}
                    bg="bg-green-50"
                  />
                  <OverviewCard
                    icon={<FileText size={22} className="text-orange-500"/>}
                    label="Applications" value={report?.applications?.total ?? '—'}
                    sub="across all jobs"
                    bg="bg-orange-50"
                  />
                  <OverviewCard
                    icon={<TrendingUp size={22} className="text-purple-600"/>}
                    label="Shortlisted" value={report?.applications?.shortlisted ?? '—'}
                    sub="candidates progressing"
                    bg="bg-purple-50"
                  />
                </div>

                {/* Application breakdown */}
                {report?.applications && (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h2 className="font-bold text-gray-800 mb-5">Application Status Breakdown</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: 'Applied',      key: 'applied',     color: 'bg-blue-500'   },
                        { label: 'Under Review', key: 'underReview', color: 'bg-yellow-400' },
                        { label: 'Shortlisted',  key: 'shortlisted', color: 'bg-green-500'  },
                        { label: 'Rejected',     key: 'rejected',    color: 'bg-red-400'    },
                      ].map(({ label, key, color }) => {
                        const val   = report.applications[key] || 0
                        const total = report.applications.total || 1
                        const pct   = Math.round((val / total) * 100)
                        return (
                          <div key={key}>
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>{label}</span>
                              <span className="font-bold">{val}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`${color} h-full rounded-full`} style={{ width: `${pct}%` }}/>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5 text-right">{pct}%</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Users Tab ─────────────────────────────────────────────────── */}
        {tab === 'Users' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Users size={16} className="text-blue-600"/>
                All Users
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{filteredUsers.length}</span>
              </h2>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search users…"
                  className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse"/>)}
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="text-center py-12 text-gray-400 text-sm">No users found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{u.name}</div>
                          <div className="text-xs text-gray-400">{u.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <RoleBadge role={u.role}/>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs">{u.phone || '—'}</td>
                        <td className="px-6 py-4 text-gray-400 text-xs">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric'}) : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            u.active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {u.active !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleUser(u.id)}
                            disabled={togglingUser === u.id || u.role === 'ADMIN'}
                            className="flex items-center gap-1.5 text-xs border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors bg-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {u.active !== false
                              ? <><ToggleRight size={14} className="text-green-500"/> Deactivate</>
                              : <><ToggleLeft size={14} className="text-gray-400"/> Activate</>
                            }
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Jobs Tab ──────────────────────────────────────────────────── */}
        {tab === 'Jobs' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Briefcase size={16} className="text-blue-600"/>
                All Job Listings
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{filteredJobs.length}</span>
              </h2>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input
                  value={jobSearch}
                  onChange={e => setJobSearch(e.target.value)}
                  placeholder="Search jobs…"
                  className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"/>)}
              </div>
            ) : filteredJobs.length === 0 ? (
              <p className="text-center py-12 text-gray-400 text-sm">No jobs found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Job</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Salary</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Posted</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredJobs.map(j => (
                      <tr key={j.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{j.title}</div>
                          <div className="text-xs text-gray-400">{j.companyName}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-xs">{j.location}</td>
                        <td className="px-6 py-4 text-gray-600 text-xs">{j.salary || '—'}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            {j.jobType?.replace('_','-') || 'Full-time'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-xs">
                          {j.createdAt ? new Date(j.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric'}) : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            j.active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {j.active !== false ? 'Active' : 'Closed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Reports Tab ───────────────────────────────────────────────── */}
        {tab === 'Reports' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ReportCard title="Platform Health" items={[
                { label: 'Total Users',    value: report?.totalUsers   ?? '—' },
                { label: 'Job Seekers',    value: report?.jobSeekers   ?? '—' },
                { label: 'Recruiters',     value: report?.recruiters   ?? '—' },
              ]} color="blue"/>
              <ReportCard title="Job Listings" items={[
                { label: 'Total Posted',   value: report?.totalJobs    ?? '—' },
                { label: 'Active',         value: report?.activeJobs   ?? '—' },
                { label: 'Closed',         value: ((report?.totalJobs||0) - (report?.activeJobs||0)) || '—' },
              ]} color="green"/>
              <ReportCard title="Applications" items={[
                { label: 'Total',          value: report?.applications?.total      ?? '—' },
                { label: 'Shortlisted',    value: report?.applications?.shortlisted ?? '—' },
                { label: 'Rejected',       value: report?.applications?.rejected    ?? '—' },
              ]} color="purple"/>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-1">System Information</h2>
              <p className="text-xs text-gray-400 mb-4">Current microservice status overview</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['Auth Service :8081', 'Job Service :8082', 'Application Service :8083', 'Admin Service :8084'].map(svc => (
                  <div key={svc} className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2.5">
                    <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 animate-pulse"/>
                    <span className="text-xs text-gray-700 font-medium">{svc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function OverviewCard({ icon, label, value, sub, bg }) {
  return (
    <div className={`${bg} rounded-xl p-5 border border-white`}>
      <div className="flex items-start justify-between mb-2">{icon}</div>
      <p className="text-3xl font-extrabold text-gray-900">{value}</p>
      <p className="text-sm font-semibold text-gray-700 mt-0.5">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  )
}

function RoleBadge({ role }) {
  const config = {
    ADMIN:      'bg-purple-100 text-purple-700',
    RECRUITER:  'bg-blue-100 text-blue-700',
    JOB_SEEKER: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${config[role] || 'bg-gray-100 text-gray-600'}`}>
      {role === 'JOB_SEEKER' ? 'Job Seeker' : role === 'RECRUITER' ? 'Recruiter' : 'Admin'}
    </span>
  )
}

function ReportCard({ title, items, color }) {
  const accent = { blue: 'border-blue-400', green: 'border-green-400', purple: 'border-purple-400' }
  return (
    <div className={`bg-white rounded-xl border-l-4 ${accent[color]} border border-gray-100 shadow-sm p-5`}>
      <h3 className="font-bold text-gray-800 mb-4 text-sm">{title}</h3>
      <div className="space-y-3">
        {items.map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center">
            <span className="text-xs text-gray-500">{label}</span>
            <span className="text-sm font-bold text-gray-800">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
