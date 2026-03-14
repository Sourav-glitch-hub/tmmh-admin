// src/components/Header.jsx
import { Menu, Bell } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import styles from './Header.module.css'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/repairs':   'Repair Requests',
  '/products':  'Products',
}

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation()
  const { admin } = useAuth()
  const title = PAGE_TITLES[pathname] || 'Admin Panel'

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onMenuClick} aria-label="Open menu">
          <Menu size={22}/>
        </button>
        <h1 className={styles.title}>{title}</h1>
      </div>
      <div className={styles.right}>
        <div className={styles.adminBadge}>
          <div className={styles.adminAvatar}>
            {admin?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <span className={styles.adminName}>{admin?.name || 'Admin'}</span>
        </div>
      </div>
    </header>
  )
}