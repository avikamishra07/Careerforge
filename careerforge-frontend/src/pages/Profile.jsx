import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useAppToast } from '../components/layout/AppLayout'
import { authService } from '../services/auth.service'
import { Button, Card, Avatar, Tag, Spinner } from '../components/ui'
import { C, SKILLS, ROLES } from '../constants'

export default function Profile() {
  const { user, updateUser, history } = useAuth()
  const toast = useAppToast()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    role: user?.role || '',
    bio: user?.bio || '',
    github: user?.github || '',
    linkedin: user?.linkedin || '',
    skills: user?.skills || [],
  })

  const toggleSkill = (s) =>
    setForm(f => ({ ...f, skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s] }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await authService.updateProfile(form)
      updateUser(updated)
      setEditing(false)
      toast('Profile updated!', 'success')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm({ name: user?.name || '', role: user?.role || '', bio: user?.bio || '', github: user?.github || '', linkedin: user?.linkedin || '', skills: user?.skills || [] })
    setEditing(false)
  }

  return (
    <div style={{ maxWidth: 620 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: '-0.03em' }}>Profile</h1>
        {!editing && <Button variant="secondary" onClick={() => setEditing(true)}><i className="ti ti-edit" /> Edit Profile</Button>}
      </div>

      {/* Avatar & name */}
      <Card style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: editing ? 20 : 0 }}>
          <Avatar name={user?.name || 'U'} size={60} />
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: '-0.03em' }}>{user?.name}</h2>
            <p style={{ fontSize: 13, color: C.muted }}>{user?.email}</p>
            {user?.role && <p style={{ fontSize: 13, color: C.indigoL, marginTop: 2 }}>{user.role}</p>}
          </div>
        </div>

        {editing ? (
          <div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Full Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Role / Title</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="">— Select a role —</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Bio</label>
              <textarea rows={3} placeholder="Tell others about yourself…" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={lbl}>GitHub URL</label>
                <input placeholder="https://github.com/you" value={form.github} onChange={e => setForm(f => ({ ...f, github: e.target.value }))} />
              </div>
              <div>
                <label style={lbl}>LinkedIn URL</label>
                <input placeholder="https://linkedin.com/in/you" value={form.linkedin} onChange={e => setForm(f => ({ ...f, linkedin: e.target.value }))} />
              </div>
            </div>
          </div>
        ) : (
          <div>
            {user?.bio && <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.65, marginTop: 12 }}>{user.bio}</p>}
            <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
              {user?.github && (
                <a href={user.github} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: C.indigoL, textDecoration: 'none' }}>
                  <i className="ti ti-brand-github" /> GitHub
                </a>
              )}
              {user?.linkedin && (
                <a href={user.linkedin} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: C.blue, textDecoration: 'none' }}>
                  <i className="ti ti-brand-linkedin" /> LinkedIn
                </a>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Skills */}
      <Card style={{ padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="ti ti-code" style={{ color: C.indigoL }} /> Skills
        </h3>
        {editing ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SKILLS.map(s => (
              <button key={s} onClick={() => toggleSkill(s)} className={`skill-pill${form.skills.includes(s) ? ' active' : ''}`}>
                {s}
              </button>
            ))}
          </div>
        ) : (
          (user?.skills?.length > 0) ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {user.skills.map(s => <Tag key={s} color="indigo">{s}</Tag>)}
            </div>
          ) : (
            <p style={{ color: C.muted, fontSize: 13 }}>No skills added yet. Edit your profile to add skills.</p>
          )
        )}
      </Card>

      {/* Stats */}
      <Card style={{ padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="ti ti-chart-bar" style={{ color: C.amber }} /> Activity
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12 }}>
          {[
            { label: 'Interviews', value: history.total_interviews, icon: 'ti-microphone', col: C.indigo },
            { label: 'Resumes', value: history.total_resumes, icon: 'ti-file-text', col: C.green },
            { label: 'Best Score', value: history.best_interview_score != null ? `${history.best_interview_score}%` : '—', icon: 'ti-trophy', col: C.amber },
            { label: 'Best ATS', value: history.best_ats_score != null ? `${history.best_ats_score}%` : '—', icon: 'ti-star', col: C.blue },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,.03)', borderRadius: 8, padding: '12px 14px' }}>
              <i className={`ti ${s.icon}`} style={{ fontSize: 16, color: s.col, display: 'block', marginBottom: 6 }} />
              <div style={{ fontSize: 18, fontWeight: 800, color: C.text, fontFamily: 'DM Mono,monospace' }}>{s.value}</div>
              <div style={{ fontSize: 11.5, color: C.muted }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Save / Cancel */}
      {editing && (
        <div style={{ display: 'flex', gap: 10 }}>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <><Spinner size={14} /> Saving…</> : <><i className="ti ti-check" /> Save Changes</>}
          </Button>
          <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
        </div>
      )}
    </div>
  )
}

const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: '#62627a', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }
