import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import VideoPlayer from '../components/VideoPlayer'

export default function WatchMovie() {
  const { tmdbId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const progress = searchParams.get('progress')

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 bg-black/80 backdrop-blur-sm border-b border-border">
        <button onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <span className="text-sm text-zinc-400">Now Playing</span>
      </div>
      <div className="flex-1">
        <VideoPlayer
          tmdbId={tmdbId}
          mediaType="movie"
          startProgress={progress ? parseInt(progress) : null}
        />
      </div>
    </motion.div>
  )
}
