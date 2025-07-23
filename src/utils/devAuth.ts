// Development Authentication Utility
// This file should be removed when implementing real authentication

export interface DevUser {
  id: string
  name: string
  email: string
  role: 'student' | 'admin'
  subscriptionPlan: 'free' | 'premium'
  loginTime: string
}

export const DEV_CREDENTIALS = {
  student: {
    email: 'dev@numera.com',
    password: 'password123'
  },
  admin: {
    email: 'admin@numera.com',
    password: 'admin123'
  }
}

export const createDevUser = (role: 'student' | 'admin' = 'student'): DevUser => {
  return {
    id: `dev-${role}-001`,
    name: role === 'admin' ? 'Admin User' : 'John Doe',
    email: DEV_CREDENTIALS[role].email,
    role,
    subscriptionPlan: 'free',
    loginTime: new Date().toISOString()
  }
}

export const isDevAuthenticated = (): boolean => {
  const token = localStorage.getItem('authToken')
  const user = localStorage.getItem('currentUser')
  return token === 'dev-token-12345' && user !== null
}

export const getDevUser = (): DevUser | null => {
  const userStr = localStorage.getItem('currentUser')
  return userStr ? JSON.parse(userStr) : null
}

export const devLogin = (email: string, password: string): boolean => {
  // Check student credentials
  if (email === DEV_CREDENTIALS.student.email && password === DEV_CREDENTIALS.student.password) {
    const user = createDevUser('student')
    localStorage.setItem('authToken', 'dev-token-12345')
    localStorage.setItem('currentUser', JSON.stringify(user))
    return true
  }
  
  // Check admin credentials
  if (email === DEV_CREDENTIALS.admin.email && password === DEV_CREDENTIALS.admin.password) {
    const user = createDevUser('admin')
    localStorage.setItem('authToken', 'dev-token-12345')
    localStorage.setItem('currentUser', JSON.stringify(user))
    return true
  }
  
  return false
}

export const devLogout = (): void => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('currentUser')
  localStorage.removeItem('selectedSubject')
}

export const updateDevUserSubscription = (plan: 'free' | 'premium'): void => {
  const user = getDevUser()
  if (user) {
    user.subscriptionPlan = plan
    localStorage.setItem('currentUser', JSON.stringify(user))
  }
}

// Quick development helpers
export const switchToPremium = (): void => {
  updateDevUserSubscription('premium')
  console.log('✅ Switched to Premium plan (refresh page to see changes)')
}

export const switchToFree = (): void => {
  updateDevUserSubscription('free')
  console.log('✅ Switched to Free plan (refresh page to see changes)')
}

// Add these to window for easy console access during development
if (typeof window !== 'undefined') {
  (window as any).devAuth = {
    switchToPremium,
    switchToFree,
    getUser: getDevUser,
    isAuthenticated: isDevAuthenticated
  }
} 