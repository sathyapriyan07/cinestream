import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'

export function useContinueWatching() {
  const { user } = useAuth()
  const [items, setItems] = useState([])

  const fetch = useCallback(async () => {
    if (!user) { setItems([]); return }
    const { data } = await supabase
      .from('continue_watching')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(20)
    setItems(data || [])
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  const saveProgress = async (payload) => {
    if (!user) return
    const { tmdb_id, media_type, season, episode, timestamp, duration } = payload
    const progress = duration > 0 ? Math.round((timestamp / duration) * 100) : 0
    await supabase.from('continue_watching').upsert(
      { user_id: user.id, tmdb_id, media_type, season, episode, timestamp, duration, progress, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,tmdb_id,media_type' }
    )
    fetch()
  }

  const getProgress = (tmdbId, mediaType) =>
    items.find(i => i.tmdb_id === tmdbId && i.media_type === mediaType)

  return { items, saveProgress, getProgress }
}
