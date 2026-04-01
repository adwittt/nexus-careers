import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getProfile, updateProfile } from '../services/api'
import { User, Mail, Phone, Check, AlertCircle } from 'lucide-react'

const Profile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user?.userId) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      const res = await getProfile(user.userId)
      setProfile(res.data)
    } catch (err) {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await updateProfile(user.userId, {
        name: profile.name,
        phone: profile.phone
      })
      setProfile(res.data)
      setSuccess('Profile updated successfully!')
    } catch (err) {
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>
  )

  if (!profile) return <div className="text-center text-gray-400 p-8">No profile data found.</div>

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-slate-700/50 shadow-xl">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center text-primary-400">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{profile.name}'s Profile</h1>
            <p className="text-slate-400 text-sm">Manage your account information</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center space-x-2">
            <AlertCircle />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 px-4 py-3 rounded-xl mb-6 flex items-center space-x-2">
            <Check />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Full Name</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-400 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email Address</label>
              <div className="relative opacity-60">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  className="w-full bg-slate-900/30 border border-slate-700 text-slate-400 rounded-xl py-3 pl-10 pr-4 cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-slate-500 pl-2">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Phone Number</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-400 transition-colors">
                  <Phone size={18} />
                </div>
                <input
                  type="text"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Account Role</label>
              <div className="py-3 px-4 bg-slate-900/30 border border-slate-700 rounded-xl text-slate-400 text-sm">
                {profile.role}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700/50 mt-8">
            <button
              type="submit"
              disabled={saving}
              className="w-full md:w-auto px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={18} />
                  <span>Update Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Profile
