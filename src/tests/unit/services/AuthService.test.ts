import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { authService } from '@/services/AuthService'
import type { LoginRequest, RegisterRequest, User } from '@/services/AuthService'

// Mock the API client
vi.mock('@/config/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  },
  apiUtils: {
    extractData: vi.fn(),
    handleError: vi.fn()
  }
}))

describe('AuthService', () => {
  let mockApiClient: any
  let mockApiUtils: any

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Get mocked modules
    const apiModule = await import('@/config/api')
    mockApiClient = apiModule.default
    mockApiUtils = apiModule.apiUtils
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      }

      const mockResponse = {
        data: {
          success: true,
          data: {
            user: {
              id: '1',
              name: 'Test User',
              email: 'test@example.com',
              role: 'student'
            },
            token: 'mock-jwt-token'
          }
        }
      }

      mockApiClient.post.mockResolvedValue(mockResponse)
      mockApiUtils.extractData.mockReturnValue(mockResponse.data.data)

      const result = await authService.login(credentials)

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/auth/login', credentials)
      expect(result).toEqual(mockResponse.data.data)
    })

    it('should throw error for invalid credentials', async () => {
      const credentials: LoginRequest = {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      }

      const mockError = new Error('Invalid credentials')
      mockApiClient.post.mockRejectedValue(mockError)
      mockApiUtils.handleError.mockImplementation(() => mockError)

      await expect(authService.login(credentials)).rejects.toThrow('Invalid credentials')
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/auth/login', credentials)
    })

    it('should handle network errors', async () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      }

      const networkError = new Error('Network error')
      mockApiClient.post.mockRejectedValue(networkError)
      mockApiUtils.handleError.mockImplementation(() => networkError)

      await expect(authService.login(credentials)).rejects.toThrow('Network error')
    })
  })

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const userData: RegisterRequest = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'student'
      }

      const mockResponse = {
        data: {
          success: true,
          data: {
            user: {
              id: '2',
              name: 'New User',
              email: 'newuser@example.com',
              role: 'student'
            },
            token: 'mock-jwt-token'
          }
        }
      }

      mockApiClient.post.mockResolvedValue(mockResponse)
      mockApiUtils.extractData.mockReturnValue(mockResponse.data.data)

      const result = await authService.register(userData)

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/auth/register', userData)
      expect(result).toEqual(mockResponse.data.data)
    })

    it('should throw error for duplicate email', async () => {
      const userData: RegisterRequest = {
        name: 'New User',
        email: 'existing@example.com',
        password: 'password123',
        role: 'student'
      }

      const mockError = new Error('Email already exists')
      mockApiClient.post.mockRejectedValue(mockError)
      mockApiUtils.handleError.mockImplementation(() => mockError)

      await expect(authService.register(userData)).rejects.toThrow('Email already exists')
    })
  })

  describe('getCurrentUser', () => {
    it('should return current user data', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'student',
        is_active: true,
        email_verified: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      } as User

      const mockResponse = {
        data: {
          success: true,
          data: mockUser
        }
      }

      mockApiClient.get.mockResolvedValue(mockResponse)
      mockApiUtils.extractData.mockReturnValue(mockUser)

      const result = await authService.getCurrentUser()

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/auth/me')
      expect(result).toEqual(mockUser)
    })

    it('should throw error when not authenticated', async () => {
      const mockError = new Error('Unauthorized')
      mockApiClient.get.mockRejectedValue(mockError)
      mockApiUtils.handleError.mockImplementation(() => mockError)

      await expect(authService.getCurrentUser()).rejects.toThrow('Unauthorized')
    })
  })

  describe('requestPasswordReset', () => {
    it('should successfully request password reset', async () => {
      const email = 'test@example.com'

      const mockResponse = {
        data: {
          success: true,
          message: 'Password reset email sent'
        }
      }

      mockApiClient.post.mockResolvedValue(mockResponse)

      await authService.requestPasswordReset(email)

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/auth/password-reset', { email })
    })

    it('should handle non-existent email gracefully', async () => {
      const email = 'nonexistent@example.com'

      const mockError = new Error('User not found')
      mockApiClient.post.mockRejectedValue(mockError)
      mockApiUtils.handleError.mockImplementation(() => mockError)

      await expect(authService.requestPasswordReset(email)).rejects.toThrow('User not found')
    })
  })

  describe('verifyPasswordResetToken', () => {
    it('should return true for valid token', async () => {
      const token = 'valid-reset-token'

      const mockResponse = {
        data: {
          success: true,
          data: { valid: true }
        }
      }

      mockApiClient.get.mockResolvedValue(mockResponse)
      mockApiUtils.extractData.mockReturnValue({ valid: true })

      const result = await authService.verifyPasswordResetToken(token)

      expect(mockApiClient.get).toHaveBeenCalledWith(`/api/v1/auth/password-reset/${token}`)
      expect(result).toBe(true)
    })

    it('should return false for invalid token', async () => {
      const token = 'invalid-reset-token'

      const mockError = new Error('Invalid token')
      mockApiClient.get.mockRejectedValue(mockError)
      mockApiUtils.handleError.mockImplementation(() => mockError)

      const result = await authService.verifyPasswordResetToken(token)

      expect(result).toBe(false)
    })
  })

  describe('confirmPasswordReset', () => {
    it('should successfully confirm password reset', async () => {
      const token = 'valid-reset-token'
      const password = 'newpassword123'

      const mockResponse = {
        data: {
          success: true,
          message: 'Password reset successful'
        }
      }

      mockApiClient.post.mockResolvedValue(mockResponse)

      await authService.confirmPasswordReset(token, password)

      expect(mockApiClient.post).toHaveBeenCalledWith(`/api/v1/auth/password-reset/${token}`, { password })
    })

    it('should throw error for invalid token', async () => {
      const token = 'invalid-reset-token'
      const password = 'newpassword123'

      const mockError = new Error('Invalid token')
      mockApiClient.post.mockRejectedValue(mockError)
      mockApiUtils.handleError.mockImplementation(() => mockError)

      await expect(authService.confirmPasswordReset(token, password)).rejects.toThrow('Invalid token')
    })
  })

  describe('updateProfile', () => {
    it('should successfully update user profile', async () => {
      const profileData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      }

      const mockUser = {
        id: '1',
        name: 'Updated Name',
        email: 'updated@example.com',
        role: 'student',
        is_active: true,
        email_verified: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      } as User

      const mockResponse = {
        data: {
          success: true,
          data: mockUser
        }
      }

      mockApiClient.put.mockResolvedValue(mockResponse)
      mockApiUtils.extractData.mockReturnValue(mockUser)

      const result = await authService.updateProfile(profileData)

      expect(mockApiClient.put).toHaveBeenCalledWith('/api/v1/auth/profile', profileData)
      expect(result).toEqual(mockUser)
    })
  })

  describe('changePassword', () => {
    it('should successfully change password', async () => {
      const currentPassword = 'oldpassword123'
      const newPassword = 'newpassword123'

      const mockResponse = {
        data: {
          success: true,
          message: 'Password changed successfully'
        }
      }

      mockApiClient.put.mockResolvedValue(mockResponse)

      await authService.changePassword(currentPassword, newPassword)

      expect(mockApiClient.put).toHaveBeenCalledWith('/api/v1/auth/password', {
        current_password: currentPassword,
        new_password: newPassword
      })
    })

    it('should throw error for incorrect current password', async () => {
      const currentPassword = 'wrongpassword'
      const newPassword = 'newpassword123'

      const mockError = new Error('Current password is incorrect')
      mockApiClient.put.mockRejectedValue(mockError)
      mockApiUtils.handleError.mockImplementation(() => mockError)

      await expect(authService.changePassword(currentPassword, newPassword)).rejects.toThrow('Current password is incorrect')
    })
  })

  describe('devLogin', () => {
    it('should use development login when in dev mode', async () => {
      const email = 'dev@example.com'
      const password = 'devpassword'

      // Mock environment check
      vi.stubEnv('DEV', 'true')

      const mockResponse = {
        data: {
          success: true,
          data: {
            user: {
              id: 'dev-1',
              name: 'Dev User',
              email: 'dev@example.com',
              role: 'student'
            },
            token: 'dev-jwt-token'
          }
        }
      }

      mockApiClient.post.mockResolvedValue(mockResponse)
      mockApiUtils.extractData.mockReturnValue(mockResponse.data.data)

      const result = await authService.devLogin(email, password)

      expect(result).toEqual(mockResponse.data.data)
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/auth/dev-login', { email, password })

      vi.unstubAllEnvs()
    })
  })

  describe('utility methods', () => {
    it('should check if user is authenticated', () => {
      // Mock localStorage
      const mockToken = 'mock-jwt-token'
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn().mockReturnValue(mockToken)
        },
        writable: true
      })

      const result = authService.isAuthenticated()
      expect(result).toBe(true)
    })

    it('should get current user from storage', () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com'
      }

      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn().mockReturnValue(JSON.stringify(mockUser))
        },
        writable: true
      })

      const result = authService.getCurrentUserFromStorage()
      expect(result).toEqual(mockUser)
    })

    it('should return null when no user in storage', () => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn().mockReturnValue(null)
        },
        writable: true
      })

      const result = authService.getCurrentUserFromStorage()
      expect(result).toBeNull()
    })
  })
}) 