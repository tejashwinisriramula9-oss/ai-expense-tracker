import { motion, AnimatePresence } from 'framer-motion'

/**
 * Glassmorphism dark confirmation modal.
 * Props:
 *   open      — boolean
 *   title     — string (optional)
 *   message   — string
 *   onConfirm — () => void
 *   onCancel  — () => void
 */
export default function ConfirmModal({ open, title = 'Confirm Delete', message = 'Are you sure you want to delete this item?', onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            key="modal-box"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed left-1/2 top-1/2 z-[101] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-slate-900/90 p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          >
            {/* Icon */}
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/15">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-rose-400">
                <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 4.5v4m0 2.5h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>

            <h3 className="text-base font-semibold text-white">{title}</h3>
            <p className="mt-1.5 text-sm text-slate-400">{message}</p>

            <div className="mt-5 flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 rounded-xl border border-white/10 bg-slate-800/60 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700/60 hover:text-white transition-all duration-150"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 rounded-xl bg-rose-500/90 py-2.5 text-sm font-semibold text-white hover:bg-rose-500 transition-all duration-150 shadow-[0_0_16px_rgba(239,68,68,0.25)]"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
