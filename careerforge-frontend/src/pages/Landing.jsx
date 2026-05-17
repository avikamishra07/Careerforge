import { useNavigate } from 'react-router-dom'
import { Button, Card } from '../components/ui'
import { C } from '../constants'

const FEATURES = [
  { icon: 'ti-microphone',     title: 'AI Mock Interview',   desc: 'Role-specific questions, speech-to-text, and a full scored feedback report.', col: C.indigo, bg: C.indigoA },
  { icon: 'ti-file-text',      title: 'Resume Analyzer',     desc: 'ATS score, skill gap analysis, and concrete improvements in seconds.',        col: C.green,  bg: C.greenA },
  { icon: 'ti-users-group',    title: 'Team Matching',       desc: 'Find compatible hackathon teammates matched by skills and stack.',              col: C.amber,  bg: C.amberA },
  { icon: 'ti-arrows-exchange',title: 'SkillSwap',           desc: 'Offer what you know, learn what you want — peer-to-peer.',                     col: C.blue,   bg: C.blueA },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', borderBottom: `1px solid ${C.border}`, backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 50, background: 'rgba(7,7,11,.9)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${C.indigo},#7c3aed)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(99,102,241,.45)' }}>
            <i className="ti ti-bolt" style={{ color: '#fff', fontSize: 16 }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.03em' }}>
            <span style={{ color: C.text }}>Career</span>
            <span style={{ color: C.indigoL }}>Forge</span>
            <span style={{ color: C.muted, fontWeight: 400 }}> AI</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" onClick={() => navigate('/login')} size="sm">Sign in</Button>
          <Button onClick={() => navigate('/register')} size="sm">
            <i className="ti ti-rocket" /> Get started
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '80px 24px 56px', maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: C.indigoA, border: '1px solid rgba(99,102,241,.25)', borderRadius: 999, padding: '5px 14px', marginBottom: 22 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.indigoL, boxShadow: `0 0 8px ${C.indigo}` }} />
          <span style={{ fontSize: 12, color: C.indigoL, fontWeight: 500 }}>AI-powered career tools for students & developers</span>
        </div>
        <h1 style={{ fontSize: 'clamp(32px,6vw,52px)', fontWeight: 800, lineHeight: 1.15, marginBottom: 20, color: '#fff', letterSpacing: '-0.04em' }}>
          Land your dream role.<br />
          <span style={{ background: `linear-gradient(135deg,${C.indigoL},#a78bfa,#ec4899)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Build the perfect team.
          </span>
        </h1>
        <p style={{ fontSize: 17, color: C.muted, maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.7, fontWeight: 300 }}>
          Practice interviews, analyze your resume, find teammates, and swap skills — all AI-powered.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button onClick={() => navigate('/register')} size="lg">
            <i className="ti ti-arrow-right" /> Start free — no credit card
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>
            <i className="ti ti-login" /> Sign in
          </Button>
        </div>
      </div>

      {/* Feature grid */}
      <div style={{ padding: '0 24px 72px', maxWidth: 920, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
          {FEATURES.map(f => (
            <Card key={f.title} style={{ padding: 22 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <i className={`ti ${f.icon}`} style={{ fontSize: 20, color: f.col }} />
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 7, letterSpacing: '-0.02em' }}>{f.title}</h3>
              <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.7 }}>{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA banner */}
      <div style={{ background: C.indigoA, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '56px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(22px,4vw,30px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>Ready to forge your career?</h2>
        <p style={{ color: C.muted, marginBottom: 24, fontSize: 14 }}>Free forever for students.</p>
        <Button onClick={() => navigate('/register')} size="lg" style={{ margin: '0 auto', justifyContent: 'center' }}>
          <i className="ti ti-arrow-right" /> Get started free
        </Button>
      </div>

      <footer style={{ padding: '20px 24px', textAlign: 'center', borderTop: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 12, color: C.faint }}>© 2025 CareerForge AI · Built for students · Powered by AI</span>
      </footer>
    </div>
  )
}
