import { useState, useEffect } from 'react'
import { tmdb } from '../services/tmdb'
import { supabase } from '../services/supabase'

// Normalize a Supabase movie row to look like a TMDB result
function normalizeMovie(row) {
  return {
    id:            row.tmdb_id || row.id,
    tmdb_id:       row.tmdb_id,
    title:         row.title,
    overview:      row.description,
    poster_path:   null,                  // not used — poster_url is full URL
    poster_url:    row.poster_url,
    backdrop_path: null,
    backdrop_url:  row.backdrop_url,
    release_date:  row.release_date,
    vote_average:  row.vote_average || 0,
    genre_ids:     [],
    genres:        row.genres || [],
    media_type:    'movie',
    _fromSupabase: true,
  }
}

const GENRE = { action: 28, comedy: 35, drama: 18 }

export function useMovies() {
  const [data, setData] = useState({
    trending: [], popular: [], topRated: [], nowPlaying: [], upcoming: [],
    action: [], comedy: [], drama: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      // Check if admin has added movies to Supabase
      const { data: sbMovies, count } = await supabase
        .from('movies')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(100)

      if (count && count > 0) {
        // Use Supabase data — split into rows for each section
        const all = (sbMovies || []).map(normalizeMovie)
        setData({
          trending:   all.slice(0, 20),
          popular:    all.slice(0, 20),
          topRated:   [...all].sort((a, b) => b.vote_average - a.vote_average).slice(0, 20),
          nowPlaying: all.slice(0, 20),
          upcoming:   all.slice(0, 20),
          action:     all.filter(m => (m.genres || []).some(g => typeof g === 'string' ? g.toLowerCase().includes('action') : false)).slice(0, 20),
          comedy:     all.filter(m => (m.genres || []).some(g => typeof g === 'string' ? g.toLowerCase().includes('comedy') : false)).slice(0, 20),
          drama:      all.filter(m => (m.genres || []).some(g => typeof g === 'string' ? g.toLowerCase().includes('drama') : false)).slice(0, 20),
        })
        setLoading(false)
        return
      }

      // Fall back to TMDB API
      try {
        const [trending, popular, topRated, nowPlaying, upcoming, action, comedy, drama] =
          await Promise.all([
            tmdb.trending('movie'),
            tmdb.popular('movie'),
            tmdb.topRated('movie'),
            tmdb.nowPlaying(),
            tmdb.upcoming(),
            tmdb.discover('movie', { with_genres: GENRE.action }),
            tmdb.discover('movie', { with_genres: GENRE.comedy }),
            tmdb.discover('movie', { with_genres: GENRE.drama }),
          ])
        setData({
          trending:   trending.results,
          popular:    popular.results,
          topRated:   topRated.results,
          nowPlaying: nowPlaying.results,
          upcoming:   upcoming.results,
          action:     action.results,
          comedy:     comedy.results,
          drama:      drama.results,
        })
      } catch (_) {}
      setLoading(false)
    }

    load()
  }, [])

  return { ...data, loading }
}
