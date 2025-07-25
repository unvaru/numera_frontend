# Performance Optimization Guide

## Overview

This document outlines performance optimization strategies, caching mechanisms, and monitoring approaches for the Numera frontend application.

## Table of Contents

1. [Performance Metrics](#performance-metrics)
2. [Optimization Strategies](#optimization-strategies)
3. [Caching Strategies](#caching-strategies)
4. [Bundle Optimization](#bundle-optimization)
5. [Network Optimization](#network-optimization)
6. [Monitoring](#monitoring)
7. [Best Practices](#best-practices)

## Performance Metrics

### Core Web Vitals

Monitor these key metrics:

```typescript
// Performance monitoring
const performanceMetrics = {
  // Largest Contentful Paint (LCP)
  lcp: 0,
  // First Input Delay (FID)
  fid: 0,
  // Cumulative Layout Shift (CLS)
  cls: 0,
  // First Contentful Paint (FCP)
  fcp: 0,
  // Time to Interactive (TTI)
  tti: 0
}
```

### Custom Metrics

```typescript
// API response time
const apiMetrics = {
  averageResponseTime: 0,
  slowQueries: [],
  errorRate: 0,
  cacheHitRate: 0
}

// User interaction metrics
const userMetrics = {
  pageLoadTime: 0,
  componentRenderTime: 0,
  interactionDelay: 0
}
```

## Optimization Strategies

### 1. Lazy Loading

```typescript
// Route-level lazy loading
const routes = [
  {
    path: '/app/subjects',
    component: () => import('@/components/organisms/SubjectSelection.vue')
  },
  {
    path: '/app/quiz/:quizId',
    component: () => import('@/components/organisms/QuizPlayer.vue')
  }
]

// Component-level lazy loading
const LazyComponent = defineAsyncComponent(() => 
  import('@/components/organisms/HeavyComponent.vue')
)
```

### 2. Virtual Scrolling

```vue
<template>
  <VirtualList
    :items="largeDataset"
    :item-height="60"
    :container-height="400"
  >
    <template #default="{ item }">
      <ListItem :data="item" />
    </template>
  </VirtualList>
</template>
```

### 3. Debouncing and Throttling

```typescript
import { debounce, throttle } from 'lodash-es'

// Debounced search
const debouncedSearch = debounce(async (query: string) => {
  const results = await searchService.search(query)
  searchResults.value = results
}, 300)

// Throttled scroll handler
const throttledScroll = throttle((event: Event) => {
  // Handle scroll event
}, 16) // ~60fps
```

### 4. Memoization

```typescript
import { computed, ref } from 'vue'

// Memoized computed property
const expensiveComputation = computed(() => {
  return heavyCalculation(data.value)
})

// Memoized function
const memoizedFunction = useMemo(() => {
  return (input: string) => {
    return expensiveOperation(input)
  }
}, [dependencies])
```

## Caching Strategies

### 1. Store-Level Caching

```typescript
// SubjectStore with caching
export const useSubjectStore = defineStore('subject', () => {
  const subjects = ref<Subject[]>([])
  const cache = new Map<string, { data: any, timestamp: number }>()
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  const fetchSubjects = async () => {
    const cacheKey = 'subjects'
    const cached = cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      subjects.value = cached.data
      return
    }

    const data = await subjectService.getSubjects()
    subjects.value = data
    cache.set(cacheKey, { data, timestamp: Date.now() })
  }

  const clearCache = () => {
    cache.clear()
  }

  return { subjects, fetchSubjects, clearCache }
})
```

### 2. API Response Caching

```typescript
// API client with response caching
class CachedApiClient {
  private cache = new Map<string, { data: any, timestamp: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000

  async get(url: string, options?: any) {
    const cacheKey = `${url}-${JSON.stringify(options)}`
    const cached = this.cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    const response = await this.axiosClient.get(url, options)
    this.cache.set(cacheKey, { data: response, timestamp: Date.now() })
    return response
  }

  clearCache() {
    this.cache.clear()
  }
}
```

### 3. Browser Cache Headers

```typescript
// Configure cache headers for different resources
const cacheConfig = {
  static: {
    'Cache-Control': 'public, max-age=31536000', // 1 year
    'ETag': true
  },
  api: {
    'Cache-Control': 'private, max-age=300', // 5 minutes
    'ETag': true
  },
  userData: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
}
```

### 4. Service Worker Caching

```typescript
// Service worker for offline caching
const CACHE_NAME = 'numera-cache-v1'
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/api/v1/subjects'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response
        }
        return fetch(event.request)
      })
  )
})
```

## Bundle Optimization

### 1. Tree Shaking

```typescript
// Use named imports for better tree shaking
import { debounce } from 'lodash-es'
import { computed } from 'vue'

// Instead of
import _ from 'lodash'
import Vue from 'vue'
```

### 2. Code Splitting

```typescript
// Dynamic imports for code splitting
const routes = [
  {
    path: '/app',
    component: () => import('@/views/App.vue'),
    children: [
      {
        path: 'subjects',
        component: () => import('@/views/Subjects.vue')
      },
      {
        path: 'quiz/:id',
        component: () => import('@/views/Quiz.vue')
      }
    ]
  }
]
```

### 3. Bundle Analysis

```bash
# Analyze bundle size
npm run build -- --analyze

# Check bundle composition
npm run build -- --report
```

### 4. Compression

```typescript
// Vite configuration for compression
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          utils: ['lodash-es', 'axios'],
          ui: ['vuetify', '@mdi/font']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
```

## Network Optimization

### 1. Request Batching

```typescript
// Batch multiple API requests
class RequestBatcher {
  private batchQueue: Array<{ id: string, request: () => Promise<any> }> = []
  private batchTimeout: NodeJS.Timeout | null = null

  async addToBatch<T>(id: string, request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.batchQueue.push({
        id,
        request: async () => {
          try {
            const result = await request()
            resolve(result)
            return result
          } catch (error) {
            reject(error)
            throw error
          }
        }
      })

      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout)
      }

      this.batchTimeout = setTimeout(() => {
        this.processBatch()
      }, 50) // 50ms batching window
    })
  }

  private async processBatch() {
    const requests = [...this.batchQueue]
    this.batchQueue = []

    // Process requests in parallel
    await Promise.all(requests.map(item => item.request()))
  }
}
```

### 2. Request Deduplication

```typescript
// Prevent duplicate requests
class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>()

  async deduplicate<T>(key: string, request: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!
    }

    const promise = request()
    this.pendingRequests.set(key, promise)

    try {
      const result = await promise
      return result
    } finally {
      this.pendingRequests.delete(key)
    }
  }
}
```

### 3. Progressive Loading

```typescript
// Progressive data loading
const useProgressiveLoading = () => {
  const loadCriticalData = async () => {
    // Load essential data first
    await authStore.initializeAuth()
    await subjectStore.fetchSubjects()
  }

  const loadSecondaryData = async () => {
    // Load additional data after critical data
    await progressStore.fetchUserProgress()
    await subscriptionStore.fetchUserSubscription()
  }

  const loadLazyData = async () => {
    // Load data on demand
    await quizStore.fetchQuizzesByTopic(topicId)
  }

  return {
    loadCriticalData,
    loadSecondaryData,
    loadLazyData
  }
}
```

### 4. Prefetching

```typescript
// Prefetch data for likely user actions
const usePrefetching = () => {
  const prefetchSubjectData = async (subjectId: string) => {
    // Prefetch in background
    Promise.all([
      subjectStore.fetchTopics(subjectId),
      progressStore.fetchSubjectProgress(subjectId)
    ]).catch(console.error)
  }

  const prefetchQuizData = async (quizId: string) => {
    // Prefetch quiz questions
    quizStore.fetchQuizQuestions(quizId).catch(console.error)
  }

  return {
    prefetchSubjectData,
    prefetchQuizData
  }
}
```

## Monitoring

### 1. Performance Monitoring

```typescript
// Performance monitoring service
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()

  measure(name: string, fn: () => any) {
    const start = performance.now()
    const result = fn()
    const duration = performance.now() - start
    
    this.recordMetric(name, duration)
    return result
  }

  async measureAsync(name: string, fn: () => Promise<any>) {
    const start = performance.now()
    const result = await fn()
    const duration = performance.now() - start
    
    this.recordMetric(name, duration)
    return result
  }

  private recordMetric(name: string, duration: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(duration)
  }

  getMetrics() {
    const result: Record<string, { avg: number, min: number, max: number }> = {}
    
    for (const [name, values] of this.metrics) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      const min = Math.min(...values)
      const max = Math.max(...values)
      
      result[name] = { avg, min, max }
    }
    
    return result
  }
}
```

### 2. Error Monitoring

```typescript
// Error monitoring with performance context
class ErrorMonitor {
  private performanceMonitor: PerformanceMonitor

  constructor(performanceMonitor: PerformanceMonitor) {
    this.performanceMonitor = performanceMonitor
  }

  captureError(error: Error, context: any) {
    const performanceMetrics = this.performanceMonitor.getMetrics()
    
    // Send to error reporting service
    this.reportError({
      error: error.message,
      stack: error.stack,
      context,
      performance: performanceMetrics,
      timestamp: new Date().toISOString()
    })
  }

  private reportError(data: any) {
    // Send to monitoring service
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(console.error)
  }
}
```

### 3. User Experience Monitoring

```typescript
// Monitor user interactions
class UXMonitor {
  private interactions: Array<{
    type: string,
    timestamp: number,
    duration: number,
    success: boolean
  }> = []

  trackInteraction(type: string, fn: () => any) {
    const start = performance.now()
    let success = true
    
    try {
      const result = fn()
      return result
    } catch (error) {
      success = false
      throw error
    } finally {
      const duration = performance.now() - start
      this.interactions.push({
        type,
        timestamp: Date.now(),
        duration,
        success
      })
    }
  }

  getInteractionStats() {
    const stats: Record<string, { count: number, avgDuration: number, successRate: number }> = {}
    
    for (const interaction of this.interactions) {
      if (!stats[interaction.type]) {
        stats[interaction.type] = { count: 0, avgDuration: 0, successRate: 0 }
      }
      
      const stat = stats[interaction.type]
      stat.count++
      stat.avgDuration = (stat.avgDuration * (stat.count - 1) + interaction.duration) / stat.count
      stat.successRate = this.interactions
        .filter(i => i.type === interaction.type)
        .filter(i => i.success).length / stat.count
    }
    
    return stats
  }
}
```

## Best Practices

### 1. Component Optimization

```vue
<template>
  <!-- Use v-show for frequently toggled elements -->
  <div v-show="isVisible" class="heavy-component">
    <!-- Heavy content -->
  </div>
  
  <!-- Use v-if for conditional rendering -->
  <div v-if="shouldRender" class="conditional-component">
    <!-- Conditional content -->
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

// Use computed for expensive calculations
const expensiveValue = computed(() => {
  return heavyCalculation(props.data)
})

// Use refs for reactive data
const localData = ref([])

// Clean up resources
onUnmounted(() => {
  // Cleanup
})
</script>
```

### 2. Store Optimization

```typescript
// Optimize store updates
export const useOptimizedStore = defineStore('optimized', () => {
  const data = ref<LargeDataset[]>([])
  
  // Use shallow ref for large objects
  const largeObject = shallowRef<LargeObject>()
  
  // Batch updates
  const batchUpdate = (updates: Partial<LargeDataset>[]) => {
    const newData = [...data.value]
    updates.forEach(update => {
      const index = newData.findIndex(item => item.id === update.id)
      if (index !== -1) {
        newData[index] = { ...newData[index], ...update }
      }
    })
    data.value = newData
  }
  
  return { data, batchUpdate }
})
```

### 3. API Optimization

```typescript
// Optimize API calls
class OptimizedApiClient {
  private requestQueue = new Map<string, Promise<any>>()
  private cache = new Map<string, { data: any, timestamp: number }>()
  
  async optimizedGet<T>(url: string, options?: any): Promise<T> {
    const cacheKey = `${url}-${JSON.stringify(options)}`
    
    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes
      return cached.data
    }
    
    // Deduplicate requests
    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey)!
    }
    
    const promise = this.axiosClient.get(url, options)
    this.requestQueue.set(cacheKey, promise)
    
    try {
      const result = await promise
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() })
      return result
    } finally {
      this.requestQueue.delete(cacheKey)
    }
  }
}
```

### 4. Memory Management

```typescript
// Memory management utilities
class MemoryManager {
  private observers: Set<WeakRef<object>> = new Set()
  
  trackObject(obj: object) {
    this.observers.add(new WeakRef(obj))
  }
  
  cleanup() {
    // Remove dead references
    for (const observer of this.observers) {
      if (!observer.deref()) {
        this.observers.delete(observer)
      }
    }
  }
  
  // Monitor memory usage
  getMemoryUsage() {
    if ('memory' in performance) {
      return (performance as any).memory
    }
    return null
  }
}
```

## Performance Checklist

### Development

- [ ] Use lazy loading for routes and components
- [ ] Implement proper caching strategies
- [ ] Optimize bundle size with tree shaking
- [ ] Use computed properties for expensive calculations
- [ ] Implement debouncing for user inputs
- [ ] Monitor Core Web Vitals
- [ ] Test on slow networks
- [ ] Optimize images and assets

### Production

- [ ] Enable compression (gzip/brotli)
- [ ] Set proper cache headers
- [ ] Use CDN for static assets
- [ ] Monitor performance metrics
- [ ] Set up error tracking
- [ ] Implement service worker caching
- [ ] Optimize database queries
- [ ] Use connection pooling

### Monitoring

- [ ] Track Core Web Vitals
- [ ] Monitor API response times
- [ ] Track user interaction metrics
- [ ] Set up performance alerts
- [ ] Monitor error rates
- [ ] Track cache hit rates
- [ ] Monitor bundle sizes
- [ ] Track memory usage

## Tools and Resources

### Performance Tools

- **Lighthouse**: Audit performance, accessibility, and SEO
- **WebPageTest**: Detailed performance analysis
- **Chrome DevTools**: Performance profiling
- **Bundle Analyzer**: Analyze bundle composition
- **Vue DevTools**: Vue-specific debugging

### Monitoring Services

- **Google Analytics**: Web analytics
- **Sentry**: Error tracking
- **New Relic**: Application performance monitoring
- **DataDog**: Infrastructure monitoring
- **LogRocket**: Session replay and error tracking

### Optimization Libraries

- **lodash-es**: Optimized utility functions
- **date-fns**: Lightweight date manipulation
- **fuse.js**: Fuzzy search with good performance
- **virtual-scroller**: Efficient list rendering
- **vue-virtual-scroller**: Vue-specific virtual scrolling

---

*Last updated: January 2024* 