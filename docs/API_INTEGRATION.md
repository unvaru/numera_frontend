# API Integration Documentation

## Overview

This document provides comprehensive guidance on integrating with the Numera API from the frontend application. It covers authentication, data fetching, error handling, and best practices.

## Table of Contents

1. [Authentication](#authentication)
2. [API Configuration](#api-configuration)
3. [Services](#services)
4. [Stores](#stores)
5. [Error Handling](#error-handling)
6. [Loading States](#loading-states)
7. [Type Definitions](#type-definitions)
8. [Best Practices](#best-practices)
9. [Testing](#testing)

## Authentication

### Setup

The authentication system uses JWT tokens stored in localStorage. The `AuthService` handles all authentication-related API calls.

```typescript
import { authService } from '@/services/AuthService'
import { useAuthStore } from '@/stores/authStore'

// In your component
const authStore = useAuthStore()
```

### Login

```typescript
// Login with credentials
const credentials = {
  email: 'user@example.com',
  password: 'password123'
}

try {
  await authStore.login(credentials)
  // User is now logged in and redirected
} catch (error) {
  // Handle login error
  console.error('Login failed:', error)
}
```

### Registration

```typescript
// Register new user
const userData = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  role: 'student'
}

try {
  await authStore.register(userData)
  // User is registered and logged in
} catch (error) {
  // Handle registration error
  console.error('Registration failed:', error)
}
```

### Password Reset

```typescript
// Request password reset
await authStore.requestPasswordReset('user@example.com')

// Verify reset token
const isValid = await authStore.verifyPasswordResetToken('reset-token')

// Confirm password reset
await authStore.confirmPasswordReset('reset-token', 'newpassword123')
```

### Logout

```typescript
// Logout user
await authStore.logout()
// User is logged out and redirected to login page
```

## API Configuration

### Environment Variables

Create a `.env` file in the frontend root:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=10000
DEV=true
```

### API Client

The `apiClient` is configured with interceptors for automatic token management:

```typescript
import apiClient from '@/config/api'

// Make authenticated requests
const response = await apiClient.get('/api/v1/subjects')
```

### Error Handling

The API client automatically handles common errors:

```typescript
import { useErrorHandler } from '@/utils/errorHandler'

const errorHandler = useErrorHandler()

try {
  await apiClient.get('/api/v1/subjects')
} catch (error) {
  const appError = errorHandler.createAppError(error)
  console.error('API Error:', appError.message)
}
```

## Services

### AuthService

Handles all authentication-related API calls:

```typescript
import { authService } from '@/services/AuthService'

// Available methods:
await authService.login(credentials)
await authService.register(userData)
await authService.getCurrentUser()
await authService.logout()
await authService.updateProfile(profileData)
await authService.changePassword(currentPassword, newPassword)
await authService.requestPasswordReset(email)
await authService.verifyPasswordResetToken(token)
await authService.confirmPasswordReset(token, password)
```

### SubjectService

Handles content-related API calls:

```typescript
import { subjectService } from '@/services/SubjectService'

// Available methods:
await subjectService.getSubjects()
await subjectService.getSubject(subjectId)
await subjectService.getTopics(subjectId)
await subjectService.getTopic(topicId)
await subjectService.getLessons(topicId)
await subjectService.getLesson(lessonId)
```

### QuizService

Handles quiz-related API calls:

```typescript
import { quizService } from '@/services/QuizService'

// Available methods:
await quizService.getQuizzesByTopic(topicId)
await quizService.getQuiz(quizId)
await quizService.getQuizQuestions(quizId)
await quizService.startQuizAttempt(quizId)
await quizService.submitQuizAnswers(attemptId, answers)
await quizService.getQuizAttempt(attemptId)
```

### ProgressService

Handles progress tracking API calls:

```typescript
import { progressService } from '@/services/ProgressService'

// Available methods:
await progressService.getUserProgress()
await progressService.getSubjectProgress(subjectId)
await progressService.getTopicProgress(topicId)
await progressService.getLessonProgress(lessonId)
await progressService.updateLessonProgress(lessonId, progress)
```

### SubscriptionService

Handles subscription-related API calls:

```typescript
import { subscriptionService } from '@/services/SubscriptionService'

// Available methods:
await subscriptionService.getSubscriptionPlans()
await subscriptionService.getUserSubscription()
await subscriptionService.createSubscription(planId, paymentMethodId)
await subscriptionService.cancelSubscription(cancelAtPeriodEnd)
await subscriptionService.getBillingInfo()
await subscriptionService.updateBillingInfo(billingData)
```

## Stores

### AuthStore

Manages authentication state:

```typescript
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

// State
authStore.user // Current user
authStore.token // JWT token
authStore.isLoading // Loading state
authStore.error // Error message

// Computed properties
authStore.isAuthenticated // Boolean
authStore.isStudent // Boolean
authStore.isAdmin // Boolean
authStore.userInitials // String

// Actions
await authStore.login(credentials)
await authStore.register(userData)
await authStore.logout()
await authStore.updateProfile(profileData)
await authStore.changePassword(currentPassword, newPassword)
authStore.clearError()
authStore.setError(message)
authStore.setLoading(loading)
```

### SubjectStore

Manages subject, topic, and lesson data:

```typescript
import { useSubjectStore } from '@/stores/subjectStore'

const subjectStore = useSubjectStore()

// State
subjectStore.subjects // Array of subjects
subjectStore.topics // Array of topics
subjectStore.lessons // Array of lessons
subjectStore.isLoading // Loading state
subjectStore.error // Error message

// Computed properties
subjectStore.subjectsByOrder // Sorted subjects
subjectStore.getSubjectById(id) // Get subject by ID
subjectStore.getTopicsBySubject(subjectId) // Get topics for subject

// Actions
await subjectStore.fetchSubjects()
await subjectStore.fetchTopics(subjectId)
await subjectStore.fetchLessons(topicId)
subjectStore.clearError()
subjectStore.clearCache()
```

### ProgressStore

Manages user progress data:

```typescript
import { useProgressStore } from '@/stores/progressStore'

const progressStore = useProgressStore()

// State
progressStore.userProgress // Array of progress data
progressStore.progressAnalytics // Analytics data
progressStore.isLoading // Loading state
progressStore.error // Error message

// Computed properties
progressStore.overallProgress // Overall progress percentage
progressStore.studyStreak // Current study streak
progressStore.completedSubjects // Number of completed subjects

// Actions
await progressStore.fetchUserProgress()
await progressStore.fetchProgressAnalytics()
await progressStore.updateLessonProgress(lessonId, progress)
progressStore.clearError()
progressStore.clearCache()
```

### QuizStore

Manages quiz-related state:

```typescript
import { useQuizStore } from '@/stores/quizStore'

const quizStore = useQuizStore()

// State
quizStore.quizzes // Array of quizzes
quizStore.currentQuiz // Current quiz
quizStore.currentQuizQuestions // Current quiz questions
quizStore.currentAttempt // Current quiz attempt
quizStore.isLoading // Loading state
quizStore.error // Error message

// Actions
await quizStore.fetchQuizzesByTopic(topicId)
await quizStore.fetchQuiz(quizId)
await quizStore.fetchQuizQuestions(quizId)
await quizStore.startQuizAttempt(quizId)
await quizStore.submitQuizAnswers(attemptId, answers)
quizStore.clearError()
quizStore.clearCache()
```

### SubscriptionStore

Manages subscription-related state:

```typescript
import { useSubscriptionStore } from '@/stores/subscriptionStore'

const subscriptionStore = useSubscriptionStore()

// State
subscriptionStore.subscriptionPlans // Array of plans
subscriptionStore.currentSubscription // Current subscription
subscriptionStore.billingInfo // Billing information
subscriptionStore.paymentMethods // Payment methods
subscriptionStore.invoices // Invoices
subscriptionStore.isLoading // Loading state
subscriptionStore.error // Error message

// Computed properties
subscriptionStore.isPremium // Boolean
subscriptionStore.isFree // Boolean
subscriptionStore.isActive // Boolean
subscriptionStore.currentPlan // Current plan object

// Actions
await subscriptionStore.fetchSubscriptionPlans()
await subscriptionStore.fetchUserSubscription()
await subscriptionStore.createSubscription(planId, paymentMethodId)
await subscriptionStore.cancelSubscription(cancelAtPeriodEnd)
subscriptionStore.clearError()
subscriptionStore.clearCache()
```

## Error Handling

### Error Types

The application defines several error types:

```typescript
import { AppError, ErrorType, ErrorSeverity } from '@/utils/errorHandler'

// Error types
ErrorType.NETWORK // Network connectivity issues
ErrorType.AUTHENTICATION // Authentication failures
ErrorType.AUTHORIZATION // Permission denied
ErrorType.VALIDATION // Input validation errors
ErrorType.NOT_FOUND // Resource not found
ErrorType.SERVER // Server errors
ErrorType.UNKNOWN // Unknown errors

// Error severity levels
ErrorSeverity.LOW // Minor issues
ErrorSeverity.MEDIUM // Moderate issues
ErrorSeverity.HIGH // Important issues
ErrorSeverity.CRITICAL // Critical issues
```

### Creating AppErrors

```typescript
import { useErrorHandler } from '@/utils/errorHandler'

const errorHandler = useErrorHandler()

// From API error
const appError = errorHandler.createAppError(apiError)

// From exception
const appError = errorHandler.createAppError(exception, 'Custom message')

// From error type
const appError = errorHandler.createAppError({
  type: ErrorType.VALIDATION,
  severity: ErrorSeverity.MEDIUM,
  message: 'Invalid input data',
  details: { field: 'email', value: 'invalid-email' }
})
```

### Error Mapping

```typescript
// Map error to user-friendly message
const userMessage = errorHandler.mapToUserMessage(appError)

// Log error
errorHandler.logError(appError)

// Get error statistics
const stats = errorHandler.getErrorStatistics()
```

## Loading States

### useLoading Composable

```typescript
import { useLoading } from '@/composables/useLoading'

const loading = useLoading('unique-key')

// Check loading state
if (loading.isLoading) {
  // Show loading indicator
}

// Set loading state
loading.setLoading(true)

// Set progress
loading.setProgress(50)

// Set loading message
loading.setMessage('Loading data...')

// Clear loading state
loading.clear()
```

### Loading Wrappers

```typescript
// Wrap async function with loading state
const result = await loading.withLoading(async () => {
  return await apiClient.get('/api/v1/subjects')
})

// Wrap with progress tracking
const result = await loading.withProgress(async (updateProgress) => {
  updateProgress(25)
  const subjects = await apiClient.get('/api/v1/subjects')
  updateProgress(50)
  const topics = await apiClient.get('/api/v1/topics')
  updateProgress(100)
  return { subjects, topics }
})
```

## Type Definitions

### API Types

```typescript
import type { 
  ApiResponse, 
  ApiError, 
  PaginatedResponse,
  SearchParams 
} from '@/types/api'

// Use in your code
const response: ApiResponse<User> = await apiClient.get('/api/v1/auth/me')
```

### User Types

```typescript
import type { 
  User, 
  UserProfile, 
  UserPreferences,
  UserSettings 
} from '@/types/user'

// Use in your code
const user: User = await authService.getCurrentUser()
```

### Content Types

```typescript
import type { 
  Subject, 
  Topic, 
  Lesson,
  Question,
  Quiz 
} from '@/types/questions'

// Use in your code
const subjects: Subject[] = await subjectService.getSubjects()
```

## Best Practices

### 1. Use Stores for State Management

```typescript
// ✅ Good - Use store
const authStore = useAuthStore()
await authStore.login(credentials)

// ❌ Bad - Direct service call
await authService.login(credentials)
```

### 2. Handle Errors Gracefully

```typescript
// ✅ Good - Proper error handling
try {
  await authStore.login(credentials)
} catch (error) {
  const appError = errorHandler.createAppError(error)
  console.error('Login failed:', appError.message)
}

// ❌ Bad - No error handling
await authStore.login(credentials)
```

### 3. Use Loading States

```typescript
// ✅ Good - Show loading state
const loading = useLoading('login')
const result = await loading.withLoading(async () => {
  return await authStore.login(credentials)
})

// ❌ Bad - No loading indication
await authStore.login(credentials)
```

### 4. Validate Input Data

```typescript
import { validateEmail, validatePassword } from '@/utils/validation'

// ✅ Good - Validate before API call
if (!validateEmail(email)) {
  throw new Error('Invalid email format')
}

if (!validatePassword(password).isValid) {
  throw new Error('Password too weak')
}

// ❌ Bad - No validation
await authStore.login({ email, password })
```

### 5. Use TypeScript Types

```typescript
// ✅ Good - Proper typing
const credentials: LoginRequest = {
  email: 'user@example.com',
  password: 'password123'
}

// ❌ Bad - No typing
const credentials = {
  email: 'user@example.com',
  password: 'password123'
}
```

### 6. Cache Data Appropriately

```typescript
// ✅ Good - Use store caching
await subjectStore.fetchSubjects() // Cached in store

// ❌ Bad - Fetch on every component mount
const subjects = await subjectService.getSubjects()
```

## Testing

### Unit Tests

```typescript
// Test service methods
describe('AuthService', () => {
  it('should login successfully', async () => {
    const credentials = { email: 'test@example.com', password: 'password123' }
    const result = await authService.login(credentials)
    expect(result.user).toBeDefined()
  })
})
```

### Component Tests

```typescript
// Test component with store
describe('LoginPage', () => {
  it('should handle login form submission', async () => {
    const wrapper = mount(LoginPage)
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')
    await wrapper.find('button[type="submit"]').trigger('click')
    expect(mockAuthStore.login).toHaveBeenCalled()
  })
})
```

### E2E Tests

```typescript
// Test complete user flows
test('should login and navigate to subjects', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/app/subjects')
})
```

## Security Considerations

### 1. Token Management

- Tokens are automatically managed by the API client
- Expired tokens trigger automatic refresh
- Invalid tokens redirect to login

### 2. Input Validation

```typescript
import { sanitizeInput, escapeHtml } from '@/utils/validation'

// Sanitize user input
const sanitizedInput = sanitizeInput(userInput)

// Escape HTML content
const safeHtml = escapeHtml(userContent)
```

### 3. CSRF Protection

```typescript
import { validateCsrfToken } from '@/utils/validation'

// Validate CSRF tokens
if (!validateCsrfToken(token)) {
  throw new Error('Invalid CSRF token')
}
```

### 4. Rate Limiting

```typescript
import { RateLimiter } from '@/utils/validation'

const rateLimiter = new RateLimiter(5, 60000) // 5 requests per minute

if (!rateLimiter.isAllowed('login')) {
  throw new Error('Too many login attempts')
}
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend allows frontend origin
2. **Token Expired**: Check token refresh logic
3. **Network Errors**: Verify API base URL configuration
4. **Validation Errors**: Check input data format

### Debug Mode

Enable debug mode for detailed logging:

```typescript
// In development
localStorage.setItem('debug', 'true')

// Check debug logs
if (localStorage.getItem('debug') === 'true') {
  console.log('API Request:', request)
  console.log('API Response:', response)
}
```

### Error Reporting

```typescript
// Report errors to monitoring service
errorHandler.logError(appError, {
  userId: authStore.user?.id,
  component: 'LoginPage',
  action: 'login'
})
```

## Migration Guide

### From Mock Data to API

1. Replace mock service calls with API calls
2. Update error handling for real API responses
3. Test with actual backend endpoints
4. Update loading states for network requests

### From Direct API Calls to Stores

1. Replace direct service calls with store actions
2. Update components to use store state
3. Remove local state management
4. Test store integration

## Support

For questions or issues:

1. Check the [API Documentation](../FRONTEND_API_DOCUMENTATION.md)
2. Review error logs in browser console
3. Test with Postman or similar tool
4. Contact development team

---

*Last updated: January 2024* 