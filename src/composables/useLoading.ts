import { ref, computed } from 'vue'

// Loading state interface
export interface LoadingState {
  isLoading: boolean
  message?: string
  progress?: number
  error?: string
}

// Loading manager class
class LoadingManager {
  private loadingStates = new Map<string, LoadingState>()
  private globalLoading = ref(false)
  private globalMessage = ref('')
  private globalProgress = ref(0)

  // Set loading state for a specific key
  setLoading(key: string, state: Partial<LoadingState>) {
    const currentState = this.loadingStates.get(key) || {
      isLoading: false,
      message: '',
      progress: 0,
      error: ''
    }

    this.loadingStates.set(key, {
      ...currentState,
      ...state
    })
  }

  // Get loading state for a specific key
  getLoading(key: string): LoadingState {
    return this.loadingStates.get(key) || {
      isLoading: false,
      message: '',
      progress: 0,
      error: ''
    }
  }

  // Start loading for a key
  startLoading(key: string, message?: string) {
    this.setLoading(key, {
      isLoading: true,
      message: message || 'Loading...',
      progress: 0,
      error: ''
    })
  }

  // Update progress for a key
  updateProgress(key: string, progress: number) {
    const currentState = this.getLoading(key)
    this.setLoading(key, {
      ...currentState,
      progress
    })
  }

  // Stop loading for a key
  stopLoading(key: string, error?: string) {
    this.setLoading(key, {
      isLoading: false,
      message: '',
      progress: 100,
      error: error || ''
    })
  }

  // Set global loading state
  setGlobalLoading(isLoading: boolean, message?: string) {
    this.globalLoading.value = isLoading
    this.globalMessage.value = message || ''
  }

  // Update global progress
  updateGlobalProgress(progress: number) {
    this.globalProgress.value = progress
  }

  // Check if any loading is active
  get isAnyLoading() {
    return this.globalLoading.value || Array.from(this.loadingStates.values()).some(state => state.isLoading)
  }

  // Get all active loading states
  get activeLoadingStates() {
    return Array.from(this.loadingStates.entries())
      .filter(([_, state]) => state.isLoading)
      .map(([key, state]) => ({ key, ...state }))
  }

  // Clear all loading states
  clearAll() {
    this.loadingStates.clear()
    this.globalLoading.value = false
    this.globalMessage.value = ''
    this.globalProgress.value = 0
  }
}

// Global loading manager instance
const loadingManager = new LoadingManager()

// Loading composable
export function useLoading(key?: string) {
  const isLoading = ref(false)
  const message = ref('')
  const progress = ref(0)
  const error = ref('')

  // Update local state from manager
  const updateLocalState = () => {
    if (key) {
      const state = loadingManager.getLoading(key)
      isLoading.value = state.isLoading
      message.value = state.message || ''
      progress.value = state.progress || 0
      error.value = state.error || ''
    }
  }

  // Start loading
  const startLoading = (loadingMessage?: string) => {
    if (key) {
      loadingManager.startLoading(key, loadingMessage)
      updateLocalState()
    }
  }

  // Update progress
  const updateProgress = (newProgress: number) => {
    if (key) {
      loadingManager.updateProgress(key, newProgress)
      updateLocalState()
    }
  }

  // Stop loading
  const stopLoading = (errorMessage?: string) => {
    if (key) {
      loadingManager.stopLoading(key, errorMessage)
      updateLocalState()
    }
  }

  // Global loading state
  const globalLoading = computed(() => loadingManager['globalLoading'].value)
  const globalMessage = computed(() => loadingManager['globalMessage'].value)
  const globalProgress = computed(() => loadingManager['globalProgress'].value)

  // Check if any loading is active
  const isAnyLoading = computed(() => loadingManager.isAnyLoading)

  // Get active loading states
  const activeLoadingStates = computed(() => loadingManager.activeLoadingStates)

  return {
    // Local state (if key provided)
    isLoading: key ? isLoading : globalLoading,
    message: key ? message : globalMessage,
    progress: key ? progress : globalProgress,
    error: key ? error : ref(''),
    
    // Actions
    startLoading,
    updateProgress,
    stopLoading,
    
    // Global state
    globalLoading,
    globalMessage,
    globalProgress,
    isAnyLoading,
    activeLoadingStates,
    
    // Utility
    clearAll: loadingManager.clearAll.bind(loadingManager)
  }
}

// Async wrapper for loading states
export function withLoading<T extends any[], R>(
  key: string,
  fn: (...args: T) => Promise<R>,
  message?: string
) {
  return async (...args: T): Promise<R> => {
    const loading = useLoading(key)
    
    try {
      loading.startLoading(message)
      const result = await fn(...args)
      loading.stopLoading()
      return result
    } catch (error) {
      loading.stopLoading(error instanceof Error ? error.message : 'An error occurred')
      throw error
    }
  }
}

// Progress tracking wrapper
export function withProgress<T>(
  key: string,
  fn: (progress: (value: number) => void) => Promise<T>,
  message?: string
) {
  return async (): Promise<T> => {
    const loading = useLoading(key)
    
    try {
      loading.startLoading(message)
      
      const result = await fn((progress) => {
        loading.updateProgress(progress)
      })
      
      loading.stopLoading()
      return result
    } catch (error) {
      loading.stopLoading(error instanceof Error ? error.message : 'An error occurred')
      throw error
    }
  }
} 