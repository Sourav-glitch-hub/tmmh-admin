// src/components/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Wrench, Package,
  LogOut, Smartphone, X
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import styles from './Sidebar.module.css'

const LINKS = [
  { to: '/dashboard',   icon: <LayoutDashboard size={18}/>, label: 'Dashboard'   },
  { to: '/repairs',     icon: <Wrench          size={18}/>, label: 'Repairs'     },
  { to: '/products',    icon: <Package         size={18}/>, label: 'Products'    },
]

export default function Sidebar({ open, onClose }) {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className={styles.overlay} onClick={onClose}/>}

      <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}><Smartphone size={17}/></div>
          <div className={styles.logoText}>
            <span className={styles.logoShop}>TMMH</span>
            <span className={styles.logoSub}>Admin Panel</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={18}/></button>
        </div>

        {/* Nav links */}
        <nav className={styles.nav}>
          <p className={styles.navLabel}>Menu</p>
          {LINKS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
              <span className={styles.linkIcon}>{icon}</span>
              <span className={styles.linkLabel}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom user card */}
        <div className={styles.bottom}>
          <div className={styles.userCard}>
            <div className={styles.userAvatar}>
              {admin?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{admin?.name || 'Admin'}</span>
              <span className={styles.userRole}>Administrator</span>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={16}/> Logout
          </button>
        </div>
      </aside>
    </>
  )
}