import { motion } from 'framer-motion'
import HeroBanner from '../components/HeroBanner'
import ContentRow from '../components/ContentRow'
import { useMovies } from '../hooks/useMovies'
import { useSeries } from '../hooks/useSeries'
import { useContinueWatching } from '../hooks/useContinueWatching'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { img } from '../services/tmdb'

function ContinueWatchingCard({ item }) {
  const navigate = useNavigate()
  const title = item.title || item.name || `ID: ${item.tmdb_id}`
  const href = item.media_type === 'movie'
    ? `/watch/movie/${item.tmdb_id}?progress=${item.timestamp}`
    : `/watch/tv/${item.tmdb_id}/${item.season}/${item.episode}?progress=${item.timestamp}`

  return (
    <div onClick={() => navigate(href)}
      className="flex-shrink-0 w-[200px] cursor-pointer group">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-surface border border-border">
        {item.poster_path && (
          <img src={img(item.poster_path, 'w300')} alt={title} className="w-full h-full object-cover" loading="lazy" />
        )}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700">
          <div className="h-full bg-accent" style={{ width: `${item.progress}%` }} />
        </div>
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <svg className="w-10 h-10 fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
      <p className="text-xs font-medium mt-1.5 truncate">{title}</p>
      {item.media_type === 'tv' && (
        <p className="text-xs text-zinc-500">S{item.season} E{item.episode}</p>
      )}
    </div>
  )
}

export default function Home() {
  const { trending, popular, topRated, nowPlaying, upcoming, loading } = useMovies()
  const { popular: tvPopular } = useSeries()
  const { items: continueItems } = useContinueWatching()
  const { user } = useAuth()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
      <HeroBanner items={trending} />

      <div className="relative z-10 -mt-16 pb-16">
        {user && continueItems.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg md:text-xl font-bold px-4 md:px-8 mb-3">Continue Watching</h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 md:px-8 pb-2">
              {continueItems.map(item => <ContinueWatchingCard key={item.id} item={item} />)}
            </div>
          </section>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <ContentRow title="Trending Now" items={trending} />
            <ContentRow title="Popular Movies" items={popular} mediaType="movie" />
            <ContentRow title="Top Rated Movies" items={topRated} mediaType="movie" />
            <ContentRow title="Now Playing" items={nowPlaying} mediaType="movie" />
            <ContentRow title="Upcoming Movies" items={upcoming} mediaType="movie" />
            <ContentRow title="Popular TV Shows" items={tvPopular} mediaType="tv" />
          </>
        )}
      </div>
    </motion.div>
  )
}
