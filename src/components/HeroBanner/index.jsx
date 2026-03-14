import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { img, tmdb } from '../../services/tmdb'
import { useWatchlist } from '../../hooks/useWatchlist'

const SLIDE_INTERVAL = 12000
const TRAILER_DELAY  = 2500
const IS_MOBILE      = typeof window !== 'undefined' && window.innerWidth < 768

export default function HeroBanner({ items = [] }) {
  // ── All hooks at the top ──────────────────────────────────
  const [current, setCurrent]       = useState(0)
  const [direction, setDirection]   = useState(1)
  const [paused, setPaused]         = useState(false)
  const [logoUrl, setLogoUrl]       = useState(null)
  const [trailerKey, setTrailerKey] = useState(null)
  const [showVideo, setShowVideo]   = useState(false)
  const [muted, setMuted]           = useState(true)
  const [heroVisible, setHeroVisible] = useState(false)

  const heroRef    = useRef(null)
  const logoCache  = useRef({})
  const videoCache = useRef({})

  const navigate                  = useNavigate()
  const { isInWatchlist, toggle } = useWatchlist()

  const total = Math.min(items.length, 6)

  const go = useCallback((next) => {
    setDirection(next > current ? 1 : -1)
    setCurrent(next)
    setShowVideo(false)
    setTrailerKey(null)
    setMuted(true)
  }, [current])

  // IntersectionObserver — only mount iframe when hero is visible
  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0.25 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Auto-advance — pause while video is playing to avoid mid-trailer cuts
  useEffect(() => {
    if (paused || showVideo || total < 2) return
    const t = setInterval(() => {
      setDirection(1)
      setCurrent((c) => (c + 1) % total)
      setShowVideo(false)
      setTrailerKey(null)
      setMuted(true)
    }, SLIDE_INTERVAL)
    return () => clearInterval(t)
  }, [paused, showVideo, total])

  // Fetch logo for current slide
  useEffect(() => {
    if (!items.length) return
    const item   = items[current]
    const dbLogo = item?.title_logo_url || null
    if (dbLogo) { setLogoUrl(dbLogo); return }

    const tmdbId = item?.tmdb_id || item?.id
    const mType  = (item?.media_type === 'movie' || !!item?.title) ? 'movie' : 'tv'
    if (!tmdbId) { setLogoUrl(null); return }

    const key = `${mType}-${tmdbId}`
    if (logoCache.current[key] !== undefined) { setLogoUrl(logoCache.current[key]); return }

    setLogoUrl(null)
    tmdb.images(mType, tmdbId)
      .then((data) => {
        const logos = data.logos || []
        const logo  = logos.find((l) => l.iso_639_1 === 'en') || logos[0] || null
        const url   = logo ? img(logo.file_path, 'w500') : null
        logoCache.current[key] = url
        setLogoUrl(url)
      })
      .catch(() => { logoCache.current[key] = null; setLogoUrl(null) })
  }, [items, current])

  // Fetch trailer for current slide, then schedule video reveal
  useEffect(() => {
    if (!items.length || IS_MOBILE) return
    const item   = items[current]
    const tmdbId = item?.tmdb_id || item?.id
    const mType  = (item?.media_type === 'movie' || !!item?.title) ? 'movie' : 'tv'
    if (!tmdbId) return

    const key = `${mType}-${tmdbId}`
    let timer

    const reveal = (tKey) => {
      if (!tKey) return
      setTrailerKey(tKey)
      timer = setTimeout(() => setShowVideo(true), TRAILER_DELAY)
    }

    if (videoCache.current[key] !== undefined) {
      reveal(videoCache.current[key])
      return () => clearTimeout(timer)
    }

    tmdb.videos(mType, tmdbId)
      .then((data) => {
        const trailer = (data.results || []).find(
          (v) => v.type === 'Trailer' && v.site === 'YouTube'
        ) || null
        const tKey = trailer?.key || null
        videoCache.current[key] = tKey
        reveal(tKey)
      })
      .catch(() => { videoCache.current[key] = null })

    return () => clearTimeout(timer)
  }, [items, current])

  // ── Early return AFTER all hooks ──────────────────────────
  if (!items.length) {
    return (
      <div className="h-[80vh] min-h-[520px] bg-surface flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const item        = items[current]
  const isMovie     = item.media_type === 'movie' || !!item.title
  const mediaType   = isMovie ? 'movie' : 'tv'
  const title       = item.title || item.name
  const overview    = item.overview || item.description || ''
  const year        = (item.release_date || item.first_air_date || '').slice(0, 4)
  const rating      = item.vote_average > 0 ? Number(item.vote_average).toFixed(1) : null
  const inList      = isInWatchlist(item.id, mediaType)
  const backdropSrc = item.backdrop_url || (item.backdrop_path ? img(item.backdrop_path, 'original') : null)
  const routeId     = item.tmdb_id || item.id

  const prev = () => go((current - 1 + total) % total)
  const next = () => go((current + 1) % total)

  const trailerSrc = trailerKey
    ? `https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&loop=1&playlist=${trailerKey}&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&enablejsapi=1`
    : null

  const slideVariants = {
    enter:  (dir) => ({ opacity: 0, scale: 1.04, x: dir > 0 ? 60 : -60 }),
    center: { opacity: 1, scale: 1, x: 0 },
    exit:   (dir) => ({ opacity: 0, scale: 0.98, x: dir > 0 ? -60 : 60 }),
  }

  return (
    <div
      ref={heroRef}
      className="relative h-[65vh] sm:h-[80vh] min-h-[480px] overflow-hidden bg-black"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Layer 1: Backdrop image ── */}
      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={`bg-${item.id}`}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
        >
          {backdropSrc ? (
            <img
              src={backdropSrc}
              alt={title}
              className="w-full h-full object-cover object-center"
              loading="eager"
            />
          ) : (
            <div className="w-full h-full bg-zinc-900" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Layer 2: YouTube trailer iframe ── */}
      {trailerSrc && heroVisible && (
        <motion.div
          className="absolute inset-0 z-[1]"
          initial={{ opacity: 0 }}
          animate={{ opacity: showVideo ? 1 : 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        >
          {/* Oversized iframe to hide YouTube letterbox bars */}
          <div className="absolute inset-0 scale-[1.35] sm:scale-[1.15]">
            <iframe
              key={trailerKey}
              src={trailerSrc}
              title={title}
              allow="autoplay; fullscreen"
              allowFullScreen
              className="w-full h-full"
              style={{ border: 'none', pointerEvents: 'none' }}
            />
          </div>
        </motion.div>
      )}

      {/* ── Layer 3: Gradient overlays ── */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
      </div>

      {/* ── Layer 4: Hero content ── */}
      <div className="absolute inset-0 z-[3] flex items-end max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${item.id}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.55, delay: 0.15, ease: 'easeOut' }}
            className="pb-24 sm:pb-20 max-w-md sm:max-w-2xl w-full"
          >
            {/* Meta badges */}
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <span className="px-2.5 py-0.5 bg-accent text-white text-xs font-bold rounded uppercase tracking-wider">
                {mediaType === 'movie' ? 'Movie' : 'Series'}
              </span>
              {year && <span className="text-zinc-400 text-xs sm:text-sm">{year}</span>}
              {rating && (
                <span className="flex items-center gap-1 text-xs sm:text-sm text-yellow-400 font-medium">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-yellow-400" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {rating}
                </span>
              )}
            </div>

            {/* Title logo or text */}
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={title}
                loading="lazy"
                className="max-h-[70px] sm:max-h-[120px] w-auto object-contain mb-3 sm:mb-4 drop-shadow-lg"
              />
            ) : (
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-[1.05] mb-3 sm:mb-4">
                {title}
              </h1>
            )}

            {/* Hide description while video plays; hide on mobile when space is tight */}
            {!showVideo && (
              <p className="hidden sm:block text-zinc-300 text-sm sm:text-base leading-relaxed line-clamp-3 mb-5 sm:mb-7 max-w-sm sm:max-w-lg">
                {overview}
              </p>
            )}
            {/* Short description visible on mobile only */}
            {!showVideo && (
              <p className="sm:hidden text-zinc-300 text-xs leading-relaxed line-clamp-2 mb-4 max-w-xs">
                {overview}
              </p>
            )}
            {showVideo && <div className="mb-5 sm:mb-7" />}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/watch/${mediaType}/${routeId}${mediaType === 'tv' ? '/1/1' : ''}`)}
                className="flex items-center gap-2 bg-accent hover:bg-red-700 text-white px-5 py-2.5 sm:px-7 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-accent/30"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                Play Now
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => toggle({ tmdb_id: routeId, media_type: mediaType, title, poster_path: item.poster_path || null })}
                className="flex items-center gap-2 glass-light border border-white/20 hover:border-white/40 text-white px-5 py-2.5 sm:px-7 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm transition-all"
              >
                {inList ? (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>In Watchlist</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>Watchlist</>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/${mediaType}/${routeId}`)}
                className="flex items-center gap-2 glass-light border border-white/10 hover:border-white/25 text-zinc-300 hover:text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                More Info
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Sound toggle — bottom right, only when video is playing ── */}
      <AnimatePresence>
        {showVideo && trailerKey && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMuted((m) => !m)}
            className="absolute bottom-20 right-4 sm:bottom-10 sm:right-6 z-[4] w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 backdrop-blur border border-white/20 hover:bg-black hover:border-white/40 flex items-center justify-center text-white transition-all"
            aria-label={muted ? 'Unmute trailer' : 'Mute trailer'}
          >
            {muted ? (
              // Volume off
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              // Volume on
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536A5 5 0 005.929 12a5 5 0 002.535 4.464M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Slide arrows ── */}
      {total > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-3 sm:left-4 bottom-[4.5rem] sm:top-1/2 sm:-translate-y-1/2 sm:bottom-auto z-[4] w-8 h-8 sm:w-10 sm:h-10 glass-light border border-white/15 rounded-full flex items-center justify-center text-white hover:bg-white/15 transition-all opacity-60 hover:opacity-100">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={next}
            className="absolute right-3 sm:right-4 bottom-[4.5rem] sm:top-1/2 sm:-translate-y-1/2 sm:bottom-auto z-[4] w-8 h-8 sm:w-10 sm:h-10 glass-light border border-white/15 rounded-full flex items-center justify-center text-white hover:bg-white/15 transition-all opacity-60 hover:opacity-100">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* ── Dots ── */}
      {total > 1 && (
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-[4] flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <button key={i} onClick={() => go(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current ? 'w-6 h-1.5 bg-accent' : 'w-1.5 h-1.5 bg-white/35 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}

      {/* ── Progress bar — only when video is not playing ── */}
      {!paused && !showVideo && total > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 z-[4]">
          <motion.div
            key={current}
            className="h-full bg-accent/60"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: SLIDE_INTERVAL / 1000, ease: 'linear' }}
          />
        </div>
      )}
    </div>
  )
}
