import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { tmdb, img } from '../services/tmdb'

function debounce(fn, delay) {
  let t
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay) }
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const doSearch = useCallback(
    debounce((q) => {
      if (!q.trim()) { setResults([]); return }
      setLoading(true)
      tmdb.search(q).then(d => {
        setResults(d.results.filter(r => r.media_type !== 'person' && (r.poster_path || r.backdrop_path)))
        setLoading(false)
      })
    }, 300),
    []
  )

  useEffect(() => {
    doSearch(query)
    if (query) setSearchParams({ q: query })
    else setSearchParams({})
  }, [query])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="min-h-screen pt-[76px] pb-16 px-4 md:px-8 max-w-[1400px] mx-auto">
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search movies and TV shows..."
            className="w-full bg-surface border border-border rounded-xl pl-12 pr-4 py-4 text-base focus:outline-none focus:border-accent transition-colors"
          />
          {query && (
            <button onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {results.map(item => {
            const type = item.media_type
            const title = item.title || item.name
            const year = (item.release_date || item.first_air_date || '').slice(0, 4)
            return (
              <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                onClick={() => navigate(`/${type === 'movie' ? 'movie' : 'series'}/${item.id}`)}
                className="cursor-pointer group">
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-surface border border-border">
                  {item.poster_path
                    ? <img src={img(item.poster_path, 'w342')} alt={title} className="w-full h-full object-cover" loading="lazy" />
                    : <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs text-center p-2">{title}</div>
                  }
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                  <span className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded font-medium ${type === 'movie' ? 'bg-accent' : 'bg-blue-600'}`}>
                    {type === 'movie' ? 'Movie' : 'TV'}
                  </span>
                </div>
                <p className="text-xs font-medium mt-1.5 truncate">{title}</p>
                {year && <p className="text-xs text-zinc-500">{year}</p>}
              </motion.div>
            )
          })}
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-lg">No results for "{query}"</p>
        </div>
      )}

      {!query && !loading && (
        <div className="text-center py-20 text-zinc-600">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <p>Search for movies and TV shows</p>
        </div>
      )}
    </motion.div>
  )
}
