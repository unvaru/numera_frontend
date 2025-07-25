import { AppError, ErrorType, ErrorSeverity } from './errorHandler'

// Monitoring configuration
interface MonitoringConfig {
  enableAnalytics: boolean
  enableErrorTracking: boolean
  enablePerformanceMonitoring: boolean
  sentryDsn?: string
  googleAnalyticsId?: string
  mixpanelToken?: string
}

class MonitoringService {
  private config: MonitoringConfig
  private isInitialized = false

  constructor(config: MonitoringConfig) {
    this.config = config
  }

  /**
   * Initialize monitoring services
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Initialize Sentry for error tracking
      if (this.config.enableErrorTracking && this.config.sentryDsn) {
        await this.initializeSentry()
      }

      // Initialize Google Analytics
      if (this.config.enableAnalytics && this.config.googleAnalyticsId) {
        this.initializeGoogleAnalytics()
      }

      // Initialize Mixpanel
      if (this.config.enableAnalytics && this.config.mixpanelToken) {
        this.initializeMixpanel()
      }

      // Initialize performance monitoring
      if (this.config.enablePerformanceMonitoring) {
        this.initializePerformanceMonitoring()
      }

      this.isInitialized = true
      console.log('✅ Monitoring services initialized')
    } catch (error) {
      console.error('❌ Failed to initialize monitoring services:', error)
    }
  }

  /**
   * Initialize Sentry error tracking
   */
  private async initializeSentry(): Promise<void> {
    try {
      const Sentry = await import('@sentry/vue')
      Sentry.init({
        app: undefined, // Will be set in main.ts
        dsn: this.config.sentryDsn,
        environment: import.meta.env.VITE_APP_ENVIRONMENT || 'production',
        release: import.meta.env.VITE_APP_VERSION || '1.0.0',
        integrations: [
          new Sentry.BrowserTracing({
            routingInstrumentation: Sentry.vueRouterInstrumentation(router)
          })
        ],
        tracesSampleRate: 0.1,
        beforeSend(event) {
          // Filter out certain errors
          if (event.exception) {
            const exception = event.exception.values?.[0]
            if (exception?.value?.includes('ResizeObserver loop limit exceeded')) {
              return null
            }
          }
          return event
        }
      })
    } catch (error) {
      console.warn('Sentry not available:', error)
    }
  }

  /**
   * Initialize Google Analytics
   */
  private initializeGoogleAnalytics(): void {
    try {
      // Load Google Analytics script
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.googleAnalyticsId}`
      document.head.appendChild(script)

      // Initialize gtag
      window.dataLayer = window.dataLayer || []
      function gtag(...args: any[]) {
        window.dataLayer.push(args)
      }
      gtag('js', new Date())
      gtag('config', this.config.googleAnalyticsId, {
        page_title: document.title,
        page_location: window.location.href
      })

      // Make gtag available globally
      window.gtag = gtag
    } catch (error) {
      console.warn('Google Analytics not available:', error)
    }
  }

  /**
   * Initialize Mixpanel
   */
  private initializeMixpanel(): void {
    try {
      // Load Mixpanel script
      const script = document.createElement('script')
      script.async = true
      script.src = 'https://cdn.mxpnl.com/libs/mixpanel-2.2.0.min.js'
      document.head.appendChild(script)

      script.onload = () => {
        // Initialize Mixpanel
        window.mixpanel.init(this.config.mixpanelToken)
      }
    } catch (error) {
      console.warn('Mixpanel not available:', error)
    }
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    // Monitor Core Web Vitals
    this.monitorCoreWebVitals()

    // Monitor API performance
    this.monitorApiPerformance()

    // Monitor user interactions
    this.monitorUserInteractions()
  }

  /**
   * Monitor Core Web Vitals
   */
  private monitorCoreWebVitals(): void {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1]
      const lcp = lastEntry.startTime
      
      this.trackMetric('lcp', lcp)
      
      if (lcp > 2500) {
        this.trackError(new AppError({
          type: ErrorType.PERFORMANCE,
          severity: ErrorSeverity.MEDIUM,
          message: 'LCP exceeded 2.5s threshold',
          details: { lcp, threshold: 2500 }
        }))
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      entries.forEach((entry) => {
        const fid = entry.processingStart - entry.startTime
        
        this.trackMetric('fid', fid)
        
        if (fid > 100) {
          this.trackError(new AppError({
            type: ErrorType.PERFORMANCE,
            severity: ErrorSeverity.MEDIUM,
            message: 'FID exceeded 100ms threshold',
            details: { fid, threshold: 100 }
          }))
        }
      })
    }).observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift (CLS)
    new PerformanceObserver((entryList) => {
      let clsValue = 0
      const entries = entryList.getEntries()
      
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += (entry as any).value
        }
      })
      
      this.trackMetric('cls', clsValue)
      
      if (clsValue > 0.1) {
        this.trackError(new AppError({
          type: ErrorType.PERFORMANCE,
          severity: ErrorSeverity.MEDIUM,
          message: 'CLS exceeded 0.1 threshold',
          details: { cls: clsValue, threshold: 0.1 }
        }))
      }
    }).observe({ entryTypes: ['layout-shift'] })
  }

  /**
   * Monitor API performance
   */
  private monitorApiPerformance(): void {
    // Monitor fetch requests
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const startTime = performance.now()
      
      try {
        const response = await originalFetch(...args)
        const duration = performance.now() - startTime
        
        this.trackApiCall(args[0] as string, duration, response.status)
        
        if (duration > 5000) {
          this.trackError(new AppError({
            type: ErrorType.PERFORMANCE,
            severity: ErrorSeverity.MEDIUM,
            message: 'API call exceeded 5s threshold',
            details: { url: args[0], duration, threshold: 5000 }
          }))
        }
        
        return response
      } catch (error) {
        const duration = performance.now() - startTime
        this.trackApiError(args[0] as string, duration, error)
        throw error
      }
    }
  }

  /**
   * Monitor user interactions
   */
  private monitorUserInteractions(): void {
    // Track page views
    this.trackPageView()

    // Track button clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        this.trackEvent('button_click', {
          text: target.textContent?.trim(),
          id: target.id,
          className: target.className
        })
      }
    })

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement
      this.trackEvent('form_submit', {
        action: form.action,
        method: form.method,
        id: form.id
      })
    })
  }

  /**
   * Track custom events
   */
  trackEvent(eventName: string, properties?: Record<string, any>): void {
    try {
      // Google Analytics
      if (window.gtag) {
        window.gtag('event', eventName, properties)
      }

      // Mixpanel
      if (window.mixpanel) {
        window.mixpanel.track(eventName, properties)
      }

      // Console log in development
      if (import.meta.env.DEV) {
        console.log('📊 Event tracked:', eventName, properties)
      }
    } catch (error) {
      console.warn('Failed to track event:', error)
    }
  }

  /**
   * Track page views
   */
  trackPageView(page?: string): void {
    const currentPage = page || window.location.pathname
    
    this.trackEvent('page_view', {
      page: currentPage,
      title: document.title,
      url: window.location.href
    })
  }

  /**
   * Track metrics
   */
  trackMetric(name: string, value: number): void {
    try {
      // Google Analytics
      if (window.gtag) {
        window.gtag('event', 'custom_metric', {
          metric_name: name,
          metric_value: value
        })
      }

      // Mixpanel
      if (window.mixpanel) {
        window.mixpanel.track('metric', {
          name,
          value
        })
      }

      // Console log in development
      if (import.meta.env.DEV) {
        console.log('📈 Metric tracked:', name, value)
      }
    } catch (error) {
      console.warn('Failed to track metric:', error)
    }
  }

  /**
   * Track API calls
   */
  trackApiCall(url: string, duration: number, status: number): void {
    this.trackEvent('api_call', {
      url,
      duration,
      status,
      success: status >= 200 && status < 300
    })
  }

  /**
   * Track API errors
   */
  trackApiError(url: string, duration: number, error: any): void {
    this.trackEvent('api_error', {
      url,
      duration,
      error: error.message,
      stack: error.stack
    })
  }

  /**
   * Track errors
   */
  trackError(error: AppError): void {
    try {
      // Sentry
      if (window.Sentry) {
        window.Sentry.captureException(error)
      }

      // Google Analytics
      if (window.gtag) {
        window.gtag('event', 'exception', {
          description: error.message,
          fatal: error.severity === ErrorSeverity.CRITICAL
        })
      }

      // Mixpanel
      if (window.mixpanel) {
        window.mixpanel.track('error', {
          message: error.message,
          type: error.type,
          severity: error.severity,
          details: error.details
        })
      }

      // Console log in development
      if (import.meta.env.DEV) {
        console.error('🚨 Error tracked:', error)
      }
    } catch (trackingError) {
      console.warn('Failed to track error:', trackingError)
    }
  }

  /**
   * Set user properties
   */
  setUser(user: any): void {
    try {
      // Google Analytics
      if (window.gtag) {
        window.gtag('config', this.config.googleAnalyticsId, {
          user_id: user.id,
          user_properties: {
            role: user.role,
            subscription_plan: user.subscription_plan
          }
        })
      }

      // Mixpanel
      if (window.mixpanel) {
        window.mixpanel.identify(user.id)
        window.mixpanel.people.set({
          $name: user.name,
          $email: user.email,
          role: user.role,
          subscription_plan: user.subscription_plan
        })
      }

      // Sentry
      if (window.Sentry) {
        window.Sentry.setUser({
          id: user.id,
          email: user.email,
          username: user.name
        })
      }
    } catch (error) {
      console.warn('Failed to set user:', error)
    }
  }

  /**
   * Clear user data
   */
  clearUser(): void {
    try {
      // Google Analytics
      if (window.gtag) {
        window.gtag('config', this.config.googleAnalyticsId, {
          user_id: null
        })
      }

      // Mixpanel
      if (window.mixpanel) {
        window.mixpanel.reset()
      }

      // Sentry
      if (window.Sentry) {
        window.Sentry.setUser(null)
      }
    } catch (error) {
      console.warn('Failed to clear user:', error)
    }
  }
}

// Create monitoring instance
const monitoring = new MonitoringService({
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableErrorTracking: import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true',
  enablePerformanceMonitoring: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
  mixpanelToken: import.meta.env.VITE_MIXPANEL_TOKEN
})

export default monitoring

// Type declarations for global objects
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    mixpanel: any
    Sentry: any
    dataLayer: any[]
  }
} 