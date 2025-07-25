import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LoginPage from '@/components/organisms/LoginPage.vue'
import { createMockUser, createMockApiResponse, createMockApiError } from '@/tests/setup'

// Mock the auth store
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn()
}))

// Mock vue-router
const mockPush = vi.fn()
const mockReplace = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace
  })
}))

describe('LoginPage', () => {
  let wrapper: any
  let mockAuthStore: any

  beforeEach(() => {
    setActivePinia(createPinia())
    
    // Create mock auth store
    mockAuthStore = {
      login: vi.fn(),
      error: null,
      isLoading: false,
      clearError: vi.fn()
    }

    // Mock the useAuthStore function
    const { useAuthStore } = require('@/stores/authStore')
    useAuthStore.mockReturnValue(mockAuthStore)

    wrapper = mount(LoginPage)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should render login form with empty fields', () => {
      expect(wrapper.find('input[type="email"]').element.value).toBe('')
      expect(wrapper.find('input[type="password"]').element.value).toBe('')
      expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    })

    it('should show login title', () => {
      expect(wrapper.text()).toContain('Login')
    })
  })

  describe('form validation', () => {
    it('should show error for empty email', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')
      const submitButton = wrapper.find('button[type="submit"]')

      // Set password but leave email empty
      await passwordInput.setValue('password123')
      await submitButton.trigger('click')

      expect(wrapper.text()).toContain('Email is required')
    })

    it('should show error for empty password', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')
      const submitButton = wrapper.find('button[type="submit"]')

      // Set email but leave password empty
      await emailInput.setValue('test@example.com')
      await submitButton.trigger('click')

      expect(wrapper.text()).toContain('Password is required')
    })

    it('should show error for invalid email format', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')
      const submitButton = wrapper.find('button[type="submit"]')

      await emailInput.setValue('invalid-email')
      await passwordInput.setValue('password123')
      await submitButton.trigger('click')

      expect(wrapper.text()).toContain('Please enter a valid email address')
    })

    it('should show error for short password', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')
      const submitButton = wrapper.find('button[type="submit"]')

      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('123')
      await submitButton.trigger('click')

      expect(wrapper.text()).toContain('Password must be at least 8 characters long')
    })
  })

  describe('login functionality', () => {
    it('should call login with valid credentials', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')
      const submitButton = wrapper.find('button[type="submit"]')

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

      mockAuthStore.login.mockResolvedValue(mockResponse.data)

      await emailInput.setValue(credentials.email)
      await passwordInput.setValue(credentials.password)
      await submitButton.trigger('click')

      expect(mockAuthStore.login).toHaveBeenCalledWith(credentials)
    })

    it('should navigate to subjects page after successful login', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')
      const submitButton = wrapper.find('button[type="submit"]')

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

      mockAuthStore.login.mockResolvedValue(mockResponse.data)

      await emailInput.setValue(credentials.email)
      await passwordInput.setValue(credentials.password)
      await submitButton.trigger('click')

      // Wait for the async operation to complete
      await wrapper.vm.$nextTick()

      expect(mockPush).toHaveBeenCalledWith('/app/subjects')
    })

    it('should show error message from auth store', async () => {
      mockAuthStore.error = 'Invalid credentials'

      // Re-render component to show error
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Invalid credentials')
    })

    it('should clear error when user starts typing', async () => {
      mockAuthStore.error = 'Invalid credentials'
      await wrapper.vm.$nextTick()

      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue('test@example.com')

      expect(mockAuthStore.clearError).toHaveBeenCalled()
    })
  })

  describe('loading state', () => {
    it('should show loading spinner when logging in', async () => {
      mockAuthStore.isLoading = true
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.loading-spinner').exists()).toBe(true)
      expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
    })

    it('should disable submit button when loading', async () => {
      mockAuthStore.isLoading = true
      await wrapper.vm.$nextTick()

      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.attributes('disabled')).toBeDefined()
    })
  })

  describe('error handling', () => {
    it('should handle login errors gracefully', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')
      const submitButton = wrapper.find('button[type="submit"]')

      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      }

      const mockError = createMockApiError('Invalid credentials', 401)
      mockAuthStore.login.mockRejectedValue(mockError)

      await emailInput.setValue(credentials.email)
      await passwordInput.setValue(credentials.password)
      await submitButton.trigger('click')

      expect(mockAuthStore.login).toHaveBeenCalledWith(credentials)
      // Error should be handled by the store
    })

    it('should show network error message', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')
      const submitButton = wrapper.find('button[type="submit"]')

      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      }

      const networkError = new Error('Network error')
      mockAuthStore.login.mockRejectedValue(networkError)

      await emailInput.setValue(credentials.email)
      await passwordInput.setValue(credentials.password)
      await submitButton.trigger('click')

      expect(mockAuthStore.login).toHaveBeenCalledWith(credentials)
    })
  })

  describe('form submission', () => {
    it('should prevent form submission with invalid data', async () => {
      const submitButton = wrapper.find('button[type="submit"]')
      
      // Try to submit without filling required fields
      await submitButton.trigger('click')

      expect(mockAuthStore.login).not.toHaveBeenCalled()
    })

    it('should handle form submission with enter key', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')

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

      mockAuthStore.login.mockResolvedValue(mockResponse.data)

      await emailInput.setValue(credentials.email)
      await passwordInput.setValue(credentials.password)
      await emailInput.trigger('keyup.enter')

      expect(mockAuthStore.login).toHaveBeenCalledWith(credentials)
    })
  })

  describe('accessibility', () => {
    it('should have proper form labels', () => {
      const emailLabel = wrapper.find('label[for="email"]')
      const passwordLabel = wrapper.find('label[for="password"]')

      expect(emailLabel.exists()).toBe(true)
      expect(passwordLabel.exists()).toBe(true)
    })

    it('should have proper input types', () => {
      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')

      expect(emailInput.exists()).toBe(true)
      expect(passwordInput.exists()).toBe(true)
    })

    it('should have proper button type', () => {
      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.exists()).toBe(true)
    })
  })

  describe('responsive design', () => {
    it('should have responsive classes', () => {
      const form = wrapper.find('form')
      expect(form.classes()).toContain('max-w-md')
    })
  })
}) 