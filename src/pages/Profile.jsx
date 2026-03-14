import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useContinueWatching } from '../hooks/useContinueWatching'
import { useWatchlist } from '../hooks/useWatchlist'
import { supabase } from '../services/supabase'

export default function Profile() {
  const { user, signOut } = useAuth()
  const { items: continueItems } = useContinueWatching()
  const { watchlist } = useWatchlist()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  if (!user) {
    navigate('/login')
    return null
  }

  const clearHistory = async () => {
    setLoading(true)
    await supabase.from('continue_watching').delete().eq('user_id', user.id)
    setMsg('Watch history cleared')
    setLoading(false)
    setTimeout(() => setMsg(''), 3000)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black mb-8">Profile</h1>

      {/* Account Info */}
      <div className="bg-surface border border-border rounded-xl p-6 mb-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Account</h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xl font-bold">
            {user.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{user.email}</p>
            <p className="text-xs text-zinc-500 mt-0.5">Member since {new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-surface border border-border rounded-xl p-5 text-center">
          <p className="text-3xl font-black text-accent">{watchlist.length}</p>
          <p className="text-sm text-zinc-400 mt-1">Watchlist Items</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 text-center">
          <p className="text-3xl font-black text-accent">{continueItems.length}</p>
          <p className="text-sm text-zinc-400 mt-1">In Progress</p>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden mb-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider px-6 pt-5 pb-3">Actions</h2>
        <button onClick={() => navigate('/watchlist')}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors border-t border-border text-sm">
          <span>My Watchlist</span>
          <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
        </button>
        <button onClick={clearHistory} disabled={loading}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors border-t border-border text-sm disabled:opacity-50">
          <span>Clear Watch History</span>
          <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>

      {msg && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-green-400 text-sm text-center mb-4">{msg}</motion.p>
      )}

        <button onClick={handleSignOut}
          className="w-full bg-accent/10 border border-accent/30 text-accent py-3 rounded-xl font-semibold hover:bg-accent/20 transition-colors">
          Sign Out
        </button>
      </div>
    </motion.div>
  )
}
