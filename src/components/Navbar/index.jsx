import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)
const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)
const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)
const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/movies', label: 'Movies' },
  { to: '/series', label: 'Series' },
  { to: '/watchlist', label: 'Watchlist' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 h-[56px] md:h-[60px] transition-all duration-300 ${
      scrolled
        ? 'bg-black/95 backdrop-blur-md border-b border-border'
        : 'bg-black/80 backdrop-blur-md md:bg-gradient-to-b md:from-black/80 md:to-transparent md:backdrop-blur-none'
    }`}>
      <div className="max-w-[1400px] mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-accent font-black text-lg md:text-2xl tracking-tight flex-shrink-0">
          CINE<span className="text-white">STREAM</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to}
              className={`text-sm font-medium transition-colors hover:text-white ${location.pathname === l.to ? 'text-white' : 'text-zinc-400'}`}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1 md:gap-3">
          <button onClick={() => navigate('/search')} className="p-2 text-zinc-400 hover:text-white transition-colors">
            <SearchIcon />
          </button>

          <div className="relative">
            <button onClick={() => setProfileOpen(p => !p)} className="p-2 text-zinc-400 hover:text-white transition-colors">
              <UserIcon />
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 top-full mt-2 w-44 bg-surface border border-border rounded-lg overflow-hidden shadow-xl"
                  onMouseLeave={() => setProfileOpen(false)}
                >
                  {user ? (
                    <>
                      <div className="px-4 py-3 text-xs text-zinc-400 border-b border-border truncate">{user.email}</div>
                      <Link to="/profile" className="block px-4 py-2.5 text-sm hover:bg-white/5 transition-colors">Profile</Link>
                      <Link to="/watchlist" className="block px-4 py-2.5 text-sm hover:bg-white/5 transition-colors">Watchlist</Link>
                      <button onClick={signOut} className="w-full text-left px-4 py-2.5 text-sm text-accent hover:bg-white/5 transition-colors">Sign Out</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="block px-4 py-2.5 text-sm hover:bg-white/5 transition-colors">Sign In</Link>
                      <Link to="/signup" className="block px-4 py-2.5 text-sm hover:bg-white/5 transition-colors">Sign Up</Link>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button className="md:hidden p-2 text-zinc-400 hover:text-white" onClick={() => setMobileOpen(p => !p)}>
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/98 border-b border-border overflow-hidden"
          >
            <nav className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map(l => (
                <Link key={l.to} to={l.to}
                  className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === l.to ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
                  {l.label}
                </Link>
              ))}
              {!user && (
                <>
                  <Link to="/login" className="py-2.5 px-3 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5">Sign In</Link>
                  <Link to="/signup" className="py-2.5 px-3 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5">Sign Up</Link>
                </>
              )}
              {user && <button onClick={signOut} className="py-2.5 px-3 rounded-lg text-sm text-accent text-left hover:bg-white/5">Sign Out</button>}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
