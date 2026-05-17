import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useAppToast } from '../components/layout/AppLayout'
import { skillswapService } from '../services/skillswap.service'
import { Button, Card, Tag, Loading, Avatar, EmptyState, Spinner } from '../components/ui'
import { C } from '../constants'

function PostCard({ item, currentUserId, onConnect, onDelete, connecting }) {
  const isOwn = item.user_id === currentUserId

  return (
    <Card style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <Avatar name={item.avatar || item.name} size={38} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>{item.name}</span>
            <span style={{ fontSize: 11, color: C.faint }}>{item.time_ago}</span>
          </div>
          <span style={{ fontSize: 11.5, color: C.muted }}>{item.experience}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ background: C.greenA, border: '1px solid rgba(16,185,129,.2)', borderRadius: 8, padding: '7px 11px', flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: 10, color: '#34d399', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Offers</div>
          <div style={{ fontSize: 13, color: C.text }}>{item.offer}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', color: C.faint }}>
          <i className="ti ti-arrows-exchange" style={{ fontSize: 16 }} />
        </div>
        <div style={{ background: C.indigoA, border: '1px solid rgba(99,102,241,.2)', borderRadius: 8, padding: '7px 11px', flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: 10, color: C.indigoL, fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Wants</div>
          <div style={{ fontSize: 13, color: C.text }}>{item.want}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {isOwn ? (
          <Button variant="danger" size="sm" onClick={() => onDelete(item.id)}>
            <i className="ti ti-trash" /> Delete
          </Button>
        ) : (
          <Button
            size="sm"
            variant={item.connected ? 'success' : 'outline'}
            onClick={() => onConnect(item.id)}
            disabled={connecting === item.id}
          >
            {connecting === item.id ? <Spinner size={13} /> :
              item.connected ? <><i className="ti ti-check" /> Connected</> : <><i className="ti ti-plug" /> Connect</>}
          </Button>
        )}
      </div>
    </Card>
  )
}

export default function SkillSwap() {
  const { user } = useAuth()
  const toast = useAppToast()
  const [posts, setPosts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [offer, setOffer] = useState('')
  const [want, setWant] = useState('')
  const [creating, setCreating] = useState(false)
  const [connecting, setConnecting] = useState(null)

  const load = useCallback(async (search = q) => {
    setLoading(true)
    try {
      const data = await skillswapService.list(search, 0, 20)
      setPosts(data.items)
      setTotal(data.total)
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [q])

  useEffect(() => { load() }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    load(q)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!offer.trim() || !want.trim()) return
    setCreating(true)
    try {
      const item = await skillswapService.create(offer.trim(), want.trim())
      setPosts(p => [item, ...p])
      setOffer('')
      setWant('')
      setShowCreate(false)
      toast('Post created!', 'success')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setCreating(false)
    }
  }

  const handleConnect = async (id) => {
    setConnecting(id)
    try {
      const res = await skillswapService.toggleConnect(id)
      setPosts(p => p.map(x => x.id === id ? { ...x, connected: !x.connected } : x))
      toast(res.message, 'success')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setConnecting(null)
    }
  }

  const handleDelete = async (id) => {
    try {
      await skillswapService.deletePost(id)
      setPosts(p => p.filter(x => x.id !== id))
      toast('Post deleted', 'info')
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: '-0.03em', marginBottom: 4 }}>SkillSwap</h1>
          <p style={{ color: C.muted, fontSize: 13 }}>Offer what you know, learn what you want — peer-to-peer learning.</p>
        </div>
        <Button onClick={() => setShowCreate(v => !v)}>
          <i className={`ti ${showCreate ? 'ti-x' : 'ti-plus'}`} />
          {showCreate ? 'Cancel' : 'New Post'}
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card style={{ padding: 20, marginBottom: 20 }} className="fade">
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Create SkillSwap Post</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, color: C.muted, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>I can teach</label>
                <input placeholder="e.g. React, Python, Figma…" value={offer} onChange={e => setOffer(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, color: C.muted, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>I want to learn</label>
                <input placeholder="e.g. Machine Learning, DevOps…" value={want} onChange={e => setWant(e.target.value)} required />
              </div>
            </div>
            <Button type="submit" disabled={creating}>
              {creating ? <><Spinner size={13} /> Posting…</> : <><i className="ti ti-send" /> Post</>}
            </Button>
          </form>
        </Card>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input
          placeholder="Search skills, names…"
          value={q}
          onChange={e => setQ(e.target.value)}
          style={{ flex: 1 }}
        />
        <Button type="submit" variant="secondary">
          <i className="ti ti-search" />
        </Button>
        {q && <Button type="button" variant="ghost" onClick={() => { setQ(''); load('') }}><i className="ti ti-x" /></Button>}
      </form>

      {/* Count */}
      <p style={{ fontSize: 12.5, color: C.muted, marginBottom: 14 }}>
        {loading ? 'Loading…' : `${total} post${total !== 1 ? 's' : ''}`}
      </p>

      {loading ? <Loading text="Loading posts…" /> :
       posts.length === 0 ? (
        <EmptyState icon="ti-arrows-exchange" title="No posts found"
          sub={q ? `No results for "${q}". Try a different search.` : 'Be the first to post a SkillSwap!'}
          action={<Button onClick={() => setShowCreate(true)}><i className="ti ti-plus" /> Create Post</Button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {posts.map(p => (
            <PostCard key={p.id} item={p} currentUserId={user?.id || user?.sub}
              onConnect={handleConnect} onDelete={handleDelete} connecting={connecting} />
          ))}
        </div>
      )}
    </div>
  )
}
