import { useState, useEffect } from 'react'
import { Users, Briefcase, FileText, TrendingUp, ToggleLeft, ToggleRight, Search, Shield } from 'lucide-react'
import { getAdminUsers, getAdminJobs, getAdminReports, toggleUserStatus } from '../services/api'
import { useAuth } from '../context/AuthContext'
import RoleBadge from '../components/RoleBadge'

const TABS = ['Overview', 'Users', 'Jobs', 'Reports']

/**
 * Admin Dashboard — full platform management with Dark Mode.
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-blue-700 dark:bg-slate-800 text-white px-4 py-8 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <Shield size={24} className="text-blue-100 dark:text-blue-400" />
            <h1 className="text-2xl font-black tracking-tight">Admin Dashboard</h1>
          </div>
          <p className="text-blue-200 dark:text-slate-400 text-sm font-medium">Full platform control — Welcome, {user?.name}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── Tabs ────────────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-1.5 mb-8 w-fit">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all border-0 cursor-pointer ${
                tab === t
                  ? 'bg-blue-700 dark:bg-blue-600 text-white shadow-lg'
                  : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 bg-transparent'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ─────────────────────────────────────────────── */}
        {tab === 'Overview' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse"/>)}
              </div>
            ) : (
              <>
                {/* Stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <OverviewCard
                    icon={<Users size={22} className="text-blue-600 dark:text-blue-400"/>}
                    label="Total Users" value={report?.totalUsers ?? '—'}
                    sub={`${report?.jobSeekers ?? 0} seekers · ${report?.recruiters ?? 0} recruiters`}
                    bg="bg-blue-50 dark:bg-blue-900/20"
                  />
                  <OverviewCard
                    icon={<Briefcase size={22} className="text-green-600 dark:text-green-400"/>}
                    label="Active Jobs" value={report?.activeJobs ?? '—'}
                    sub={`${report?.totalJobs ?? 0} total posted`}
                    bg="bg-green-50 dark:bg-green-900/20"
                  />
                  <OverviewCard
                    icon={<FileText size={22} className="text-orange-500 dark:text-orange-400"/>}
                    label="Applications" value={report?.applications?.total ?? '—'}
                    sub="across all jobs"
                    bg="bg-orange-50 dark:bg-orange-900/20"
                  />
                  <OverviewCard
                    icon={<TrendingUp size={22} className="text-purple-600 dark:text-purple-400"/>}
                    label="Shortlisted" value={report?.applications?.shortlisted ?? '—'}
                    sub="candidates progressing"
                    bg="bg-purple-50 dark:bg-purple-900/20"
                  />
                </div>

                {/* Application breakdown */}
                {report?.applications && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 hover:shadow-md transition-shadow">
                    <h2 className="font-extrabold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                       <TrendingUp size={18} className="text-blue-600 dark:text-blue-400" />
                       Application Status Breakdown
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
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
                          <div key={key} className="group">
                            <div className="flex justify-between items-end mb-2">
                              <span className="text-xs font-bold text-gray-600 dark:text-slate-400 uppercase tracking-tight">{label}</span>
                              <span className="text-lg font-black text-gray-900 dark:text-white">{val}</span>
                            </div>
                            <div className="h-2.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                              <div className={`${color} h-full rounded-full transition-all duration-1000 group-hover:brightness-110`} style={{ width: `${pct}%` }}/>
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mt-1.5 text-right tracking-widest">{pct}%</p>
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
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden animate-in slide-in-from-bottom duration-500">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <h2 className="font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
                <Users size={18} className="text-blue-600 dark:text-blue-400"/>
                All Users
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full font-black uppercase tracking-tighter">
                  {filteredUsers.length}
                </span>
              </h2>
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"/>
                <input
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search by name, email or role…"
                  className="pl-9 pr-4 py-2.5 text-sm w-full bg-gray-50 dark:bg-slate-900/50 border border-transparent dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white transition-all"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-6 space-y-4">
                {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-gray-50 dark:bg-slate-700/50 rounded-xl animate-pulse"/>)}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-20">
                 <Users size={40} className="mx-auto text-gray-200 dark:text-slate-700 mb-4" />
                 <p className="text-gray-400 dark:text-slate-500 text-sm font-medium">No users match your search</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-slate-900/50 text-left">
                      <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest">User Profile</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest">Role</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest">Metadata</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900 dark:text-white">{u.name}</div>
                          <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{u.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <RoleBadge role={u.role}/>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">📞 {u.phone || 'N/A'}</div>
                          <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">🗓️ Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric'}) : '—'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${
                            u.active !== false ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50'
                          }`}>
                            {u.active !== false ? '● Active' : '○ Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleUser(u.id)}
                            disabled={togglingUser === u.id || u.role === 'ADMIN'}
                            className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider border px-3 py-2 rounded-xl transition-all shadow-sm ${
                              u.active !== false 
                                ? 'bg-white dark:bg-slate-800 border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' 
                                : 'bg-white dark:bg-slate-800 border-green-100 dark:border-green-900/50 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                             } cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed`}
                          >
                            {u.active !== false
                              ? <><ToggleRight size={14}/> Disable</>
                              : <><ToggleLeft size={14}/> Enable</>
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
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden animate-in slide-in-from-bottom duration-500">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <h2 className="font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
                <Briefcase size={18} className="text-blue-600 dark:text-blue-400"/>
                All Job Listings
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full font-black uppercase tracking-tighter">{filteredJobs.length}</span>
              </h2>
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"/>
                <input
                  value={jobSearch}
                  onChange={e => setJobSearch(e.target.value)}
                  placeholder="Search by title, company or location…"
                  className="pl-9 pr-4 py-2.5 text-sm w-full bg-gray-50 dark:bg-slate-900/50 border border-transparent dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white transition-all"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-6 space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-50 dark:bg-slate-700/50 rounded-xl animate-pulse"/>)}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-20">
                 <Briefcase size={40} className="mx-auto text-gray-200 dark:text-slate-700 mb-4" />
                 <p className="text-gray-400 dark:text-slate-500 text-sm font-medium">No jobs found in database</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-slate-900/50 text-left">
                      <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest">Position & Company</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest">Comp & Loc</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest">Job Details</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest">Live Since</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                    {filteredJobs.map(j => (
                      <tr key={j.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900 dark:text-white leading-tight">{j.title}</div>
                          <div className="text-xs text-gray-400 dark:text-slate-500 mt-1 font-semibold">{j.companyName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-green-600 dark:text-green-400 font-black">{j.salary || '—'}</div>
                          <div className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5 italic flex items-center gap-1"><MapPin size={9}/> {j.location}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-lg font-black uppercase border border-blue-100 dark:border-blue-900/50">
                            {j.jobType?.replace('_','-') || 'Full-time'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 dark:text-slate-500 text-[10px] font-bold">
                          {j.createdAt ? new Date(j.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric'}) : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tight ${
                            j.active !== false ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}>
                            {j.active !== false ? '● Active' : '○ Closed'}
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
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-8 group">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-black text-gray-800 dark:text-white text-lg tracking-tight">System Infrastructure</h2>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-widest font-black mt-1">Real-time microservice status</p>
                </div>
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-xl border border-green-100 dark:border-green-800/50">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[10px] font-black uppercase">All Systems Operational</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'Auth Service', port: '8081', desc: 'Identity & Access' },
                  { name: 'Job Service', port: '8082', desc: 'Marketplace Engine' },
                  { name: 'Application Service', port: '8083', desc: 'Workflow Manager' },
                  { name: 'Admin Service', port: '8084', desc: 'Central Control' }
                ].map(svc => (
                  <div key={svc.port} className="flex flex-col gap-1.5 bg-gray-50 dark:bg-slate-900/50 border border-transparent dark:border-slate-700/50 rounded-2xl p-4 transition-all hover:shadow-md hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-black text-gray-800 dark:text-white">{svc.name}</span>
                       <span className="text-[10px] bg-white dark:bg-slate-800 text-gray-400 dark:text-slate-500 px-2 py-0.5 rounded-lg border border-gray-100 dark:border-slate-700">:{svc.port}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-slate-500 font-medium">{svc.desc}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                       <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                       <span className="text-[9px] font-black text-green-600 dark:text-green-500 uppercase tracking-tighter">Healthy</span>
                    </div>
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
    <div className={`${bg} rounded-2xl p-6 border border-white dark:border-slate-800/50 transition-all hover:scale-[1.02] hover:shadow-lg group shadow-sm`}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm transition-transform group-hover:rotate-12">{icon}</div>
      </div>
      <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{value}</p>
      <p className="text-xs font-black text-gray-700 dark:text-slate-300 mt-2 uppercase tracking-wide">{label}</p>
      <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 font-medium italic">{sub}</p>
    </div>
  )
}

function ReportCard({ title, items, color }) {
  const accent = { 
    blue: 'border-blue-500 dark:border-blue-400 shadow-blue-500/5', 
    green: 'border-green-500 dark:border-green-400 shadow-green-500/5', 
    purple: 'border-purple-500 dark:border-purple-400 shadow-purple-500/5' 
  }
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl border-l-[6px] ${accent[color]} border border-gray-100 dark:border-slate-700 shadow-sm p-6 hover:shadow-xl transition-all`}>
      <h3 className="font-black text-gray-800 dark:text-white mb-5 text-[10px] uppercase tracking-widest">{title}</h3>
      <div className="space-y-4">
        {items.map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center group/item">
            <span className="text-[11px] text-gray-500 dark:text-slate-400 font-bold group-hover/item:text-blue-500 dark:group-hover/item:text-blue-400 transition-colors uppercase tracking-tight">{label}</span>
            <span className="text-sm font-black text-gray-900 dark:text-white tracking-tight">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MapPin({ size, className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} height={size} 
      viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="2" 
      strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  )
}
