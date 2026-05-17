import { useState } from 'react'
import { teamService } from '../services/team.service'
import { Button, Card, Tag, Loading, Avatar, ProgressBar } from '../components/ui'
import { C, SKILLS } from '../constants'

function MatchCard({ m }) {
  const compatColor = m.compatibility >= 80 ? C.green : m.compatibility >= 60 ? C.amber : C.red
  return (
    <Card style={{ padding: 20 }}>
      <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
        <Avatar name={m.avatar || m.name} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{m.name}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: compatColor, fontFamily: 'DM Mono,monospace' }}>{m.compatibility}%</span>
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{m.role} · {m.experience}</div>
          <div style={{ marginTop: 6 }}>
            <ProgressBar value={m.compatibility} color={compatColor} height={3} />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Skills</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {m.skills.map(s => <Tag key={s} color="indigo">{s}</Tag>)}
        </div>
      </div>

      <div style={{ background: C.indigoA, borderRadius: 8, padding: '9px 12px', marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: C.indigoL, fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Suggested Role</div>
        <div style={{ fontSize: 13, color: C.text }}>{m.suggested_role}</div>
      </div>

      <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6, marginBottom: 12 }}>{m.reason}</p>

      {m.github && (
        <a href={m.github.startsWith('http') ? m.github : `https://github.com/${m.github}`} target="_blank" rel="noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.indigoL, textDecoration: 'none' }}>
          <i className="ti ti-brand-github" /> {m.github}
        </a>
      )}
    </Card>
  )
}

export default function Team() {
  const [selectedSkills, setSelectedSkills] = useState([])
  const [interests, setInterests] = useState('')
  const [experience, setExperience] = useState('beginner')
  const [useAI, setUseAI] = useState(false)
  const [matches, setMatches] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleSkill = (s) => setSelectedSkills(prev =>
    prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
  )

  const handleFind = async () => {
    if (selectedSkills.length === 0) { setError('Select at least one skill.'); return }
    setError('')
    setLoading(true)
    try {
      const data = await teamService.findMatches(selectedSkills, interests, experience, useAI)
      setMatches(data.matches)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading text="Finding your ideal teammates…" sub={useAI ? 'AI is generating personalized matches' : 'Running skill compatibility matching'} />

  if (matches) return (
    <div className="fade">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: '-0.03em', marginBottom: 4 }}>Your Matches</h2>
          <p style={{ color: C.muted, fontSize: 13 }}>{matches.length} compatible teammates found</p>
        </div>
        <Button variant="secondary" onClick={() => setMatches(null)}>
          <i className="ti ti-refresh" /> Search Again
        </Button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
        {matches.map((m, i) => <MatchCard key={i} m={m} />)}
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 620, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: C.amberA, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <i className="ti ti-users-group" style={{ fontSize: 26, color: C.amber }} />
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6, letterSpacing: '-0.03em' }}>Team Matching</h1>
        <p style={{ color: C.muted, fontSize: 13.5 }}>Find compatible hackathon teammates matched by skills and stack.</p>
      </div>

      <Card style={{ padding: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Your Skills <span style={{ color: C.indigo }}>({selectedSkills.length} selected)</span>
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SKILLS.map(s => (
              <button key={s} onClick={() => toggleSkill(s)} className={`skill-pill${selectedSkills.includes(s) ? ' active' : ''}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Experience Level</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['beginner', 'intermediate', 'advanced'].map(l => (
              <button key={l} onClick={() => setExperience(l)} className={`skill-pill${experience === l ? ' active' : ''}`} style={{ flex: 1, textAlign: 'center' }}>
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Interests / Project Ideas</label>
          <input placeholder="e.g. fintech, AI tools, gaming, social impact…" value={interests} onChange={e => setInterests(e.target.value)} />
        </div>

        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 8, background: useAI ? C.indigoA : 'rgba(255,255,255,.03)', border: `1px solid ${useAI ? 'rgba(99,102,241,.3)' : C.border}`, cursor: 'pointer', transition: 'all .2s' }}
          onClick={() => setUseAI(v => !v)}>
          <div style={{ width: 36, height: 20, borderRadius: 10, background: useAI ? C.indigo : 'rgba(255,255,255,.1)', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 3, left: useAI ? 18 : 3, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>AI-Powered Matching</div>
            <div style={{ fontSize: 11.5, color: C.muted }}>Uses AI to generate personalized teammate profiles (slower)</div>
          </div>
        </div>

        {error && (
          <div style={{ background: C.redA, border: '1px solid rgba(239,68,68,.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#f87171', display: 'flex', gap: 8, alignItems: 'center' }}>
            <i className="ti ti-alert-circle" style={{ flexShrink: 0 }} /> {error}
          </div>
        )}

        <Button full size="lg" onClick={handleFind}>
          <i className="ti ti-search" /> Find Teammates
        </Button>
      </Card>
    </div>
  )
}
