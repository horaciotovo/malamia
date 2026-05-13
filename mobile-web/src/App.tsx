import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Cart from './pages/Cart'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import Orders from './pages/Orders'
import Notifications from './pages/Notifications'
import Loyalty from './pages/Loyalty'
import Admin from './pages/admin/Admin'
import AdminOrders from './pages/admin/AdminOrders'
import AdminNotifications from './pages/admin/AdminNotifications'
import Navigation from './components/Navigation'
import './App.css'

function App() {
  const [isInitialized, setIsInitialized] = useState(false)
  const initFromStorage = useAuthStore((state) => state.initFromStorage)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    // Initialize auth from localStorage on app load
    initFromStorage()
    // Mark as initialized after a brief delay to ensure state is updated
    const timer = setTimeout(() => {
      setIsInitialized(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [initFromStorage])

  // Show nothing until we've initialized auth
  if (!isInitialized) {
    return <div className="app" style={{ background: '#0A0A0A', width: '100%', height: '100vh' }} />
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          {!isAuthenticated ? (
            <Route path="/*" element={<Auth />} />
          ) : (
            <>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/*"
                element={
                  <>
                    <div className="app-container">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/catalog" element={<Catalog />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/loyalty" element={<Loyalty />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/admin/orders" element={<AdminOrders />} />
                        <Route path="/admin/notifications" element={<AdminNotifications />} />
                      </Routes>
                    </div>
                    <Navigation />
                  </>
                }
              />
            </>
          )}
        </Routes>
      </div>
    </Router>
  )
}

export default App
