import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../../services/supabase'
import AdminHeader from '../../components/admin/AdminHeader'

function StatCard({ label, value, icon, color, to }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-surface border border-zinc-800 rounded-xl p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {to && (
          <Link to={to} className="text-xs text-zinc-600 hover:text-accent transition-colors">
            View all →
          </Link>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-0.5">{value ?? '—'}</p>
      <p className="text-xs text-zinc-500">{label}</p>
    </motion.div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ movies: 0, series: 0, users: 0, banners: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('movies').select('id', { count: 'exact', head: true }),
      supabase.from('series').select('id', { count: 'exact', head: true }),
      supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('hero_banners').select('id', { count: 'exact', head: true }),
    ]).then(([m, s, u, b]) => {
      setStats({ movies: m.count ?? 0, series: s.count ?? 0, users: u.count ?? 0, banners: b.count ?? 0 })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const cards = [
    {
      label: 'Total Movies', value: loading ? '…' : stats.movies, to: '/admin/movies',
      color: 'bg-accent/15 text-accent',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>,
    },
    {
      label: 'Total Series', value: loading ? '…' : stats.series, to: '/admin/series',
      color: 'bg-blue-500/15 text-blue-400',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    },
    {
      label: 'Registered Users', value: loading ? '…' : stats.users, to: '/admin/users',
      color: 'bg-green-500/15 text-green-400',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    },
    {
      label: 'Hero Banners', value: loading ? '…' : stats.banners, to: '/admin/hero-banners',
      color: 'bg-purple-500/15 text-purple-400',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    },
  ]

  return (
    <div>
      <AdminHeader title="Dashboard" subtitle="Welcome back, Administrator" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => (
          <motion.div key={c.label} transition={{ delay: i * 0.07 }}>
            <StatCard {...c} />
          </motion.div>
        ))}
      </div>

      {/* Quick links */}
      <div className="bg-surface border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/admin/movies', label: 'Manage Movies' },
            { to: '/admin/series', label: 'Manage Series' },
            { to: '/admin/hero-banners', label: 'Edit Banners' },
            { to: '/admin/users', label: 'Manage Users' },
          ].map((l) => (
            <Link key={l.to} to={l.to}
              className="flex items-center justify-center py-3 px-4 rounded-lg border border-zinc-800 text-sm text-zinc-400 hover:text-white hover:border-zinc-600 hover:bg-white/4 transition-all text-center">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
