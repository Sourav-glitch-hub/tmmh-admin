// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Wrench, CheckCircle, Clock, Search,
  TrendingUp, ArrowRight, AlertCircle
} from 'lucide-react'
import { repairAPI } from '../api/index.js'
import { useAuth } from '../context/AuthContext.jsx'
import { statusBadge, formatDate } from '../utils.js'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const { token } = useAuth()
  const [stats,   setStats]   = useState(null)
  const [recent,  setRecent]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [s, r] = await Promise.all([
          repairAPI.getStats(token),
          repairAPI.getAll(token, { limit: 6, page: 1 }),
        ])
        setStats(s.data)
        setRecent(r.data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const STAT_CARDS = [
    { label: 'Total Repairs',  value: stats?.total          ?? '—', icon: <Wrench size={20}/>,      color: 'blue'   },
    { label: 'Received',       value: stats?.byStatus?.Received  ?? '—', icon: <Clock size={20}/>,       color: 'amber'  },
    { label: 'In Progress',    value: (stats ? (stats.byStatus.Checking || 0) + (stats.byStatus.Repairing || 0) : '—'), icon: <TrendingUp size={20}/>, color: 'orange' },
    { label: 'Completed',      value: stats?.byStatus?.Completed ?? '—', icon: <CheckCircle size={20}/>, color: 'green'  },
  ]

  return (
    <div>
      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}><AlertCircle size={15}/>{error}</div>}

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        {STAT_CARDS.map((s, i) => (
          <div key={s.label} className={`card ${styles.statCard} anim-fade-up d${i + 1}`}>
            <div className={`${styles.statIcon} ${styles[`icon_${s.color}`]}`}>{s.icon}</div>
            <div className={styles.statVal}>
              {loading ? <div className="skeleton" style={{ height: 28, width: 60 }}/> : s.value}
            </div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Problem breakdown */}
      {stats?.byProblemType?.length > 0 && (
        <div className={`card anim-fade-up d3 ${styles.breakdownCard}`}>
          <h3 className={styles.cardTitle}>Problem Types Breakdown</h3>
          <div className={styles.breakdownGrid}>
            {stats.byProblemType.map(p => (
              <div key={p.type} className={styles.breakdownItem}>
                <div className={styles.breakdownLabel}>{p.type.charAt(0).toUpperCase() + p.type.slice(1)}</div>
                <div className={styles.breakdownBarWrap}>
                  <div
                    className={styles.breakdownBar}
                    style={{ width: `${Math.round((p.count / stats.total) * 100)}%` }}
                  />
                </div>
                <div className={styles.breakdownCount}>{p.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent repairs */}
      <div className={`card anim-fade-up d4 ${styles.recentCard}`}>
        <div className={styles.recentHeader}>
          <h3 className={styles.cardTitle}>Recent Repairs</h3>
          <Link to="/repairs" className="btn btn-ghost btn-sm">
            View All <ArrowRight size={14}/>
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '12px 0' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="skeleton" style={{ height: 14, width: 80 }}/>
                <div className="skeleton" style={{ height: 14, flex: 1 }}/>
                <div className="skeleton" style={{ height: 14, width: 100 }}/>
                <div className="skeleton" style={{ height: 22, width: 80, borderRadius: 99 }}/>
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className={styles.empty}><Search size={28}/><p>No repairs yet</p></div>
        ) : (
          <div className="table-wrap" style={{ border: 'none', borderRadius: 0, marginTop: 12 }}>
            <table>
              <thead>
                <tr>
                  <th>Repair ID</th>
                  <th>Customer</th>
                  <th>Device</th>
                  <th>Problem</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(r => (
                  <tr key={r._id}>
                    <td><Link to={`/repairs/${r._id}`} className={styles.idLink}>{r.repairId}</Link></td>
                    <td>{r.customerName}</td>
                    <td>{r.deviceBrand} {r.deviceModel}</td>
                    <td style={{ textTransform: 'capitalize' }}>{r.problemType}</td>
                    <td>{formatDate(r.createdAt)}</td>
                    <td><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}