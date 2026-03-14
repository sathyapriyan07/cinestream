import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../services/supabase'
import { tmdb, img } from '../../services/tmdb'
import AdminHeader from '../../components/admin/AdminHeader'
import AdminTable from '../../components/admin/AdminTable'
import AdminModal from '../../components/admin/AdminModal'
import { Field, Input, Textarea, FormActions } from '../../components/admin/AdminForm'
import { useToast, ToastContainer, ConfirmDialog, Pagination } from '../../components/admin/AdminUtils'

const PER_PAGE = 20
const TMDB_IMG = 'https://image.tmdb.org/t/p'

const EMPTY_FORM = {
  title: '', description: '', poster_url: '', backdrop_url: '',
  release_date: '', runtime: '', genres: '', tmdb_id: '', vote_average: '', title_logo_url: '',
}

function validate(form) {
  const errs = {}
  if (!form.title.trim()) errs.title = 'Title is required'
  if (form.tmdb_id && isNaN(Number(form.tmdb_id))) errs.tmdb_id = 'Must be a number'
  if (form.runtime && isNaN(Number(form.runtime))) errs.runtime = 'Must be a number'
  return errs
}

/* ── TMDB Search Panel ─────────────────────────────────────── */
function TmdbImportPanel({ onImport, importingId }) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef(null)

  const search = useCallback((q) => {
    if (!q.trim()) { setResults([]); return }
    setSearching(true)
    tmdb.search(q).then((d) => {
      setResults((d.results || []).filter((r) => r.media_type === 'movie').slice(0, 12))
      setSearching(false)
    }).catch(() => setSearching(false))
  }, [])

  const handleInput = (e) => {
    const q = e.target.value
    setQuery(q)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(q), 350)
  }

  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900/60 border-b border-zinc-800">
        <div className="w-5 h-5 flex-shrink-0">
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Import from TMDB</p>
          <p className="text-xs text-zinc-500">Search and import movies directly from The Movie Database</p>
        </div>
      </div>

      <div className="p-4">
        {/* Search input */}
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={query}
            onChange={handleInput}
            placeholder="Search TMDB for a movie title…"
            className="w-full bg-black border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Results grid */}
        {results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {results.map((movie) => {
              const isImporting = importingId === movie.id
              return (
                <div key={movie.id} className="group relative">
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 mb-1.5">
                    {movie.poster_path ? (
                      <img
                        src={`${TMDB_IMG}/w185${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs text-center p-2">
                        {movie.title}
                      </div>
                    )}
                    {/* Import overlay */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <button
                        onClick={() => onImport(movie)}
                        disabled={isImporting}
                        className="flex items-center gap-1.5 bg-accent hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                      >
                        {isImporting ? (
                          <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                          </svg>
                        )}
                        Import
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-300 truncate font-medium">{movie.title}</p>
                  <p className="text-[10px] text-zinc-600">{movie.release_date?.slice(0, 4)}</p>
                </div>
              )
            })}
          </div>
        )}

        {!searching && query && results.length === 0 && (
          <p className="text-center text-sm text-zinc-600 py-6">No movies found for "{query}"</p>
        )}

        {!query && (
          <p className="text-center text-xs text-zinc-700 py-4">
            Type a movie title above to search TMDB
          </p>
        )}
      </div>
    </div>
  )
}

/* ── Main Page ─────────────────────────────────────────────── */
export default function AdminMovies() {
  const [rows, setRows]           = useState([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [page, setPage]           = useState(1)
  const [search, setSearch]       = useState('')
  const [editRow, setEditRow]     = useState(null)
  const [deleteRow, setDeleteRow] = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [errors, setErrors]       = useState({})
  const [saving, setSaving]       = useState(false)
  const [importingId, setImportingId] = useState(null)
  const [showImport, setShowImport]   = useState(false)
  const { toasts, toast }         = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('movies').select('*', { count: 'exact' })
    if (search) q = q.ilike('title', `%${search}%`)
    q = q.order('created_at', { ascending: false })
         .range((page - 1) * PER_PAGE, page * PER_PAGE - 1)
    const { data, count } = await q
    setRows(data || [])
    setTotal(count || 0)
    setLoading(false)
  }, [page, search])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [search])

  /* ── TMDB one-click import ── */
  const handleTmdbImport = async (movie) => {
    setImportingId(movie.id)
    try {
      // Fetch full details for runtime + genres
      const detail = await tmdb.movieDetail(movie.id)
      const genres = (detail.genres || []).map((g) => g.name)
      const payload = {
        tmdb_id:      detail.id,
        title:        detail.title,
        description:  detail.overview || '',
        poster_url:   detail.poster_path   ? `${TMDB_IMG}/w500${detail.poster_path}`   : null,
        backdrop_url: detail.backdrop_path ? `${TMDB_IMG}/original${detail.backdrop_path}` : null,
        release_date: detail.release_date  || null,
        runtime:      detail.runtime       || null,
        genres,
        vote_average: detail.vote_average  || 0,
      }
      const { error } = await supabase
        .from('movies')
        .upsert(payload, { onConflict: 'tmdb_id' })
      if (error) throw error
      toast.success(`"${detail.title}" imported successfully`)
      load()
    } catch (err) {
      toast.error(err.message || 'Import failed')
    }
    setImportingId(null)
  }

  /* ── Manual add / edit ── */
  const openAdd  = () => { setForm(EMPTY_FORM); setErrors({}); setEditRow({}) }
  const openEdit = (row) => {
    setForm({
      title:          row.title          || '',
      description:    row.description    || '',
      poster_url:     row.poster_url     || '',
      backdrop_url:   row.backdrop_url   || '',
      release_date:   row.release_date   || '',
      runtime:        row.runtime        != null ? String(row.runtime)        : '',
      genres:         Array.isArray(row.genres) ? row.genres.join(', ') : (row.genres || ''),
      tmdb_id:        row.tmdb_id        != null ? String(row.tmdb_id)        : '',
      vote_average:   row.vote_average   != null ? String(row.vote_average)   : '',
      title_logo_url: row.title_logo_url || '',
    })
    setErrors({})
    setEditRow(row)
  }

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((er) => ({ ...er, [e.target.name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)

    const payload = {
      title:        form.title.trim(),
      description:  form.description.trim(),
      poster_url:   form.poster_url.trim()   || null,
      backdrop_url: form.backdrop_url.trim() || null,
      release_date: form.release_date        || null,
      runtime:      form.runtime      ? Number(form.runtime)      : null,
      genres:       form.genres ? form.genres.split(',').map((g) => g.trim()).filter(Boolean) : [],
      title_logo_url: form.title_logo_url.trim() || null,
      tmdb_id:      form.tmdb_id      ? Number(form.tmdb_id)      : null,
      vote_average: form.vote_average ? Number(form.vote_average) : null,
    }

    let error
    if (editRow?.id) {
      ;({ error } = await supabase.from('movies').update(payload).eq('id', editRow.id))
    } else {
      ;({ error } = await supabase.from('movies').insert(payload))
    }

    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(editRow?.id ? 'Movie updated successfully' : 'Movie added successfully')
    setEditRow(null)
    load()
  }

  const handleDelete = async () => {
    const { error } = await supabase.from('movies').delete().eq('id', deleteRow.id)
    setDeleteRow(null)
    if (error) { toast.error(error.message); return }
    toast.success('Movie deleted')
    load()
  }

  const columns = [
    {
      key: 'poster_url', label: 'Poster', width: 60,
      render: (row) => (
        <div className="w-9 h-12 rounded overflow-hidden bg-zinc-900 flex-shrink-0">
          {row.poster_url
            ? <img src={row.poster_url} alt="" className="w-full h-full object-cover" loading="lazy" />
            : <div className="w-full h-full bg-zinc-800" />}
        </div>
      ),
    },
    {
      key: 'title', label: 'Title',
      render: (row) => <span className="font-medium text-white">{row.title}</span>,
    },
    {
      key: 'release_date', label: 'Year', width: 70,
      render: (row) => <span className="text-zinc-400">{row.release_date?.slice(0, 4) || '—'}</span>,
    },
    {
      key: 'genres', label: 'Genres',
      render: (row) => {
        const g = Array.isArray(row.genres) ? row.genres : []
        return (
          <div className="flex flex-wrap gap-1">
            {g.slice(0, 3).map((genre) => (
              <span key={genre} className="px-1.5 py-0.5 bg-zinc-800 text-zinc-400 text-[10px] rounded">{genre}</span>
            ))}
          </div>
        )
      },
    },
    {
      key: 'vote_average', label: 'Rating', width: 70,
      render: (row) => row.vote_average
        ? <span className="text-yellow-400 text-xs font-bold">★ {Number(row.vote_average).toFixed(1)}</span>
        : <span className="text-zinc-600">—</span>,
    },
    {
      key: 'tmdb_id', label: 'TMDB ID', width: 90,
      render: (row) => <span className="text-zinc-500 font-mono text-xs">{row.tmdb_id ?? '—'}</span>,
    },
    {
      key: 'actions', label: 'Actions', width: 130,
      render: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(row)}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 hover:text-white transition-colors">
            Edit
          </button>
          <button onClick={() => setDeleteRow(row)}
            className="px-3 py-1.5 rounded-lg bg-accent/10 hover:bg-accent/20 text-xs font-medium text-accent transition-colors">
            Delete
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <AdminHeader
        title="Movies"
        subtitle={`${total} total movie${total !== 1 ? 's' : ''} in library`}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImport((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                showImport
                  ? 'bg-accent/15 border-accent/40 text-accent'
                  : 'border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {showImport ? 'Hide Import' : 'Import from TMDB'}
            </button>
            <button onClick={openAdd}
              className="flex items-center gap-2 bg-accent hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Manually
            </button>
          </div>
        }
      />

      {/* TMDB Import Panel */}
      {showImport && (
        <div className="mb-6">
          <TmdbImportPanel onImport={handleTmdbImport} importingId={importingId} />
        </div>
      )}

      {/* Library search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search library by title…"
            className="w-full bg-surface border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>
      </div>

      <AdminTable columns={columns} data={rows} loading={loading} emptyMessage="No movies in library yet. Use 'Import from TMDB' to add movies." />
      <Pagination page={page} total={total} perPage={PER_PAGE} onChange={setPage} />

      {/* Edit / Add Modal */}
      <AdminModal open={editRow !== null} onClose={() => setEditRow(null)}
        title={editRow?.id ? 'Edit Movie' : 'Add Movie Manually'} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Title" required error={errors.title}>
                <Input name="title" value={form.title} onChange={handleChange} placeholder="Movie title" error={errors.title} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Description" error={errors.description}>
                <Textarea name="description" value={form.description} onChange={handleChange} placeholder="Short description…" rows={3} />
              </Field>
            </div>
            <Field label="Poster URL" error={errors.poster_url}>
              <Input name="poster_url" value={form.poster_url} onChange={handleChange} placeholder="https://…" />
            </Field>
            <Field label="Backdrop URL" error={errors.backdrop_url}>
              <Input name="backdrop_url" value={form.backdrop_url} onChange={handleChange} placeholder="https://…" />
            </Field>
            <Field label="Release Date" error={errors.release_date}>
              <Input type="date" name="release_date" value={form.release_date} onChange={handleChange} />
            </Field>
            <Field label="Runtime (minutes)" error={errors.runtime}>
              <Input name="runtime" value={form.runtime} onChange={handleChange} placeholder="120" />
            </Field>
            <Field label="Genres (comma separated)" error={errors.genres}>
              <Input name="genres" value={form.genres} onChange={handleChange} placeholder="Action, Drama, Thriller" />
            </Field>
            <Field label="Rating (0–10)" error={errors.vote_average}>
              <Input name="vote_average" value={form.vote_average} onChange={handleChange} placeholder="7.5" />
            </Field>
            <Field label="TMDB ID" error={errors.tmdb_id}>
              <Input name="tmdb_id" value={form.tmdb_id} onChange={handleChange} placeholder="12345" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Title Logo URL" error={errors.title_logo_url}>
                <Input name="title_logo_url" value={form.title_logo_url} onChange={handleChange} placeholder="https://… (overrides TMDB auto-logo)" />
              </Field>
            </div>
            {form.poster_url && (
              <div className="sm:col-span-2">
                <p className="text-xs text-zinc-600 mb-2">Poster Preview</p>
                <img src={form.poster_url} alt="preview"
                  className="h-28 rounded-lg object-cover border border-zinc-800"
                  onError={(e) => { e.target.style.display = 'none' }} />
              </div>
            )}
          </div>
          <FormActions onCancel={() => setEditRow(null)} submitLabel={editRow?.id ? 'Update Movie' : 'Add Movie'} loading={saving} />
        </form>
      </AdminModal>

      <ConfirmDialog open={!!deleteRow} title="Delete Movie"
        message={`Are you sure you want to delete "${deleteRow?.title}"? This cannot be undone.`}
        onConfirm={handleDelete} onCancel={() => setDeleteRow(null)} />

      <ToastContainer toasts={toasts} />
    </div>
  )
}
