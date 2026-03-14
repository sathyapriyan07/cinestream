import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { img } from '../../services/tmdb'
import { useWatchlist } from '../../hooks/useWatchlist'

export default function MovieCard({ item, mediaType = 'movie' }) {
  const [imgError, setImgError]   = useState(false)
  const [hovered, setHovered]     = useState(false)
  const navigate                  = useNavigate()
  const { isInWatchlist, toggle } = useWatchlist()

  const type     = item.media_type || mediaType
  const title    = item.title || item.name
  const year     = (item.release_date || item.first_air_date || '').slice(0, 4)
  const inList   = isInWatchlist(item.id, type)
  const detailId = item.tmdb_id || item.id
  const posterSrc = item.poster_url || (item.poster_path ? img(item.poster_path, 'w342') : null)

  const goDetail = (e) => { e.stopPropagation(); navigate(`/${type === 'movie' ? 'movie' : 'series'}/${detailId}`) }
  const goWatch  = (e) => { e.stopPropagation(); navigate(`/watch/${type}/${detailId}${type === 'tv' ? '/1/1' : ''}`) }
  const handleWatchlist = (e) => {
    e.stopPropagation()
    toggle({ tmdb_id: detailId, media_type: type, title, poster_path: item.poster_path || null })
  }

  return (
    <div className="isolate w-full cursor-pointer" onClick={goDetail}>
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface border border-border"
        style={{ zIndex: hovered ? 10 : 1, position: 'relative' }}
      >
        {/* Poster */}
        {!imgError && posterSrc ? (
          <img
            src={posterSrc}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs text-center p-3 leading-snug">
            {title}
          </div>
        )}

        {/* Rating badge */}
        {item.vote_average > 0 && (
          <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-full">
            <svg className="w-2.5 h-2.5 fill-yellow-400 flex-shrink-0" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-[10px] font-bold text-yellow-400">{Number(item.vote_average).toFixed(1)}</span>
          </div>
        )}

        {/* Hover overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.18 }}
          className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2.5"
        >
          <motion.button
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: hovered ? 1 : 0.7, opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.2, delay: 0.04 }}
            onClick={goWatch}
            className="w-11 h-11 bg-accent rounded-full flex items-center justify-center shadow-xl hover:bg-red-700 transition-colors"
          >
            <svg className="w-5 h-5 fill-white ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 6 }}
            transition={{ duration: 0.2, delay: 0.08 }}
            onClick={handleWatchlist}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              inList ? 'bg-accent/90 text-white' : 'bg-white/15 border border-white/25 text-white hover:bg-white/25'
            }`}
          >
            {inList ? (
              <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Saved</>
            ) : (
              <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>Watchlist</>
            )}
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Info below poster */}
      <div className="mt-2 px-0.5">
        <p className="text-sm font-medium text-white truncate leading-snug">{title}</p>
        {year && <p className="text-xs text-zinc-400 mt-0.5">{year}</p>}
      </div>
    </div>
  )
}
