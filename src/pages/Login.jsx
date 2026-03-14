// src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Smartphone, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { authAPI } from '../api/index.js'
import { useAuth } from '../context/AuthContext.jsx'
import styles from './Login.module.css'

export default function Login() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Please enter email and password.'); return }
    setLoading(true); setError('')
    try {
      const data = await authAPI.login(email, password)
      if (data.user.role !== 'admin') {
        setError('Access denied. Admin accounts only.')
        return
      }
      login(data.user, data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* Background decoration */}
      <div className={styles.bgBlob1}/>
      <div className={styles.bgBlob2}/>

      <div className={`${styles.card} anim-scale-up`}>
        {/* Logo */}
        <div className={styles.logoWrap}>
          <div className={styles.logoIcon}><Smartphone size={22}/></div>
          <div>
            <div className={styles.logoName}>Tara Maa Mobile House</div>
            <div className={styles.logoSub}>Admin Panel</div>
          </div>
        </div>

        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.sub}>Sign in to your admin account</p>

        {error && (
          <div className={`alert alert-error ${styles.alertGap}`}>
            <AlertCircle size={15}/> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className={styles.inputWrap}>
              <Mail size={15} className={styles.inputIcon}/>
              <input
                className={`form-input ${styles.inputPadded}`}
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className={styles.inputWrap}>
              <Lock size={15} className={styles.inputIcon}/>
              <input
                className={`form-input ${styles.inputPadded} ${styles.inputPaddedRight}`}
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPwd(v => !v)}
                tabIndex={-1}
              >
                {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={loading}
          >
            {loading ? <><div className="spinner"/> Signing in…</> : 'Sign In'}
          </button>
        </form>

        <p className={styles.hint}>
          Admin credentials are set up via the backend seed script.
        </p>
      </div>
    </div>
  )
}