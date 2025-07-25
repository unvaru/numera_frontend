import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// Environment configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000')

// API Response interface
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

// API Error interface
export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: any
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle common responses
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Handle successful responses
    return response
  },
  (error) => {
    // Handle common error scenarios
    if (error.response) {
      const { status, data } = error.response
      
      // Handle authentication errors
      if (status === 401) {
        // Clear invalid token
        localStorage.removeItem('authToken')
        localStorage.removeItem('currentUser')
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
      
      // Handle forbidden errors
      if (status === 403) {
        console.error('Access forbidden:', data?.error || 'Insufficient permissions')
      }
      
      // Handle rate limiting
      if (status === 429) {
        console.error('Rate limit exceeded. Please try again later.')
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.message)
    } else {
      // Other error
      console.error('API error:', error.message)
    }
    
    return Promise.reject(error)
  }
)

// API utility functions
export const apiUtils = {
  // Extract data from API response
  extractData: <T>(response: AxiosResponse<ApiResponse<T>>): T => {
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Invalid API response')
  },
  
  // Handle API errors
  handleError: (error: any): ApiError => {
    if (error.response) {
      return {
        message: error.response.data?.error || 'API request failed',
        code: error.response.data?.code,
        status: error.response.status,
        details: error.response.data?.details,
      }
    }
    return {
      message: error.message || 'Network error',
      code: 'NETWORK_ERROR',
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('authToken')
    if (!token) return false
    
    try {
      // Basic token validation (check if it's a valid JWT format)
      const parts = token.split('.')
      if (parts.length !== 3) return false
      
      // Check if token is expired
      const payload = JSON.parse(atob(parts[1]))
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('currentUser')
        return false
      }
      
      return true
    } catch {
      return false
    }
  },
  
  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('currentUser')
    return userStr ? JSON.parse(userStr) : null
  },
  
  // Set authentication data
  setAuthData: (token: string, user: any) => {
    localStorage.setItem('authToken', token)
    localStorage.setItem('currentUser', JSON.stringify(user))
  },
  
  // Clear authentication data
  clearAuthData: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('currentUser')
  },
}

export default apiClient 