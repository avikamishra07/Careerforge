import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useAppToast } from '../components/layout/AppLayout'
import { resumeService } from '../services/resume.service'
import { Button, Card, Loading, ScoreRing, Tag, ProgressBar, Spinner } from '../components/ui'
import { C, scoreColor } from '../constants'

/* ── Score breakdown bar ── */
function BreakdownRow({ label, value, color }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12.5 }}>
        <span style={{ color: C.muted }}>{label}</span>
        <span style={{ color, fontWeight: 700, fontFamily: 'DM Mono,monospace' }}>{value}%</span>
      </div>
      <ProgressBar value={value} color={color} height={5} />
    </div>
  )
}

/* ── Results view ── */
function Results({ data, onReset }) {
  const { addResumeResult } = useAuth()
  const toast = useAppToast()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await resumeService.save(data)
      addResumeResult({ ...data, created_at: new Date().toISOString() })
      setSaved(true)
      toast('Resume analysis saved!', 'success')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const bd = data.ats_breakdown
  const bdRows = [
    { label: 'Formatting',     value: bd.formatting,     color: C.indigo },
    { label: 'Keywords',       value: bd.keywords,       color: C.blue   },
    { label: 'Quantification', value: bd.quantification, color: C.amber  },
    { label: 'Clarity',        value: bd.clarity,        color: C.green  },
  ]

  return (
    <div className="fade" style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Hero */}
      <Card style={{ padding: 28, marginBottom: 20, background: `linear-gradient(135deg,${C.card},rgba(16,185,129,.04))` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <ScoreRing score={data.ats_score} color={scoreColor(data.ats_score)} size={90} label="ATS Score" />
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 8, letterSpacing: '-0.03em' }}>Resume Analysis Complete</h2>
            <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.65 }}>{data.summary}</p>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, marginBottom: 20 }}>
        {/* ATS Breakdown */}
        <Card style={{ padding: 20 }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-chart-bar" style={{ color: C.indigoL }} /> ATS Breakdown
          </h3>
          {bdRows.map(r => <BreakdownRow key={r.label} {...r} />)}
        </Card>

        {/* Skills found */}
        <Card style={{ padding: 20 }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-code" style={{ color: C.green }} /> Skills Detected
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {data.skills_found.length === 0
              ? <p style={{ color: C.muted, fontSize: 13 }}>No skills detected</p>
              : data.skills_found.map(s => <Tag key={s} color="green">{s}</Tag>)
            }
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, marginBottom: 20 }}>
        {/* Missing skills */}
        <Card style={{ padding: 20 }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-alert-triangle" style={{ color: C.amber }} /> Skill Gaps
          </h3>
          {data.missing_skills.length === 0
            ? <p style={{ color: C.muted, fontSize: 13 }}>Great — no obvious gaps!</p>
            : data.missing_skills.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 7, alignItems: 'center' }}>
                <i className="ti ti-minus" style={{ color: C.amber, fontSize: 13, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: C.text }}>{s}</span>
              </div>
            ))}
        </Card>

        {/* Suitable roles */}
        <Card style={{ padding: 20 }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-briefcase" style={{ color: C.blue }} /> Suitable Roles
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {data.suitable_roles.map(r => <Tag key={r} color="blue">{r}</Tag>)}
          </div>
        </Card>
      </div>

      {/* Improvements */}
      <Card style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="ti ti-list-check" style={{ color: C.indigoL }} /> Improvement Suggestions
        </h3>
        {data.improvements.map((imp, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
            <span style={{ width: 20, height: 20, borderRadius: 6, background: C.indigoA, color: C.indigoL, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'DM Mono,monospace' }}>{i + 1}</span>
            <span style={{ fontSize: 13.5, color: C.text, lineHeight: 1.6 }}>{imp}</span>
          </div>
        ))}
      </Card>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Button onClick={handleSave} disabled={saving || saved} variant={saved ? 'success' : 'primary'}>
          {saving ? <><Spinner size={14} /> Saving…</> : saved ? <><i className="ti ti-check" /> Saved!</> : <><i className="ti ti-device-floppy" /> Save to History</>}
        </Button>
        <Button variant="secondary" onClick={onReset}>
          <i className="ti ti-refresh" /> Analyze Another
        </Button>
      </div>
    </div>
  )
}

/* ── Main ── */
export default function Resume() {
  const [tab, setTab] = useState('text')    // text | pdf
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const fileRef = useRef()
  const toast = useAppToast()

  const analyze = async () => {
    setError('')
    if (tab === 'text' && text.trim().length < 50) { setError('Please paste at least 50 characters of resume text.'); return }
    if (tab === 'pdf' && !file) { setError('Please upload a PDF file.'); return }
    setLoading(true)
    try {
      const data = tab === 'text' ? await resumeService.analyzeText(text) : await resumeService.analyzePdf(file)
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading text="Analyzing your resume…" sub="AI is evaluating ATS compatibility and skill gaps" />
  if (result)  return <Results data={result} onReset={() => { setResult(null); setText(''); setFile(null) }} />

  return (
    <div style={{ maxWidth: 620, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: C.greenA, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <i className="ti ti-file-text" style={{ fontSize: 26, color: C.green }} />
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6, letterSpacing: '-0.03em' }}>Resume Analyzer</h1>
        <p style={{ color: C.muted, fontSize: 13.5 }}>Get your ATS score, skill gap analysis, and concrete improvements.</p>
      </div>

      <Card style={{ padding: 24 }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: 'rgba(255,255,255,.04)', borderRadius: 8, padding: 4 }}>
          {[['text', 'ti-file-description', 'Paste Text'], ['pdf', 'ti-file-type-pdf', 'Upload PDF']].map(([id, icon, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '7px 0', borderRadius: 6, border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: tab === id ? 600 : 400, cursor: 'pointer', transition: 'all .15s', background: tab === id ? C.card : 'transparent', color: tab === id ? C.text : C.muted }}>
              <i className={`ti ${icon}`} style={{ fontSize: 14 }} /> {label}
            </button>
          ))}
        </div>

        {tab === 'text' ? (
          <textarea
            rows={12}
            placeholder="Paste your resume text here…&#10;&#10;Include your work experience, education, skills, and projects for best results."
            value={text}
            onChange={e => setText(e.target.value)}
            style={{ resize: 'vertical', minHeight: 220, fontFamily: 'inherit', lineHeight: 1.65 }}
          />
        ) : (
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type === 'application/pdf') setFile(f) }}
            style={{ border: `2px dashed ${file ? C.green : C.border}`, borderRadius: 10, padding: '40px 20px', textAlign: 'center', cursor: 'pointer', transition: 'all .2s', background: file ? C.greenA : 'transparent' }}>
            <i className={`ti ${file ? 'ti-file-check' : 'ti-cloud-upload'}`} style={{ fontSize: 32, color: file ? C.green : C.faint, display: 'block', marginBottom: 10 }} />
            {file ? (
              <>
                <p style={{ fontSize: 14, fontWeight: 600, color: C.green }}>{file.name}</p>
                <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{(file.size / 1024).toFixed(0)} KB · Click to change</p>
              </>
            ) : (
              <>
                <p style={{ fontSize: 14, color: C.text, marginBottom: 4 }}>Drop your PDF here or click to browse</p>
                <p style={{ fontSize: 12, color: C.muted }}>PDF only · Max 5MB</p>
              </>
            )}
            <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
          </div>
        )}

        {error && (
          <div style={{ background: C.redA, border: '1px solid rgba(239,68,68,.25)', borderRadius: 8, padding: '10px 14px', marginTop: 14, fontSize: 13, color: '#f87171', display: 'flex', gap: 8, alignItems: 'center' }}>
            <i className="ti ti-alert-circle" style={{ flexShrink: 0 }} /> {error}
          </div>
        )}

        <Button full size="lg" style={{ marginTop: 18 }} onClick={analyze}>
          <i className="ti ti-search" /> Analyze Resume
        </Button>
      </Card>
    </div>
  )
}
