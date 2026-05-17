import api from '../api/axios'

export const skillswapService = {
  async list(q = '', skip = 0, limit = 20) {
    const params = new URLSearchParams({ skip, limit })
    if (q) params.set('q', q)
    const { data } = await api.get(`/api/v1/skillswap/?${params}`)
    return data // { items: SkillSwapItem[], total: number }
  },

  async create(offer, want) {
    const { data } = await api.post('/api/v1/skillswap/', { offer, want })
    return data // SkillSwapItem
  },

  async toggleConnect(postId) {
    const { data } = await api.post(`/api/v1/skillswap/${postId}/connect`)
    return data // { message: string }
  },

  async deletePost(postId) {
    const { data } = await api.delete(`/api/v1/skillswap/${postId}`)
    return data
  },
}
