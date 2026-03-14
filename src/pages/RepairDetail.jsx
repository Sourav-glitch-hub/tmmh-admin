// src/pages/RepairDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, CheckCircle, Clock, Wrench, Search,
  Smartphone, Phone, FileText, AlertCircle, Save, Trash2, Image
} from 'lucide-react'
import { repairAPI } from '../api/index.js'
import { useAuth } from '../context/AuthContext.jsx'
import { statusBadge, formatDateTime, capitalize } from '../utils.js'
import ConfirmModal from '../components/ConfirmModal.jsx'
import styles from './RepairDetail.module.css'

const STATUSES = ['Received', 'Checking', 'Repairing', 'Completed']

const STATUS_ICONS = {
  Received:  <Clock       size={15}/>,
  Checking:  <Search      size={15}/>,
  Repairing: <Wrench      size={15}/>,
  Completed: <CheckCircle size={15}/>,
}

export default function RepairDetail() {
  const { id }       = useParams()
  const { token }    = useAuth()
  const navigate     = useNavigate()

  const [repair,     setRepair]     = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [newStatus,  setNewStatus]  = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [saving,     setSaving]     = useState(false)
  const [saveMsg,    setSaveMsg]    = useState('')
  const [showDel,    setShowDel]    = useState(false)
  const [deleting,   setDeleting]   = useState(false)
  const [lightbox,   setLightbox]   = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await repairAPI.getOne(id, token)
        setRepair(data.data)
        setNewStatus(data.data.status)
        setAdminNotes(data.data.adminNotes || '')
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleSave = async () => {
    setSaving(true); setSaveMsg('')
    try {
      await repairAPI.updateStatus(id, newStatus, adminNotes, token)
      setRepair(r => ({ ...r, status: newStatus, adminNotes }))
      setSaveMsg('Saved successfully!')
      setTimeout(() => setSaveMsg(''), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await repairAPI.delete(id, token)
      navigate('/repairs')
    } catch (err) {
      setError(err.message)
      setDeleting(false)
      setShowDel(false)
    }
  }

  if (loading) return (
    <div className={styles.loadWrap}>
      <div className="spinner spinner-blue" style={{ width: 32, height: 32, borderWidth: 3 }}/>
    </div>
  )

  if (error && !repair) return (
    <div>
      <div className="alert alert-error"><AlertCircle size={15}/>{error}</div>
      <Link to="/repairs" className="btn btn-ghost" style={{ marginTop: 16 }}>
        <ArrowLeft size={15}/> Back to Repairs
      </Link>
    </div>
  )

  const statusIdx = STATUSES.indexOf(repair?.status)

  return (
    <div className={styles.page}>
      {/* Back + title */}
      <div className={styles.topBar}>
        <Link to="/repairs" className="btn btn-ghost btn-sm">
          <ArrowLeft size={15}/> Back
        </Link>
        <div className={styles.topRight}>
          <span className={`badge ${statusBadge(repair.status)}`}>{repair.status}</span>
          <button
            className="btn btn-sm"
            style={{ background: 'var(--red-light)', color: 'var(--red)', border: 'none' }}
            onClick={() => setShowDel(true)}
          >
            <Trash2 size={14}/> Delete
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}><AlertCircle size={15}/>{error}</div>}

      <div className={styles.grid}>
        {/* Left column */}
        <div className={styles.leftCol}>

          {/* Repair ID card */}
          <div className={`card ${styles.idCard}`}>
            <div className={styles.idTop}>
              <div>
                <p className={styles.idLabel}>Repair ID</p>
                <p className={styles.idVal}>{repair.repairId}</p>
              </div>
              <div className={styles.idMeta}>
                <p className={styles.metaItem}><span>Submitted</span>{formatDateTime(repair.createdAt)}</p>
                <p className={styles.metaItem}><span>Updated</span>{formatDateTime(repair.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Customer info */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 className={styles.cardHead}><Phone size={15}/> Customer Info</h3>
            <div className={styles.infoRows}>
              <div className={styles.infoRow}><span>Name</span><strong>{repair.customerName}</strong></div>
              <div className={styles.infoRow}><span>Phone</span><strong>{repair.phoneNumber}</strong></div>
            </div>
          </div>

          {/* Device info */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 className={styles.cardHead}><Smartphone size={15}/> Device Info</h3>
            <div className={styles.infoRows}>
              <div className={styles.infoRow}><span>Brand</span><strong>{repair.deviceBrand}</strong></div>
              <div className={styles.infoRow}><span>Model</span><strong>{repair.deviceModel}</strong></div>
              <div className={styles.infoRow}><span>Problem</span><strong style={{ textTransform: 'capitalize' }}>{repair.problemType}</strong></div>
            </div>
          </div>

          {/* Problem description */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 className={styles.cardHead}><FileText size={15}/> Problem Description</h3>
            <p className={styles.description}>{repair.problemDescription}</p>
          </div>

          {/* Device image — always shown, click to enlarge */}
          <div className="card">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 14 }}>
              <h3 className={styles.cardHead} style={{ marginBottom: 0 }}><Image size={15}/> Device Photo</h3>
              {repair.image && (
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => setLightbox(true)}
                  title="View full size"
                >
                  🔍 View Full
                </button>
              )}
            </div>
            {repair.image ? (
              <img
                src={`http://localhost:5000${repair.image}`}
                alt="Device damage"
                className={styles.deviceImg}
                onClick={() => setLightbox(true)}
                onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}
              />
            ) : null}
            <div
              className={styles.noImage}
              style={{ display: repair.image ? 'none' : 'flex' }}
            >
              <Image size={32} style={{ color: 'var(--border)', marginBottom: 8 }}/>
              <p>No photo uploaded by customer</p>
            </div>
          </div>

          {/* Lightbox — full screen image view */}
          {lightbox && repair.image && (
            <div className={styles.lightbox} onClick={() => setLightbox(false)}>
              <button className={styles.lightboxClose} onClick={() => setLightbox(false)}>✕</button>
              <img
                src={`http://localhost:5000${repair.image}`}
                alt="Device damage full size"
                className={styles.lightboxImg}
                onClick={e => e.stopPropagation()}
              />
            </div>
          )}
        </div>

        {/* Right column — status update */}
        <div className={styles.rightCol}>

          {/* Timeline */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 className={styles.cardHead}>Repair Progress</h3>
            <div className={styles.timeline}>
              {STATUSES.map((s, i) => {
                const done   = i < statusIdx
                const active = i === statusIdx
                return (
                  <div key={s} className={`${styles.tlItem} ${done ? styles.tlDone : ''} ${active ? styles.tlActive : ''}`}>
                    {i < STATUSES.length - 1 && (
                      <div className={`${styles.tlLine} ${done ? styles.tlLineDone : ''}`}/>
                    )}
                    <div className={`${styles.tlDot} ${done ? styles.tlDotDone : ''} ${active ? styles.tlDotActive : ''}`}>
                      {done ? <CheckCircle size={13}/> : STATUS_ICONS[s]}
                    </div>
                    <div className={styles.tlText}>
                      <span className={`${styles.tlLabel} ${!done && !active ? styles.tlFuture : ''}`}>{s}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Update status */}
          <div className="card">
            <h3 className={styles.cardHead}>Update Status</h3>

            <div className="form-group">
              <label className="form-label">New Status</label>
              <select
                className="form-select"
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Admin Notes <span style={{ color: 'var(--subtle)', fontSize: 11, textTransform: 'none', fontWeight: 400 }}>(optional)</span></label>
              <textarea
                className="form-textarea"
                placeholder="Internal notes about this repair…"
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                rows={4}
              />
            </div>

            {saveMsg && (
              <div className="alert alert-success" style={{ marginBottom: 12 }}>
                <CheckCircle size={14}/> {saveMsg}
              </div>
            )}

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving
                ? <><div className="spinner"/> Saving…</>
                : <><Save size={15}/> Save Changes</>
              }
            </button>
          </div>
        </div>
      </div>

      {showDel && (
        <ConfirmModal
          title="Delete Repair Request"
          message={`Permanently delete repair "${repair.repairId}"? This cannot be undone.`}
          confirmLabel="Yes, Delete"
          danger
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setShowDel(false)}
        />
      )}
    </div>
  )
}