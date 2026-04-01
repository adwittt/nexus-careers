/**
 * RoleBadge Component — Standardized role indicators for Seeker, Recruiter, Admin.
 */
export default function RoleBadge({ role }) {
  const config = {
    ADMIN:      'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/50',
    RECRUITER:  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
    JOB_SEEKER: 'bg-gray-100 dark:bg-slate-700/50 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border ${config[role] || config.JOB_SEEKER}`}>
      {role === 'JOB_SEEKER' ? 'Job Seeker' : role === 'RECRUITER' ? 'Recruiter' : 'Admin'}
    </span>
  )
}
