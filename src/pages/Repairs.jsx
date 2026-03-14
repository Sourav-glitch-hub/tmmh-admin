// src/pages/Repairs.jsx
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, Filter, RefreshCw, Eye, Trash2, AlertCircle, ChevronLeft, ChevronRight, Camera
} from 'lucide-react'
import { repairAPI } from '../api/index.js'
import { useAuth } from '../context/AuthContext.jsx'
import { statusBadge, formatDate } from '../utils.js'
import ConfirmModal from '../components/ConfirmModal.jsx'
import styles from './Repairs.module.css'

const STATUSES = ['', 'Received', 'Checking', 'Repairing', 'Completed']

export default function Repairs() {
  const { token } = useAuth()
  const [repairs,  setRepairs]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [search,   setSearch]   = useState('')
  const [status,   setStatus]   = useState('')
  const [page,     setPage]     = useState(1)
  const [pagination, setPagination] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const data = await repairAPI.getAll(token, { page, limit: 12, status, search })
      setRepairs(data.data || [])
      setPagination(data.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token, page, status, search])

  // Reload when filters change; debounce search
  useEffect(() => {
    const t = setTimeout(load, search ? 400 : 0)
    return () => clearTimeout(t)
  }, [load])

  // Reset to page 1 when filter changes
  useEffect(() => { setPage(1) }, [status, search])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await repairAPI.delete(deleteId, token)
      setDeleteId(null)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className={`card ${styles.toolbar}`}>
        {/* Search */}
        <div className={styles.searchBox}>
          <Search size={15} className={styles.searchIcon}/>
          <input
            className={styles.searchInput}
            placeholder="Search by ID, name, phone, brand…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        {/* Status filter */}
        <div className={styles.filterGroup}>
          <Filter size={15} className={styles.filterIcon}/>
          <select
            className={`form-select ${styles.filterSelect}`}
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUSES.filter(Boolean).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <button className="btn btn-ghost btn-sm" onClick={load} title="Refresh">
          <RefreshCw size={15}/>
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          <AlertCircle size={15}/> {error}
        </div>
      )}

      {/* Table */}
      <div className={`anim-fade-up ${styles.tableCard}`}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Repair ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Device</th>
                <th>Problem</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[80, 120, 100, 140, 80, 90, 70, 70].map((w, j) => (
                      <td key={j}><div className="skeleton" style={{ height: 13, width: w }}/></td>
                    ))}
                  </tr>
                ))
              ) : repairs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--subtle)' }}>
                    No repairs found. {search || status ? 'Try clearing filters.' : ''}
                  </td>
                </tr>
              ) : (
                repairs.map(r => (
                  <tr key={r._id}>
                    <td>
                      <Link to={`/repairs/${r._id}`} className={styles.idLink}>
                        {r.repairId}
                      </Link>
                    </td>
                    <td className={styles.nameCell}>{r.customerName}</td>
                    <td>{r.phoneNumber}</td>
                    <td>{r.deviceBrand} {r.deviceModel}</td>
                    <td style={{ textTransform: 'capitalize' }}>{r.problemType}</td>
                    <td>{formatDate(r.createdAt)}</td>
                    <td>
                      <span className={`badge ${statusBadge(r.status)}`}>{r.status}</span>
                    </td>
                    <td>
                      {r.image
                        ? <span title="Has device photo" style={{ color: 'var(--blue)', display: 'flex', alignItems: 'center' }}><Camera size={15}/></span>
                        : <span style={{ color: 'var(--border)' }}>—</span>
                      }
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Link to={`/repairs/${r._id}`} className="btn btn-ghost btn-xs" title="View">
                          <Eye size={13}/>
                        </Link>
                        <button
                          className="btn btn-xs"
                          style={{ background: 'var(--red-light)', color: 'var(--red)', border: 'none' }}
                          title="Delete"
                          onClick={() => setDeleteId(r._id)}
                        >
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <span className={styles.paginationInfo}>
              Showing {repairs.length} of {pagination.total} repairs
            </span>
            <div className={styles.paginationBtns}>
              <button
                className="btn btn-ghost btn-sm"
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft size={15}/> Prev
              </button>
              <span className={styles.pageNum}>
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                className="btn btn-ghost btn-sm"
                disabled={!pagination.hasNextPage}
                onClick={() => setPage(p => p + 1)}
              >
                Next <ChevronRight size={15}/>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteId && (
        <ConfirmModal
          title="Delete Repair Request"
          message="Are you sure you want to permanently delete this repair request? This action cannot be undone."
          confirmLabel="Yes, Delete"
          danger
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}