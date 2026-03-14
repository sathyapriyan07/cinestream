import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { tmdb, img } from '../services/tmdb'
import { useWatchlist } from '../hooks/useWatchlist'
import { useContinueWatching } from '../hooks/useContinueWatching'
import EpisodeCard from '../components/EpisodeCard'
import MovieCard from '../components/MovieCard'

const TMDB_IMG = 'https://image.tmdb.org/t/p'

const PlayIcon  = () => <svg className="w-5 h-5 fill-black" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>

export default function SeriesDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [show, setShow]             = useState(null)
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [seasonData, setSeasonData] = useState(null)
  const [loading, setLoading]       = useState(true)
  const [logoUrl, setLogoUrl]       = useState(null)
  const [episodeQuery, setEpisodeQuery] = useState('')
  const [sortAsc, setSortAsc]       = useState(true)
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

  useEffect(() => {
    if (!show?.id) return
    let active = true
    setLogoUrl(null)
    tmdb.images('tv', show.id)
      .then((data) => {
        const logos = data.logos || []
        const logo = logos.find((l) => l.iso_639_1 === 'en') || logos[0] || null
        const url = logo ? img(logo.file_path, 'w500') : null
        if (active) setLogoUrl(url)
      })
      .catch(() => { if (active) setLogoUrl(null) })
    return () => { active = false }
  }, [show?.id])

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
  const year        = show.first_air_date ? show.first_air_date.slice(0, 4) : null
  const rating      = show.vote_average > 0 ? show.vote_average.toFixed(1) : null
  const genres      = show.genres?.map(g => g.name).join(' / ')

  const episodes = seasonData?.episodes || []
  const filteredEpisodes = [...episodes]
    .filter(ep => ep.name?.toLowerCase().includes(episodeQuery.toLowerCase()))
    .sort((a, b) => (sortAsc ? a.episode_number - b.episode_number : b.episode_number - a.episode_number))

  const scrollToEpisodes = () => {
    document.getElementById('episodes')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
      <div className="relative h-[85vh] sm:h-[90vh] overflow-hidden">
        {backdropSrc
          ? <img src={backdropSrc} alt={show.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-zinc-900" />
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

        <div className="absolute bottom-20 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 text-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={show.name}
                className="max-h-[90px] object-contain mx-auto"
              />
            ) : (
              <h1 className="text-3xl sm:text-4xl font-bold">{show.name}</h1>
            )}

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm text-zinc-300">
              {rating && (
                <span className="flex items-center gap-1 text-yellow-400 font-medium">
                  <svg className="w-3.5 h-3.5 fill-yellow-400" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  {rating}
                </span>
              )}
              {year && <span>{year}</span>}
              {genres && <span>{genres}</span>}
            </div>

            <p className="text-sm text-zinc-300 mt-3 line-clamp-3 max-w-2xl mx-auto">
              {show.overview}
            </p>

            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={() => navigate(
                  progress
                    ? `/watch/tv/${show.id}/${progress.season}/${progress.episode}?progress=${progress.timestamp}`
                    : `/watch/tv/${show.id}/${selectedSeason}/1`
                )}
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black"
                aria-label="Play"
              >
                <PlayIcon />
              </button>
              <button
                onClick={scrollToEpisodes}
                className="rounded-full px-5 py-2 bg-white/10 border border-white/20 text-white text-sm font-semibold"
              >
                Episodes
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
        <div className="grid md:grid-cols-[180px,1fr] gap-6">
          <div className="w-44 md:w-[180px]">
            {posterSrc
              ? <img src={posterSrc} alt={show.name} className="w-full rounded-xl border border-border" />
              : <div className="w-full aspect-[2/3] rounded-xl bg-zinc-900 border border-border" />
            }
          </div>
          <div>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={show.name}
                className="max-h-[48px] object-contain mb-3"
              />
            ) : (
              <h2 className="text-xl font-bold mb-2">About</h2>
            )}
            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400 mb-4">
              {year && <span>{year}</span>}
              {show.number_of_seasons > 0 && (
                <span>{show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''}</span>
              )}
              {rating && <span>⭐ {rating}</span>}
            </div>
            <p className="text-zinc-300 leading-relaxed">{show.overview}</p>
            <div className="flex flex-wrap gap-3 mt-5">
              <button
                onClick={() => navigate(
                  progress
                    ? `/watch/tv/${show.id}/${progress.season}/${progress.episode}?progress=${progress.timestamp}`
                    : `/watch/tv/${show.id}/${selectedSeason}/1`
                )}
                className="rounded-full px-5 py-2 bg-white text-black text-sm font-semibold"
              >
                {progress ? 'Resume' : 'Play'}
              </button>
              <button
                onClick={() => toggle({ tmdb_id: show.id, media_type: 'tv', title: show.name, poster_path: show.poster_path })}
                className="rounded-full px-5 py-2 bg-white/10 border border-white/20 text-white text-sm font-semibold"
              >
                {inList ? 'In Watchlist' : 'Add to Watchlist'}
              </button>
            </div>
          </div>
        </div>

        {cast.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Cast</h3>
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

        {seasons.length > 0 && (
          <div id="episodes">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Episodes</h2>
            </div>

            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(Number(e.target.value))}
                className="bg-surface border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-accent"
              >
                {seasons.map(s => (
                  <option key={s.season_number} value={s.season_number}>
                    Season {s.season_number}
                  </option>
                ))}
              </select>
              <input
                value={episodeQuery}
                onChange={(e) => setEpisodeQuery(e.target.value)}
                placeholder="Search episodes..."
                className="bg-surface border border-border rounded-full px-4 py-2 text-sm flex-1 focus:outline-none focus:border-accent"
              />
              <button
                onClick={() => setSortAsc(s => !s)}
                className="rounded-full px-4 py-2 bg-white/10 border border-white/20 text-sm text-white"
              >
                {sortAsc ? 'Sort: Asc' : 'Sort: Desc'}
              </button>
            </div>

            {seasonData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredEpisodes.map(ep => (
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

        {similar.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">More Like This</h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-3">
              {similar.map(s => (
                <div key={s.id} className="flex-shrink-0 w-[130px] md:w-[180px]">
                  <MovieCard item={s} mediaType="tv" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
