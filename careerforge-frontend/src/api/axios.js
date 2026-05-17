import axios from 'axios'

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://careerforge-7pqw.onrender.com'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/* ── Request interceptor: inject JWT ── */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cf_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Don't override Content-Type for FormData
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }

  return config
})

/* ── Response interceptor: normalize errors ── */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail =
      error.response?.data?.detail ||
      error.response?.data?.error ||
      error.message

    // Auto logout on unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('cf_token')
      localStorage.removeItem('cf_user')
      window.dispatchEvent(new Event('cf:logout'))
    }

    return Promise.reject(
      new Error(
        typeof detail === 'string'
          ? detail
          : JSON.stringify(detail)
      )
    )
  }
)

export default api