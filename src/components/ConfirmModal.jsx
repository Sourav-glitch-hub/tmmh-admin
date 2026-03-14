// src/components/ConfirmModal.jsx
import { AlertTriangle } from 'lucide-react'

export default function ConfirmModal({
  title, message, confirmLabel = 'Confirm',
  danger = false, loading = false,
  onConfirm, onCancel
}) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: danger ? 'var(--red-light)' : 'var(--amber-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: danger ? 'var(--red)' : 'var(--amber)', flexShrink: 0
            }}>
              <AlertTriangle size={18}/>
            </div>
            <span className="modal-title">{title}</span>
          </div>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.6 }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <><div className="spinner"/> Processing…</> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}