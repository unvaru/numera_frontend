// Validation utilities for form inputs and security checks

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password strength validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Password confirmation validation
export const validatePasswordConfirmation = (password: string, confirmation: string): boolean => {
  return password === confirmation
}

// Name validation
export const validateName = (name: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (name.length < 2) {
    errors.push('Name must be at least 2 characters long')
  }
  
  if (name.length > 50) {
    errors.push('Name must be less than 50 characters')
  }
  
  if (!/^[a-zA-Z\s]+$/.test(name)) {
    errors.push('Name can only contain letters and spaces')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// URL validation
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Phone number validation
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// Credit card validation (Luhn algorithm)
export const validateCreditCard = (cardNumber: string): boolean => {
  const cleanNumber = cardNumber.replace(/\s/g, '')
  
  if (!/^\d{13,19}$/.test(cleanNumber)) {
    return false
  }
  
  let sum = 0
  let isEven = false
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i])
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
}

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
}

// XSS prevention
export const escapeHtml = (text: string): string => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// CSRF token validation
export const validateCsrfToken = (token: string): boolean => {
  // In a real application, this would validate against the server
  return Boolean(token && token.length > 0)
}

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map()
  
  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now()
    const record = this.attempts.get(key)
    
    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs })
      return true
    }
    
    if (record.count >= maxAttempts) {
      return false
    }
    
    record.count++
    return true
  }
  
  reset(key: string): void {
    this.attempts.delete(key)
  }
}

// File validation
export const validateFile = (file: File, options: {
  maxSize?: number
  allowedTypes?: string[]
  maxFiles?: number
} = {}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  const { maxSize = 10 * 1024 * 1024, allowedTypes = [], maxFiles = 1 } = options
  
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`)
  }
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Form validation helper
export class FormValidator {
  private errors: Map<string, string[]> = new Map()
  
  validateField(fieldName: string, value: any, validators: Array<(value: any) => { isValid: boolean; errors: string[] }>): boolean {
    const fieldErrors: string[] = []
    
    for (const validator of validators) {
      const result = validator(value)
      if (!result.isValid) {
        fieldErrors.push(...result.errors)
      }
    }
    
    if (fieldErrors.length > 0) {
      this.errors.set(fieldName, fieldErrors)
      return false
    } else {
      this.errors.delete(fieldName)
      return true
    }
  }
  
  getErrors(fieldName?: string): string[] {
    if (fieldName) {
      return this.errors.get(fieldName) || []
    }
    return Array.from(this.errors.values()).flat()
  }
  
  hasErrors(): boolean {
    return this.errors.size > 0
  }
  
  clearErrors(): void {
    this.errors.clear()
  }
}

// Security utilities
export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const hashPassword = async (password: string): Promise<string> => {
  // In a real application, this would use a proper hashing library
  // For now, we'll use a simple hash function
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Token expiration check
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

// Input length validation
export const validateLength = (value: string, min: number, max: number): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (value.length < min) {
    errors.push(`Must be at least ${min} characters long`)
  }
  
  if (value.length > max) {
    errors.push(`Must be less than ${max} characters long`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Numeric validation
export const validateNumber = (value: string, min?: number, max?: number): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  const num = parseFloat(value)
  
  if (isNaN(num)) {
    errors.push('Must be a valid number')
    return { isValid: false, errors }
  }
  
  if (min !== undefined && num < min) {
    errors.push(`Must be at least ${min}`)
  }
  
  if (max !== undefined && num > max) {
    errors.push(`Must be less than ${max}`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Date validation
export const validateDate = (date: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  const parsedDate = new Date(date)
  
  if (isNaN(parsedDate.getTime())) {
    errors.push('Must be a valid date')
  }
  
  if (parsedDate > new Date()) {
    errors.push('Date cannot be in the future')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// All functions are already exported above 