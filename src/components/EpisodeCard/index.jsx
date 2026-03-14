import { useNavigate } from 'react-router-dom'
import { img } from '../../services/tmdb'

const PlayIcon = () => (
  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
)

export default function EpisodeCard({ episode, seriesId, season }) {
  const navigate = useNavigate()
  const runtime = episode.runtime ? `${episode.runtime}m` : ''

  const goPlay = (e) => {
    e.stopPropagation()
    navigate(`/watch/tv/${seriesId}/${season}/${episode.episode_number}`)
  }

  return (
    <div
      onClick={() => navigate(`/watch/tv/${seriesId}/${season}/${episode.episode_number}`)}
      className="flex gap-3 p-3 rounded-xl bg-surface border border-border hover:border-accent/50 cursor-pointer group transition-colors"
    >
      <div className="relative flex-shrink-0 w-32 aspect-video rounded overflow-hidden bg-black">
        {episode.still_path ? (
          <img src={img(episode.still_path, 'w300')} alt={episode.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-zinc-800" />
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <PlayIcon />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold truncate">
            <span className="text-zinc-500 mr-1">{episode.episode_number}.</span>
            {episode.name}
          </p>
          {runtime && <span className="text-xs text-zinc-500 flex-shrink-0">{runtime}</span>}
        </div>
        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{episode.overview}</p>
      </div>

      <button
        onClick={goPlay}
        className="flex-shrink-0 w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white"
        aria-label="Play episode"
      >
        <PlayIcon />
      </button>
    </div>
  )
}
