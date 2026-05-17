import { useState } from 'react'
import { C } from '../../constants'

/* ─────────────── Button ─────────────── */
const BTN_VARIANTS = {
  primary:  { background: `linear-gradient(135deg,${C.indigo},#7c3aed)`, color: '#fff', border: 'none', boxShadow: '0 2px 8px rgba(99,102,241,.3)' },
  secondary:{ background: 'rgba(255,255,255,.06)', color: C.text, border: `1px solid ${C.border}` },
  ghost:    { background: 'transparent', color: C.muted, border: `1px solid ${C.border}` },
  outline:  { background: 'transparent', color: C.indigoL, border: '1px solid rgba(99,102,241,.35)' },
  success:  { background: `linear-gradient(135deg,${C.green},#059669)`, color: '#fff', border: 'none' },
  danger:   { background: C.red, color: '#fff', border: 'none' },
  amber:    { background: C.amberA, color: C.amber, border: '1px solid rgba(245,158,11,.25)' },
}
const BTN_PAD  = { sm: '6px 12px',  md: '8px 17px',  lg: '11px 24px' }
const BTN_SIZE = { sm: '12px',      md: '13px',       lg: '14.5px' }

export function Button({ children, onClick, variant = 'primary', disabled, full, size = 'md', style: s = {}, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: BTN_PAD[size],
        fontSize: BTN_SIZE[size],
        fontWeight: 500,
        borderRadius: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        width: full ? '100%' : 'auto',
        justifyContent: full ? 'center' : 'flex-start',
        transition: 'all .15s',
        letterSpacing: '-0.01em',
        flexShrink: 0,
        ...BTN_VARIANTS[variant],
        ...s,
      }}
    >
      {children}
    </button>
  )
}

/* ─────────────── Card ─────────────── */
export function Card({ children, style: s = {}, onClick, className = '' }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={onClick ? () => setHov(true) : null}
      onMouseLeave={onClick ? () => setHov(false) : null}
      className={className}
      style={{
        background: C.card,
        border: `1px solid ${hov ? 'rgba(99,102,241,.3)' : C.border}`,
        borderRadius: 12,
        padding: 18,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color .15s, transform .1s',
        transform: hov && onClick ? 'translateY(-1px)' : 'none',
        ...s,
      }}
    >
      {children}
    </div>
  )
}

/* ─────────────── Tag ─────────────── */
const TAG_COLORS = {
  indigo: { bg: C.indigoA, col: C.indigoL },
  green:  { bg: C.greenA,  col: '#34d399' },
  amber:  { bg: C.amberA,  col: '#fbbf24' },
  blue:   { bg: C.blueA,   col: '#60a5fa' },
  red:    { bg: C.redA,    col: '#f87171' },
  gray:   { bg: 'rgba(255,255,255,.07)', col: C.muted },
}

export function Tag({ children, color = 'indigo' }) {
  const x = TAG_COLORS[color] || TAG_COLORS.gray
  return (
    <span style={{ background: x.bg, color: x.col, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  )
}

/* ─────────────── Avatar ─────────────── */
export function Avatar({ name, size = 36 }) {
  const initials = (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: C.indigoA, border: '1px solid rgba(99,102,241,.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.29, fontWeight: 700, color: C.indigoL, flexShrink: 0,
      fontFamily: 'DM Mono, monospace',
    }}>
      {initials}
    </div>
  )
}

/* ─────────────── ProgressBar ─────────────── */
export function ProgressBar({ value, color = C.indigo, height = 4 }) {
  return (
    <div style={{ height, background: 'rgba(255,255,255,.07)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{
        height: '100%',
        width: `${Math.min(Math.max(value, 0), 100)}%`,
        background: color,
        borderRadius: 2,
        transition: 'width .6s cubic-bezier(.4,0,.2,1)',
      }} />
    </div>
  )
}

/* ─────────────── Spinner ─────────────── */
export function Spinner({ size = 18 }) {
  return (
    <div className="spin" style={{
      width: size, height: size,
      border: '2.5px solid rgba(255,255,255,.1)',
      borderTopColor: C.indigoL,
      borderRadius: '50%',
      display: 'inline-block',
      flexShrink: 0,
    }} />
  )
}

/* ─────────────── Loading ─────────────── */
export function Loading({ text = 'Working on it…', sub = '' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 16 }}>
      <div style={{ position: 'relative', width: 52, height: 52 }}>
        <div className="spin" style={{ position: 'absolute', inset: 0, border: '3px solid rgba(255,255,255,.06)', borderTopColor: C.indigo, borderRadius: '50%' }} />
        <div className="spin" style={{ position: 'absolute', inset: 8, border: '2px solid rgba(255,255,255,.06)', borderTopColor: C.indigoL, borderRadius: '50%', animationDirection: 'reverse', animationDuration: '.5s' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: C.text, fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{text}</p>
        {sub && <p style={{ color: C.muted, fontSize: 13 }}>{sub}</p>}
      </div>
    </div>
  )
}

/* ─────────────── ErrorMsg ─────────────── */
export function ErrorMsg({ error, onRetry }) {
  return (
    <div style={{ background: C.redA, border: '1px solid rgba(239,68,68,.25)', borderRadius: 12, padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <i className="ti ti-alert-circle" style={{ fontSize: 20, color: C.red, flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: '#f87171', marginBottom: 4 }}>
          {typeof error === 'string' ? error : 'Something went wrong'}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="secondary" size="sm" style={{ marginTop: 8 }}>
            <i className="ti ti-refresh" /> Try again
          </Button>
        )}
      </div>
    </div>
  )
}

/* ─────────────── Toast ─────────────── */
export function Toast({ toasts }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
      {toasts.map(t => (
        <div key={t.id} className="slide-right" style={{
          background: C.card2,
          border: `1px solid ${t.type === 'success' ? 'rgba(16,185,129,.3)' : t.type === 'error' ? 'rgba(239,68,68,.3)' : 'rgba(99,102,241,.3)'}`,
          borderRadius: 10, padding: '11px 15px',
          minWidth: 260, maxWidth: 320,
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 8px 32px rgba(0,0,0,.5)',
          pointerEvents: 'all',
        }}>
          <i className={`ti ${t.type === 'success' ? 'ti-check' : t.type === 'error' ? 'ti-x' : 'ti-info-circle'}`}
            style={{ fontSize: 15, color: t.type === 'success' ? C.green : t.type === 'error' ? C.red : C.indigoL, flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{t.msg}</span>
        </div>
      ))}
    </div>
  )
}

/* ─────────────── EmptyState ─────────────── */
export function EmptyState({ icon, title, sub, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '52px 20px' }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: C.indigoA, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
        <i className={`ti ${icon}`} style={{ fontSize: 24, color: C.indigoL }} />
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6 }}>{title}</p>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 18, maxWidth: 260, margin: '0 auto 18px', lineHeight: 1.65 }}>{sub}</p>
      {action}
    </div>
  )
}

/* ─────────────── Section ─────────────── */
export function Section({ title, sub, children, action, icon }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {icon && (
            <div style={{ width: 32, height: 32, borderRadius: 8, background: C.indigoA, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className={`ti ${icon}`} style={{ fontSize: 16, color: C.indigoL }} />
            </div>
          )}
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: '-0.02em', marginBottom: 2 }}>{title}</h2>
            {sub && <p style={{ fontSize: 12.5, color: C.muted }}>{sub}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

/* ─────────────── ScoreRing ─────────────── */
export function ScoreRing({ score, label, color, size = 68 }) {
  const r = size * 0.397
  const circ = 2 * Math.PI * r
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: size, height: size, position: 'relative', margin: '0 auto 8px' }}>
        <svg width={size} height={size} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={5} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
            strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.235, fontWeight: 800, color, fontFamily: 'DM Mono, monospace' }}>
          {score}
        </div>
      </div>
      <span style={{ fontSize: 11, color: C.muted }}>{label}</span>
    </div>
  )
}
