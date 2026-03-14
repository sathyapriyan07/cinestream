/* Reusable form field components for admin forms */

export function Field({ label, error, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-accent">{error}</p>}
    </div>
  )
}

export function Input({ error, ...props }) {
  return (
    <input
      {...props}
      className={`w-full bg-black border rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors ${
        error ? 'border-accent/60 focus:border-accent' : 'border-zinc-800 focus:border-zinc-600'
      } ${props.className || ''}`}
    />
  )
}

export function Textarea({ error, rows = 3, ...props }) {
  return (
    <textarea
      rows={rows}
      {...props}
      className={`w-full bg-black border rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors resize-none ${
        error ? 'border-accent/60 focus:border-accent' : 'border-zinc-800 focus:border-zinc-600'
      }`}
    />
  )
}

export function Select({ error, children, ...props }) {
  return (
    <select
      {...props}
      className={`w-full bg-black border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none transition-colors ${
        error ? 'border-accent/60 focus:border-accent' : 'border-zinc-800 focus:border-zinc-600'
      }`}
    >
      {children}
    </select>
  )
}

export function FormActions({ onCancel, submitLabel = 'Save', loading = false }) {
  return (
    <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-800 bg-black/30">
      <button
        type="button"
        onClick={onCancel}
        className="px-5 py-2 rounded-lg border border-zinc-700 text-sm font-medium text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading}
        className="px-5 py-2 rounded-lg bg-accent hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {loading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
        {submitLabel}
      </button>
    </div>
  )
}
