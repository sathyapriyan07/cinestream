import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../services/supabase'
import AdminHeader from '../../components/admin/AdminHeader'
import AdminModal from '../../components/admin/AdminModal'
import { Field, Input, Textarea, Select, FormActions } from '../../components/admin/AdminForm'
import { useToast, ToastContainer, ConfirmDialog, Pagination } from '../../components/admin/AdminUtils'

const PER_PAGE = 20

const EMPTY_FORM = {
  title: '', backdrop_url: '', tmdb_id: '', media_type: 'movie', display_order: '', active: true,
}

function validate(form) {
  const errs = {}
  if (!form.title.trim()) errs.title = 'Title is required'
  if (form.tmdb_id && isNaN(Number(form.tmdb_id))) errs.tmdb_id = 'Must be a number'
  if (form.display_order && isNaN(Number(form.display_order))) errs.display_order = 'Must be a number'
  return errs
}

export default function AdminHeroBanners() {
  const [rows, setRows]           = useState([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [page, setPage]           = useState(1)
  const [editRow, setEditRow]     = useState(null)
  const [deleteRow, setDeleteRow] = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [errors, setErrors]       = useState({})
  const [saving, setSaving]       = useState(false)
  const { toasts, toast }         = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    const { data, count } = await supabase
      .from('hero_banners')
      .select('*', { count: 'exact' })
      .order('display_order', { ascending: true })
      .range((page - 1) * PER_PAGE, page * PER_PAGE - 1)
    setRows(data || [])
    setTotal(count || 0)
    setLoading(false)
  }, [page])

  useEffect(() => { load() }, [load])

  const openAdd  = () => { setForm(EMPTY_FORM); setErrors({}); setEditRow({}) }
  const openEdit = (row) => {
    setForm({
      title:         row.title         || '',
      backdrop_url:  row.backdrop_url  || '',
      tmdb_id:       row.tmdb_id       != null ? String(row.tmdb_id) : '',
      media_type:    row.media_type    || 'movie',
      display_order: row.display_order != null ? String(row.display_order) : '',
      active:        row.active        ?? true,
    })
    setErrors({})
    setEditRow(row)
  }

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [e.target.name]: val }))
    setErrors((er) => ({ ...er, [e.target.name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)

    const payload = {
      title:         form.title.trim(),
      backdrop_url:  form.backdrop_url.trim() || null,
      tmdb_id:       form.tmdb_id ? Number(form.tmdb_id) : null,
      media_type:    form.media_type,
      display_order: form.display_order ? Number(form.display_order) : 0,
      active:        form.active,
    }

    let error
    if (editRow?.id) {
      ;({ error } = await supabase.from('hero_banners').update(payload).eq('id', editRow.id))
    } else {
      ;({ error } = await supabase.from('hero_banners').insert(payload))
    }

    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(editRow?.id ? 'Banner updated successfully' : 'Banner added successfully')
    setEditRow(null)
    load()
  }

  const handleDelete = async () => {
    const { error } = await supabase.from('hero_banners').delete().eq('id', deleteRow.id)
    setDeleteRow(null)
    if (error) { toast.error(error.message); return }
    toast.success('Banner deleted')
    load()
  }

  const toggleActive = async (row) => {
    const { error } = await supabase.from('hero_banners').update({ active: !row.active }).eq('id', row.id)
    if (error) { toast.error(error.message); return }
    toast.success(`Banner ${!row.active ? 'activated' : 'deactivated'}`)
    load()
  }

  return (
    <div>
      <AdminHeader
        title="Hero Banners"
        subtitle={`${total} banners configured`}
        action={
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-accent hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Banner
          </button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-video rounded-xl bg-zinc-900 animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-surface border border-zinc-800 rounded-xl p-12 text-center text-zinc-600">
          No hero banners configured yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((row, i) => (
            <motion.div
              key={row.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative group rounded-xl overflow-hidden border border-zinc-800 bg-surface"
            >
              {/* Backdrop */}
              <div className="aspect-video relative">
                {row.backdrop_url ? (
                  <img src={row.backdrop_url} alt={row.title}
                    className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700 text-sm">
                    No image
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Active badge */}
                <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  row.active ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                }`}>
                  {row.active ? 'Active' : 'Inactive'}
                </div>

                {/* Order badge */}
                <div className="absolute top-2 left-2 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-[10px] font-bold text-zinc-400">
                  {row.display_order ?? '—'}
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="font-semibold text-sm text-white truncate">{row.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    row.media_type === 'movie' ? 'bg-accent/15 text-accent' : 'bg-blue-500/15 text-blue-400'
                  }`}>
                    {row.media_type}
                  </span>
                  {row.tmdb_id && (
                    <span className="text-[10px] text-zinc-600 font-mono">ID: {row.tmdb_id}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="px-3 pb-3 flex items-center gap-2">
                <button onClick={() => openEdit(row)}
                  className="flex-1 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 hover:text-white transition-colors">
                  Edit
                </button>
                <button onClick={() => toggleActive(row)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    row.active
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white'
                      : 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
                  }`}>
                  {row.active ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => setDeleteRow(row)}
                  className="w-8 h-8 rounded-lg bg-accent/10 hover:bg-accent/20 flex items-center justify-center text-accent transition-colors flex-shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Pagination page={page} total={total} perPage={PER_PAGE} onChange={setPage} />

      {/* Edit / Add Modal */}
      <AdminModal open={editRow !== null} onClose={() => setEditRow(null)}
        title={editRow?.id ? 'Edit Banner' : 'Add Banner'} size="md">
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 flex flex-col gap-4">
            <Field label="Title" required error={errors.title}>
              <Input name="title" value={form.title} onChange={handleChange} placeholder="Banner title" error={errors.title} />
            </Field>
            <Field label="Backdrop Image URL" error={errors.backdrop_url}>
              <Input name="backdrop_url" value={form.backdrop_url} onChange={handleChange} placeholder="https://…" />
            </Field>
            {form.backdrop_url && (
              <div>
                <p className="text-xs text-zinc-600 mb-2">Preview</p>
                <img src={form.backdrop_url} alt="preview"
                  className="w-full aspect-video rounded-lg object-cover border border-zinc-800"
                  onError={(e) => { e.target.style.display = 'none' }} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <Field label="TMDB ID" error={errors.tmdb_id}>
                <Input name="tmdb_id" value={form.tmdb_id} onChange={handleChange} placeholder="12345" />
              </Field>
              <Field label="Display Order" error={errors.display_order}>
                <Input name="display_order" value={form.display_order} onChange={handleChange} placeholder="1" />
              </Field>
            </div>
            <Field label="Media Type">
              <Select name="media_type" value={form.media_type} onChange={handleChange}>
                <option value="movie">Movie</option>
                <option value="tv">TV Series</option>
              </Select>
            </Field>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="active" checked={form.active} onChange={handleChange}
                className="w-4 h-4 accent-accent rounded" />
              <span className="text-sm text-zinc-300">Active (show on homepage)</span>
            </label>
          </div>
          <FormActions onCancel={() => setEditRow(null)} submitLabel={editRow?.id ? 'Update Banner' : 'Add Banner'} loading={saving} />
        </form>
      </AdminModal>

      <ConfirmDialog open={!!deleteRow} title="Delete Banner"
        message={`Delete banner "${deleteRow?.title}"?`}
        onConfirm={handleDelete} onCancel={() => setDeleteRow(null)} />

      <ToastContainer toasts={toasts} />
    </div>
  )
}
