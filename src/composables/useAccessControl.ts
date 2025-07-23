import { ref, computed } from 'vue'

// Types
export interface UserSubscription {
  plan: 'free' | 'premium'
  status: 'active' | 'expired' | 'cancelled'
  expiresAt?: string
}

export interface UsageLimits {
  dailyQuizzes: { used: number; limit: number }
  dailyPractice: { used: number; limit: number }
  weeklyLessons: { used: number; limit: number }
  subjectsAccess: { used: number; limit: number }
}

export interface AccessResult {
  canAccess: boolean
  reason?: 'premium_required' | 'usage_limit' | 'subscription_expired'
  upgradeRequired: boolean
  limitInfo?: {
    used: number
    limit: number
    resetTime: string
  }
}

// State management for access control
const currentUser = ref<any>(null)
const usageLimits = ref<UsageLimits>({
  dailyQuizzes: { used: 3, limit: 5 },
  dailyPractice: { used: 1, limit: 2 },
  weeklyLessons: { used: 8, limit: 10 },
  subjectsAccess: { used: 1, limit: 1 }
})

export function useAccessControl() {
  // Get current user data
  const loadUserData = () => {
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      currentUser.value = JSON.parse(userStr)
    }
  }

  // Initialize user data
  if (!currentUser.value) {
    loadUserData()
  }

  // Computed properties
  const userSubscription = computed<UserSubscription>(() => {
    if (!currentUser.value) {
      return { plan: 'free', status: 'active' }
    }
    
    return {
      plan: currentUser.value.subscriptionPlan || 'free',
      status: 'active', // In real app, this would be calculated
      expiresAt: currentUser.value.subscriptionExpiry
    }
  })

  const isPremiumUser = computed(() => {
    return userSubscription.value.plan === 'premium' && userSubscription.value.status === 'active'
  })

  const isFreeTier = computed(() => {
    return userSubscription.value.plan === 'free'
  })

  // Access control methods
  const canAccessPremiumContent = (contentType?: string): AccessResult => {
    // Premium users can access everything
    if (isPremiumUser.value) {
      return { canAccess: true, upgradeRequired: false }
    }

    // Free users cannot access premium content
    return {
      canAccess: false,
      reason: 'premium_required',
      upgradeRequired: true
    }
  }

  const canAccessWithUsageLimit = (
    limitType: keyof UsageLimits,
    increment: boolean = false
  ): AccessResult => {
    // Premium users have no usage limits
    if (isPremiumUser.value) {
      return { canAccess: true, upgradeRequired: false }
    }

    const limit = usageLimits.value[limitType]
    const canAccess = limit.used < limit.limit

    // Increment usage if requested and access is granted
    if (canAccess && increment) {
      limit.used += 1
      // Save to localStorage for persistence during development
      localStorage.setItem('usageLimits', JSON.stringify(usageLimits.value))
    }

    return {
      canAccess,
      reason: canAccess ? undefined : 'usage_limit',
      upgradeRequired: !canAccess,
      limitInfo: {
        used: limit.used,
        limit: limit.limit,
        resetTime: getResetTime(limitType)
      }
    }
  }

  const canStartQuiz = (): AccessResult => {
    return canAccessWithUsageLimit('dailyQuizzes')
  }

  const canUsePracticeTools = (): AccessResult => {
    return canAccessWithUsageLimit('dailyPractice')
  }

  const canAccessMultipleSubjects = (): AccessResult => {
    // Free users can only access one subject
    if (isFreeTier.value && usageLimits.value.subjectsAccess.used >= 1) {
      return {
        canAccess: false,
        reason: 'usage_limit',
        upgradeRequired: true,
        limitInfo: {
          used: usageLimits.value.subjectsAccess.used,
          limit: usageLimits.value.subjectsAccess.limit,
          resetTime: 'Never (upgrade required)'
        }
      }
    }

    return { canAccess: true, upgradeRequired: false }
  }

  const canDownloadCertificates = (): AccessResult => {
    return canAccessPremiumContent('certificates')
  }

  const canAccessAdvancedAnalytics = (): AccessResult => {
    return canAccessPremiumContent('analytics')
  }

  // Usage tracking methods
  const incrementUsage = (limitType: keyof UsageLimits) => {
    if (isFreeTier.value && usageLimits.value[limitType].used < usageLimits.value[limitType].limit) {
      usageLimits.value[limitType].used += 1
      localStorage.setItem('usageLimits', JSON.stringify(usageLimits.value))
    }
  }

  const resetDailyLimits = () => {
    usageLimits.value.dailyQuizzes.used = 0
    usageLimits.value.dailyPractice.used = 0
    localStorage.setItem('usageLimits', JSON.stringify(usageLimits.value))
  }

  const resetWeeklyLimits = () => {
    usageLimits.value.weeklyLessons.used = 0
    localStorage.setItem('usageLimits', JSON.stringify(usageLimits.value))
  }

  // Utility methods
  const getResetTime = (limitType: keyof UsageLimits): string => {
    const now = new Date()
    
    switch (limitType) {
      case 'dailyQuizzes':
      case 'dailyPractice':
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0)
        return tomorrow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      
      case 'weeklyLessons':
        const nextWeek = new Date(now)
        nextWeek.setDate(nextWeek.getDate() + (7 - nextWeek.getDay()))
        nextWeek.setHours(0, 0, 0, 0)
        return nextWeek.toLocaleDateString()
      
      default:
        return 'N/A'
    }
  }

  const getRemainingUsage = (limitType: keyof UsageLimits) => {
    const limit = usageLimits.value[limitType]
    return Math.max(0, limit.limit - limit.used)
  }

  const getUsagePercentage = (limitType: keyof UsageLimits) => {
    const limit = usageLimits.value[limitType]
    return Math.round((limit.used / limit.limit) * 100)
  }

  // Load saved usage limits from localStorage
  const loadUsageLimits = () => {
    const saved = localStorage.getItem('usageLimits')
    if (saved) {
      try {
        usageLimits.value = { ...usageLimits.value, ...JSON.parse(saved) }
      } catch (error) {
        console.warn('Failed to load usage limits from localStorage')
      }
    }
  }

  // Initialize usage limits
  loadUsageLimits()

  // Development helpers
  const resetAllLimits = () => {
    usageLimits.value = {
      dailyQuizzes: { used: 0, limit: 5 },
      dailyPractice: { used: 0, limit: 2 },
      weeklyLessons: { used: 0, limit: 10 },
      subjectsAccess: { used: 0, limit: 1 }
    }
    localStorage.setItem('usageLimits', JSON.stringify(usageLimits.value))
  }

  const simulateUsage = (limitType: keyof UsageLimits, amount: number) => {
    usageLimits.value[limitType].used = Math.min(
      usageLimits.value[limitType].limit,
      usageLimits.value[limitType].used + amount
    )
    localStorage.setItem('usageLimits', JSON.stringify(usageLimits.value))
  }

  return {
    // State
    userSubscription,
    usageLimits,
    isPremiumUser,
    isFreeTier,
    
    // Access control methods
    canAccessPremiumContent,
    canAccessWithUsageLimit,
    canStartQuiz,
    canUsePracticeTools,
    canAccessMultipleSubjects,
    canDownloadCertificates,
    canAccessAdvancedAnalytics,
    
    // Usage tracking
    incrementUsage,
    resetDailyLimits,
    resetWeeklyLimits,
    
    // Utilities
    getRemainingUsage,
    getUsagePercentage,
    getResetTime,
    
    // Development helpers
    resetAllLimits,
    simulateUsage,
    loadUserData
  }
} 