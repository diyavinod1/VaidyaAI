import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://vaidyaai-backend.onrender.com'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

// Pass language code to backend so it can enforce the correct system prompt
export const symptomChat = async (messages, language = 'en') => {
  const { data } = await api.post('/symptom_chat', { messages, language })
  return data
}

export const analyzeSymptoms = async (conversation, symptoms_summary, language = 'en') => {
  const { data } = await api.post('/analyze', { conversation, symptoms_summary, language })
  return data
}

export const getHospitals = async (lat, lon, radius = 5000) => {
  const { data } = await api.get('/hospitals', { params: { lat, lon, radius } })
  return data
}

export const generateSummary = async (messages, patient_phone, language = 'en') => {
  const { data } = await api.post('/summary', { conversation: messages, patient_phone, language })
  return data
}
