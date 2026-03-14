import { useEffect, useRef } from 'react'
import { useContinueWatching } from '../../hooks/useContinueWatching'

export default function VideoPlayer({ tmdbId, mediaType, season, episode, startProgress }) {
  const { saveProgress } = useContinueWatching()
  const saveRef = useRef(saveProgress)
  saveRef.current = saveProgress

  const src = mediaType === 'movie'
    ? `https://www.vidking.net/embed/movie/${tmdbId}?color=e50914&autoPlay=true${startProgress ? `&progress=${startProgress}` : ''}`
    : `https://www.vidking.net/embed/tv/${tmdbId}/${season}/${episode}?color=e50914&autoPlay=true&nextEpisode=true&episodeSelector=true${startProgress ? `&progress=${startProgress}` : ''}`

  useEffect(() => {
    const handler = (event) => {
      if (!event.data || typeof event.data !== 'string') return
      try {
        const data = JSON.parse(event.data)
        if (data.currentTime && data.duration) {
          saveRef.current({
            tmdb_id: tmdbId,
            media_type: mediaType,
            season: season || null,
            episode: episode || null,
            timestamp: Math.floor(data.currentTime),
            duration: Math.floor(data.duration),
          })
        }
      } catch {}
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [tmdbId, mediaType, season, episode])

  return (
    <div className="w-full h-full bg-black">
      <iframe
        src={src}
        width="100%"
        height="100%"
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture"
        className="w-full h-full border-0"
        title="Video Player"
      />
    </div>
  )
}
