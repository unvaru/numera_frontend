import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import subscriptionService, { 
  type SubscriptionPlan, 
  type UserSubscription, 
  type BillingInfo, 
  type PaymentMethod, 
  type Invoice 
} from '@/services/SubscriptionService'

export const useSubscriptionStore = defineStore('subscription', () => {
  // State
  const subscriptionPlans = ref<SubscriptionPlan[]>([])
  const currentSubscription = ref<UserSubscription | null>(null)
  const billingInfo = ref<BillingInfo | null>(null)
  const paymentMethods = ref<PaymentMethod[]>([])
  const invoices = ref<Invoice[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const isPremium = computed(() => {
    return currentSubscription.value?.status === 'active' && 
           currentSubscription.value?.plan_id !== 'free'
  })

  const isFree = computed(() => {
    return !currentSubscription.value || 
           currentSubscription.value?.plan_id === 'free'
  })

  const isActive = computed(() => {
    return currentSubscription.value?.status === 'active'
  })

  const isCancelled = computed(() => {
    return currentSubscription.value?.status === 'cancelled' ||
           currentSubscription.value?.cancel_at_period_end === true
  })

  const currentPlan = computed(() => {
    if (!currentSubscription.value) return null
    return subscriptionPlans.value.find(plan => plan.id === currentSubscription.value?.plan_id)
  })

  const popularPlan = computed(() => {
    return subscriptionPlans.value.find(plan => plan.is_popular)
  })

  const defaultPlan = computed(() => {
    return subscriptionPlans.value.find(plan => plan.id === 'premium')
  })

  // Actions
  const fetchSubscriptionPlans = async () => {
    try {
      isLoading.value = true
      error.value = null

      // Try to fetch from API first, fallback to mock data
      try {
        const apiPlans = await subscriptionService.getSubscriptionPlans()
        subscriptionPlans.value = apiPlans
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError)
        const mockPlans = await subscriptionService.getMockSubscriptionPlans()
        subscriptionPlans.value = mockPlans
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch subscription plans'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchUserSubscription = async () => {
    try {
      isLoading.value = true
      error.value = null

      // Try to fetch from API first, fallback to mock data
      try {
        const apiSubscription = await subscriptionService.getUserSubscription()
        currentSubscription.value = apiSubscription
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError)
        const mockSubscription = await subscriptionService.getMockUserSubscription()
        currentSubscription.value = mockSubscription
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch user subscription'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createSubscription = async (planId: string, paymentMethodId: string) => {
    try {
      isLoading.value = true
      error.value = null

      // Try to create via API first, fallback to local update
      try {
        const newSubscription = await subscriptionService.createSubscription(planId, paymentMethodId)
        currentSubscription.value = newSubscription
      } catch (apiError) {
        console.warn('API not available, updating locally:', apiError)
        // Update locally for development
        currentSubscription.value = {
          id: `sub-${Date.now()}`,
          user_id: 'dev-student-001',
          plan_id: planId,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          cancel_at_period_end: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to create subscription'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const cancelSubscription = async (cancelAtPeriodEnd: boolean = true) => {
    try {
      isLoading.value = true
      error.value = null

      // Try to cancel via API first, fallback to local update
      try {
        const updatedSubscription = await subscriptionService.cancelSubscription(cancelAtPeriodEnd)
        currentSubscription.value = updatedSubscription
      } catch (apiError) {
        console.warn('API not available, updating locally:', apiError)
        // Update locally for development
        if (currentSubscription.value) {
          currentSubscription.value = {
            ...currentSubscription.value,
            cancel_at_period_end: cancelAtPeriodEnd,
            status: cancelAtPeriodEnd ? 'active' : 'cancelled',
            updated_at: new Date().toISOString()
          }
        }
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to cancel subscription'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const reactivateSubscription = async () => {
    try {
      isLoading.value = true
      error.value = null

      // Try to reactivate via API first, fallback to local update
      try {
        const updatedSubscription = await subscriptionService.reactivateSubscription()
        currentSubscription.value = updatedSubscription
      } catch (apiError) {
        console.warn('API not available, updating locally:', apiError)
        // Update locally for development
        if (currentSubscription.value) {
          currentSubscription.value = {
            ...currentSubscription.value,
            cancel_at_period_end: false,
            status: 'active',
            updated_at: new Date().toISOString()
          }
        }
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to reactivate subscription'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchBillingInfo = async () => {
    try {
      isLoading.value = true
      error.value = null

      // Try to fetch from API first, fallback to mock data
      try {
        const apiBillingInfo = await subscriptionService.getBillingInfo()
        billingInfo.value = apiBillingInfo
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError)
        const mockBillingInfo = await subscriptionService.getMockBillingInfo()
        billingInfo.value = mockBillingInfo
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch billing information'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateBillingInfo = async (billingData: Partial<BillingInfo>) => {
    try {
      isLoading.value = true
      error.value = null

      // Try to update via API first, fallback to local update
      try {
        const updatedBillingInfo = await subscriptionService.updateBillingInfo(billingData)
        billingInfo.value = updatedBillingInfo
      } catch (apiError) {
        console.warn('API not available, updating locally:', apiError)
        // Update locally for development
        if (billingInfo.value) {
          billingInfo.value = {
            ...billingInfo.value,
            ...billingData
          }
        }
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to update billing information'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchPaymentMethods = async () => {
    try {
      isLoading.value = true
      error.value = null

      // Try to fetch from API first, fallback to mock data
      try {
        const apiPaymentMethods = await subscriptionService.getPaymentMethods()
        paymentMethods.value = apiPaymentMethods
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError)
        const mockPaymentMethods = await subscriptionService.getMockPaymentMethods()
        paymentMethods.value = mockPaymentMethods
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch payment methods'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchInvoices = async () => {
    try {
      isLoading.value = true
      error.value = null

      // Try to fetch from API first, fallback to mock data
      try {
        const apiInvoices = await subscriptionService.getInvoices()
        invoices.value = apiInvoices
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError)
        const mockInvoices = await subscriptionService.getMockInvoices()
        invoices.value = mockInvoices
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch invoices'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const addPaymentMethod = async (paymentMethodData: any) => {
    try {
      isLoading.value = true
      error.value = null

      // Try to add via API first, fallback to local update
      try {
        const newPaymentMethod = await subscriptionService.addPaymentMethod(paymentMethodData)
        paymentMethods.value.push(newPaymentMethod)
      } catch (apiError) {
        console.warn('API not available, updating locally:', apiError)
        // Add locally for development
        const mockPaymentMethod: PaymentMethod = {
          id: `pm-${Date.now()}`,
          user_id: 'dev-student-001',
          type: 'card',
          last4: '4242',
          brand: 'visa',
          exp_month: 12,
          exp_year: 2025,
          is_default: false,
          created_at: new Date().toISOString()
        }
        paymentMethods.value.push(mockPaymentMethod)
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to add payment method'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const removePaymentMethod = async (paymentMethodId: string) => {
    try {
      isLoading.value = true
      error.value = null

      // Try to remove via API first, fallback to local update
      try {
        await subscriptionService.removePaymentMethod(paymentMethodId)
        paymentMethods.value = paymentMethods.value.filter(pm => pm.id !== paymentMethodId)
      } catch (apiError) {
        console.warn('API not available, updating locally:', apiError)
        // Remove locally for development
        paymentMethods.value = paymentMethods.value.filter(pm => pm.id !== paymentMethodId)
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to remove payment method'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearCache = () => {
    subscriptionPlans.value = []
    currentSubscription.value = null
    billingInfo.value = null
    paymentMethods.value = []
    invoices.value = []
  }

  return {
    // State
    subscriptionPlans,
    currentSubscription,
    billingInfo,
    paymentMethods,
    invoices,
    isLoading,
    error,
    
    // Computed
    isPremium,
    isFree,
    isActive,
    isCancelled,
    currentPlan,
    popularPlan,
    defaultPlan,
    
    // Actions
    fetchSubscriptionPlans,
    fetchUserSubscription,
    createSubscription,
    cancelSubscription,
    reactivateSubscription,
    fetchBillingInfo,
    updateBillingInfo,
    fetchPaymentMethods,
    fetchInvoices,
    addPaymentMethod,
    removePaymentMethod,
    clearError,
    clearCache
  }
}) 