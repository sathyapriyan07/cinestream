import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWatchlist } from '../hooks/useWatchlist'
import { img } from '../services/tmdb'
import MovieCard from '../components/MovieCard'

export default function Watchlist() {
  const { user } = useAuth()
  const { watchlist, toggle } = useWatchlist()
  const navigate = useNavigate()

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4 px-4">
      <p className="text-zinc-400">Sign in to view your watchlist</p>
      <button onClick={() => navigate('/login')}
        className="bg-accent text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-colors">
        Sign In
      </button>
    </div>
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="min-h-screen pt-[76px] pb-16 px-4 md:px-8 max-w-[1400px] mx-auto">
      <h1 className="text-3xl font-black mb-6">My Watchlist</h1>

      {watchlist.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
          </svg>
          <p className="text-lg mb-2">Your watchlist is empty</p>
          <p className="text-sm">Add movies and shows to watch later</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {watchlist.map(item => (
            <div key={item.id} className="relative group">
              <MovieCard
                item={{ id: item.tmdb_id, title: item.title, name: item.title, poster_path: item.poster_path }}
                mediaType={item.media_type}
              />
              <button
                onClick={(e) => { e.stopPropagation(); toggle(item) }}
                className="absolute top-2 left-2 w-7 h-7 bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
                title="Remove from watchlist"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
