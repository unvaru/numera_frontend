// Security utilities and middleware for the frontend application

import { validateCsrfToken, generateSecureToken, isTokenExpired } from './validation'

// Security configuration
export const SECURITY_CONFIG = {
  TOKEN_KEY: 'auth_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  CSRF_TOKEN_KEY: 'csrf_token',
  SESSION_KEY: 'user_session',
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  PASSWORD_RESET_EXPIRY: 60 * 60 * 1000 // 1 hour
}

// Token management
export class TokenManager {
  private static instance: TokenManager
  private refreshPromise: Promise<string> | null = null

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager()
    }
    return TokenManager.instance
  }

  // Store authentication token
  setToken(token: string): void {
    localStorage.setItem(SECURITY_CONFIG.TOKEN_KEY, token)
  }

  // Get authentication token
  getToken(): string | null {
    return localStorage.getItem(SECURITY_CONFIG.TOKEN_KEY)
  }

  // Remove authentication token
  removeToken(): void {
    localStorage.removeItem(SECURITY_CONFIG.TOKEN_KEY)
  }

  // Store refresh token
  setRefreshToken(token: string): void {
    localStorage.setItem(SECURITY_CONFIG.REFRESH_TOKEN_KEY, token)
  }

  // Get refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem(SECURITY_CONFIG.REFRESH_TOKEN_KEY)
  }

  // Remove refresh token
  removeRefreshToken(): void {
    localStorage.removeItem(SECURITY_CONFIG.REFRESH_TOKEN_KEY)
  }

  // Check if token is valid and not expired
  isTokenValid(): boolean {
    const token = this.getToken()
    if (!token) return false
    return !isTokenExpired(token)
  }

  // Check if token will expire soon
  isTokenExpiringSoon(): boolean {
    const token = this.getToken()
    if (!token) return false
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expiryTime = payload.exp * 1000
      const currentTime = Date.now()
      return (expiryTime - currentTime) < SECURITY_CONFIG.TOKEN_EXPIRY_BUFFER
    } catch {
      return true
    }
  }

  // Clear all tokens
  clearTokens(): void {
    this.removeToken()
    this.removeRefreshToken()
  }
}

// Session management
export class SessionManager {
  private static instance: SessionManager

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  // Create new session
  createSession(userId: string, data: any = {}): void {
    const session = {
      userId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      data
    }
    localStorage.setItem(SECURITY_CONFIG.SESSION_KEY, JSON.stringify(session))
  }

  // Get current session
  getSession(): any | null {
    const session = localStorage.getItem(SECURITY_CONFIG.SESSION_KEY)
    if (!session) return null
    
    try {
      return JSON.parse(session)
    } catch {
      return null
    }
  }

  // Update session activity
  updateActivity(): void {
    const session = this.getSession()
    if (session) {
      session.lastActivity = Date.now()
      localStorage.setItem(SECURITY_CONFIG.SESSION_KEY, JSON.stringify(session))
    }
  }

  // Check if session is expired
  isSessionExpired(): boolean {
    const session = this.getSession()
    if (!session) return true
    
    const now = Date.now()
    const lastActivity = session.lastActivity || session.createdAt
    return (now - lastActivity) > SECURITY_CONFIG.SESSION_TIMEOUT
  }

  // Clear session
  clearSession(): void {
    localStorage.removeItem(SECURITY_CONFIG.SESSION_KEY)
  }

  // Extend session
  extendSession(): void {
    const session = this.getSession()
    if (session) {
      session.lastActivity = Date.now()
      localStorage.setItem(SECURITY_CONFIG.SESSION_KEY, JSON.stringify(session))
    }
  }
}

// CSRF protection
export class CsrfProtection {
  private static instance: CsrfProtection

  static getInstance(): CsrfProtection {
    if (!CsrfProtection.instance) {
      CsrfProtection.instance = new CsrfProtection()
    }
    return CsrfProtection.instance
  }

  // Generate CSRF token
  generateToken(): string {
    const token = generateSecureToken(32)
    localStorage.setItem(SECURITY_CONFIG.CSRF_TOKEN_KEY, token)
    return token
  }

  // Get CSRF token
  getToken(): string | null {
    return localStorage.getItem(SECURITY_CONFIG.CSRF_TOKEN_KEY)
  }

  // Validate CSRF token
  validateToken(token: string): boolean {
    const storedToken = this.getToken()
    return Boolean(storedToken && validateCsrfToken(token) && token === storedToken)
  }

  // Clear CSRF token
  clearToken(): void {
    localStorage.removeItem(SECURITY_CONFIG.CSRF_TOKEN_KEY)
  }
}

// Rate limiting for login attempts
export class LoginRateLimiter {
  private static instance: LoginRateLimiter
  private attempts: Map<string, { count: number; lockoutUntil: number }> = new Map()

  static getInstance(): LoginRateLimiter {
    if (!LoginRateLimiter.instance) {
      LoginRateLimiter.instance = new LoginRateLimiter()
    }
    return LoginRateLimiter.instance
  }

  // Check if login is allowed
  isLoginAllowed(identifier: string): boolean {
    const record = this.attempts.get(identifier)
    const now = Date.now()

    if (!record) return true

    if (now < record.lockoutUntil) {
      return false
    }

    if (record.count >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
      record.lockoutUntil = now + SECURITY_CONFIG.LOCKOUT_DURATION
      record.count = 0
      this.attempts.set(identifier, record)
      return false
    }

    return true
  }

  // Record failed login attempt
  recordFailedAttempt(identifier: string): void {
    const record = this.attempts.get(identifier) || { count: 0, lockoutUntil: 0 }
    record.count++
    this.attempts.set(identifier, record)
  }

  // Reset login attempts
  resetAttempts(identifier: string): void {
    this.attempts.delete(identifier)
  }

  // Get remaining lockout time
  getLockoutTime(identifier: string): number {
    const record = this.attempts.get(identifier)
    if (!record) return 0
    
    const now = Date.now()
    return Math.max(0, record.lockoutUntil - now)
  }
}

// Security headers utility
export class SecurityHeaders {
  // Add security headers to requests
  static addHeaders(headers: Record<string, string> = {}): Record<string, string> {
    const csrfToken = CsrfProtection.getInstance().getToken()
    
    return {
      ...headers,
      'X-Requested-With': 'XMLHttpRequest',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      ...(csrfToken && { 'X-CSRF-Token': csrfToken })
    }
  }

  // Validate security headers in response
  static validateResponseHeaders(headers: Record<string, string>): boolean {
    const requiredHeaders = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection'
    ]

    return requiredHeaders.every(header => headers[header] !== undefined)
  }
}

// Password reset token management
export class PasswordResetManager {
  private static instance: PasswordResetManager

  static getInstance(): PasswordResetManager {
    if (!PasswordResetManager.instance) {
      PasswordResetManager.instance = new PasswordResetManager()
    }
    return PasswordResetManager.instance
  }

  // Store password reset token
  storeResetToken(token: string): void {
    const resetData = {
      token,
      createdAt: Date.now()
    }
    localStorage.setItem('password_reset_token', JSON.stringify(resetData))
  }

  // Get password reset token
  getResetToken(): string | null {
    const data = localStorage.getItem('password_reset_token')
    if (!data) return null

    try {
      const resetData = JSON.parse(data)
      const now = Date.now()
      
      if (now - resetData.createdAt > SECURITY_CONFIG.PASSWORD_RESET_EXPIRY) {
        this.clearResetToken()
        return null
      }

      return resetData.token
    } catch {
      return null
    }
  }

  // Clear password reset token
  clearResetToken(): void {
    localStorage.removeItem('password_reset_token')
  }

  // Validate password reset token
  isResetTokenValid(token: string): boolean {
    const storedToken = this.getResetToken()
    return storedToken === token
  }
}

// Security audit logging
export class SecurityAudit {
  private static instance: SecurityAudit
  private logs: Array<{
    timestamp: number
    event: string
    details: any
    ip?: string
    userAgent?: string
  }> = []

  static getInstance(): SecurityAudit {
    if (!SecurityAudit.instance) {
      SecurityAudit.instance = new SecurityAudit()
    }
    return SecurityAudit.instance
  }

  // Log security event
  logEvent(event: string, details: any = {}): void {
    const logEntry = {
      timestamp: Date.now(),
      event,
      details,
      ip: this.getClientIP(),
      userAgent: navigator.userAgent
    }

    this.logs.push(logEntry)
    
    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000)
    }

    // In production, this would send to a security monitoring service
    console.log('Security Event:', logEntry)
  }

  // Get security logs
  getLogs(limit: number = 100): Array<any> {
    return this.logs.slice(-limit)
  }

  // Clear logs
  clearLogs(): void {
    this.logs = []
  }

  // Get client IP (mock implementation)
  private getClientIP(): string {
    // In a real application, this would be provided by the server
    return 'unknown'
  }
}

// Security middleware for Vue components
export function useSecurity() {
  const tokenManager = TokenManager.getInstance()
  const sessionManager = SessionManager.getInstance()
  const csrfProtection = CsrfProtection.getInstance()
  const rateLimiter = LoginRateLimiter.getInstance()
  const audit = SecurityAudit.getInstance()

  return {
    tokenManager,
    sessionManager,
    csrfProtection,
    rateLimiter,
    audit,
    
    // Utility functions
    isAuthenticated: () => tokenManager.isTokenValid(),
    isSessionValid: () => !sessionManager.isSessionExpired(),
    generateCsrfToken: () => csrfProtection.generateToken(),
    logSecurityEvent: (event: string, details: any) => audit.logEvent(event, details)
  }
}

// All classes and functions are already exported above 