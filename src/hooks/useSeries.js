import { useState, useEffect } from 'react'
import { tmdb } from '../services/tmdb'
import { supabase } from '../services/supabase'

function normalizeSeries(row) {
  return {
    id:            row.tmdb_id || row.id,
    tmdb_id:       row.tmdb_id,
    name:          row.title,
    overview:      row.description,
    poster_path:   null,
    poster_url:    row.poster_url,
    backdrop_path: null,
    backdrop_url:  row.backdrop_url,
    first_air_date: row.first_air_date,
    vote_average:  row.vote_average || 0,
    media_type:    'tv',
    _fromSupabase: true,
  }
}

export function useSeries() {
  const [data, setData] = useState({ trending: [], popular: [], topRated: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: sbSeries, count } = await supabase
        .from('series')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(100)

      if (count && count > 0) {
        const all = (sbSeries || []).map(normalizeSeries)
        setData({
          trending: all.slice(0, 20),
          popular:  all.slice(0, 20),
          topRated: [...all].sort((a, b) => b.vote_average - a.vote_average).slice(0, 20),
        })
        setLoading(false)
        return
      }

      try {
        const [trending, popular, topRated] = await Promise.all([
          tmdb.trending('tv'),
          tmdb.popular('tv'),
          tmdb.topRated('tv'),
        ])
        setData({
          trending: trending.results,
          popular:  popular.results,
          topRated: topRated.results,
        })
      } catch (_) {}
      setLoading(false)
    }

    load()
  }, [])

  return { ...data, loading }
}
