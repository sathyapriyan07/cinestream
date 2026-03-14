import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    const { error: err } = await signUp(email, password)
    if (err) { setError(err.message); setLoading(false) }
    else setSuccess(true)
  }

  if (success) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2">Check your email</h2>
        <p className="text-zinc-400 text-sm mb-6">We sent a confirmation link to {email}</p>
        <Link to="/login" className="text-accent hover:underline text-sm">Back to Sign In</Link>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-black via-zinc-950 to-black">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface border border-border rounded-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-accent font-black text-2xl mb-1">CINE<span className="text-white">STREAM</span></h1>
          <p className="text-zinc-400 text-sm">Create your account</p>
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
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Confirm Password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
              className="w-full bg-black border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
              placeholder="••••••••" />
          </div>
          {error && <p className="text-accent text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-60">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-white hover:text-accent transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
