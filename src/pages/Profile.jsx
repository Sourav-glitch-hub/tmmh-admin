// src/pages/Profile.jsx
import { useState } from 'react'
import { User, Mail, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { request } from '../api/index.js'
import styles from './Profile.module.css'

export default function Profile() {
  const { admin, token, login } = useAuth()

  // ── Name / Email form ─────────────────────────────────────
  const [info, setInfo]         = useState({ name: admin?.name || '', email: admin?.email || '' })
  const [infoSaving, setInfoSaving] = useState(false)
  const [infoMsg,    setInfoMsg]    = useState(null) // { type: 'success'|'error', text }

  // ── Password form ─────────────────────────────────────────
  const [pwd, setPwd]           = useState({ current: '', newPwd: '', confirm: '' })
  const [showCur,  setShowCur]  = useState(false)
  const [showNew,  setShowNew]  = useState(false)
  const [pwdSaving, setPwdSaving] = useState(false)
  const [pwdMsg,    setPwdMsg]    = useState(null)

  // ── Update name/email ─────────────────────────────────────
  const handleInfoSave = async () => {
    if (!info.name.trim() || !info.email.trim()) {
      setInfoMsg({ type: 'error', text: 'Name and email are required.' })
      return
    }
    setInfoSaving(true)
    setInfoMsg(null)
    try {
      const data = await request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: info.name, email: info.email }),
      }, token)
      // Update auth context so header/sidebar reflects new name
      login(data.user, token)
      setInfoMsg({ type: 'success', text: 'Profile updated successfully!' })
    } catch (err) {
      setInfoMsg({ type: 'error', text: err.message })
    } finally {
      setInfoSaving(false)
    }
  }

  // ── Update password ───────────────────────────────────────
  const handlePasswordSave = async () => {
    if (!pwd.current || !pwd.newPwd || !pwd.confirm) {
      setPwdMsg({ type: 'error', text: 'All password fields are required.' })
      return
    }
    if (pwd.newPwd !== pwd.confirm) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match.' })
      return
    }
    if (pwd.newPwd.length < 6) {
      setPwdMsg({ type: 'error', text: 'New password must be at least 6 characters.' })
      return
    }
    setPwdSaving(true)
    setPwdMsg(null)
    try {
      await request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword: pwd.current, newPassword: pwd.newPwd }),
      }, token)
      setPwdMsg({ type: 'success', text: 'Password changed successfully!' })
      setPwd({ current: '', newPwd: '', confirm: '' })
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.message })
    } finally {
      setPwdSaving(false)
    }
  }

  return (
    <div className={styles.page}>

      {/* ── Profile Info Card ── */}
      <div className={`card ${styles.card}`}>
        <div className={styles.cardHead}>
          <div className={styles.cardIcon}><User size={18}/></div>
          <div>
            <h3 className={styles.cardTitle}>Profile Information</h3>
            <p className={styles.cardSub}>Update your name and email address</p>
          </div>
        </div>

        {infoMsg && (
          <div className={`alert alert-${infoMsg.type === 'success' ? 'success' : 'error'} ${styles.alertGap}`}>
            {infoMsg.type === 'success' ? <CheckCircle size={15}/> : <AlertCircle size={15}/>}
            {infoMsg.text}
          </div>
        )}

        <div className={styles.formBody}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className={styles.inputWrap}>
              <User size={15} className={styles.inputIcon}/>
              <input
                className={`form-input ${styles.inputPadded}`}
                placeholder="Your name"
                value={info.name}
                onChange={e => setInfo(i => ({ ...i, name: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Address</label>
            <div className={styles.inputWrap}>
              <Mail size={15} className={styles.inputIcon}/>
              <input
                className={`form-input ${styles.inputPadded}`}
                type="email"
                placeholder="your@email.com"
                value={info.email}
                onChange={e => setInfo(i => ({ ...i, email: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div className={styles.cardFoot}>
          <button
            className="btn btn-primary"
            onClick={handleInfoSave}
            disabled={infoSaving}
          >
            {infoSaving ? <><div className="spinner"/> Saving…</> : <><CheckCircle size={15}/> Save Changes</>}
          </button>
        </div>
      </div>

      {/* ── Change Password Card ── */}
      <div className={`card ${styles.card}`}>
        <div className={styles.cardHead}>
          <div className={`${styles.cardIcon} ${styles.cardIconRed}`}><Lock size={18}/></div>
          <div>
            <h3 className={styles.cardTitle}>Change Password</h3>
            <p className={styles.cardSub}>Must contain uppercase, lowercase, and a number</p>
          </div>
        </div>

        {pwdMsg && (
          <div className={`alert alert-${pwdMsg.type === 'success' ? 'success' : 'error'} ${styles.alertGap}`}>
            {pwdMsg.type === 'success' ? <CheckCircle size={15}/> : <AlertCircle size={15}/>}
            {pwdMsg.text}
          </div>
        )}

        <div className={styles.formBody}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <div className={styles.inputWrap}>
              <Lock size={15} className={styles.inputIcon}/>
              <input
                className={`form-input ${styles.inputPadded} ${styles.inputPaddedRight}`}
                type={showCur ? 'text' : 'password'}
                placeholder="Enter current password"
                value={pwd.current}
                onChange={e => setPwd(p => ({ ...p, current: e.target.value }))}
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowCur(v => !v)}>
                {showCur ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className={styles.inputWrap}>
              <Lock size={15} className={styles.inputIcon}/>
              <input
                className={`form-input ${styles.inputPadded} ${styles.inputPaddedRight}`}
                type={showNew ? 'text' : 'password'}
                placeholder="Enter new password"
                value={pwd.newPwd}
                onChange={e => setPwd(p => ({ ...p, newPwd: e.target.value }))}
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowNew(v => !v)}>
                {showNew ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Confirm New Password</label>
            <div className={styles.inputWrap}>
              <Lock size={15} className={styles.inputIcon}/>
              <input
                className={`form-input ${styles.inputPadded}`}
                type="password"
                placeholder="Re-enter new password"
                value={pwd.confirm}
                onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div className={styles.cardFoot}>
          <button
            className="btn btn-primary"
            onClick={handlePasswordSave}
            disabled={pwdSaving}
          >
            {pwdSaving ? <><div className="spinner"/> Changing…</> : <><Lock size={15}/> Change Password</>}
          </button>
        </div>
      </div>

    </div>
  )
}
