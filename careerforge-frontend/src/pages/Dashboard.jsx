import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Card, Button, ScoreRing, Tag, Loading } from '../components/ui'
import { C, scoreColor, fmtDate, NAV_ITEMS } from '../constants'

const QUICK_ACTIONS = [
  { id: 'interview', icon: 'ti-microphone',     label: 'Start Interview',   desc: 'AI mock interview',     col: C.indigo, bg: C.indigoA },
  { id: 'resume',    icon: 'ti-file-text',       label: 'Analyze Resume',    desc: 'ATS score + tips',      col: C.green,  bg: C.greenA  },
  { id: 'team',      icon: 'ti-users-group',     label: 'Find Teammates',    desc: 'Hackathon matching',    col: C.amber,  bg: C.amberA  },
  { id: 'skillswap', icon: 'ti-arrows-exchange', label: 'SkillSwap',         desc: 'Peer learning',         col: C.blue,   bg: C.blueA   },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, history, historyLoading } = useAuth()

  const name = user?.name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const stats = [
    { label: 'Interviews Done',   value: history.total_interviews || 0,          icon: 'ti-microphone',   col: C.indigo },
    { label: 'Resumes Analyzed',  value: history.total_resumes || 0,             icon: 'ti-file-text',    col: C.green  },
    { label: 'Best Interview',    value: history.best_interview_score != null ? `${history.best_interview_score}%` : '—', icon: 'ti-trophy', col: C.amber },
    { label: 'Best ATS Score',    value: history.best_ats_score != null ? `${history.best_ats_score}%` : '—',             icon: 'ti-star',   col: C.blue  },
  ]

  return (
    <div className="fade">
      {/* Greeting */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: '-0.03em', marginBottom: 4 }}>
          {greeting}, {name} 👋
        </h1>
        <p style={{ color: C.muted, fontSize: 13.5 }}>Your career tools are ready. What would you like to do today?</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 28 }}>
        {stats.map(s => (
          <Card key={s.label} style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: s.col + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`ti ${s.icon}`} style={{ fontSize: 15, color: s.col }} />
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: '-0.04em', fontFamily: 'DM Mono,monospace' }}>{historyLoading ? '…' : s.value}</div>
            <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14, letterSpacing: '-0.02em' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
          {QUICK_ACTIONS.map(a => (
            <Card key={a.id} onClick={() => navigate(`/app/${a.id}`)} style={{ padding: 18, cursor: 'pointer' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <i className={`ti ${a.icon}`} style={{ fontSize: 18, color: a.col }} />
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginBottom: 3 }}>{a.label}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{a.desc}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
        {/* Recent interviews */}
        <Card style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>Recent Interviews</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/history')}>View all</Button>
          </div>
          {historyLoading ? <Loading text="Loading…" /> :
           history.interviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <i className="ti ti-microphone" style={{ fontSize: 28, color: C.faint, display: 'block', marginBottom: 8 }} />
              <p style={{ color: C.muted, fontSize: 13 }}>No interviews yet</p>
              <Button size="sm" style={{ marginTop: 10 }} onClick={() => navigate('/app/interview')}>Start your first</Button>
            </div>
          ) : history.interviews.slice(0, 4).map(iv => (
            <div key={iv.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: `1px solid ${C.border}` }}>
              <ScoreRing score={iv.overall_score} color={scoreColor(iv.overall_score)} size={44} label="" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{iv.role}</div>
                <div style={{ fontSize: 11.5, color: C.muted }}>{iv.level} · {fmtDate(iv.created_at)}</div>
              </div>
            </div>
          ))}
        </Card>

        {/* Recent resumes */}
        <Card style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>Resume Analyses</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/history')}>View all</Button>
          </div>
          {historyLoading ? <Loading text="Loading…" /> :
           history.resumes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <i className="ti ti-file-text" style={{ fontSize: 28, color: C.faint, display: 'block', marginBottom: 8 }} />
              <p style={{ color: C.muted, fontSize: 13 }}>No resumes analyzed yet</p>
              <Button size="sm" style={{ marginTop: 10 }} onClick={() => navigate('/app/resume')}>Analyze resume</Button>
            </div>
          ) : history.resumes.slice(0, 4).map(r => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: C.greenA, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: C.green, fontFamily: 'DM Mono,monospace' }}>{r.ats_score}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.filename || 'Resume'}</div>
                <div style={{ fontSize: 11.5, color: C.muted }}>{fmtDate(r.created_at)}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
