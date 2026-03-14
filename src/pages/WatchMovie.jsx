import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import VideoPlayer from '../components/VideoPlayer'
import { useState } from 'react'

export default function WatchMovie() {
  const { tmdbId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const progress = searchParams.get('progress')
  const [muted, setMuted] = useState(true)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="relative flex-1">
        <VideoPlayer
          tmdbId={tmdbId}
          mediaType="movie"
          startProgress={progress ? parseInt(progress) : null}
          muted={muted}
        />
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-sm">
          <button onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-black/40 hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <button
            onClick={() => setMuted(m => !m)}
            className="p-2 rounded-full bg-black/40 hover:bg-white/10 transition-colors"
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536A5 5 0 005.929 12a5 5 0 002.535 4.464M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <div className="px-4 py-4 border-t border-white/10 text-sm text-zinc-400">
        Now Playing - Movie
      </div>
    </motion.div>
  )
}
