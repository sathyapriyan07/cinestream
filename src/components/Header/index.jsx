import { Link, useNavigate } from 'react-router-dom'

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12a4 4 0 100-8 4 4 0 000 8zM6 20a6 6 0 0112 0" />
  </svg>
)

export default function Header() {
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[56px] md:h-[64px] bg-black/40 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white">
          <span className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-semibold">
            CS
          </span>
          <span className="text-sm md:text-base tracking-wide font-semibold">CineStream</span>
        </Link>

        <button
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white hover:bg-white/15 transition-colors"
          aria-label="Profile"
        >
          <UserIcon />
        </button>
      </div>
    </header>
  )
}
