import api from '../api/axios'

export const teamService = {
  async findMatches(skills, interests = '', experience = 'beginner', useAI = false) {
    const { data } = await api.post(`/team/match?use_ai=${useAI}`, {
      skills,
      interests,
      experience,
    })
    return data // { matches: TeamMatch[], total: number }
  },
}
