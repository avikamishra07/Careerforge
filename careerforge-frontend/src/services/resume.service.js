import api from '../api/axios'

export const resumeService = {
  async analyzeText(text) {
    const fd = new FormData()
    fd.append('text', text)
    const { data } = await api.post('/api/v1/resume/analyze/text', fd)
    return data // ResumeAnalysis
  },

  async analyzePdf(file) {
    const fd = new FormData()
    fd.append('file', file)
    const { data } = await api.post('/api/v1/resume/analyze/pdf', fd)
    return data // ResumeAnalysis
  },

  async save(analysis, filename = null) {
    const url = filename
      ? `/resume/save?filename=${encodeURIComponent(filename)}`
      : '/api/v1/resume/save'
    const { data } = await api.post(url, analysis)
    return data
  },
}
