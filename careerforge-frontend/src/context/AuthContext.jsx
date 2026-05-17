import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/auth.service'
import { interviewService } from '../services/interview.service'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getUser())
  const [token, setToken] = useState(() => authService.getToken())
  const [history, setHistory] = useState({
    interviews: [], resumes: [],
    total_interviews: 0, total_resumes: 0,
    best_interview_score: null, best_ats_score: null,
  })
  const [historyLoading, setHistoryLoading] = useState(false)

  const isAuthenticated = !!token && !!user

  /* ── Listen for forced logout (401) ── */
  useEffect(() => {
    const handler = () => logout()
    window.addEventListener('cf:logout', handler)
    return () => window.removeEventListener('cf:logout', handler)
  }, [])

  /* ── Load history when authenticated ── */
  const refreshHistory = useCallback(async () => {
    if (!authService.getToken()) return
    setHistoryLoading(true)
    try {
      const h = await interviewService.getHistory()
      setHistory(h)
    } catch (e) {
      console.warn('History load failed:', e.message)
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) refreshHistory()
  }, [isAuthenticated])

  const login = async (tokenVal, userData) => {
    authService.setToken(tokenVal)
    authService.setUser(userData)
    setToken(tokenVal)
    setUser(userData)
    // Load history
    try {
      const h = await interviewService.getHistory()
      setHistory(h)
    } catch {}
  }

  const logout = () => {
    authService.clear()
    setToken(null)
    setUser(null)
    setHistory({
      interviews: [], resumes: [],
      total_interviews: 0, total_resumes: 0,
      best_interview_score: null, best_ats_score: null,
    })
  }

  const updateUser = (updates) => {
    const updated = { ...user, ...updates }
    authService.setUser(updated)
    setUser(updated)
  }

  /* ── Optimistic history updates ── */
  const addInterviewResult = (result) => {
    setHistory(h => ({
      ...h,
      interviews: [result, ...h.interviews],
      total_interviews: (h.total_interviews || 0) + 1,
      best_interview_score: Math.max(h.best_interview_score || 0, result.overall_score),
    }))
    setTimeout(refreshHistory, 1500)
  }

  const addResumeResult = (result) => {
    setHistory(h => ({
      ...h,
      resumes: [result, ...h.resumes],
      total_resumes: (h.total_resumes || 0) + 1,
      best_ats_score: Math.max(h.best_ats_score || 0, result.ats_score),
    }))
    setTimeout(refreshHistory, 1500)
  }

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated, history, historyLoading,
      login, logout, updateUser, refreshHistory,
      addInterviewResult, addResumeResult,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
