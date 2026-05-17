import api from '../api/axios'

export const authService = {
  async register(name, email, password) {
    const { data } = await api.post('/users/register', { name, email, password })
    return data // { token, user }
  },

  async login(email, password) {
    const { data } = await api.post('/users/login', { email, password })
    return data // { token, user }
  },

  async getProfile() {
    const { data } = await api.get('/users/me')
    return data
  },

  async updateProfile(updates) {
    const { data } = await api.patch('/users/me', updates)
    return data
  },

  setToken(token) {
    if (token) localStorage.setItem('cf_token', token)
    else localStorage.removeItem('cf_token')
  },

  getToken() {
    return localStorage.getItem('cf_token')
  },

  setUser(user) {
    if (user) localStorage.setItem('cf_user', JSON.stringify(user))
    else localStorage.removeItem('cf_user')
  },

  getUser() {
    try {
      const u = localStorage.getItem('cf_user')
      return u ? JSON.parse(u) : null
    } catch { return null }
  },

  clear() {
    localStorage.removeItem('cf_token')
    localStorage.removeItem('cf_user')
  },
}
