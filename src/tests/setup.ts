import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true
})

// Mock fetch
global.fetch = vi.fn()

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// Mock crypto for secure token generation
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: vi.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    }),
    subtle: {
      digest: vi.fn().mockResolvedValue(new Uint8Array(32))
    }
  }
})

// Mock environment variables
vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3000')
vi.stubEnv('VITE_API_TIMEOUT', '10000')
vi.stubEnv('DEV', 'true')

// Global test utilities
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'student',
  subscription_plan: 'free',
  language_preference: 'en',
  timezone: 'UTC',
  avatar_url: null,
  is_active: true,
  email_verified: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  last_login: null,
  ...overrides
})

export const createMockSubject = (overrides = {}) => ({
  id: 'subject-1',
  title: 'Introduction to Accounting',
  description: 'Learn the basics of accounting principles',
  order: 1,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides
})

export const createMockTopic = (overrides = {}) => ({
  id: 'topic-1',
  subject_id: 'subject-1',
  title: 'Double Entry Bookkeeping',
  description: 'Understanding the double entry system',
  order: 1,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides
})

export const createMockLesson = (overrides = {}) => ({
  id: 'lesson-1',
  topic_id: 'topic-1',
  title: 'Basic Principles',
  description: 'Introduction to accounting principles',
  content: 'This is the lesson content...',
  order: 1,
  duration: 15,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides
})

export const createMockQuiz = (overrides = {}) => ({
  id: 'quiz-1',
  topic_id: 'topic-1',
  title: 'Double Entry Quiz',
  description: 'Test your understanding of double entry bookkeeping',
  time_limit: 30,
  passing_score: 70,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides
})

export const createMockQuestion = (overrides = {}) => ({
  id: 'question-1',
  quiz_id: 'quiz-1',
  text: 'What is the basic principle of double entry bookkeeping?',
  type: 'mcq',
  options: [
    { id: 'A', text: 'Every transaction affects only one account' },
    { id: 'B', text: 'Every transaction affects at least two accounts' },
    { id: 'C', text: 'Every transaction must be recorded in cash' },
    { id: 'D', text: 'Every transaction must be approved by an accountant' }
  ],
  correct_answer: 'B',
  explanation: 'The double entry system requires that every transaction affects at least two accounts.',
  difficulty: 'basic',
  order: 1,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides
})

export const createMockProgress = (overrides = {}) => ({
  id: 'progress-1',
  user_id: 'test-user-1',
  subject_id: 'subject-1',
  overall_progress: 75,
  completed_lessons: 3,
  total_lessons: 4,
  completed_quizzes: 2,
  total_quizzes: 3,
  average_score: 85,
  time_spent: 1200,
  last_activity: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides
})

// Mock API response helper
export const createMockApiResponse = (data: any, success = true) => ({
  data: {
    success,
    data,
    message: success ? 'Success' : 'Error'
  }
})

// Mock API error helper
export const createMockApiError = (message: string, status = 400) => ({
  response: {
    status,
    data: {
      success: false,
      error: message,
      message
    }
  },
  message
})

// Cleanup function for tests
export const cleanup = () => {
  vi.clearAllMocks()
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  sessionStorageMock.getItem.mockClear()
  sessionStorageMock.setItem.mockClear()
  sessionStorageMock.removeItem.mockClear()
} 