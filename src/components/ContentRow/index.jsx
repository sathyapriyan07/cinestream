import { useRef } from 'react'
import MovieCard from '../MovieCard'

export default function ContentRow({ title, items = [], mediaType = 'movie' }) {
  const rowRef = useRef(null)

  const scroll = (dir) => {
    rowRef.current?.scrollBy({ left: dir * 600, behavior: 'smooth' })
  }

  if (!items.length) return null

  return (
    <section className="mb-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-bold text-white">{title}</h2>
        <div className="hidden md:flex items-center gap-1.5">
          <button
            onClick={() => scroll(-1)}
            aria-label="Scroll left"
            className="w-8 h-8 rounded-full bg-black/70 backdrop-blur border border-white/10 hover:bg-black hover:border-white/25 flex items-center justify-center transition-all"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Scroll right"
            className="w-8 h-8 rounded-full bg-black/70 backdrop-blur border border-white/10 hover:bg-black hover:border-white/25 flex items-center justify-center transition-all"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scroll row */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-3"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="flex-shrink-0 w-[130px] sm:w-[150px] md:w-[180px]"
            style={{ scrollSnapAlign: 'start' }}
          >
            <MovieCard item={item} mediaType={item.media_type || mediaType} />
          </div>
        ))}
      </div>
    </section>
  )
}
