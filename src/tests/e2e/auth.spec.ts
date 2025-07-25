import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('/login')
  })

  test.describe('Login Flow', () => {
    test('should display login form', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Password')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
    })

    test('should show validation errors for empty fields', async ({ page }) => {
      const loginButton = page.getByRole('button', { name: 'Login' })
      await loginButton.click()

      await expect(page.getByText('Email is required')).toBeVisible()
      await expect(page.getByText('Password is required')).toBeVisible()
    })

    test('should show validation error for invalid email', async ({ page }) => {
      await page.getByLabel('Email').fill('invalid-email')
      await page.getByLabel('Password').fill('password123')
      await page.getByRole('button', { name: 'Login' }).click()

      await expect(page.getByText('Please enter a valid email address')).toBeVisible()
    })

    test('should show validation error for short password', async ({ page }) => {
      await page.getByLabel('Email').fill('test@example.com')
      await page.getByLabel('Password').fill('123')
      await page.getByRole('button', { name: 'Login' }).click()

      await expect(page.getByText('Password must be at least 8 characters long')).toBeVisible()
    })

    test('should successfully login with valid credentials', async ({ page }) => {
      // Mock successful login response
      await page.route('**/api/v1/auth/login', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
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
          })
        })
      })

      await page.getByLabel('Email').fill('test@example.com')
      await page.getByLabel('Password').fill('password123')
      await page.getByRole('button', { name: 'Login' }).click()

      // Should redirect to subjects page
      await expect(page).toHaveURL('/app/subjects')
      await expect(page.getByText('Welcome, Test User')).toBeVisible()
    })

    test('should show error for invalid credentials', async ({ page }) => {
      // Mock failed login response
      await page.route('**/api/v1/auth/login', async route => {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Invalid credentials'
          })
        })
      })

      await page.getByLabel('Email').fill('invalid@example.com')
      await page.getByLabel('Password').fill('wrongpassword')
      await page.getByRole('button', { name: 'Login' }).click()

      await expect(page.getByText('Invalid credentials')).toBeVisible()
    })

    test('should show loading state during login', async ({ page }) => {
      // Mock delayed response
      await page.route('**/api/v1/auth/login', async route => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              user: { id: '1', name: 'Test User', email: 'test@example.com', role: 'student' },
              token: 'mock-jwt-token'
            }
          })
        })
      })

      await page.getByLabel('Email').fill('test@example.com')
      await page.getByLabel('Password').fill('password123')
      await page.getByRole('button', { name: 'Login' }).click()

      // Should show loading state
      await expect(page.getByText('Logging in...')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Login' })).toBeDisabled()
    })
  })

  test.describe('Registration Flow', () => {
    test('should navigate to registration page', async ({ page }) => {
      await page.getByRole('link', { name: 'Create account' }).click()
      await expect(page).toHaveURL('/register')
    })

    test('should display registration form', async ({ page }) => {
      await page.goto('/register')
      
      await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible()
      await expect(page.getByLabel('First Name')).toBeVisible()
      await expect(page.getByLabel('Last Name')).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Password')).toBeVisible()
      await expect(page.getByLabel('Confirm Password')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible()
    })

    test('should show validation errors for registration form', async ({ page }) => {
      await page.goto('/register')
      
      await page.getByRole('button', { name: 'Create Account' }).click()

      await expect(page.getByText('First name is required')).toBeVisible()
      await expect(page.getByText('Last name is required')).toBeVisible()
      await expect(page.getByText('Email is required')).toBeVisible()
      await expect(page.getByText('Password is required')).toBeVisible()
    })

    test('should show error for password mismatch', async ({ page }) => {
      await page.goto('/register')
      
      await page.getByLabel('First Name').fill('John')
      await page.getByLabel('Last Name').fill('Doe')
      await page.getByLabel('Email').fill('john@example.com')
      await page.getByLabel('Password').fill('password123')
      await page.getByLabel('Confirm Password').fill('differentpassword')
      await page.getByRole('button', { name: 'Create Account' }).click()

      await expect(page.getByText('Passwords do not match')).toBeVisible()
    })

    test('should successfully register new user', async ({ page }) => {
      await page.goto('/register')

      // Mock successful registration response
      await page.route('**/api/v1/auth/register', async route => {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              user: {
                id: '2',
                name: 'John Doe',
                email: 'john@example.com',
                role: 'student'
              },
              token: 'mock-jwt-token'
            }
          })
        })
      })

      await page.getByLabel('First Name').fill('John')
      await page.getByLabel('Last Name').fill('Doe')
      await page.getByLabel('Email').fill('john@example.com')
      await page.getByLabel('Password').fill('password123')
      await page.getByLabel('Confirm Password').fill('password123')
      await page.getByRole('button', { name: 'Create Account' }).click()

      // Should redirect to subjects page
      await expect(page).toHaveURL('/app/subjects')
      await expect(page.getByText('Welcome, John Doe')).toBeVisible()
    })
  })

  test.describe('Password Reset Flow', () => {
    test('should navigate to password reset page', async ({ page }) => {
      await page.getByRole('link', { name: 'Forgot password?' }).click()
      await expect(page).toHaveURL('/password-reset')
    })

    test('should display password reset form', async ({ page }) => {
      await page.goto('/password-reset')
      
      await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Send Reset Link' })).toBeVisible()
    })

    test('should successfully request password reset', async ({ page }) => {
      await page.goto('/password-reset')

      // Mock successful password reset request
      await page.route('**/api/v1/auth/password-reset', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Password reset email sent'
          })
        })
      })

      await page.getByLabel('Email').fill('test@example.com')
      await page.getByRole('button', { name: 'Send Reset Link' }).click()

      await expect(page.getByText('Password reset email sent')).toBeVisible()
    })
  })

  test.describe('Navigation', () => {
    test('should navigate between login and register pages', async ({ page }) => {
      // From login to register
      await page.getByRole('link', { name: 'Create account' }).click()
      await expect(page).toHaveURL('/register')

      // From register to login
      await page.getByRole('link', { name: 'Already have an account?' }).click()
      await expect(page).toHaveURL('/login')
    })

    test('should navigate to password reset from login', async ({ page }) => {
      await page.getByRole('link', { name: 'Forgot password?' }).click()
      await expect(page).toHaveURL('/password-reset')
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper form labels and ARIA attributes', async ({ page }) => {
      const emailInput = page.getByLabel('Email')
      const passwordInput = page.getByLabel('Password')
      const loginButton = page.getByRole('button', { name: 'Login' })

      await expect(emailInput).toBeVisible()
      await expect(passwordInput).toBeVisible()
      await expect(loginButton).toBeVisible()

      // Check for proper input types
      await expect(emailInput).toHaveAttribute('type', 'email')
      await expect(passwordInput).toHaveAttribute('type', 'password')
    })

    test('should support keyboard navigation', async ({ page }) => {
      const emailInput = page.getByLabel('Email')
      const passwordInput = page.getByLabel('Password')
      const loginButton = page.getByRole('button', { name: 'Login' })

      // Tab through form elements
      await page.keyboard.press('Tab')
      await expect(emailInput).toBeFocused()

      await page.keyboard.press('Tab')
      await expect(passwordInput).toBeFocused()

      await page.keyboard.press('Tab')
      await expect(loginButton).toBeFocused()
    })
  })

  test.describe('Responsive Design', () => {
    test('should display properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      
      await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Password')).toBeVisible()
    })

    test('should display properly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      
      await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Password')).toBeVisible()
    })
  })
}) 