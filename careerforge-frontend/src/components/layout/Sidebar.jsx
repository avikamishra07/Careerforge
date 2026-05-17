import { NavLink } from 'react-router-dom'
import { C, NAV_ITEMS } from '../../constants'
import { Avatar } from '../ui'

export default function Sidebar({ user, onLogout, open, onClose }) {
  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{ display: 'block', position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 40, backdropFilter: 'blur(2px)' }}
        />
      )}
      <aside
        className={`app-sidebar${open ? ' open' : ''}`}
        style={{
          width: 210, background: '#09090f', flexShrink: 0,
          borderRight: `1px solid ${C.border}`,
          display: 'flex', flexDirection: 'column', height: '100%',
          position: 'relative',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '16px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg,${C.indigo},#7c3aed)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 10px rgba(99,102,241,.4)' }}>
              <i className="ti ti-bolt" style={{ color: '#fff', fontSize: 15 }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.text, letterSpacing: '-0.03em', lineHeight: 1.1 }}>CareerForge</div>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 500 }}>AI Platform</div>
            </div>
          </div>
          {open && (
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: C.muted, fontSize: 18, display: 'flex', cursor: 'pointer' }}>
              <i className="ti ti-x" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 7px', overflowY: 'auto' }}>
          {NAV_ITEMS.map((n, idx) =>
            n === null ? (
              <div key={idx} style={{ height: 1, background: C.border, margin: '6px 3px 10px' }} />
            ) : (
              <NavLink
                key={n.id}
                to={`/app/${n.id}`}
                onClick={onClose}
                style={({ isActive }) => ({
                  width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                  padding: '8px 10px', borderRadius: 8, border: 'none',
                  background: isActive ? C.indigoA : 'transparent',
                  color: isActive ? C.indigoL : C.muted,
                  fontSize: 12.5, fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer', marginBottom: 2, transition: 'all .1s',
                  textDecoration: 'none',
                })}
              >
                <i className={`ti ${n.icon}`} style={{ fontSize: 16, flexShrink: 0 }} />
                {n.label}
              </NavLink>
            )
          )}
        </nav>

        {/* User footer */}
        <div style={{ padding: '11px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9, padding: '7px 8px', borderRadius: 8, background: 'rgba(255,255,255,.03)' }}>
            <Avatar name={user?.name || 'U'} size={30} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</div>
              <div style={{ fontSize: 10, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || ''}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{ width: '100%', padding: '6px', borderRadius: 6, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: 'inherit' }}
          >
            <i className="ti ti-logout" style={{ fontSize: 13 }} /> Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
