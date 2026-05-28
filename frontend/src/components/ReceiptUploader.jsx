import { useState } from 'react'
import api from '../api/axiosConfig'
import toast from 'react-hot-toast'

export default function ReceiptUploader() {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleUpload = async () => {
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    setLoading(true)
    try {
      const response = await api.post('/receipt-upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(response.data)
      toast.success('Receipt uploaded successfully')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-soft">
      <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Receipt scanner</p>
      <p className="mt-3 text-xl font-semibold text-white">Upload a bill image for instant review</p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="file"
          accept="image/*"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-white"
        />
        <button
          onClick={handleUpload}
          disabled={loading}
          className="rounded-3xl bg-gradient-to-r from-indigo-500 to-sky-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Scanning…' : 'Scan Receipt'}
        </button>
      </div>
      {result && (
        <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Merchant</p>
          <p className="mt-1 text-lg font-semibold text-white">{result.merchant}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-300">
              <p className="text-slate-400">Total</p>
              <p className="mt-2 text-xl font-semibold text-white">
                {typeof result.total === 'number' ? `$${result.total.toFixed(2)}` : 'Unknown'}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-300">
              <p className="text-slate-400">Date</p>
              <p className="mt-2 text-xl font-semibold text-white">{new Date(result.date).toLocaleDateString()}</p>
            </div>
            <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-300">
              <p className="text-slate-400">Items scanned</p>
              <p className="mt-2 text-xl font-semibold text-white">{Array.isArray(result.items) ? result.items.length : 0}</p>
            </div>
          </div>
          {result.parsed_text ? (
            <p className="mt-4 text-sm text-slate-400">{result.parsed_text}</p>
          ) : null}
        </div>
      )}
    </div>
  )
}
