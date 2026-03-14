// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Layout     from './components/Layout.jsx'
import Login      from './pages/Login.jsx'
import Dashboard  from './pages/Dashboard.jsx'
import Repairs    from './pages/Repairs.jsx'
import RepairDetail from './pages/RepairDetail.jsx'
import Products   from './pages/Products.jsx'

// Protected route — redirects to /login if not authenticated
function PrivateRoute({ children }) {
  const { isLoggedIn, loading } = useAuth()
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div className="spinner spinner-blue" style={{ width: 36, height: 36, borderWidth: 3 }}/>
    </div>
  )
  return isLoggedIn ? children : <Navigate to="/login" replace/>
}

function AppRoutes() {
  const { isLoggedIn } = useAuth()

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={isLoggedIn ? <Navigate to="/dashboard" replace/> : <Login/>}
      />

      {/* Protected admin routes */}
      <Route path="/" element={<PrivateRoute><Layout/></PrivateRoute>}>
        <Route index            element={<Navigate to="/dashboard" replace/>}/>
        <Route path="dashboard" element={<Dashboard/>}/>
        <Route path="repairs"   element={<Repairs/>}/>
        <Route path="repairs/:id" element={<RepairDetail/>}/>
        <Route path="products"  element={<Products/>}/>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes/>
    </AuthProvider>
  )
}