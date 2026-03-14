import axios from 'axios'
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE } from '../config'

const api = axios.create({
  baseURL: TMDB_BASE_URL,
  params: { api_key: TMDB_API_KEY },
})

export const img = (path, size = 'w500') =>
  path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null

export const tmdb = {
  trending: (type = 'all', window = 'week') =>
    api.get(`/trending/${type}/${window}`).then(r => r.data),

  popular: (type = 'movie') =>
    api.get(`/${type}/popular`).then(r => r.data),

  topRated: (type = 'movie') =>
    api.get(`/${type}/top_rated`).then(r => r.data),

  nowPlaying: () =>
    api.get('/movie/now_playing').then(r => r.data),

  upcoming: () =>
    api.get('/movie/upcoming').then(r => r.data),

  movieDetail: (id) =>
    api.get(`/movie/${id}`, { params: { append_to_response: 'credits,similar,videos' } }).then(r => r.data),

  tvDetail: (id) =>
    api.get(`/tv/${id}`, { params: { append_to_response: 'credits,similar,videos' } }).then(r => r.data),

  tvSeason: (id, season) =>
    api.get(`/tv/${id}/season/${season}`).then(r => r.data),

  search: (query, page = 1) =>
    api.get('/search/multi', { params: { query, page } }).then(r => r.data),

  genres: (type = 'movie') =>
    api.get(`/genre/${type}/list`).then(r => r.data),

  discover: (type = 'movie', params = {}) =>
    api.get(`/discover/${type}`, { params }).then(r => r.data),

  images: (type, id) =>
    api.get(`/${type}/${id}/images`, { params: { include_image_language: 'en,null' } }).then(r => r.data),

  videos: (type, id) =>
    api.get(`/${type}/${id}/videos`).then(r => r.data),
}
