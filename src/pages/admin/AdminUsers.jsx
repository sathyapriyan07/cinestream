import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import AdminHeader from '../../components/admin/AdminHeader'
import AdminTable from '../../components/admin/AdminTable'
import { useToast, ToastContainer, ConfirmDialog, Pagination } from '../../components/admin/AdminUtils'

const PER_PAGE = 20

export default function AdminUsers() {
  const [rows, setRows]             = useState([])
  const [total, setTotal]           = useState(0)
  const [loading, setLoading]       = useState(true)
  const [page, setPage]             = useState(1)
  const [search, setSearch]         = useState('')
  const [confirmRow, setConfirmRow] = useState(null)   // { row, action }
  const { user: currentUser }       = useAuth()
  const { toasts, toast }           = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('user_profiles').select('*', { count: 'exact' })
    if (search) q = q.ilike('email', `%${search}%`)
    q = q.order('created_at', { ascending: false })
         .range((page - 1) * PER_PAGE, page * PER_PAGE - 1)
    const { data, count } = await q
    setRows(data || [])
    setTotal(count || 0)
    setLoading(false)
  }, [page, search])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [search])

  const handleConfirm = async () => {
    const { row, action } = confirmRow
    setConfirmRow(null)

    let payload = {}
    if (action === 'promote')    payload = { role: 'admin' }
    if (action === 'demote')     payload = { role: 'user' }
    if (action === 'deactivate') payload = { active: false }
    if (action === 'activate')   payload = { active: true }

    const { error } = await supabase.from('user_profiles').update(payload).eq('id', row.id)
    if (error) { toast.error(error.message); return }

    const messages = {
      promote:    'User promoted to admin',
      demote:     'Admin role removed',
      deactivate: 'User deactivated',
      activate:   'User activated',
    }
    toast.success(messages[action])
    load()
  }

  const confirmMessages = {
    promote:    (r) => `Promote "${r?.email}" to admin?`,
    demote:     (r) => `Remove admin role from "${r?.email}"?`,
    deactivate: (r) => `Deactivate account for "${r?.email}"?`,
    activate:   (r) => `Reactivate account for "${r?.email}"?`,
  }

  const columns = [
    {
      key: 'avatar', label: '', width: 44,
      render: (row) => (
        <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-xs font-bold text-accent flex-shrink-0">
          {row.email?.[0]?.toUpperCase() || '?'}
        </div>
      ),
    },
    {
      key: 'email', label: 'Email',
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-white">{row.email}</p>
          {row.id === currentUser?.id && (
            <span className="text-[10px] text-accent">You</span>
          )}
        </div>
      ),
    },
    {
      key: 'role', label: 'Role', width: 100,
      render: (row) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          row.role === 'admin'
            ? 'bg-accent/15 text-accent border border-accent/20'
            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
        }`}>
          {row.role || 'user'}
        </span>
      ),
    },
    {
      key: 'active', label: 'Status', width: 90,
      render: (row) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
          row.active !== false
            ? 'bg-green-500/15 text-green-400'
            : 'bg-zinc-800 text-zinc-500'
        }`}>
          {row.active !== false ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'created_at', label: 'Joined', width: 110,
      render: (row) => (
        <span className="text-zinc-500 text-xs">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'actions', label: 'Actions', width: 200,
      render: (row) => {
        if (row.id === currentUser?.id) {
          return <span className="text-xs text-zinc-600 italic">Current user</span>
        }
        const isAdmin  = row.role === 'admin'
        const isActive = row.active !== false
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setConfirmRow({ row, action: isAdmin ? 'demote' : 'promote' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isAdmin
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white'
                  : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400'
              }`}
            >
              {isAdmin ? 'Remove Admin' : 'Make Admin'}
            </button>
            <button
              onClick={() => setConfirmRow({ row, action: isActive ? 'deactivate' : 'activate' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-accent/10 hover:bg-accent/20 text-accent'
                  : 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
              }`}
            >
              {isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        )
      },
    },
  ]

  return (
    <div>
      <AdminHeader title="Users" subtitle={`${total} registered users`} />

      <div className="mb-4">
        <div className="relative max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email…"
            className="w-full bg-surface border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>
      </div>

      <AdminTable columns={columns} data={rows} loading={loading} emptyMessage="No users found." />
      <Pagination page={page} total={total} perPage={PER_PAGE} onChange={setPage} />

      <ConfirmDialog
        open={!!confirmRow}
        title="Confirm Action"
        message={confirmRow ? confirmMessages[confirmRow.action]?.(confirmRow.row) : ''}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmRow(null)}
        danger={confirmRow?.action === 'deactivate' || confirmRow?.action === 'demote'}
      />

      <ToastContainer toasts={toasts} />
    </div>
  )
}
