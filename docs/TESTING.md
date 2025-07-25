# Testing Documentation

## Overview

This document provides comprehensive guidance on testing the Numera frontend application, including unit tests, component tests, and end-to-end tests.

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Unit Tests](#unit-tests)
3. [Component Tests](#component-tests)
4. [E2E Tests](#e2e-tests)
5. [Test Utilities](#test-utilities)
6. [Best Practices](#best-practices)
7. [CI/CD Integration](#cicd-integration)

## Testing Strategy

### Testing Pyramid

Our testing strategy follows the testing pyramid:

```
    E2E Tests (Few)
        /\
       /  \
   Component Tests (Some)
      /\
     /  \
  Unit Tests (Many)
```

- **Unit Tests**: Test individual functions, services, and utilities
- **Component Tests**: Test Vue components in isolation
- **E2E Tests**: Test complete user workflows

### Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Component Tests**: 70%+ coverage
- **E2E Tests**: Critical user flows

## Unit Tests

### Running Unit Tests

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- AuthService.test.ts

# Run tests matching pattern
npm run test -- --grep "login"
```

### Writing Unit Tests

#### Service Tests

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from '@/services/AuthService'

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should login successfully', async () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    }

    const result = await authService.login(credentials)
    expect(result.user).toBeDefined()
    expect(result.token).toBeDefined()
  })

  it('should handle login errors', async () => {
    const credentials = {
      email: 'invalid@example.com',
      password: 'wrongpassword'
    }

    await expect(authService.login(credentials)).rejects.toThrow()
  })
})
```

#### Store Tests

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'

describe('AuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with default state', () => {
    const authStore = useAuthStore()
    expect(authStore.user).toBeNull()
    expect(authStore.token).toBeNull()
    expect(authStore.isAuthenticated).toBe(false)
  })

  it('should login user', async () => {
    const authStore = useAuthStore()
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    }

    await authStore.login(credentials)
    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.user).toBeDefined()
  })
})
```

#### Utility Tests

```typescript
import { describe, it, expect } from 'vitest'
import { validateEmail, validatePassword } from '@/utils/validation'

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true)
    })

    it('should reject invalid email', () => {
      expect(validateEmail('invalid-email')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const result = validatePassword('StrongPass123!')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject weak password', () => {
      const result = validatePassword('123')
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })
})
```

### Mocking Strategies

#### API Mocking

```typescript
// Mock API client
vi.mock('@/config/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

// Mock service
vi.mock('@/services/AuthService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn()
  }
}))
```

#### Store Mocking

```typescript
// Mock Pinia store
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn()
}))

// In test
const mockAuthStore = {
  user: null,
  token: null,
  login: vi.fn(),
  logout: vi.fn()
}

const { useAuthStore } = require('@/stores/authStore')
useAuthStore.mockReturnValue(mockAuthStore)
```

#### Router Mocking

```typescript
// Mock vue-router
const mockPush = vi.fn()
const mockReplace = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace
  })
}))
```

## Component Tests

### Running Component Tests

```bash
# Run component tests
npm run test -- --grep "Component"

# Run specific component test
npm run test -- LoginPage.test.ts
```

### Writing Component Tests

#### Basic Component Test

```typescript
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LoginPage from '@/components/organisms/LoginPage.vue'

describe('LoginPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render login form', () => {
    const wrapper = mount(LoginPage)
    
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('should handle form submission', async () => {
    const wrapper = mount(LoginPage)
    
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')
    await wrapper.find('button[type="submit"]').trigger('click')
    
    // Assert form submission
    expect(wrapper.emitted('submit')).toBeTruthy()
  })
})
```

#### Component with Store

```typescript
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SubjectSelection from '@/components/organisms/SubjectSelection.vue'

// Mock the store
vi.mock('@/stores/subjectStore', () => ({
  useSubjectStore: vi.fn()
}))

describe('SubjectSelection', () => {
  let mockSubjectStore: any

  beforeEach(() => {
    setActivePinia(createPinia())
    
    mockSubjectStore = {
      subjects: [],
      isLoading: false,
      error: null,
      fetchSubjects: vi.fn()
    }

    const { useSubjectStore } = require('@/stores/subjectStore')
    useSubjectStore.mockReturnValue(mockSubjectStore)
  })

  it('should display subjects', async () => {
    mockSubjectStore.subjects = [
      { id: '1', title: 'Subject 1' },
      { id: '2', title: 'Subject 2' }
    ]

    const wrapper = mount(SubjectSelection)
    
    expect(wrapper.text()).toContain('Subject 1')
    expect(wrapper.text()).toContain('Subject 2')
  })

  it('should show loading state', () => {
    mockSubjectStore.isLoading = true

    const wrapper = mount(SubjectSelection)
    
    expect(wrapper.find('.loading-spinner').exists()).toBe(true)
  })
})
```

#### Component with Router

```typescript
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import QuizPlayer from '@/components/organisms/QuizPlayer.vue'

describe('QuizPlayer', () => {
  let router: any

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/quiz/:id', component: QuizPlayer }
      ]
    })
  })

  it('should navigate to quiz', async () => {
    const wrapper = mount(QuizPlayer, {
      global: {
        plugins: [router]
      },
      props: {
        quizId: 'quiz-1'
      }
    })

    await router.push('/quiz/quiz-1')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('Quiz')
  })
})
```

### Testing User Interactions

```typescript
describe('User Interactions', () => {
  it('should handle button clicks', async () => {
    const wrapper = mount(MyComponent)
    
    await wrapper.find('button').trigger('click')
    
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('should handle form inputs', async () => {
    const wrapper = mount(MyComponent)
    
    const input = wrapper.find('input')
    await input.setValue('test value')
    
    expect(input.element.value).toBe('test value')
  })

  it('should handle keyboard events', async () => {
    const wrapper = mount(MyComponent)
    
    await wrapper.find('input').trigger('keyup.enter')
    
    expect(wrapper.emitted('submit')).toBeTruthy()
  })
})
```

## E2E Tests

### Running E2E Tests

```bash
# Install Playwright browsers
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode
npm run test:e2e:headed

# Run specific E2E test
npm run test:e2e -- auth.spec.ts

# Run tests in specific browser
npm run test:e2e -- --project=chromium
```

### Writing E2E Tests

#### Basic E2E Test

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL('/app/subjects')
    await expect(page.getByText('Welcome')).toBeVisible()
  })

  test('should show validation errors', async ({ page }) => {
    await page.goto('/login')
    
    await page.click('button[type="submit"]')
    
    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Password is required')).toBeVisible()
  })
})
```

#### Testing User Flows

```typescript
test.describe('User Flows', () => {
  test('should complete quiz flow', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Navigate to quiz
    await page.goto('/app/quiz/quiz-1')
    
    // Answer questions
    await page.click('input[type="radio"]')
    await page.click('button:has-text("Next")')
    
    // Complete quiz
    await page.click('button:has-text("Submit")')
    
    // Verify results
    await expect(page.getByText('Quiz Complete')).toBeVisible()
  })
})
```

#### Testing Responsive Design

```typescript
test.describe('Responsive Design', () => {
  test('should work on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/login')
    
    await expect(page.getByText('Login')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
  })

  test('should work on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/login')
    
    await expect(page.getByText('Login')).toBeVisible()
  })
})
```

#### Testing Accessibility

```typescript
test.describe('Accessibility', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/login')
    
    const emailInput = page.getByLabel('Email')
    const passwordInput = page.getByLabel('Password')
    
    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/login')
    
    await page.keyboard.press('Tab')
    await expect(page.getByLabel('Email')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.getByLabel('Password')).toBeFocused()
  })
})
```

### Mocking in E2E Tests

```typescript
test('should handle API responses', async ({ page }) => {
  // Mock API response
  await page.route('**/api/v1/auth/login', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          user: { id: '1', name: 'Test User' },
          token: 'mock-token'
        }
      })
    })
  })

  await page.goto('/login')
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL('/app/subjects')
})
```

## Test Utilities

### Test Setup

```typescript
// src/tests/setup.ts
import { vi } from 'vitest'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock fetch
global.fetch = vi.fn()

// Mock environment variables
vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3000')
```

### Mock Data Factories

```typescript
// src/tests/factories.ts
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'student',
  ...overrides
})

export const createMockSubject = (overrides = {}) => ({
  id: 'subject-1',
  title: 'Test Subject',
  description: 'Test description',
  order: 1,
  is_active: true,
  ...overrides
})

export const createMockQuiz = (overrides = {}) => ({
  id: 'quiz-1',
  title: 'Test Quiz',
  description: 'Test quiz description',
  time_limit: 30,
  passing_score: 70,
  ...overrides
})
```

### Test Helpers

```typescript
// src/tests/helpers.ts
export const waitForElement = async (selector: string, timeout = 5000) => {
  const start = Date.now()
  
  while (Date.now() - start < timeout) {
    const element = document.querySelector(selector)
    if (element) return element
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  throw new Error(`Element ${selector} not found within ${timeout}ms`)
}

export const mockApiResponse = (data: any, status = 200) => ({
  status,
  data: {
    success: status < 400,
    data,
    message: status < 400 ? 'Success' : 'Error'
  }
})

export const mockApiError = (message: string, status = 400) => ({
  response: {
    status,
    data: {
      success: false,
      error: message
    }
  }
})
```

## Best Practices

### 1. Test Organization

```typescript
// Organize tests by feature
describe('Authentication', () => {
  describe('Login', () => {
    it('should login with valid credentials')
    it('should show error for invalid credentials')
    it('should handle network errors')
  })

  describe('Registration', () => {
    it('should register new user')
    it('should validate form inputs')
  })
})
```

### 2. Test Naming

```typescript
// Use descriptive test names
it('should display error message when login fails')
it('should redirect to subjects page after successful login')
it('should disable submit button during loading')
```

### 3. Test Isolation

```typescript
// Each test should be independent
beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

afterEach(() => {
  // Clean up after each test
})
```

### 4. Mock Management

```typescript
// Centralize mocks
const mockAuthService = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn()
}

beforeEach(() => {
  vi.clearAllMocks()
  mockAuthService.login.mockResolvedValue(mockUser)
})
```

### 5. Assertion Best Practices

```typescript
// Use specific assertions
expect(element).toBeVisible()
expect(element).toHaveText('Expected text')
expect(element).toHaveClass('expected-class')
expect(mockFunction).toHaveBeenCalledWith(expectedArgs)
```

### 6. Async Testing

```typescript
// Handle async operations properly
it('should load data asynchronously', async () => {
  const wrapper = mount(AsyncComponent)
  
  await wrapper.vm.$nextTick()
  await flushPromises()
  
  expect(wrapper.text()).toContain('Loaded data')
})
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm run test:coverage
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
```

### Test Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:ci": "npm run test:coverage && npm run test:e2e"
  }
}
```

### Coverage Thresholds

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
})
```

## Troubleshooting

### Common Issues

1. **Test Timeouts**: Increase timeout or optimize slow operations
2. **Mock Issues**: Ensure mocks are properly reset between tests
3. **Async Problems**: Use proper async/await patterns
4. **Component Mounting**: Check for missing dependencies or props

### Debug Tips

```typescript
// Debug test failures
test('debug test', async ({ page }) => {
  await page.goto('/login')
  
  // Pause execution for debugging
  await page.pause()
  
  // Take screenshot
  await page.screenshot({ path: 'debug.png' })
  
  // Log page content
  console.log(await page.content())
})
```

### Performance Testing

```typescript
// Test component performance
test('should render quickly', async () => {
  const start = performance.now()
  
  const wrapper = mount(HeavyComponent)
  await wrapper.vm.$nextTick()
  
  const duration = performance.now() - start
  expect(duration).toBeLessThan(100) // 100ms threshold
})
```

---

*Last updated: January 2024* 