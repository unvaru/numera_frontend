import type { ApiError } from '@/config/api'

// Error types
export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  UNKNOWN = 'unknown'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error interface
export interface AppError {
  type: ErrorType
  severity: ErrorSeverity
  message: string
  code?: string
  details?: any
  timestamp: Date
  userMessage?: string
  retryable: boolean
}

// Error handler class
class ErrorHandler {
  private errors: AppError[] = []
  private maxErrors = 100

  // Create error from API error
  createFromApiError(apiError: ApiError): AppError {
    const error: AppError = {
      type: this.mapApiErrorToType(apiError),
      severity: this.mapApiErrorToSeverity(apiError),
      message: apiError.message,
      code: apiError.code,
      details: apiError.details,
      timestamp: new Date(),
      userMessage: this.getUserFriendlyMessage(apiError),
      retryable: this.isRetryable(apiError)
    }

    this.logError(error)
    return error
  }

  // Create error from exception
  createFromException(error: any): AppError {
    const appError: AppError = {
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      message: error.message || 'An unexpected error occurred',
      timestamp: new Date(),
      userMessage: 'Something went wrong. Please try again.',
      retryable: false
    }

    this.logError(appError)
    return appError
  }

  // Map API error to error type
  private mapApiErrorToType(apiError: ApiError): ErrorType {
    if (!apiError.status) return ErrorType.NETWORK

    switch (apiError.status) {
      case 401:
        return ErrorType.AUTHENTICATION
      case 403:
        return ErrorType.AUTHORIZATION
      case 400:
        return ErrorType.VALIDATION
      case 404:
        return ErrorType.NOT_FOUND
      case 500:
      case 502:
      case 503:
        return ErrorType.SERVER
      default:
        return ErrorType.UNKNOWN
    }
  }

  // Map API error to severity
  private mapApiErrorToSeverity(apiError: ApiError): ErrorSeverity {
    if (!apiError.status) return ErrorSeverity.MEDIUM

    switch (apiError.status) {
      case 401:
      case 403:
        return ErrorSeverity.HIGH
      case 500:
      case 502:
      case 503:
        return ErrorSeverity.CRITICAL
      case 404:
        return ErrorSeverity.LOW
      default:
        return ErrorSeverity.MEDIUM
    }
  }

  // Get user-friendly error message
  private getUserFriendlyMessage(apiError: ApiError): string {
    switch (apiError.status) {
      case 401:
        return 'Please log in to continue.'
      case 403:
        return 'You don\'t have permission to access this resource.'
      case 404:
        return 'The requested resource was not found.'
      case 429:
        return 'Too many requests. Please try again later.'
      case 500:
        return 'Server error. Please try again later.'
      case 502:
      case 503:
        return 'Service temporarily unavailable. Please try again later.'
      default:
        return 'Something went wrong. Please try again.'
    }
  }

  // Check if error is retryable
  private isRetryable(apiError: ApiError): boolean {
    if (!apiError.status) return true // Network errors are retryable
    
    return [408, 429, 500, 502, 503, 504].includes(apiError.status)
  }

  // Log error
  private logError(error: AppError) {
    console.error('Application Error:', {
      type: error.type,
      severity: error.severity,
      message: error.message,
      code: error.code,
      timestamp: error.timestamp,
      details: error.details
    })

    // Add to errors array
    this.errors.push(error)
    
    // Keep only the last maxErrors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors)
    }
  }

  // Get recent errors
  getRecentErrors(limit: number = 10): AppError[] {
    return this.errors.slice(-limit)
  }

  // Clear errors
  clearErrors() {
    this.errors = []
  }

  // Get error statistics
  getErrorStats() {
    const stats = {
      total: this.errors.length,
      byType: {} as Record<ErrorType, number>,
      bySeverity: {} as Record<ErrorSeverity, number>,
      recent: this.errors.slice(-24) // Last 24 errors
    }

    // Count by type
    this.errors.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1
    })

    return stats
  }
}

// Global error handler instance
export const errorHandler = new ErrorHandler()

// Error handler composable
export function useErrorHandler() {
  const handleError = (error: any): AppError => {
    if (error && typeof error === 'object' && 'status' in error) {
      return errorHandler.createFromApiError(error)
    } else {
      return errorHandler.createFromException(error)
    }
  }

  const showError = (error: AppError) => {
    // This will be integrated with a toast/notification system
    console.error('User Error:', error.userMessage)
  }

  const clearErrors = () => {
    errorHandler.clearErrors()
  }

  const getErrorStats = () => {
    return errorHandler.getErrorStats()
  }

  return {
    handleError,
    showError,
    clearErrors,
    getErrorStats
  }
} 