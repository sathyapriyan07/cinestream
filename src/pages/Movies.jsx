import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { tmdb } from '../services/tmdb'
import { supabase } from '../services/supabase'
import MovieCard from '../components/MovieCard'

function normalizeMovie(row) {
  return {
    id:           row.tmdb_id || row.id,
    tmdb_id:      row.tmdb_id,
    title:        row.title,
    overview:     row.description,
    poster_url:   row.poster_url,
    backdrop_url: row.backdrop_url,
    release_date: row.release_date,
    vote_average: row.vote_average || 0,
    genres:       row.genres || [],
    media_type:   'movie',
    _fromSupabase: true,
  }
}

export default function Movies() {
  const [movies, setMovies]           = useState([])
  const [genres, setGenres]           = useState([])
  const [selectedGenre, setSelectedGenre] = useState(null)
  const [search, setSearch]           = useState('')
  const [page, setPage]               = useState(1)
  const [loading, setLoading]         = useState(true)
  const [totalPages, setTotalPages]   = useState(1)
  const [fromSupabase, setFromSupabase] = useState(false)

  // Load genres for filter (always from TMDB for label names)
  useEffect(() => {
    tmdb.genres('movie').then(d => setGenres(d.genres)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)

    const loadFromSupabase = async () => {
      let q = supabase.from('movies').select('*', { count: 'exact' })
      if (search) q = q.ilike('title', `%${search}%`)
      if (selectedGenre) {
        // Filter by genre name using the genres array column
        const genre = genres.find(g => g.id === selectedGenre)
        if (genre) q = q.contains('genres', [genre.name])
      }
      q = q.order('created_at', { ascending: false })
           .range((page - 1) * 20, page * 20 - 1)
      const { data, count } = await q
      return { data: data || [], count: count || 0 }
    }

    const loadFromTmdb = async () => {
      const params = { page, ...(selectedGenre ? { with_genres: selectedGenre } : {}) }
      const d = await tmdb.discover('movie', params)
      return { data: d.results, totalPages: Math.min(d.total_pages, 20) }
    }

    // Check if Supabase has movies
    supabase.from('movies').select('id', { count: 'exact', head: true }).then(async ({ count }) => {
      if (count && count > 0) {
        setFromSupabase(true)
        const { data, count: total } = await loadFromSupabase()
        setMovies(data.map(normalizeMovie))
        setTotalPages(Math.ceil(total / 20) || 1)
      } else {
        setFromSupabase(false)
        const { data, totalPages: tp } = await loadFromTmdb()
        setMovies(data)
        setTotalPages(tp)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [selectedGenre, page, search, genres])

  useEffect(() => { setPage(1) }, [search, selectedGenre])

  const filtered = fromSupabase
    ? movies  // already filtered server-side
    : search
      ? movies.filter(m => m.title?.toLowerCase().includes(search.toLowerCase()))
      : movies

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black">Movies</h1>
          {fromSupabase && (
            <span className="text-xs text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-full font-medium">
              Library
            </span>
          )}
        </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by title..."
          className="bg-surface border border-border rounded-lg px-4 py-2.5 text-sm flex-1 focus:outline-none focus:border-accent transition-colors"
        />
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => { setSelectedGenre(null); setPage(1) }}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !selectedGenre ? 'bg-accent text-white' : 'bg-surface border border-border hover:border-accent/50'
            }`}
          >All</button>
          {genres.map(g => (
            <button key={g.id}
              onClick={() => { setSelectedGenre(g.id); setPage(1) }}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedGenre === g.id ? 'bg-accent text-white' : 'bg-surface border border-border hover:border-accent/50'
              }`}
            >{g.name}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-600">
          <p className="text-lg">No movies found</p>
          {search && <p className="text-sm mt-1">Try a different search term</p>}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filtered.map(m => <MovieCard key={m.id} item={m} mediaType="movie" />)}
          </div>
          {!search && totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 bg-surface border border-border rounded-lg text-sm disabled:opacity-40 hover:border-accent/50 transition-colors">
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-zinc-400">{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 bg-surface border border-border rounded-lg text-sm disabled:opacity-40 hover:border-accent/50 transition-colors">
                Next
              </button>
            </div>
          )}
        </>
      )}
      </div>
    </motion.div>
  )
}
