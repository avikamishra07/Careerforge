import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Toast } from '../ui'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../hooks/useToast'
import { C } from '../../constants'
import { Avatar } from '../ui'

export const ToastContext = import.meta.env ? null : null

// We export toast via a global ref approach so pages can call it
import { createContext, useContext } from 'react'
export const ToastCtx = createContext(() => {})
export const useAppToast = () => useContext(ToastCtx)

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { toasts, toast } = useToast()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <ToastCtx.Provider value={toast}>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: C.bg, color: C.text, fontSize: 14 }}>
        {/* Mobile header */}
        <div className="mobile-header" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 30 }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'transparent', border: 'none', color: C.muted, fontSize: 22, display: 'flex', cursor: 'pointer', padding: 4 }}
          >
            <i className="ti ti-menu-2" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: `linear-gradient(135deg,${C.indigo},#7c3aed)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ti ti-bolt" style={{ color: '#fff', fontSize: 13 }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.03em' }}>CareerForge AI</span>
          </div>
          <Avatar name={user?.name || 'U'} size={30} />
        </div>

        <Sidebar
          user={user}
          onLogout={handleLogout}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main style={{
          flex: 1,
          padding: '28px 32px',
          background: C.bg,
          overflowY: 'auto',
          paddingTop: 'max(28px, 60px)',
        }}>
          <Outlet />
        </main>

        <Toast toasts={toasts} />
      </div>
    </ToastCtx.Provider>
  )
}
