import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import AdminHeader from '../../components/admin/AdminHeader'
import { useToast, ToastContainer } from '../../components/admin/AdminUtils'
import { Field, Input, FormActions } from '../../components/admin/AdminForm'
import { supabase } from '../../services/supabase'

export default function AdminSettings() {
  const { user } = useAuth()
  const { toasts, toast } = useToast()
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwErrors, setPwErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const handlePwChange = (e) => {
    setPwForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setPwErrors((er) => ({ ...er, [e.target.name]: undefined }))
  }

  const handlePwSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!pwForm.next || pwForm.next.length < 6) errs.next = 'Minimum 6 characters'
    if (pwForm.next !== pwForm.confirm) errs.confirm = 'Passwords do not match'
    if (Object.keys(errs).length) { setPwErrors(errs); return }

    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: pwForm.next })
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Password updated successfully')
    setPwForm({ current: '', next: '', confirm: '' })
  }

  return (
    <div>
      <AdminHeader title="Settings" subtitle="Admin account settings" />

      <div className="max-w-lg space-y-6">
        {/* Account info */}
        <div className="bg-surface border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Account</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-lg font-bold text-accent">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-white">{user?.email}</p>
              <p className="text-xs text-accent mt-0.5">Administrator</p>
            </div>
          </div>
        </div>

        {/* Change password */}
        <div className="bg-surface border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Change Password</h2>
          </div>
          <form onSubmit={handlePwSubmit}>
            <div className="px-5 py-4 flex flex-col gap-4">
              <Field label="New Password" required error={pwErrors.next}>
                <Input type="password" name="next" value={pwForm.next} onChange={handlePwChange}
                  placeholder="••••••••" error={pwErrors.next} />
              </Field>
              <Field label="Confirm New Password" required error={pwErrors.confirm}>
                <Input type="password" name="confirm" value={pwForm.confirm} onChange={handlePwChange}
                  placeholder="••••••••" error={pwErrors.confirm} />
              </Field>
            </div>
            <FormActions onCancel={() => setPwForm({ current: '', next: '', confirm: '' })}
              submitLabel="Update Password" loading={saving} />
          </form>
        </div>
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  )
}
