import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { tmdb, img } from '../services/tmdb'
import { useWatchlist } from '../hooks/useWatchlist'
import { useContinueWatching } from '../hooks/useContinueWatching'
import EpisodeCard from '../components/EpisodeCard'
import MovieCard from '../components/MovieCard'

const TMDB_IMG = 'https://image.tmdb.org/t/p'

const PlusIcon  = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
const CheckIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
const PlayIcon  = () => <svg className="w-5 h-5 fill-black" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>

export default function SeriesDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [show, setShow]             = useState(null)
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [seasonData, setSeasonData] = useState(null)
  const [loading, setLoading]       = useState(true)
  const { isInWatchlist, toggle }   = useWatchlist()
  const { getProgress }             = useContinueWatching()

  useEffect(() => {
    setLoading(true)
    // id is always the TMDB ID
    tmdb.tvDetail(id)
      .then(d => {
        setShow(d)
        const firstSeason = d.seasons?.find(s => s.season_number > 0)?.season_number || 1
        setSelectedSeason(firstSeason)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!show) return
    setSeasonData(null)
    tmdb.tvSeason(id, selectedSeason).then(setSeasonData).catch(() => {})
  }, [id, selectedSeason, show])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!show) return (
    <div className="min-h-screen flex items-center justify-center text-zinc-500">
      Series not found.
    </div>
  )

  const inList   = isInWatchlist(show.id, 'tv')
  const progress = getProgress(show.id, 'tv')
  const seasons  = show.seasons?.filter(s => s.season_number > 0) || []
  const similar  = show.similar?.results?.slice(0, 12) || []
  const cast     = show.credits?.cast?.slice(0, 8) || []

  const backdropSrc = show.backdrop_path ? `${TMDB_IMG}/original${show.backdrop_path}` : null
  const posterSrc   = show.poster_path   ? `${TMDB_IMG}/w500${show.poster_path}`       : null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
      {/* Backdrop */}
      <div className="relative h-[60vh] min-h-[400px]">
        {backdropSrc
          ? <img src={backdropSrc} alt={show.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-zinc-900" />
        }
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-48 relative z-10 pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 w-44 md:w-60 mx-auto md:mx-0">
            {posterSrc
              ? <img src={posterSrc} alt={show.name} className="w-full rounded-xl shadow-2xl border border-border" />
              : <div className="w-full aspect-[2/3] rounded-xl bg-zinc-900 border border-border" />
            }
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-5xl font-black mb-2">{show.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400 mb-4">
              {show.first_air_date && <span>{show.first_air_date.slice(0, 4)}</span>}
              {show.number_of_seasons > 0 && (
                <span>{show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''}</span>
              )}
              {show.vote_average > 0 && (
                <span className="flex items-center gap-1 text-yellow-400 font-bold">
                  <svg className="w-3.5 h-3.5 fill-yellow-400" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  {show.vote_average.toFixed(1)}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {show.genres?.map(g => (
                <span key={g.id} className="px-3 py-1 bg-surface border border-border rounded-full text-xs">{g.name}</span>
              ))}
            </div>

            <p className="text-zinc-300 leading-relaxed mb-6 max-w-2xl">{show.overview}</p>

            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={() => navigate(
                  progress
                    ? `/watch/tv/${show.id}/${progress.season}/${progress.episode}?progress=${progress.timestamp}`
                    : `/watch/tv/${show.id}/${selectedSeason}/1`
                )}
                className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-zinc-200 transition-colors">
                <PlayIcon /> {progress ? 'Resume' : 'Play'}
              </button>
              <button
                onClick={() => toggle({ tmdb_id: show.id, media_type: 'tv', title: show.name, poster_path: show.poster_path })}
                className="flex items-center gap-2 bg-surface border border-border px-6 py-3 rounded-xl font-semibold hover:border-accent/50 transition-colors">
                {inList ? <CheckIcon /> : <PlusIcon />}
                {inList ? 'In Watchlist' : 'Add to Watchlist'}
              </button>
            </div>

            {/* Cast */}
            {cast.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-zinc-500 mb-3 uppercase tracking-wider">Cast</h3>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                  {cast.map(person => (
                    <div key={person.id} className="flex-shrink-0 text-center w-16">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-surface border border-border mb-1">
                        {person.profile_path
                          ? <img src={img(person.profile_path, 'w185')} alt={person.name} className="w-full h-full object-cover" loading="lazy" />
                          : <div className="w-full h-full flex items-center justify-center text-zinc-600 text-lg">{person.name[0]}</div>
                        }
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate">{person.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Season selector + episodes */}
        {seasons.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-3 mb-5 overflow-x-auto scrollbar-hide pb-1">
              {seasons.map(s => (
                <button key={s.season_number}
                  onClick={() => setSelectedSeason(s.season_number)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedSeason === s.season_number
                      ? 'bg-accent text-white'
                      : 'bg-surface border border-border hover:border-accent/50'
                  }`}>
                  Season {s.season_number}
                </button>
              ))}
            </div>

            {seasonData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {seasonData.episodes?.map(ep => (
                  <EpisodeCard key={ep.id} episode={ep} seriesId={show.id} season={selectedSeason} />
                ))}
              </div>
            ) : (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}

        {/* Similar */}
        {similar.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4">More Like This</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {similar.map(s => <MovieCard key={s.id} item={s} mediaType="tv" />)}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
