/**
 * Displays application status with color coding.
 * APPLIED=blue, UNDER_REVIEW=yellow, SHORTLISTED=green, REJECTED=red
 */
export default function StatusBadge({ status }) {
  const config = {
    APPLIED:      { label: 'Applied',      cls: 'bg-blue-100 text-blue-700' },
    UNDER_REVIEW: { label: 'Under Review', cls: 'bg-yellow-100 text-yellow-700' },
    SHORTLISTED:  { label: 'Shortlisted',  cls: 'bg-green-100 text-green-700' },
    REJECTED:     { label: 'Rejected',     cls: 'bg-red-100 text-red-700' },
  }
  const { label, cls } = config[status] || { label: status, cls: 'bg-gray-100 text-gray-700' }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  )
}
