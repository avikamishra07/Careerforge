import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/auth.service'
import { Button, Spinner } from '../components/ui'
import { C } from '../constants'

/* ✅ FIX: Field moved OUTSIDE component (prevents cursor issue) */
const Field = ({ label, name, type = 'text', placeholder, autoComplete, value, onChange }) => (
  <div style={{ marginBottom: 16 }}>
    <label
      style={{
        display: 'block',
        fontSize: 12,
        fontWeight: 600,
        color: C.muted,
        marginBottom: 6,
        letterSpacing: '0.04em',
        textTransform: 'uppercase'
      }}
    >
      {label}
    </label>

    <input
      id={name}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      maxLength={72} 
      required
    />
  </div>
)

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name || !form.email || !form.password) {
      setError('All fields are required.')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const { token, user } = await authService.register(
        form.name,
        form.email,
        form.password
      )

      await login(token, user)
      navigate('/app/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24
      }}
    >
      <div
        style={{
          position: 'fixed',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background:
            'radial-gradient(circle,rgba(99,102,241,.08) 0%,transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 9,
                marginBottom: 8
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: `linear-gradient(135deg,${C.indigo},#7c3aed)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 16px rgba(99,102,241,.4)'
                }}
              >
                <i
                  className="ti ti-bolt"
                  style={{ color: '#fff', fontSize: 18 }}
                />
              </div>

              <span
                style={{
                  fontWeight: 800,
                  fontSize: 18,
                  letterSpacing: '-0.03em',
                  color: C.text
                }}
              >
                Career
                <span style={{ color: C.indigoL }}>Forge</span>
                <span style={{ color: C.muted, fontWeight: 400 }}> AI</span>
              </span>
            </div>
          </Link>

          <p style={{ color: C.muted, fontSize: 13 }}>
            Create your free account — no credit card needed
          </p>
        </div>

        {/* Form */}
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: 28
          }}
        >
          <form onSubmit={handleSubmit}>
            <Field
              label="Full Name"
              name="name"
              placeholder="Jane Smith"
              autoComplete="name"
              value={form.name}
              onChange={set('name')}
            />

            <Field
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={form.email}
              onChange={set('email')}
            />

            <Field
              label="Password"
              name="password"
              type="password"
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              value={form.password}
              onChange={set('password')}
            />

            <Field
              label="Confirm Password"
              name="confirm"
              type="password"
              placeholder="Re-enter password"
              autoComplete="new-password"
              value={form.confirm}
              onChange={set('confirm')}
            />

            {/* Error */}
            {error && (
              <div
                style={{
                  background: C.redA,
                  border: '1px solid rgba(239,68,68,.25)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <i
                  className="ti ti-alert-circle"
                  style={{ color: C.red, fontSize: 15 }}
                />
                <span style={{ fontSize: 13, color: '#f87171' }}>
                  {error}
                </span>
              </div>
            )}

            {/* Submit */}
            <Button type="submit" full disabled={loading} size="lg">
              {loading ? (
                <>
                  <Spinner size={15} /> Creating account…
                </>
              ) : (
                <>
                  <i className="ti ti-rocket" /> Create account
                </>
              )}
            </Button>
          </form>

          <div
            style={{
              marginTop: 20,
              textAlign: 'center',
              fontSize: 13,
              color: C.muted
            }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: C.indigoL, textDecoration: 'none', fontWeight: 500 }}
            >
              Sign in
            </Link>
          </div>
        </div>

        <p
          style={{
            textAlign: 'center',
            fontSize: 11.5,
            color: C.faint,
            marginTop: 16
          }}
        >
          By creating an account you agree to our terms of service.
        </p>
      </div>
    </div>
  )
}