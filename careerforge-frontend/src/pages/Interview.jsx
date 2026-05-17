import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useAppToast } from '../components/layout/AppLayout'
import { interviewService } from '../services/interview.service'
import { Button, Card, Loading, ScoreRing, Tag, Section, Spinner } from '../components/ui'
import { C, ROLES, scoreColor, fmtTime } from '../constants'

const LEVELS = ['junior', 'mid', 'senior']

/* ── Step 0: Setup ── */
function Setup({ onStart }) {
  const [role, setRole] = useState('')
  const [customRole, setCustomRole] = useState('')
  const [level, setLevel] = useState('mid')
  const [count, setCount] = useState(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const finalRole = role === '__custom__' ? customRole.trim() : role

  const handleStart = async () => {
    if (!finalRole) { setError('Please select or enter a role.'); return }
    setError('')
    setLoading(true)
    try {
      const data = await interviewService.generateQuestions(finalRole, level, count)
      onStart({ role: finalRole, level, questions: data.questions })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: C.indigoA, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <i className="ti ti-microphone" style={{ fontSize: 26, color: C.indigoL }} />
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6, letterSpacing: '-0.03em' }}>AI Mock Interview</h1>
        <p style={{ color: C.muted, fontSize: 13.5 }}>Get role-specific questions and a full scored feedback report.</p>
      </div>

      <Card style={{ padding: 24 }}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Role</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="">— Select a role —</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            <option value="__custom__">Other (enter manually)</option>
          </select>
          {role === '__custom__' && (
            <input style={{ marginTop: 10 }} placeholder="e.g. Blockchain Developer" value={customRole} onChange={e => setCustomRole(e.target.value)} />
          )}
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Experience Level</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {LEVELS.map(l => (
              <button key={l} onClick={() => setLevel(l)} className={`skill-pill${level === l ? ' active' : ''}`} style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }}>
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Number of Questions: <span style={{ color: C.indigoL }}>{count}</span>
          </label>
          <input type="range" min={3} max={8} value={count} onChange={e => setCount(+e.target.value)}
            style={{ width: '100%', accentColor: C.indigo, padding: 0, border: 'none', background: 'transparent' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.faint, marginTop: 4 }}>
            <span>3 (Quick)</span><span>8 (Full)</span>
          </div>
        </div>

        {error && (
          <div style={{ background: C.redA, border: '1px solid rgba(239,68,68,.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#f87171', display: 'flex', gap: 8, alignItems: 'center' }}>
            <i className="ti ti-alert-circle" style={{ flexShrink: 0 }} /> {error}
          </div>
        )}

        <Button full size="lg" onClick={handleStart} disabled={loading}>
          {loading ? <><Spinner size={15} /> Generating questions…</> : <><i className="ti ti-arrow-right" /> Start Interview</>}
        </Button>
      </Card>
    </div>
  )
}

/* ── Step 1: Interview (answer questions) ── */
function InterviewSession({ role, level, questions, onFinish }) {
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState(Array(questions.length).fill(''))
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(intervalRef.current)
  }, [])

  const current = questions[idx]
  const progress = ((idx + 1) / questions.length) * 100

  const handleNext = () => {
    if (idx < questions.length - 1) setIdx(i => i + 1)
    else {
      clearInterval(intervalRef.current)
      const qa = questions.map((q, i) => ({ question: q, answer: answers[i] }))
      onFinish(qa, elapsed)
    }
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <Tag color="indigo">{role}</Tag>
          <Tag color="gray" style={{ marginLeft: 6 }}>{level}</Tag>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.muted, fontSize: 13, fontFamily: 'DM Mono,monospace' }}>
          <i className="ti ti-clock" />
          {fmtTime(elapsed)}
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.muted, marginBottom: 6 }}>
          <span>Question {idx + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: 3, background: 'rgba(255,255,255,.07)', borderRadius: 2 }}>
          <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg,${C.indigo},${C.indigoL})`, borderRadius: 2, transition: 'width .3s' }} />
        </div>
      </div>

      <Card style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: C.indigoA, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'DM Mono,monospace', fontSize: 12, color: C.indigoL, fontWeight: 700 }}>
            {idx + 1}
          </div>
          <p style={{ fontSize: 15, color: C.text, lineHeight: 1.65, fontWeight: 500 }}>{current}</p>
        </div>

        <textarea
          rows={6}
          placeholder="Type your answer here… be specific and use examples from your experience."
          value={answers[idx]}
          onChange={e => {
            const next = [...answers]
            next[idx] = e.target.value
            setAnswers(next)
          }}
          style={{ resize: 'vertical', minHeight: 130 }}
        />
      </Card>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
        <Button variant="ghost" size="sm" disabled={idx === 0} onClick={() => setIdx(i => i - 1)}>
          <i className="ti ti-arrow-left" /> Previous
        </Button>
        <Button onClick={handleNext} disabled={!answers[idx]?.trim()}>
          {idx < questions.length - 1 ? <><i className="ti ti-arrow-right" /> Next</> : <><i className="ti ti-send" /> Submit & Evaluate</>}
        </Button>
      </div>
    </div>
  )
}

/* ── Step 2: Results ── */
function Results({ result, role, level, duration, onRetry }) {
  const { addInterviewResult } = useAuth()
  const toast = useAppToast()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await interviewService.save(role, level, result, duration)
      addInterviewResult({ ...result, role, level, duration_seconds: duration, created_at: new Date().toISOString() })
      setSaved(true)
      toast('Interview saved to history!', 'success')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const scores = [
    { label: 'Technical',     val: result.technical_score,     col: C.indigo },
    { label: 'Communication', val: result.communication_score, col: C.green  },
    { label: 'Confidence',    val: result.confidence_score,    col: C.amber  },
  ]

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }} className="fade">
      {/* Hero score */}
      <Card style={{ padding: 28, marginBottom: 20, textAlign: 'center', background: `linear-gradient(135deg,${C.card},rgba(99,102,241,.06))` }}>
        <p style={{ color: C.muted, fontSize: 13, marginBottom: 16 }}>Overall Score — {role} ({level})</p>
        <ScoreRing score={result.overall_score} color={scoreColor(result.overall_score)} size={100} label="Overall" />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
          {scores.map(s => <ScoreRing key={s.label} score={s.val} color={s.col} size={68} label={s.label} />)}
        </div>
        <p style={{ color: C.muted, fontSize: 13, marginTop: 16, lineHeight: 1.65, maxWidth: 480, margin: '16px auto 0' }}>{result.summary}</p>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, marginBottom: 20 }}>
        <Card style={{ padding: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
            <i className="ti ti-check" /> Strengths
          </h3>
          {result.strengths.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
              <i className="ti ti-circle-check-filled" style={{ color: C.green, fontSize: 14, flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 13, color: C.text, lineHeight: 1.55 }}>{s}</span>
            </div>
          ))}
        </Card>
        <Card style={{ padding: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: C.amber, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
            <i className="ti ti-bulb" /> Areas to Improve
          </h3>
          {result.weaknesses.map((w, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
              <i className="ti ti-alert-triangle" style={{ color: C.amber, fontSize: 14, flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 13, color: C.text, lineHeight: 1.55 }}>{w}</span>
            </div>
          ))}
        </Card>
      </div>

      <Card style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: C.indigoL, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
          <i className="ti ti-list-check" /> Action Items
        </h3>
        {result.improvements.map((imp, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
            <span style={{ width: 20, height: 20, borderRadius: 6, background: C.indigoA, color: C.indigoL, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'DM Mono,monospace' }}>{i + 1}</span>
            <span style={{ fontSize: 13, color: C.text, lineHeight: 1.55 }}>{imp}</span>
          </div>
        ))}
      </Card>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Button onClick={handleSave} disabled={saving || saved} variant={saved ? 'success' : 'primary'}>
          {saving ? <><Spinner size={14} /> Saving…</> : saved ? <><i className="ti ti-check" /> Saved!</> : <><i className="ti ti-device-floppy" /> Save to History</>}
        </Button>
        <Button variant="secondary" onClick={onRetry}>
          <i className="ti ti-refresh" /> New Interview
        </Button>
      </div>
    </div>
  )
}

/* ── Main ── */
export default function Interview() {
  const [stage, setStage] = useState('setup') // setup | session | evaluating | results
  const [config, setConfig] = useState(null)
  const [result, setResult] = useState(null)
  const [duration, setDuration] = useState(0)
  const toast = useAppToast()

  const handleStart = (cfg) => { setConfig(cfg); setStage('session') }

  const handleFinish = async (qa, elapsed) => {
    setDuration(elapsed)
    setStage('evaluating')
    try {
      const feedback = await interviewService.evaluate(config.role, config.level, qa, elapsed)
      setResult(feedback)
      setStage('results')
    } catch (e) {
      toast(e.message, 'error')
      setStage('session')
    }
  }

  if (stage === 'setup')      return <Setup onStart={handleStart} />
  if (stage === 'session')    return <InterviewSession {...config} onFinish={handleFinish} />
  if (stage === 'evaluating') return <Loading text="Evaluating your answers…" sub="AI is analyzing your responses, this takes ~10 seconds" />
  if (stage === 'results')    return <Results result={result} role={config.role} level={config.level} duration={duration} onRetry={() => setStage('setup')} />
  return null
}
