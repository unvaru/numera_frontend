import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService, { type User, type LoginRequest, type RegisterRequest } from '@/services/AuthService'
import { apiUtils } from '@/config/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const isAuthenticated = computed(() => {
    return !!token.value && !!user.value && apiUtils.isAuthenticated()
  })

  const isAdmin = computed(() => {
    return user.value?.role === 'admin'
  })

  const isStudent = computed(() => {
    return user.value?.role === 'student'
  })

  const isPremium = computed(() => {
    return user.value?.subscription_plan === 'premium'
  })

  const isFree = computed(() => {
    return user.value?.subscription_plan === 'free'
  })

  // Actions
  const initializeAuth = async () => {
    try {
      // Check if user is already authenticated
      if (apiUtils.isAuthenticated()) {
        const storedUser = apiUtils.getCurrentUser()
        if (storedUser) {
          user.value = storedUser
          token.value = localStorage.getItem('authToken')
          return
        }
      }

      // Try to refresh user data from API
      if (token.value) {
        await refreshUser()
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error)
      logout()
    }
  }

  const login = async (credentials: LoginRequest) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await authService.login(credentials)
      
      user.value = response.user
      token.value = response.token
      
      return response
    } catch (err: any) {
      error.value = err.message || 'Login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData: RegisterRequest) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await authService.register(userData)
      
      user.value = response.user
      token.value = response.token
      
      return response
    } catch (err: any) {
      error.value = err.message || 'Registration failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    error.value = null
    authService.logout()
  }

  const refreshUser = async () => {
    try {
      const refreshedUser = await authService.getCurrentUser()
      user.value = refreshedUser
    } catch (error) {
      console.error('Failed to refresh user:', error)
      logout()
    }
  }

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      isLoading.value = true
      error.value = null

      const updatedUser = await authService.updateProfile(profileData)
      user.value = updatedUser
      
      return updatedUser
    } catch (err: any) {
      error.value = err.message || 'Profile update failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      isLoading.value = true
      error.value = null

      await authService.changePassword(currentPassword, newPassword)
    } catch (err: any) {
      error.value = err.message || 'Password change failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const requestPasswordReset = async (email: string) => {
    try {
      isLoading.value = true
      error.value = null

      await authService.requestPasswordReset(email)
    } catch (err: any) {
      error.value = err.message || 'Password reset request failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const verifyPasswordResetToken = async (token: string) => {
    try {
      return await authService.verifyPasswordResetToken(token)
    } catch (err: any) {
      error.value = err.message || 'Token verification failed'
      throw err
    }
  }

  const confirmPasswordReset = async (token: string, password: string) => {
    try {
      isLoading.value = true
      error.value = null

      await authService.confirmPasswordReset(token, password)
    } catch (err: any) {
      error.value = err.message || 'Password reset failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  // Development helper methods
  const devLogin = async (email: string, password: string) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await authService.devLogin(email, password)
      
      user.value = response.user
      token.value = response.token
      
      return response
    } catch (err: any) {
      error.value = err.message || 'Development login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    user,
    token,
    isLoading,
    error,
    
    // Computed
    isAuthenticated,
    isAdmin,
    isStudent,
    isPremium,
    isFree,
    
    // Actions
    initializeAuth,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
    changePassword,
    requestPasswordReset,
    verifyPasswordResetToken,
    confirmPasswordReset,
    clearError,
    
    // Development helpers
    devLogin
  }
}) 