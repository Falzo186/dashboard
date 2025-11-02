// frontend/src/services/api/client.ts
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1'

const apiClient = axios.create({
  baseURL: `${API_URL}/api/${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 120 segundos
})

// Increase default timeout for long-running analytics endpoints (helps debugging)
apiClient.defaults.timeout = 300000 // 5 minutes

// Interceptor para requests
apiClient.interceptors.request.use(
  (config) => {
    console.log('🔵 API Request:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Interceptor para responses
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url)
    console.log('📦 Response Data:', response.data)
    return response
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.status, error.config?.url)
    console.error('📦 Error Data:', error.response?.data)
    
    if (error.response) {
      // El servidor respondió con un código de error
      console.error('Server Error:', error.response.status, error.response.data)
    } else if (error.request) {
      // La request se hizo pero no hubo respuesta
      console.error('No Response:', error.request)
    } else {
      // Algo pasó al configurar la request
      console.error('Request Setup Error:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default apiClient