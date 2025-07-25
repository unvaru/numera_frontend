import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

// Font Awesome
import '@fortawesome/fontawesome-free/css/all.css'

// Tailwind CSS
import './style.css'

// Initialize stores
import { useAuthStore } from './stores/authStore'

// Initialize monitoring
import monitoring from './utils/monitoring'

// Create Vuetify instance
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light'
  }
})

// Create Pinia instance
const pinia = createPinia()

// Create Vue app
const app = createApp(App)

// Use plugins
app.use(pinia)
app.use(router)
app.use(vuetify)

// Initialize auth store
const authStore = useAuthStore()

// Initialize monitoring services
async function initializeApp() {
  try {
    // Initialize monitoring first
    await monitoring.initialize()

    // Initialize auth store
    await authStore.initializeAuth()

    // Set user in monitoring if authenticated
    if (authStore.user) {
      monitoring.setUser(authStore.user)
    }

    // Track app initialization
    monitoring.trackEvent('app_initialized', {
      environment: import.meta.env.VITE_APP_ENVIRONMENT,
      version: import.meta.env.VITE_APP_VERSION
    })

    console.log('✅ Application initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize application:', error)
    
    // Track initialization error
    monitoring.trackError({
      type: 'UNKNOWN' as any,
      severity: 'HIGH' as any,
      message: 'Application initialization failed',
      details: { error: (error as Error).message }
    })
  }
}

// Initialize application
initializeApp()

// Mount app
app.mount('#app')

// Track page views on route changes
router.afterEach((to) => {
  monitoring.trackPageView(to.path)
})

// Handle unhandled errors
window.addEventListener('error', (event) => {
  monitoring.trackError({
    type: 'UNHANDLED_ERROR',
    severity: 'HIGH',
    message: event.error?.message || 'Unhandled error',
    details: {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    }
  })
})

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  monitoring.trackError({
    type: 'UNHANDLED_REJECTION',
    severity: 'HIGH',
    message: 'Unhandled promise rejection',
    details: {
      reason: event.reason
    }
  })
})

// Handle beforeunload for analytics
window.addEventListener('beforeunload', () => {
  // Track session end
  monitoring.trackEvent('session_end', {
    duration: performance.now()
  })
})

// Export for testing
export { app, router, pinia }
