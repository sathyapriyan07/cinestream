import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await signIn(email, password)
    if (err) { setError(err.message); setLoading(false) }
    else navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-black via-zinc-950 to-black">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface border border-border rounded-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-accent font-black text-2xl mb-1">CINE<span className="text-white">STREAM</span></h1>
          <p className="text-zinc-400 text-sm">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-black border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full bg-black border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
              placeholder="••••••••" />
          </div>
          {error && <p className="text-accent text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-60">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-white hover:text-accent transition-colors">Sign up</Link>
        </p>
      </motion.div>
    </div>
  )
}
