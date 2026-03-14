import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'

export function useWatchlist() {
  const { user } = useAuth()
  const [watchlist, setWatchlist] = useState([])

  useEffect(() => {
    if (!user) { setWatchlist([]); return }
    supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data }) => setWatchlist(data || []))
  }, [user])

  const isInWatchlist = (tmdbId, mediaType) =>
    watchlist.some(i => i.tmdb_id === tmdbId && i.media_type === mediaType)

  const toggle = async (item) => {
    if (!user) return
    const exists = isInWatchlist(item.tmdb_id, item.media_type)
    if (exists) {
      await supabase.from('watchlist').delete()
        .eq('user_id', user.id).eq('tmdb_id', item.tmdb_id).eq('media_type', item.media_type)
      setWatchlist(prev => prev.filter(i => !(i.tmdb_id === item.tmdb_id && i.media_type === item.media_type)))
    } else {
      const { data } = await supabase.from('watchlist').insert({ ...item, user_id: user.id }).select().single()
      if (data) setWatchlist(prev => [...prev, data])
    }
  }

  return { watchlist, isInWatchlist, toggle }
}
