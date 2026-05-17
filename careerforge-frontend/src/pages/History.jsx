import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Card, Button, ScoreRing, Tag, Loading, EmptyState } from '../components/ui'
import { C, scoreColor, fmtDate, fmtTime } from '../constants'

function InterviewCard({ iv }) {
  const col = scoreColor(iv.overall_score)
  return (
    <Card style={{ padding: 18 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <ScoreRing score={iv.overall_score} color={col} size={56} label="" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{iv.role}</span>
            <Tag color={iv.overall_score >= 80 ? 'green' : iv.overall_score >= 60 ? 'amber' : 'red'}>{iv.overall_score}%</Tag>
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>
            {iv.level} · {fmtDate(iv.created_at)}{iv.duration_seconds ? ` · ${fmtTime(iv.duration_seconds)}` : ''}
          </div>
          <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>{iv.summary}</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
            {[['Technical', iv.technical_score, C.indigo], ['Comm.', iv.communication_score, C.green], ['Confidence', iv.confidence_score, C.amber]].map(([label, val, c]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: c, fontFamily: 'DM Mono,monospace' }}>{val}</div>
                <div style={{ fontSize: 10.5, color: C.faint }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

function ResumeCard({ r }) {
  const col = scoreColor(r.ats_score)
  return (
    <Card style={{ padding: 18 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ width: 56, height: 56, borderRadius: 12, background: col + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 17, fontWeight: 800, color: col, fontFamily: 'DM Mono,monospace' }}>{r.ats_score}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.filename || 'Resume'}</span>
            <Tag color={r.ats_score >= 80 ? 'green' : r.ats_score >= 60 ? 'amber' : 'red'}>ATS {r.ats_score}%</Tag>
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>{fmtDate(r.created_at)}</div>
          <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6, marginBottom: 10 }}>{r.summary}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {r.skills_found.slice(0, 5).map(s => (
              <span key={s} style={{ background: C.greenA, color: '#34d399', padding: '2px 8px', borderRadius: 999, fontSize: 11 }}>{s}</span>
            ))}
            {r.skills_found.length > 5 && <span style={{ color: C.muted, fontSize: 11, alignSelf: 'center' }}>+{r.skills_found.length - 5} more</span>}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function History() {
  const navigate = useNavigate()
  const { history, historyLoading, refreshHistory } = useAuth()
  const [tab, setTab] = useState('interviews')

  if (historyLoading) return <Loading text="Loading history…" />

  const hasInterviews = history.interviews.length > 0
  const hasResumes = history.resumes.length > 0

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: '-0.03em', marginBottom: 4 }}>History</h1>
          <p style={{ color: C.muted, fontSize: 13 }}>
            {history.total_interviews} interview{history.total_interviews !== 1 ? 's' : ''} · {history.total_resumes} resume{history.total_resumes !== 1 ? 's' : ''} analyzed
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={refreshHistory}>
          <i className="ti ti-refresh" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      {(history.best_interview_score != null || history.best_ats_score != null) && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {history.best_interview_score != null && (
            <Card style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <i className="ti ti-trophy" style={{ color: C.amber, fontSize: 20 }} />
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.amber, fontFamily: 'DM Mono,monospace' }}>{history.best_interview_score}%</div>
                <div style={{ fontSize: 11.5, color: C.muted }}>Best Interview Score</div>
              </div>
            </Card>
          )}
          {history.best_ats_score != null && (
            <Card style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <i className="ti ti-star" style={{ color: C.green, fontSize: 20 }} />
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.green, fontFamily: 'DM Mono,monospace' }}>{history.best_ats_score}%</div>
                <div style={{ fontSize: 11.5, color: C.muted }}>Best ATS Score</div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: 'rgba(255,255,255,.04)', borderRadius: 8, padding: 4, maxWidth: 360 }}>
        {[['interviews', 'ti-microphone', 'Interviews'], ['resumes', 'ti-file-text', 'Resumes']].map(([id, icon, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '7px 0', borderRadius: 6, border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: tab === id ? 600 : 400, cursor: 'pointer', transition: 'all .15s', background: tab === id ? C.card : 'transparent', color: tab === id ? C.text : C.muted }}>
            <i className={`ti ${icon}`} style={{ fontSize: 14 }} /> {label}
          </button>
        ))}
      </div>

      {tab === 'interviews' && (
        !hasInterviews ? (
          <EmptyState icon="ti-microphone" title="No interviews yet"
            sub="Complete your first AI mock interview to see your results here."
            action={<Button onClick={() => navigate('/app/interview')}><i className="ti ti-arrow-right" /> Start Interview</Button>} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
            {history.interviews.map(iv => <InterviewCard key={iv.id} iv={iv} />)}
          </div>
        )
      )}

      {tab === 'resumes' && (
        !hasResumes ? (
          <EmptyState icon="ti-file-text" title="No resumes analyzed"
            sub="Upload or paste your resume to get your ATS score and improvement tips."
            action={<Button onClick={() => navigate('/app/resume')}><i className="ti ti-arrow-right" /> Analyze Resume</Button>} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
            {history.resumes.map(r => <ResumeCard key={r.id} r={r} />)}
          </div>
        )
      )}
    </div>
  )
}
