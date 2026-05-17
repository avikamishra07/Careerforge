import api from '../api/axios'

export const interviewService = {
  async generateQuestions(role, level = 'mid', count = 5) {
    const { data } = await api.post('/api/v1/interview/questions', { role, level, count })
    return data // { questions: string[], role, level }
  },

  async evaluate(role, level, qa_pairs, duration_seconds = 0) {
    const { data } = await api.post('/api/v1/interview/evaluate', {
      role, level, qa_pairs, duration_seconds,
    })
    return data // InterviewFeedback
  },

  async save(role, level, feedback, duration_seconds, qa_pairs) {
    const { data } = await api.post('/api/v1/interview/save', {
      role, level, feedback, duration_seconds, qa_pairs,
    })
    return data
  },

  async getHistory() {
    const { data } = await api.get('/api/v1/interview/history')
    return data // HistorySummary
  },
}
