import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Resume API
export const resumeAPI = {
  upload: async (file) => {
    const formData = new FormData()
    formData.append('resume', file)

    const response = await api.post('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/resume/${id}`)
    return response.data
  },

  getAll: async () => {
    const response = await api.get('/resume')
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/resume/${id}`)
    return response.data
  },
}

// ATS API
export const atsAPI = {
  analyze: async (resumeId, jobDescription) => {
    const response = await api.post('/ats/analyze', {
      resumeId,
      jobDescription,
    })
    return response.data
  },

  improve: async (resumeId, jobDescription) => {
    const response = await api.post('/ats/improve', {
      resumeId,
      jobDescription,
    })
    return response.data
  },

  extractKeywords: async (jobDescription) => {
    const response = await api.post('/ats/keywords', {
      jobDescription,
    })
    return response.data
  },

  compare: async (resumeId, jobDescription) => {
    const response = await api.post('/ats/compare', {
      resumeId,
      jobDescription,
    })
    return response.data
  },

  getScore: async (resumeId) => {
    const response = await api.get(`/ats/score/${resumeId}`)
    return response.data
  },
}

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health')
  return response.data
}

export default api
