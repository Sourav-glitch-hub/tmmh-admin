// src/components/Layout.jsx
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Header from './Header.jsx'
import styles from './Layout.module.css'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={styles.layout}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)}/>
      <div className={styles.main}>
        <Header onMenuClick={() => setSidebarOpen(true)}/>
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}