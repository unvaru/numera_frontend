import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { createMockUser, createMockApiResponse, createMockApiError } from '@/tests/setup'

// Mock the AuthService
vi.mock('@/services/AuthService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
    requestPasswordReset: vi.fn(),
    verifyPasswordResetToken: vi.fn(),
    confirmPasswordReset: vi.fn(),
    isAuthenticated: vi.fn(),
    getCurrentUserFromStorage: vi.fn()
  }
}))

describe('AuthStore', () => {
  let authStore: ReturnType<typeof useAuthStore>
  let mockAuthService: any

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    
    // Get mocked service
    const authServiceModule = require('@/services/AuthService')
    mockAuthService = authServiceModule.authService
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with default state', () => {
      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(authStore.isLoading).toBe(false)
      expect(authStore.error).toBeNull()
    })

    it('should initialize auth from storage', async () => {
      const mockUser = createMockUser()
      const mockToken = 'mock-jwt-token'

      mockAuthService.isAuthenticated.mockReturnValue(true)
      mockAuthService.getCurrentUserFromStorage.mockReturnValue(mockUser)

      await authStore.initializeAuth()

      expect(authStore.user).toEqual(mockUser)
      expect(authStore.token).toBe(mockToken)
      expect(authStore.isAuthenticated).toBe(true)
    })
  })

  describe('login', () => {
    it('should successfully login user', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      }

      const mockUser = createMockUser()
      const mockToken = 'mock-jwt-token'
      const mockResponse = createMockApiResponse({
        user: mockUser,
        token: mockToken
      })

      mockAuthService.login.mockResolvedValue(mockResponse.data)

      await authStore.login(credentials)

      expect(mockAuthService.login).toHaveBeenCalledWith(credentials)
      expect(authStore.user).toEqual(mockUser)
      expect(authStore.token).toBe(mockToken)
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.error).toBeNull()
    })

    it('should handle login errors', async () => {
      const credentials = {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      }

      const mockError = createMockApiError('Invalid credentials', 401)
      mockAuthService.login.mockRejectedValue(mockError)

      await authStore.login(credentials)

      expect(mockAuthService.login).toHaveBeenCalledWith(credentials)
      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.error).toBe('Invalid credentials')
    })

    it('should set loading state during login', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      }

      // Create a promise that doesn't resolve immediately
      let resolveLogin: (value: any) => void
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve
      })

      mockAuthService.login.mockReturnValue(loginPromise)

      const loginPromiseResult = authStore.login(credentials)

      expect(authStore.isLoading).toBe(true)

      // Resolve the promise
      resolveLogin!(createMockApiResponse({
        user: createMockUser(),
        token: 'mock-jwt-token'
      }).data)

      await loginPromiseResult

      expect(authStore.isLoading).toBe(false)
    })
  })

  describe('register', () => {
    it('should successfully register user', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'student' as const
      }

      const mockUser = createMockUser({ ...userData })
      const mockToken = 'mock-jwt-token'
      const mockResponse = createMockApiResponse({
        user: mockUser,
        token: mockToken
      })

      mockAuthService.register.mockResolvedValue(mockResponse.data)

      await authStore.register(userData)

      expect(mockAuthService.register).toHaveBeenCalledWith(userData)
      expect(authStore.user).toEqual(mockUser)
      expect(authStore.token).toBe(mockToken)
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.error).toBeNull()
    })

    it('should handle registration errors', async () => {
      const userData = {
        name: 'New User',
        email: 'existing@example.com',
        password: 'password123',
        role: 'student' as const
      }

      const mockError = createMockApiError('Email already exists', 409)
      mockAuthService.register.mockRejectedValue(mockError)

      await authStore.register(userData)

      expect(mockAuthService.register).toHaveBeenCalledWith(userData)
      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.error).toBe('Email already exists')
    })
  })

  describe('logout', () => {
    it('should successfully logout user', async () => {
      // Set up initial authenticated state
      authStore.user = createMockUser()
      authStore.token = 'mock-jwt-token'

      mockAuthService.logout.mockResolvedValue(undefined)

      await authStore.logout()

      expect(mockAuthService.logout).toHaveBeenCalled()
      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.error).toBeNull()
    })
  })

  describe('updateProfile', () => {
    it('should successfully update user profile', async () => {
      const initialUser = createMockUser()
      authStore.user = initialUser

      const profileData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      }

      const updatedUser = { ...initialUser, ...profileData }
      const mockResponse = createMockApiResponse(updatedUser)

      mockAuthService.updateProfile.mockResolvedValue(updatedUser)

      await authStore.updateProfile(profileData)

      expect(mockAuthService.updateProfile).toHaveBeenCalledWith(profileData)
      expect(authStore.user).toEqual(updatedUser)
      expect(authStore.error).toBeNull()
    })

    it('should handle profile update errors', async () => {
      const initialUser = createMockUser()
      authStore.user = initialUser

      const profileData = {
        name: 'Updated Name',
        email: 'invalid-email'
      }

      const mockError = createMockApiError('Invalid email format', 400)
      mockAuthService.updateProfile.mockRejectedValue(mockError)

      await authStore.updateProfile(profileData)

      expect(mockAuthService.updateProfile).toHaveBeenCalledWith(profileData)
      expect(authStore.user).toEqual(initialUser) // Should remain unchanged
      expect(authStore.error).toBe('Invalid email format')
    })
  })

  describe('changePassword', () => {
    it('should successfully change password', async () => {
      const currentPassword = 'oldpassword123'
      const newPassword = 'newpassword123'

      mockAuthService.changePassword.mockResolvedValue(undefined)

      await authStore.changePassword(currentPassword, newPassword)

      expect(mockAuthService.changePassword).toHaveBeenCalledWith(currentPassword, newPassword)
      expect(authStore.error).toBeNull()
    })

    it('should handle password change errors', async () => {
      const currentPassword = 'wrongpassword'
      const newPassword = 'newpassword123'

      const mockError = createMockApiError('Current password is incorrect', 400)
      mockAuthService.changePassword.mockRejectedValue(mockError)

      await authStore.changePassword(currentPassword, newPassword)

      expect(mockAuthService.changePassword).toHaveBeenCalledWith(currentPassword, newPassword)
      expect(authStore.error).toBe('Current password is incorrect')
    })
  })

  describe('password reset', () => {
    it('should successfully request password reset', async () => {
      const email = 'test@example.com'

      mockAuthService.requestPasswordReset.mockResolvedValue(undefined)

      await authStore.requestPasswordReset(email)

      expect(mockAuthService.requestPasswordReset).toHaveBeenCalledWith(email)
      expect(authStore.error).toBeNull()
    })

    it('should successfully verify password reset token', async () => {
      const token = 'valid-reset-token'

      mockAuthService.verifyPasswordResetToken.mockResolvedValue(true)

      const result = await authStore.verifyPasswordResetToken(token)

      expect(mockAuthService.verifyPasswordResetToken).toHaveBeenCalledWith(token)
      expect(result).toBe(true)
    })

    it('should successfully confirm password reset', async () => {
      const token = 'valid-reset-token'
      const password = 'newpassword123'

      mockAuthService.confirmPasswordReset.mockResolvedValue(undefined)

      await authStore.confirmPasswordReset(token, password)

      expect(mockAuthService.confirmPasswordReset).toHaveBeenCalledWith(token, password)
      expect(authStore.error).toBeNull()
    })
  })

  describe('computed properties', () => {
    it('should correctly compute isAuthenticated', () => {
      expect(authStore.isAuthenticated).toBe(false)

      authStore.user = createMockUser()
      authStore.token = 'mock-jwt-token'

      expect(authStore.isAuthenticated).toBe(true)
    })

    it('should correctly compute isStudent', () => {
      authStore.user = createMockUser({ role: 'student' })
      expect(authStore.isStudent).toBe(true)
      expect(authStore.isAdmin).toBe(false)
    })

    it('should correctly compute isAdmin', () => {
      authStore.user = createMockUser({ role: 'admin' })
      expect(authStore.isAdmin).toBe(true)
      expect(authStore.isStudent).toBe(false)
    })

    it('should correctly compute userInitials', () => {
      authStore.user = createMockUser({ name: 'John Doe' })
      expect(authStore.userInitials).toBe('JD')
    })

    it('should return empty string for userInitials when no user', () => {
      authStore.user = null
      expect(authStore.userInitials).toBe('')
    })
  })

  describe('error handling', () => {
    it('should clear error when clearError is called', () => {
      authStore.error = 'Some error'
      authStore.clearError()
      expect(authStore.error).toBeNull()
    })

    it('should set error when setError is called', () => {
      const errorMessage = 'Custom error message'
      authStore.setError(errorMessage)
      expect(authStore.error).toBe(errorMessage)
    })
  })

  describe('loading state', () => {
    it('should set loading state', () => {
      authStore.setLoading(true)
      expect(authStore.isLoading).toBe(true)

      authStore.setLoading(false)
      expect(authStore.isLoading).toBe(false)
    })
  })
}) 