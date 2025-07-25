import apiClient, { apiUtils, ApiResponse, ApiError } from '@/config/api'

// User interface
export interface User {
  id: string
  name: string
  email: string
  role: 'student' | 'admin'
  subscription_plan?: string
  subscription_expiry?: string
  language_preference?: string
  created_at?: string
  last_login?: string
}

// Login request interface
export interface LoginRequest {
  email: string
  password: string
}

// Register request interface
export interface RegisterRequest {
  name: string
  email: string
  password: string
  role?: 'student' | 'admin'
}

// Password reset request interface
export interface PasswordResetRequest {
  email: string
}

// Password reset verify interface
export interface PasswordResetVerifyRequest {
  token: string
}

// Password reset confirm interface
export interface PasswordResetConfirmRequest {
  token: string
  password: string
}

// Auth response interface
export interface AuthResponse {
  token: string
  user: User
}

class AuthService {
  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/api/v1/auth/login', credentials)
      const data = apiUtils.extractData(response)
      
      // Store authentication data
      apiUtils.setAuthData(data.token, data.user)
      
      return data
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Register new user
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/api/v1/auth/register', userData)
      const data = apiUtils.extractData(response)
      
      // Store authentication data
      apiUtils.setAuthData(data.token, data.user)
      
      return data
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<ApiResponse<User>>('/api/v1/auth/me')
      const user = apiUtils.extractData(response)
      
      // Update stored user data
      localStorage.setItem('currentUser', JSON.stringify(user))
      
      return user
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await apiClient.post<ApiResponse<void>>('/api/v1/auth/password-reset', { email })
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Verify password reset token
  async verifyPasswordResetToken(token: string): Promise<boolean> {
    try {
      await apiClient.post<ApiResponse<void>>('/api/v1/auth/password-reset/verify', { token })
      return true
    } catch (error) {
      return false
    }
  }

  // Confirm password reset
  async confirmPasswordReset(token: string, password: string): Promise<void> {
    try {
      await apiClient.post<ApiResponse<void>>('/api/v1/auth/password-reset/confirm', { token, password })
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Logout user
  logout(): void {
    // Clear authentication data
    apiUtils.clearAuthData()
    
    // Redirect to login page
    window.location.href = '/login'
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return apiUtils.isAuthenticated()
  }

  // Get current user from localStorage
  getCurrentUserFromStorage(): User | null {
    return apiUtils.getCurrentUser()
  }

  // Refresh user data from API
  async refreshUserData(): Promise<User> {
    return this.getCurrentUser()
  }

  // Update user profile
  async updateProfile(profileData: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.put<ApiResponse<User>>('/api/v1/users/profile', profileData)
      const user = apiUtils.extractData(response)
      
      // Update stored user data
      localStorage.setItem('currentUser', JSON.stringify(user))
      
      return user
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiClient.put<ApiResponse<void>>('/api/v1/users/profile', {
        current_password: currentPassword,
        new_password: newPassword
      })
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Development helper methods (for testing)
  // These methods simulate the API for development when backend is not available
  
  // Development login
  async devLogin(email: string, password: string): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const devUsers = {
      'dev@numera.com': {
        id: 'dev-student-001',
        name: 'John Doe',
        email: 'dev@numera.com',
        role: 'student' as const,
        subscription_plan: 'free',
        created_at: new Date().toISOString()
      },
      'admin@numera.com': {
        id: 'dev-admin-001',
        name: 'Admin User',
        email: 'admin@numera.com',
        role: 'admin' as const,
        subscription_plan: 'premium',
        created_at: new Date().toISOString()
      }
    }
    
    const user = devUsers[email as keyof typeof devUsers]
    if (!user || password !== 'password123') {
      throw new Error('Invalid credentials')
    }
    
    const token = 'dev-token-12345'
    const authData: AuthResponse = { token, user }
    
    // Store authentication data
    apiUtils.setAuthData(token, user)
    
    return authData
  }
  
  // Check if we should use development mode
  private shouldUseDevMode(): boolean {
    return import.meta.env.DEV && !apiUtils.isAuthenticated()
  }
}

export const authService = new AuthService()
export default authService 